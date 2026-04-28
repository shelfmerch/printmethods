# ShelfMerch Handoff Status

Last updated: 2026-04-28
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
| 2026-04-27 | Codex | Kit logo preview placement and variant-aware size/color selections for send/redeem flows | `backend/routes/kits.js`, `backend/routes/kitSends.js`, `backend/routes/kitRedemptions.js`, `backend/utils/kitVariantSelections.js`, `backend/utils/kitVariantSelections.test.js`, `src/components/kits/KitItemPreview.tsx`, `src/lib/kitVariants.ts`, `src/pages/BrandKitBuilder.tsx`, `src/pages/BrandKitSendWizard.tsx`, `src/pages/KitRedeem.tsx`, `src/types/kits.ts` |
| 2026-04-27 | Codex | Kit packaging curation and single-location bulk delivery mode | `backend/models/Kit.js`, `backend/models/KitSend.js`, `backend/routes/kits.js`, `backend/routes/kitSends.js`, `backend/utils/kitFulfillment.js`, `backend/utils/kitFulfillment.test.js`, `src/lib/kitVariants.ts`, `src/pages/BrandKitBuilder.tsx`, `src/pages/BrandKitSendWizard.tsx`, `src/types/kits.ts` |
| 2026-04-27 | Codex | Superadmin order management inside existing Direct Orders page with direct checkout details, status/tracking updates, and kit fulfillment queue | `backend/models/KitRedemption.js`, `backend/routes/adminDirectOrders.js`, `backend/routes/adminKitFulfillment.js`, `backend/server.js`, `backend/utils/mailer.js`, `src/components/admin/AdminOrderManagement.tsx`, `src/lib/api.ts`, `src/pages/Admin.tsx` |
| 2026-04-27 | Codex | Quotation PDFs, draft orders, advance payments, PO upload, support tickets, and product/sample request workflows | `backend/models/DirectOrder.js`, `backend/models/SupportTicket.js`, `backend/models/CatalogProduct.js`, `backend/models/Kit.js`, `backend/routes/quotations.js`, `backend/routes/quotationPdf.js`, `backend/routes/supportTickets.js`, `backend/routes/directOrders.js`, `backend/routes/products.js`, `backend/routes/catalog.js`, `backend/routes/upload.js`, `backend/server.js`, `backend/utils/mailer.js`, `src/pages/DirectCheckout.tsx`, `src/pages/BrandDraftOrders.tsx`, `src/pages/BrandSupportTickets.tsx`, `src/components/admin/AdminQuotations.tsx`, `src/components/admin/AdminSupportTickets.tsx`, `src/pages/CatalogOrderPage.tsx`, `src/pages/AdminProductCreation.tsx`, `src/pages/BrandKitBuilder.tsx`, `src/pages/BrandKitDetail.tsx`, `src/pages/BrandKitSendWizard.tsx`, `src/App.tsx`, `src/components/layout/DashboardLayout.tsx`, `src/lib/api.ts`, `src/types/product.ts`, `src/types/kits.ts` |
| 2026-04-28 | Codex | Fixed company wallet credit allocation mismatch and removed withdrawal/dead actions from brand Company Wallet page | `backend/routes/creditAllocation.js`, `src/pages/MerchantWallet.tsx` |
| 2026-04-28 | Codex | Normalized brand Team and Wallet Top Up pages to use the shared dashboard sidebar/layout | `src/pages/BrandTeam.tsx`, `src/pages/WalletTopUp.tsx` |
| 2026-04-28 | Codex | Reworked brand `/dashboard` into the home command center, added dashboard summary API, production-stage counts, Free/Growth/Enterprise plan limits, and updated pricing/billing copy | `backend/models/DirectOrder.js`, `backend/models/Store.js`, `backend/models/StoreOrder.js`, `backend/routes/brandDashboard.js`, `backend/routes/brandEmployees.js`, `backend/routes/brandSubscription.js`, `backend/routes/kits.js`, `backend/routes/storeProducts.js`, `backend/routes/stores.js`, `backend/server.js`, `backend/utils/planLimits.js`, `backend/utils/planLimits.test.js`, `src/lib/api.ts`, `src/pages/Dashboard.tsx`, `src/pages/BrandBilling.tsx`, `src/pages/rem-pgs/PricingPage.tsx` |
| 2026-04-28 | Codex | Simplified the brand dashboard and separated it from Products in the sidebar navigation | `src/components/layout/DashboardLayout.tsx`, `src/pages/Dashboard.tsx` |
| 2026-04-28 | Codex | Cleaned Store Setup/Channels page to remove Etsy and keep only hosted swag store, Shopify, and API docs | `src/components/layout/DashboardLayout.tsx`, `src/pages/Stores.tsx` |
| 2026-04-28 | Codex | Fixed catalog order design preview placement to use superadmin placeholder canvas math instead of guessed image-relative placement | `src/pages/CatalogOrderPage.tsx` |

## Verification

