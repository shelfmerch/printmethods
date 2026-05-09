/**
 * Wallet — barrel export for all wallet-related pages.
 *
 * Pages:
 *   MerchantWallet    → /wallet           (main wallet dashboard)
 *   WalletTopUp       → /wallet/top-up    (Razorpay top-up flow)
 *   WalletTransactions→ /wallet/transactions (transaction history)
 */

export { default as MerchantWallet } from './MerchantWallet';
export { default as WalletTopUp } from './WalletTopUp';
export { default as WalletTransactions } from './WalletTransactions';
