# How designData.views[].mockupImageUrl Is Saved and Why the Blank Image Appears

## 1. Where does `mockupImageUrl` come from?

There are **two different sources** of `designData.views[].mockupImageUrl`:

### A. Catalog product (the “blank” base image)

- **Set in:** Admin product creation/editing (`AdminProductCreation`, `ProductImageConfigurator`).
- **Flow:** Admin uploads a **base/studio mockup image** per view (front, back, left, right). It’s uploaded to S3 and the URL is stored in the **catalog product** as `design.views[n].mockupImageUrl`.
- **Meaning:** These URLs point to the **blank garment** (no customer design) — the “clean” product photo used as the canvas background in the designer.

So the “blank” image is **by design**: it’s the catalog’s base mockup for that view.

### B. Store product (composed mockup per view)

- **Set in:** Design editor when the user clicks **Save** (or when we capture composed mockups and update the store product).
- **Flow:** For each view we capture the **full Konva stage** (garment + design layers), upload that image to S3, then save those URLs into the **store product** document as `designData.views[n].mockupImageUrl`.
- **Meaning:** These URLs should be the **composed** mockup (garment + design) for each view.

So we have:

- **Catalog product** `design.views[].mockupImageUrl` → blank base image (admin upload).
- **Store product** `designData.views[].mockupImageUrl` → composed image (garment + design), written on Save.

---

## 2. How the designer uses `mockupImageUrl` (why you see the blank)

In `DesignEditor.tsx`:

1. **Product loaded:** The editor loads the **catalog product** with `productApi.getById(id)` (the route `id` is the catalog product id). So `product.design.views` and `product.design.views[].mockupImageUrl` come from the **catalog** (the base mockups).
2. **Canvas background:** `loadMockupForView(viewKey, product.design.views)` uses `view.mockupImageUrl` to load the image that is drawn as the **bottom layer** of the Konva stage (the garment). So the “blank” you see on the canvas is literally that catalog URL — the base product image, no design yet.
3. **Design layers:** Text, shapes, and uploaded graphics are added in separate Konva layers on top of that background. So the **visible** canvas = base mockup (from `mockupImageUrl`) + design layers.

So: the blank image on screen comes from the **catalog** `design.views[].mockupImageUrl` and is correct for the background. The bug is only in what gets **saved** when the user clicks Save.

---

## 3. Why the *saved* image was blank (the bug)

When the user clicks **Save**, the code that runs has to export an image from the canvas:

- **Wrong (old) approach:** Use `webglCanvasRef.current.querySelector('canvas')` and call `canvas.toBlob()` on that element.
- **What Konva does:** It creates **one `<canvas>` per `<Layer>`**. The first canvas in the DOM is the **background layer** (garment only). So `querySelector('canvas')` returns that first canvas → the exported image is **only the garment**, i.e. the “blank” product image with **no** design.
- **Correct approach:** Use Konva’s own export so **all layers** are composited into one image:
  - `stageRef.current.toDataURL({ mimeType: 'image/png', pixelRatio: 2 })`, or  
  - `stageRef.current.toBlob({ mimeType: 'image/png', pixelRatio: 2, callback })`
  Then upload that blob/URL. That image is the full composed mockup (garment + design).

So the blank stored on Save was not because “mockupImageUrl is the blank” in general; it was because we were exporting the wrong DOM canvas (only the first layer). Fixing the capture to use `stageRef` fixes what gets uploaded and thus what gets stored in `designData.views[].mockupImageUrl`.

---

## 4. How `designData.views[].mockupImageUrl` is saved (intended flow)

1. **Preview save (current view):**  
   `handleSave` captures the **current** view from the Konva stage (using `stageRef.toBlob` / `toDataURL`), uploads to S3, then calls `/api/auth/me/previews/:id` to store that preview URL. This is for the user’s “My previews” / preview gallery (and can still update `savedPreviewImages` etc.).

2. **Store product `designData.views` (all views):**  
   After that, if we have a `storeProductId` and `product.design.views`:
   - For **each** view in `product.design.views`:
     - Switch the stage to that view (`setCurrentView(view.key)`).
     - Wait for render (e.g. short delay + `requestAnimationFrame`).
     - Capture the full stage:  
       `dataUrl = stageRef.current.toDataURL({ mimeType: 'image/png', pixelRatio: 2 })`,  
       `blob = await fetch(dataUrl).then(r => r.blob())`.
     - Upload the blob to S3 (same upload API as above), get back the URL.
   - Build an **updated** `views` array where each view has the same `key` and `placeholders`, but `mockupImageUrl` is set to the new S3 URL for that view.
   - Call `storeProductsApi.update(storeProductId, { designData: { ...existingDesignData, views: updatedViews } })`.

The backend `PATCH /api/store-products/:id` accepts `designData` (e.g. in `backend/routes/storeProducts.js` and `StoreProduct` model where `designData` is type `Object`). So the payload that includes `designData.views` with the new `mockupImageUrl` values is what persists them to the **storeproducts** MongoDB document.

**Summary:** The blank product image is the catalog’s base mockup (used correctly as the canvas background). The bug was that Save exported only that one layer; fixing capture to use `stageRef` and then saving those URLs into `designData.views[].mockupImageUrl` via `storeProductsApi.update` is how we store the composed canvas mockup per view in the store product.