- `node --check backend/routes/kits.js`
- `node --check backend/routes/kitSends.js`
- `node --check backend/routes/kitRedemptions.js`
- `node --check backend/models/Kit.js`
- `node --check backend/models/KitSend.js`
- `node --check backend/models/KitRedemption.js`
- `node --check backend/server.js`
- `node --check backend/routes/adminDirectOrders.js`
- `node --check backend/routes/adminKitFulfillment.js`
- `node --check backend/routes/quotations.js`
- `node --check backend/routes/quotationPdf.js`
- `node --check backend/routes/supportTickets.js`
- `node --check backend/models/SupportTicket.js`
- `node --check backend/routes/directOrders.js`
- `node --check backend/routes/products.js`
- `node --check backend/routes/upload.js`
- `node --check backend/routes/creditAllocation.js`
- `node --check backend/routes/brandDashboard.js`
- `node --check backend/routes/stores.js`
- `node --check backend/routes/storeProducts.js`
- `node --check backend/routes/brandEmployees.js`
- `node --check backend/routes/brandSubscription.js`
- `node --check backend/models/StoreOrder.js`
- `node --check backend/models/DirectOrder.js`
- `node --check backend/utils/mailer.js`
- `node --test backend/utils/kitVariantSelections.test.js`
- `node --check backend/utils/kitVariantSelections.js`
- `node --test backend/utils/kitFulfillment.test.js backend/utils/kitVariantSelections.test.js`
- `node --check backend/utils/kitFulfillment.js`
- `node --test backend/utils/planLimits.test.js`
- `npm run build`
- `curl http://localhost:5002/health`
- `curl -i http://localhost:5002/api/admin/direct-orders`
- `curl -i http://localhost:5002/api/admin/kit-fulfillment/production-queue`
- `curl -I http://localhost:8080/`

## Notes

- This phase does not build inventory management UI. MOQ overages are stored on `KitSend.overageItems` for Phase B inventory handling.
- `npm install` was run in this worktree to restore missing dependencies before build verification.
- Uploaded kit logos now render only in the first front-view placeholder configured by the superadmin; there is no guessed fallback placement.
- Recipients Redeem mode leaves size/color selection to the recipient on the redeem link.
- Surprise Recipients mode requires HR/admin to choose size/color per recipient only for kit products that have active variants.
- Non-variant kit products remain selectable and display as "No size/color needed" in send/redeem flows.
- Packaging is stored on `Kit.packaging`; active catalog products with `categoryId === "packaging"` are shown in kit curation and validated on kit save/send.
- Kit builder now separates merchandise from packaging, with explicit "No packaging needed" or one catalog packaging product plus branding/notes.
- Send Items step 2 is now Delivery and includes `single_location` mode for one office/event/other address; it creates no redemption links.
- Single-location sends store total quantity, address, delivery notes, and per-variant quantity breakdowns on `KitSend`; fixed products inherit the total kit quantity.
- Packaging cost is charged per kit unit and included before service fee/tax in send pricing and checkout summary.
- Superadmin sidebar still has one visible Direct Orders item; the order page now switches internally between Direct Orders and Kit Fulfillment.
- Admin direct order APIs are superadmin-only and support all-brand listing, order detail, shipment history, and status/tracking updates.
- Kit fulfillment keeps redemption status separate from shipping status, grouping redeemed items by product/color/size for production and allowing per-recipient tracking updates.
- Local email delivery remains optional; shipping email calls are wrapped so SMTP failures do not roll back paid orders or shipment updates.
- Quotation flow stores draft orders as `DirectOrder` records with `orderType: "quotation"` and statuses `quotation`, `po_received`, `partially_paid`, and `paid`.
- Draft Orders are visible in the brand sidebar; quotation PDF downloads use `/api/quotation-pdf/:id` and mark `quotation.downloadedAt`.
- Superadmin quotations are available from the admin Quotations tab/path and can manually confirm PO/offline payment.
- Support tickets are order-scoped, threaded, and visible from brand Support plus superadmin Support. Email notifications are non-fatal.
- Products now support `sampleAvailable`; catalog product pages can create one-unit sample checkout orders with `DirectOrder.orderType: "sample"`.
- Kits can store `sampleRequested` and show a brand detail banner when a sample kit is requested.
- Credit allocation now links the current topped-up wallet to `Store.companyWalletId` when the store has no company wallet yet, so employee allocations can debit the same funds shown on Company Wallet.
- The brand Company Wallet page no longer shows withdrawal requests, withdraw dialogs, or a dead invoice PDF download button; withdrawals belong to seller/admin finance workflows, not corporate credit allocation.
- Brand Team and Wallet Top Up now render inside `DashboardLayout`; the old standalone Team surface and old merchant-only Wallet Top Up sidebar were removed for navigation consistency.
- `/dashboard` is now the brand home page: a simplified home surface with plan/wallet summary, onboarding checklist, product health, and production pipeline counts. Product-management tables are no longer shown on the dashboard.
- The brand sidebar now has a separate Dashboard item for `/dashboard`; Products is no longer the `/dashboard` label.
- `/stores` is now a Store Setup/Channels page, not a products page. It only presents the ShelfMerch hosted swag store, Shopify connection, and API docs/developer settings.
- Etsy, generic marketplace signup copy, delete-store actions, and creator-facing "friends/family/followers" copy were removed from the Store Setup surface.
- Catalog order upload previews now translate the superadmin placeholder from the 800x600 padded admin canvas onto the rendered product image; centered fallback logo placement was removed so uploaded designs never appear in a guessed location.
- Dashboard summary data comes from `/api/brand-dashboard/:brandId/summary`; it combines store products, store orders, direct orders, kits, kit sends, employees, team members, and wallet balance.
- Order production visibility now has `shipment.productionStage` on `StoreOrder` and `DirectOrder` with `queued`, `printing`, `packaging`, `ready_to_ship`, and `shipped`.
- Plan limits are centralized in `backend/utils/planLimits.js`; legacy `trial` maps to Free and legacy `starter`/`business` map to Growth.
- Free is enforced as 1 swag store, 50 employees, 10 active/live store products, and 3 kits; Growth is 5 stores, 500 employees, 250 live products, and unlimited kits; Enterprise is unlimited.
- Server-side limit checks now cover store creation, store product publishing, employee create/import, and kit creation, returning `PLAN_LIMIT_EXCEEDED` with upgrade-friendly copy.
- Public Pricing plus brand Billing now use Free, Growth (`₹4,999/month`, about `$59/month`), and Enterprise positioning; product cost, packaging, shipping, taxes, and customization remain separate from subscription.
