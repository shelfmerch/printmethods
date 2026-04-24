# ShelfMerch Handoff Status

Last updated: 2026-04-25
Updated by: Codex

## Critical Rules

- `RAW_API_URL` does not include `/api`; frontend fetches must use `${RAW_API_URL}/api/...`.
- New brand portal pages import `Header` and `Footer` from `@/components/home/`.

## Completed Work

| Date | Updated by | Area | Files |
| --- | --- | --- | --- |
| 2026-04-25 | Codex | Kits & Send Items backend models, APIs, Razorpay send creation/verification, redemption tokens, invite email helper, brand access helper | `backend/models/Kit.js`, `backend/models/KitSend.js`, `backend/models/KitRedemption.js`, `backend/routes/kits.js`, `backend/routes/kitSends.js`, `backend/routes/kitRedemptions.js`, `backend/utils/brandAccess.js`, `backend/utils/mailer.js`, `backend/server.js` |
| 2026-04-25 | Codex | Catalog product fulfillment metadata for superadmin product create/edit | `backend/models/CatalogProduct.js`, `backend/routes/products.js`, `src/types/product.ts`, `src/pages/AdminProductCreation.tsx`, `src/components/admin/ProductStocksSection.tsx` |
| 2026-04-25 | Codex | Brand kits UI, kit builder, kit detail, send wizard with MOQ handling, public redeem page, routes, and brand nav | `src/pages/BrandKits.tsx`, `src/pages/BrandKitBuilder.tsx`, `src/pages/BrandKitDetail.tsx`, `src/pages/BrandKitSendWizard.tsx`, `src/pages/KitRedeem.tsx`, `src/components/kits/KitItemPreview.tsx`, `src/components/home/index.ts`, `src/lib/kits.ts`, `src/types/kits.ts`, `src/App.tsx`, `src/components/layout/DashboardLayout.tsx` |

## Verification

- `node --check backend/routes/kits.js`
- `node --check backend/routes/kitSends.js`
- `node --check backend/routes/kitRedemptions.js`
- `node --check backend/models/Kit.js`
- `node --check backend/models/KitSend.js`
- `node --check backend/models/KitRedemption.js`
- `node --check backend/server.js`
- `npm run build`

## Notes

- This phase does not build inventory management UI. MOQ overages are stored on `KitSend.overageItems` for Phase B inventory handling.
- `npm install` was run in this worktree to restore missing dependencies before build verification.
