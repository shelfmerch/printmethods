// import { useState, useEffect, useMemo, useCallback } from 'react';
// import { Link, useSearchParams } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import { Product, Order, Store as StoreType } from '@/types';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Badge } from '@/components/ui/badge';
// import { Textarea } from '@/components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from '@/components/ui/alert-dialog';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";
// import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// import {
//   Users,
//   Package,
//   Palette,
//   Store,
//   TrendingUp,
//   Settings,
//   LogOut,
//   Search,
//   Filter,
//   Download,
//   ShoppingBag,
//   DollarSign,
//   Globe,
//   Truck,
//   AlertTriangle,
//   Bell,
//   MessageSquare,
//   Ban,
//   CheckCircle,
//   XCircle,
//   Edit,
//   BarChart3,
//   Megaphone,
//   HelpCircle,
//   FileText,
//   Mail,
//   ArrowUpRight,
//   ArrowDownRight,
//   Activity,
//   Clock,
//   ChevronRight,
//   Wallet,
//   Shield,
//   Plus,
//   Banknote,
//   Info,
//   ArrowRightLeft,
//   Layers,
//   CreditCard
// } from 'lucide-react';
// import { WalletManagement } from '@/components/admin/WalletManagement';
// import { WithdrawalsManagement } from '@/components/admin/WithdrawalsManagement';
// import { InvoiceManagement } from '@/components/admin/InvoiceManagement';
// import { AuditLogs } from '@/components/admin/AuditLogs';
// import { PayoutManagement } from '@/components/admin/PayoutManagement';
// import {
//   productApi,
//   storeOrdersApi,
//   adminWalletApi,
//   adminShopifyOrdersApi,
//   adminFulfillmentOrdersApi,
//   adminImportOrdersApi,
//   adminProductMappingApi,
//   adminProductionJobApi
// } from '@/lib/api';
// import { storeApi } from '@/lib/api';
// import { toast } from 'sonner';
// import { CatalogToolbar } from '@/components/admin/CatalogToolbar';
// import { BaseProductsTable } from '@/components/admin/BaseProductsTable';
// import logo from '@/assets/logo.webp';

// const Admin = () => {
//   const { user, logout } = useAuth();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeTab, setActiveTab] = useState(() => {
//     // Check URL params for tab
//     const tabParam = searchParams.get('tab');
//     return tabParam || 'overview';
//   });
//   const [selectedTimeRange, setSelectedTimeRange] = useState('month');
//   const [announcementText, setAnnouncementText] = useState('');
//   const [totalUsers, setTotalUsers] = useState<number>(0);
//   const [isLoadingUsers, setIsLoadingUsers] = useState(true);
//   const [usersData, setUsersData] = useState<Array<{
//     userId: string;
//     userName: string;
//     userEmail: string;
//     stores: any[];
//     revenue: number;
//     revenueRupees: string;
//     status: string;
//   }>>([]);
//   const [isLoadingUsersData, setIsLoadingUsersData] = useState(false);
//   const [editingUserId, setEditingUserId] = useState<string | null>(null);
//   const [disablingUserId, setDisablingUserId] = useState<string | null>(null);

//   // Products from database
//   const [databaseProducts, setDatabaseProducts] = useState<any[]>([]);
//   const [isLoadingProducts, setIsLoadingProducts] = useState(false);
//   const [productsSearchQuery, setProductsSearchQuery] = useState('');
//   const [productsPage, setProductsPage] = useState(1);
//   const [productsTotal, setProductsTotal] = useState(0);
//   const [productsCount, setProductsCount] = useState<number>(0); // For stats display
//   const [isLoadingProductsCount, setIsLoadingProductsCount] = useState(false);
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [sortBy, setSortBy] = useState('newest');
//   const [stores, setStores] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [storesPage, setStoresPage] = useState(1);
//   const [storesLimit, setStoresLimit] = useState(10);
//   const [storesTotal, setStoresTotal] = useState(0);
//   const [storesSortBy, setStoresSortBy] = useState('createdAt');
//   const [storesSortOrder, setStoresSortOrder] = useState<'asc' | 'desc'>('desc');
//   const [suspendingStoreId, setSuspendingStoreId] = useState<string | null>(null);
//   const [isSuspendingStore, setIsSuspendingStore] = useState(false);


//   // Admin sees ALL data across platform (stores/products from localStorage snapshot)
//   const allStores = JSON.parse(localStorage.getItem('shelfmerch_all_stores') || '[]') as StoreType[];
//   const allProducts = JSON.parse(localStorage.getItem('shelfmerch_all_products') || '[]') as Product[];

//   // Live platform orders for Admin Orders tab (superadmin only)
//   const [platformOrders, setPlatformOrders] = useState<Order[]>([]);
//   const [isLoadingOrders, setIsLoadingOrders] = useState(false);
//   const [ordersError, setOrdersError] = useState<string | null>(null);

//   // Orders filter states
//   const [ordersSearchQuery, setOrdersSearchQuery] = useState('');
//   const [ordersStatusFilter, setOrdersStatusFilter] = useState<string>('all');
//   const [ordersAmountSort, setOrdersAmountSort] = useState<string>('none');
//   const [ordersAlphabeticalSort, setOrdersAlphabeticalSort] = useState<string>('none');

//   // Shopify Orders (Super Admin)
//   const [shopifyOrders, setShopifyOrders] = useState<any[]>([]);
//   const [isLoadingShopifyOrders, setIsLoadingShopifyOrders] = useState(false);
//   const [shopifyOrdersPage, setShopifyOrdersPage] = useState(1);
//   const [shopifyOrdersLimit, setShopifyOrdersLimit] = useState(25);
//   const [shopifyOrdersTotal, setShopifyOrdersTotal] = useState(0);
//   const [shopifyOrdersPages, setShopifyOrdersPages] = useState(1);
//   const [shopifyOrdersShopFilter, setShopifyOrdersShopFilter] = useState('');
//   const [shopifyOrdersFinancialStatus, setShopifyOrdersFinancialStatus] = useState<string>('');
//   const [shopifyOrdersFulfillmentStatus, setShopifyOrdersFulfillmentStatus] = useState<string>('');
//   const [shopifyOrdersDateFrom, setShopifyOrdersDateFrom] = useState<string>('');
//   const [shopifyOrdersDateTo, setShopifyOrdersDateTo] = useState<string>('');
//   const [shopifyOrdersSearch, setShopifyOrdersSearch] = useState<string>('');
//   const [selectedShopifyOrder, setSelectedShopifyOrder] = useState<any | null>(null);
//   const [isShopifyOrderDialogOpen, setIsShopifyOrderDialogOpen] = useState(false);
//   const [isShopifyOrderDetailOpen, setIsShopifyOrderDetailOpen] = useState(false);
//   const [isImporting, setIsImporting] = useState(false);
//   const [fulfillmentCreatingFor, setFulfillmentCreatingFor] = useState<string | null>(null);

//   // POD Fulfillment Pipeline - Import Orders
//   const [importOrders, setImportOrders] = useState<any[]>([]);
//   const [isLoadingImportOrders, setIsLoadingImportOrders] = useState(false);
//   const [importOrdersPage, setImportOrdersPage] = useState(1);
//   const [importOrdersTotal, setImportOrdersTotal] = useState(0);
//   const [importOrdersStatusFilter, setImportOrdersStatusFilter] = useState('');
//   const [importOrdersShopFilter, setImportOrdersShopFilter] = useState('');
//   const [importOrdersSearch, setImportOrdersSearch] = useState('');
//   const [selectedImportOrder, setSelectedImportOrder] = useState<any | null>(null);
//   const [isImportOrderDialogOpen, setIsImportOrderDialogOpen] = useState(false);

//   // POD Fulfillment Pipeline - Product Mapping
//   const [productMappings, setProductMappings] = useState<any[]>([]);
//   const [isLoadingProductMappings, setIsLoadingProductMappings] = useState(false);
//   const [productMappingsPage, setProductMappingsPage] = useState(1);
//   const [productMappingsTotal, setProductMappingsTotal] = useState(0);
//   const [productMappingsShopFilter, setProductMappingsShopFilter] = useState('');
//   const [productMappingsSearch, setProductMappingsSearch] = useState('');
//   const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);
//   const [selectedMapping, setSelectedMapping] = useState<any | null>(null);

//   // POD Fulfillment Pipeline - Production Jobs
//   const [productionJobs, setProductionJobs] = useState<any[]>([]);
//   const [isLoadingProductionJobs, setIsLoadingProductionJobs] = useState(false);
//   const [productionJobsPage, setProductionJobsPage] = useState(1);
//   const [productionJobsTotal, setProductionJobsTotal] = useState(0);
//   const [productionJobsStatusFilter, setProductionJobsStatusFilter] = useState('');
//   const [productionJobsShopFilter, setProductionJobsShopFilter] = useState('');
//   const [productionJobsSearch, setProductionJobsSearch] = useState('');
//   const [selectedProductionJob, setSelectedProductionJob] = useState<any | null>(null);
//   const [isProductionJobDialogOpen, setIsProductionJobDialogOpen] = useState(false);
//   const [unmappedItems, setUnmappedItems] = useState<any[]>([]);
//   const [isLoadingUnmappedItems, setIsLoadingUnmappedItems] = useState(false);

//   // Platform Statistics
//   const [adminStats, setAdminStats] = useState<{
//     totalRevenue: number;
//     totalOrders: number;
//     deliveredOrders: number;
//     monthlyRevenue: number;
//     monthlyOrders: number;
//     topProducts: any[];
//   } | null>(null);
//   const [isLoadingStats, setIsLoadingStats] = useState(false);

//   // Derive effective stores list: prefer backend data when available, otherwise fall back to local snapshot
//   const effectiveStores: StoreType[] = !error && stores.length > 0 ? stores : allStores;

//   // Calculate real stats from data
//   const totalRevenue = adminStats?.totalRevenue || 0;
//   const activeStores = effectiveStores.length;
//   const totalProducts = allProducts.length;
//   const pendingOrders = platformOrders.filter(o => o.status === 'on-hold').length;

//   const statusOptions: Array<{ value: Order['status']; label: string }> = [
//     { value: 'on-hold', label: 'On hold' },
//     { value: 'in-production', label: 'In production' },
//     { value: 'shipped', label: 'Shipped' },
//     { value: 'delivered', label: 'Delivered' },
//     { value: 'refunded', label: 'Refunded' },
//     { value: 'cancelled', label: 'Cancelled' },
//   ];

//   // Fetch total user count from backend
//   useEffect(() => {
//     const fetchUserCount = async () => {
//       try {
//         const { authApi } = await import('@/lib/api');
//         const response = await authApi.getUserCount();
//         // The apiRequest returns the full response object for auth endpoints
//         if (response && typeof response.count === 'number') {
//           setTotalUsers(response.count);
//         } else if (response && response.success && typeof response.count === 'number') {
//           setTotalUsers(response.count);
//         }
//       } catch (error) {
//         console.error('Failed to fetch user count:', error);
//         // Fallback to stores length if API fails
//         setTotalUsers(allStores.length);
//       } finally {
//         setIsLoadingUsers(false);
//       }
//     };

//     if (user?.role === 'superadmin') {
//       fetchUserCount();
//     } else {
//       // If not admin, just show stores length
//       setTotalUsers(allStores.length);
//       setIsLoadingUsers(false);
//     }
//   }, [user?.role, allStores.length]);

//   // Fetch users data with stores and wallet information
//   useEffect(() => {
//     const fetchUsersData = async () => {
//       if (user?.role !== 'superadmin' || activeTab !== 'users') {
//         return;
//       }

//       setIsLoadingUsersData(true);
//       try {
//         // Fetch wallets (contains user info and balance)
//         const walletsResponse = await adminWalletApi.listWallets({ limit: 1000 });
//         const wallets = walletsResponse.data || [];

//         // Fetch all stores to map users to their stores
//         const storesResponse = await storeApi.listAllStores({ limit: 1000 });
//         const allStoresData = storesResponse.data || [];

//         // Group stores by merchant (userId)
//         const storesByUser: Record<string, any[]> = {};
//         allStoresData.forEach((store: any) => {
//           const merchantId = store.merchant?._id || store.merchant || store.userId;
//           if (merchantId) {
//             if (!storesByUser[merchantId]) {
//               storesByUser[merchantId] = [];
//             }
//             storesByUser[merchantId].push(store);
//           }
//         });

//         // Combine wallet data with stores
//         const usersList = wallets.map((wallet: any) => {
//           const userId = wallet.userId;
//           const userStores = storesByUser[userId] || [];
//           const revenue = wallet.balancePaise || 0;

//           return {
//             userId,
//             userName: wallet.userName || 'Unknown',
//             userEmail: wallet.userEmail || 'N/A',
//             stores: userStores,
//             revenue,
//             revenueRupees: wallet.balanceRupees || '0.00',
//             status: wallet.status === 'ACTIVE' ? 'Active' : 'Inactive',
//           };
//         });

//         setUsersData(usersList);
//       } catch (error) {
//         console.error('Failed to fetch users data:', error);
//         toast.error('Failed to load users data');
//       } finally {
//         setIsLoadingUsersData(false);
//       }
//     };

//     fetchUsersData();
//   }, [user?.role, activeTab]);

//   // Fetch products count from backend for stats
//   useEffect(() => {
//     const fetchProductsCount = async () => {
//       if (user?.role !== 'superadmin') {
//         return;
//       }

//       setIsLoadingProductsCount(true);
//       try {
//         // Fetch with minimal limit to get just the pagination info
//         const response = await productApi.getAll({
//           page: 1,
//           limit: 1,
//         });

//         if (response && response.success !== false) {
//           const pagination = response.pagination || { total: 0 };
//           setProductsCount(pagination.total || 0);
//         } else {
//           // Fallback to localStorage count if API fails
//           setProductsCount(totalProducts);
//         }
//       } catch (error) {
//         console.error('Failed to fetch products count:', error);
//         // Fallback to localStorage count if API fails
//         setProductsCount(totalProducts);
//       } finally {
//         setIsLoadingProductsCount(false);
//       }
//     };

//     fetchProductsCount();
//   }, [user?.role, totalProducts]);

//   // Fetch platform-wide orders for Orders tab (superadmin)
//   useEffect(() => {
//     const fetchOrders = async () => {
//       if (user?.role !== 'superadmin') return;
//       if (activeTab !== 'orders') return;

//       setIsLoadingOrders(true);
//       setOrdersError(null);
//       try {
//         const data = await storeOrdersApi.listForMerchant();
//         setPlatformOrders(Array.isArray(data) ? data : []);
//       } catch (error: any) {
//         console.error('Failed to fetch platform orders:', error);
//         setOrdersError(error?.message || 'Failed to load orders');
//       } finally {
//         setIsLoadingOrders(false);
//       }
//     };

//     fetchOrders();
//   }, [user?.role, activeTab]);

//   // Filter and sort orders based on all criteria
//   const filteredOrders = useMemo(() => {
//     let filtered = [...platformOrders];

//     // Apply search filter
//     if (ordersSearchQuery.trim()) {
//       const query = ordersSearchQuery.toLowerCase().trim();
//       filtered = filtered.filter((order) => {
//         // Search by customer email
//         const emailMatch = order.customerEmail?.toLowerCase().includes(query);

//         // Search by store name (from order.storeId)
//         let storeName = '';
//         if (order.storeId && typeof order.storeId === 'object' && order.storeId !== null) {
//           storeName = (order.storeId as { name?: string }).name || '';
//         }
//         const storeMatch = storeName.toLowerCase().includes(query);

//         return emailMatch || storeMatch;
//       });
//     }

//     // Apply status filter
//     if (ordersStatusFilter !== 'all') {
//       filtered = filtered.filter((order) => order.status === ordersStatusFilter);
//     }

//     // Apply amount sorting
//     if (ordersAmountSort !== 'none') {
//       filtered.sort((a, b) => {
//         const amountA = a.total !== undefined ? a.total : 0;
//         const amountB = b.total !== undefined ? b.total : 0;

//         if (ordersAmountSort === 'low-high') {
//           return amountA - amountB;
//         } else if (ordersAmountSort === 'high-low') {
//           return amountB - amountA;
//         }
//         return 0;
//       });
//     }

//     // Apply alphabetical sorting
//     if (ordersAlphabeticalSort !== 'none') {
//       filtered.sort((a, b) => {
//         let compareA = '';
//         let compareB = '';

//         if (ordersAlphabeticalSort === 'store-az' || ordersAlphabeticalSort === 'store-za') {
//           // Sort by store name
//           let storeNameA = '';
//           let storeNameB = '';
//           if (a.storeId && typeof a.storeId === 'object' && a.storeId !== null) {
//             storeNameA = (a.storeId as { name?: string }).name || '';
//           }
//           if (b.storeId && typeof b.storeId === 'object' && b.storeId !== null) {
//             storeNameB = (b.storeId as { name?: string }).name || '';
//           }
//           compareA = storeNameA.toLowerCase();
//           compareB = storeNameB.toLowerCase();
//         } else if (ordersAlphabeticalSort === 'email-az' || ordersAlphabeticalSort === 'email-za') {
//           // Sort by customer email
//           compareA = (a.customerEmail || '').toLowerCase();
//           compareB = (b.customerEmail || '').toLowerCase();
//         }

//         const comparison = compareA.localeCompare(compareB);

//         if (ordersAlphabeticalSort === 'store-za' || ordersAlphabeticalSort === 'email-za') {
//           return -comparison; // Reverse for Z-A
//         }
//         return comparison; // A-Z
//       });
//     }

//     return filtered;
//   }, [platformOrders, ordersSearchQuery, ordersStatusFilter, ordersAmountSort, ordersAlphabeticalSort]);

//   // Fetch admin dashboard statistics
//   useEffect(() => {
//     const fetchAdminStats = async () => {
//       if (user?.role !== 'superadmin' || activeTab !== 'overview') return;

//       setIsLoadingStats(true);
//       try {
//         // TODO: Implement getAdminStats API endpoint
//         // const response = await storeOrdersApi.getAdminStats();
//         // if (response.success) {
//         //   setAdminStats(response.data);
//         // }
//         // For now, set empty stats
//         setAdminStats(null);
//       } catch (error) {
//         console.error('Failed to fetch admin stats:', error);
//       } finally {
//         setIsLoadingStats(false);
//       }
//     };

//     fetchAdminStats();
//   }, [user?.role, activeTab]);

//   // Filter and sort products
//   const filteredAndSortedProducts = useMemo(() => {
//     let filtered = [...databaseProducts];

//     // Apply status filter
//     if (statusFilter !== 'all') {
//       if (statusFilter === 'active') {
//         filtered = filtered.filter(p => p.isActive);
//       } else if (statusFilter === 'archived') {
//         filtered = filtered.filter(p => !p.isActive);
//       }
//       // TODO: Add draft status filtering when draft status is implemented
//     }

//     // Apply category filter (placeholder - can be enhanced when categories are added)
//     // For now, category filter doesn't do anything

//     // Apply sorting
//     filtered.sort((a, b) => {
//       switch (sortBy) {
//         case 'oldest':
//           return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
//         case 'price-low':
//           return (a.catalogue?.basePrice || 0) - (b.catalogue?.basePrice || 0);
//         case 'price-high':
//           return (b.catalogue?.basePrice || 0) - (a.catalogue?.basePrice || 0);
//         case 'newest':
//         default:
//           return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
//       }
//     });

//     return filtered;
//   }, [databaseProducts, statusFilter, categoryFilter, sortBy]);

//   // Fetch products from database
//   const fetchProducts = useCallback(async () => {
//     if (activeTab !== 'products') {
//       return;
//     }

//     if (user?.role !== 'superadmin') {
//       return;
//     }

//     console.log('Fetching products from database...', { productsPage, productsSearchQuery });
//     setIsLoadingProducts(true);
//     try {
//       const response = await productApi.getAll({
//         page: productsPage,
//         limit: 20,
//         search: productsSearchQuery.trim() || undefined,
//       });

//       console.log('Products API response:', response);

//       // Handle response structure
//       if (response && response.success !== false) {
//         const productsArray = Array.isArray(response.data) ? response.data : [];
//         const pagination = response.pagination || { total: productsArray.length };

//         console.log(`Loaded ${productsArray.length} products out of ${pagination.total} total`);
//         setDatabaseProducts(productsArray);
//         setProductsTotal(pagination.total || productsArray.length);
//       } else {
//         console.warn('API response indicates failure:', response);
//         setDatabaseProducts([]);
//         setProductsTotal(0);
//       }
//     } catch (error: any) {
//       console.error('Failed to fetch products:', error);
//       toast.error(error.message || 'Failed to load products from database');
//       setDatabaseProducts([]);
//       setProductsTotal(0);
//     } finally {
//       setIsLoadingProducts(false);
//     }
//   }, [activeTab, user?.role, productsPage, productsSearchQuery]);

//   // Fetch All Stores
//   useEffect(() => {
//     let isMounted = true;

//     const loadStores = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await storeApi.listAllStores({
//           page: storesPage,
//           limit: storesLimit,
//           search: searchQuery,
//           sortBy: storesSortBy,
//           sortOrder: storesSortOrder
//         });

//         if (isMounted) {
//           if (response.success) {
//             setStores(response.data || []);
//             if (response.pagination) {
//               setStoresTotal(response.pagination.total);
//             }
//           }
//         }
//       } catch (err: any) {
//         if (isMounted) {
//           setError(err?.message || 'Failed to load stores');
//         }
//       } finally {
//         if (isMounted) {
//           setLoading(false);
//         }
//       }
//     };

//     const timeoutId = setTimeout(() => {
//       loadStores();
//     }, 500);

//     return () => {
//       isMounted = false;
//       clearTimeout(timeoutId);
//     };
//   }, [storesPage, storesLimit, searchQuery, storesSortBy, storesSortOrder]);


//   // Update URL when tab changes
//   useEffect(() => {
//     if (activeTab) {
//       setSearchParams({ tab: activeTab }, { replace: true });
//     }
//   }, [activeTab, setSearchParams]);

//   // Fetch Shopify Orders (Super Admin tab)
//   useEffect(() => {
//     const fetchShopifyOrders = async () => {
//       if (user?.role !== 'superadmin' || activeTab !== 'shopify-orders') return;
//       setIsLoadingShopifyOrders(true);
//       try {
//         const resp = await adminShopifyOrdersApi.list({
//           page: shopifyOrdersPage,
//           limit: shopifyOrdersLimit,
//           shop: shopifyOrdersShopFilter || undefined,
//           financialStatus: shopifyOrdersFinancialStatus || undefined,
//           fulfillmentStatus: shopifyOrdersFulfillmentStatus || undefined,
//           dateFrom: shopifyOrdersDateFrom || undefined,
//           dateTo: shopifyOrdersDateTo || undefined,
//           search: shopifyOrdersSearch || undefined,
//         });
//         if (resp && resp.success) {
//           setShopifyOrders(resp.orders || []);
//           setShopifyOrdersTotal(resp.total || 0);
//           setShopifyOrdersPages(resp.pages || 1);
//         }
//       } catch (error) {
//         console.error('Failed to fetch Shopify orders:', error);
//         toast.error('Failed to load Shopify orders');
//       } finally {
//         setIsLoadingShopifyOrders(false);
//       }
//     };
//     fetchShopifyOrders();
//   }, [
//     activeTab,
//     user?.role,
//     shopifyOrdersPage,
//     shopifyOrdersLimit,
//     shopifyOrdersShopFilter,
//     shopifyOrdersFinancialStatus,
//     shopifyOrdersFulfillmentStatus,
//     shopifyOrdersDateFrom,
//     shopifyOrdersDateTo,
//     shopifyOrdersSearch,
//   ]);

//   // Fetch Import Orders
//   useEffect(() => {
//     const fetchImportOrders = async () => {
//       if (user?.role !== 'superadmin' || activeTab !== 'import-orders') return;
//       setIsLoadingImportOrders(true);
//       try {
//         const resp = await adminImportOrdersApi.list({
//           page: importOrdersPage,
//           limit: 25,
//           shop: importOrdersShopFilter || undefined,
//           status: importOrdersStatusFilter || undefined,
//           search: importOrdersSearch || undefined,
//         });
//         if (resp && resp.success) {
//           setImportOrders(resp.data || []);
//           setImportOrdersTotal(resp.pagination?.total || 0);
//         }
//       } catch (error) {
//         console.error('Failed to fetch import orders:', error);
//         toast.error('Failed to load import orders');
//       } finally {
//         setIsLoadingImportOrders(false);
//       }
//     };
//     fetchImportOrders();
//   }, [
//     activeTab,
//     user?.role,
//     importOrdersPage,
//     importOrdersShopFilter,
//     importOrdersStatusFilter,
//     importOrdersSearch,
//   ]);

//   // Fetch Product Mappings
//   useEffect(() => {
//     const fetchProductMappings = async () => {
//       if (user?.role !== 'superadmin' || activeTab !== 'product-mappings') return;
//       setIsLoadingProductMappings(true);
//       try {
//         const resp = await adminProductMappingApi.list({
//           page: productMappingsPage,
//           limit: 25,
//           shop: productMappingsShopFilter || undefined,
//           search: productMappingsSearch || undefined,
//         });
//         if (resp && resp.success) {
//           setProductMappings(resp.data || []);
//           setProductMappingsTotal(resp.pagination?.total || 0);
//         }
//       } catch (error) {
//         console.error('Failed to fetch product mappings:', error);
//         toast.error('Failed to load product mappings');
//       } finally {
//         setIsLoadingProductMappings(false);
//       }
//     };
//     fetchProductMappings();
//   }, [
//     activeTab,
//     user?.role,
//     productMappingsPage,
//     productMappingsShopFilter,
//     productMappingsSearch,
//   ]);

//   // Fetch Production Jobs
//   useEffect(() => {
//     const fetchProductionJobs = async () => {
//       if (user?.role !== 'superadmin' || activeTab !== 'production-jobs') return;
//       setIsLoadingProductionJobs(true);
//       try {
//         const resp = await adminProductionJobApi.list({
//           page: productionJobsPage,
//           limit: 25,
//           shop: productionJobsShopFilter || undefined,
//           status: productionJobsStatusFilter || undefined,
//           search: productionJobsSearch || undefined,
//         });
//         if (resp && resp.success) {
//           setProductionJobs(resp.data || []);
//           setProductionJobsTotal(resp.pagination?.total || 0);
//         }
//       } catch (error) {
//         console.error('Failed to fetch production jobs:', error);
//         toast.error('Failed to load production jobs');
//       } finally {
//         setIsLoadingProductionJobs(false);
//       }
//     };
//     fetchProductionJobs();
//   }, [
//     activeTab,
//     user?.role,
//     productionJobsPage,
//     productionJobsShopFilter,
//     productionJobsStatusFilter,
//     productionJobsSearch,
//   ]);

//   // POD Pipeline Helpers
//   const handleImportOrder = async (shop: string, orderId: string) => {
//     try {
//       const resp = await adminImportOrdersApi.import({ shop, shopifyOrderId: orderId });
//       if (resp.success) {
//         toast.success('Order imported and normalized');
//         setActiveTab('import-orders');
//         // Refresh list
//         const listResp = await adminImportOrdersApi.list({ page: 1, limit: 25 });
//         if (listResp.success) {
//           setImportOrders(listResp.data);
//           setImportOrdersTotal(listResp.pagination.total);
//         }
//       }
//     } catch (err: any) {
//       toast.error(err.message || 'Import failed');
//     }
//   };

//   const handleCreateProductionJob = async (orderId: string) => {
//     try {
//       const resp = await adminProductionJobApi.create(orderId);
//       if (resp.success) {
//         toast.success('Production job created');
//         setActiveTab('production-jobs');
//         // Refresh list
//         const listResp = await adminProductionJobApi.list({ page: 1, limit: 25 });
//         if (listResp.success) {
//           setProductionJobs(listResp.data);
//           setProductionJobsTotal(listResp.pagination.total);
//         }
//       }
//     } catch (err: any) {
//       toast.error(err.message || 'Job creation failed');
//     }
//   };

//   const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
//   const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
//     try {
//       setIsUpdatingStatus(jobId);
//       const resp = await adminProductionJobApi.updateStatus(jobId, newStatus);
//       if (resp.success) {
//         toast.success(`Status updated to ${newStatus}`);
//         setProductionJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
//       }
//     } catch (err: any) {
//       toast.error(err.message || 'Status update failed');
//     } finally {
//       setIsUpdatingStatus(null);
//     }
//   };

//   const [isUpdatingShipping, setIsUpdatingShipping] = useState<string | null>(null);
//   const handleUpdateShipping = async (jobId: string, shipping: any) => {
//     try {
//       setIsUpdatingShipping(jobId);
//       const resp = await adminProductionJobApi.updateShipping(jobId, shipping);
//       if (resp.success) {
//         toast.success('Shipping info updated');
//         setProductionJobs(prev => prev.map(j => j._id === jobId ? { ...j, ...resp.data } : j));
//       }
//     } catch (err: any) {
//       toast.error(err.message || 'Shipping update failed');
//     } finally {
//       setIsUpdatingShipping(null);
//     }
//   };

//   const fetchUnmappedItems = useCallback(async () => {
//     if (activeTab !== 'product-mappings' && activeTab !== 'import-orders') return;
//     setIsLoadingUnmappedItems(true);
//     try {
//       const resp = await adminImportOrdersApi.getUnmappedItems();
//       if (resp.success) {
//         setUnmappedItems(resp.data || []);
//       }
//     } catch (err: any) {
//       console.error('Failed to fetch unmapped items:', err);
//     } finally {
//       setIsLoadingUnmappedItems(false);
//     }
//   }, [activeTab]);
//   useEffect(() => {
//     fetchUnmappedItems();
//   }, [activeTab, fetchUnmappedItems]);
//   useEffect(() => {
//     // Fetch immediately when tab becomes active or page changes
//     if (activeTab === 'products' && user?.role === 'superadmin') {
//       if (productsSearchQuery) {
//         // Debounce search query
//         const timeoutId = setTimeout(() => {
//           fetchProducts();
//         }, 500);
//         return () => clearTimeout(timeoutId);
//       } else {
//         // Fetch immediately for page changes or initial load
//         fetchProducts();
//       }
//     }
//   }, [activeTab, productsPage, productsSearchQuery, user?.role, fetchProducts]);

//   // Handle suspending/unsuspending a store
//   const handleSuspendStore = async () => {
//     if (!suspendingStoreId) return;

//     try {
//       setIsSuspendingStore(true);
//       // TODO: Implement suspend API endpoint
//       // const response = await storeApi.suspend(suspendingStoreId);
//       // For now, use update method to toggle isActive status
//       const store = stores.find(s => s.id === suspendingStoreId);
//       if (store) {
//         const response = await storeApi.update(suspendingStoreId, {
//           // Note: This may need to be adjusted based on actual API structure
//         });
//         if (response.success) {
//           toast.success(response.message || 'Store status updated successfully');
//           setSuspendingStoreId(null);
//           // Reload stores list
//           const updatedResponse = await storeApi.listAllStores({
//             page: storesPage,
//             limit: storesLimit,
//             search: searchQuery,
//             sortBy: storesSortBy,
//             sortOrder: storesSortOrder
//           });
//           if (updatedResponse.success) {
//             setStores(updatedResponse.data || []);
//             setStoresTotal(updatedResponse.pagination.total);
//           }
//         }
//       }
//     } catch (err: any) {
//       toast.error(err?.message || 'Failed to update store status');
//     } finally {
//       setIsSuspendingStore(false);
//     }
//   };


//   const stats = [
//     {
//       label: 'Monthly Revenue',
//       value: isLoadingStats ? '...' : `₹${(adminStats?.monthlyRevenue || 0).toLocaleString()}`,
//       change: '+23%',
//       trend: 'up',
//       icon: DollarSign
//     },
//     {
//       label: 'Active Stores',
//       value: `${effectiveStores.length}`,
//       change: '+15%',
//       trend: 'up',
//       icon: Store
//     },
//     {
//       label: 'Base Products',
//       value: isLoadingProductsCount ? '...' : (productsCount > 0 ? productsCount.toString() : totalProducts.toString()),
//       change: '+8%',
//       trend: 'up',
//       icon: Package
//     },
//     {
//       label: 'Orders Delivered',
//       value: isLoadingStats ? '...' : (adminStats?.deliveredOrders || 0).toString(),
//       change: '+12%',
//       trend: 'up',
//       icon: Truck
//     },
//   ];

//   const revenueData = [
//     { month: 'Jan', revenue: 12400, orders: 89 },
//     { month: 'Feb', revenue: 15800, orders: 112 },
//     { month: 'Mar', revenue: 19200, orders: 145 },
//     { month: 'Apr', revenue: 22100, orders: 167 },
//     { month: 'May', revenue: 28400, orders: 198 },
//     { month: 'Jun', revenue: 32600, orders: 234 },
//   ];

//   const regionData = [
//     { name: 'North America', value: 45, color: 'hsl(var(--primary))' },
//     { name: 'Europe', value: 30, color: 'hsl(var(--accent-foreground))' },
//     { name: 'Asia', value: 18, color: 'hsl(159 58% 60%)' },
//     { name: 'Others', value: 7, color: 'hsl(var(--muted-foreground))' },
//   ];

//   const topProducts = adminStats?.topProducts?.map(p => ({
//     id: p._id,
//     name: p.storeName || p.name || 'Unknown',
//     sales: p.salesCount || 0,
//     revenue: p.revenue || 0,
//     imageUrl: p.imageUrl || p.mockupUrl || '', // Support both imageUrl and mockupUrl
//     userId: p.userId || p.storeId || '' // Support both userId and storeId
//   })) || [];

//   const fulfillmentPartners = [
//     { id: 2, name: 'EuroFulfill', status: 'active', performance: 95, avgTime: '3.1 days', orders: 892 },
//     { id: 3, name: 'AsiaPress', status: 'warning', performance: 87, avgTime: '4.2 days', orders: 567 },
//     { id: 4, name: 'QuickShip Global', status: 'active', performance: 96, avgTime: '2.8 days', orders: 1034 },
//   ];

//   const supportTickets = [
//     { id: 'TKT-001', user: 'john@example.com', subject: 'Payment issue', priority: 'high', status: 'open' },
//     { id: 'TKT-002', user: 'jane@example.com', subject: 'Product quality question', priority: 'medium', status: 'in-progress' },
//     { id: 'TKT-003', user: 'mike@example.com', subject: 'Shipping delay', priority: 'high', status: 'open' },
//     { id: 'TKT-004', user: 'sara@example.com', subject: 'Account access', priority: 'low', status: 'resolved' },
//   ];

//   const alerts = [
//     { id: 1, type: 'warning', message: 'High order volume in North America region', time: '2h ago' },
//     { id: 2, type: 'error', message: 'Fulfillment delay from AsiaPress partner', time: '5h ago' },
//     { id: 3, type: 'info', message: '3 new stores pending approval', time: '1d ago' },
//   ];

//   return (
//     <div className="min-h-screen bg-background">
//       {/* Header */}
//       <header className="fixed top-0 left-0 right-0 h-16 border-b bg-card z-50 px-6">
//         <div className="flex items-center justify-between h-full">
//           <div className="flex items-center gap-8">
//             <Link to="/" className="flex items-center space-x-2">
//               <img src={logo} alt="ShelfMerch" className="h-8 w-auto" />
//             </Link>
//             <nav className="hidden md:flex items-center gap-1">
//               <Button variant="ghost" size="sm" asChild>
//                 <Link to="/products">Catalog</Link>
//               </Button>
//               <Button variant="ghost" size="sm" asChild>
//                 <a href="#pricing">Pricing</a>
//               </Button>
//               <Button variant="ghost" size="sm" asChild>
//                 <a href="#support">Support</a>
//               </Button>
//               <Button variant="ghost" size="sm" asChild>
//                 <a href="#help">Help Center</a>
//               </Button>
//             </nav>
//           </div>

//           <div className="flex items-center gap-3">
//             <Dialog>
//               <DialogTrigger asChild>
//                 <Button variant="ghost" size="icon" className="relative">
//                   <Bell className="h-5 w-5" />
//                   {alerts.length > 0 && (
//                     <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
//                   )}
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>System Alerts</DialogTitle>
//                   <DialogDescription>Recent platform notifications</DialogDescription>
//                 </DialogHeader>
//                 <div className="space-y-4">
//                   {alerts.map((alert) => (
//                     <div key={alert.id} className="flex gap-3 p-3 rounded-lg border">
//                       {alert.type === 'error' && <AlertTriangle className="h-5 w-5 text-destructive" />}
//                       {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
//                       {alert.type === 'info' && <Bell className="h-5 w-5 text-primary" />}
//                       <div className="flex-1">
//                         <p className="text-sm font-medium">{alert.message}</p>
//                         <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </DialogContent>
//             </Dialog>

//             <div className="flex items-center gap-2 border-l pl-3">
//               <div className="text-right hidden sm:block">
//                 <p className="text-sm font-medium">{user?.name}</p>
//                 <p className="text-xs text-muted-foreground">{user?.email}</p>
//               </div>
//               <Button variant="ghost" size="icon" onClick={logout}>
//                 <LogOut className="h-5 w-5" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Sidebar */}
//       <aside className="fixed left-0 top-16 bottom-0 w-64 border-r bg-card p-6 overflow-y-auto">
//         <div className="mb-6 p-3 bg-primary/10 rounded-lg">
//           <p className="text-xs font-semibold text-primary">SUPER ADMIN</p>
//         </div>

//         <nav className="space-y-6">
//           {/* Core */}
//           <div className="space-y-1">
//             <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
//               Core
//             </p>
//             <Button
//               variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'overview' && "bg-secondary font-semibold"
//               )}
//               onClick={() => setActiveTab('overview')}
//             >
//               <TrendingUp className="mr-2 h-4 w-4" />
//               Overview
//             </Button>
//             <Button
//               variant={activeTab === 'products' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start relative",
//                 activeTab === 'products' && "bg-secondary font-semibold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-r"
//               )}
//               onClick={() => setActiveTab('products')}
//             >
//               <Package className="mr-2 h-4 w-4" />
//               Product Catalog
//             </Button>
//             <Button
//               variant={activeTab === 'orders' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'orders' && "bg-secondary font-semibold"
//               )}
//               className={cn("w-full justify-start", activeTab === 'orders' && "bg-secondary font-semibold")}
//               onClick={() => setActiveTab('orders')}
//             >
//               <ShoppingBag className="mr-2 h-4 w-4" />
//               Orders
//               Direct Orders
//             </Button>
//             <Button
//               variant={activeTab === 'shopify-orders' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'shopify-orders' && "bg-secondary font-semibold"
//               )}
//               onClick={() => setActiveTab('shopify-orders')}
//               variant={activeTab === 'wallets' ? 'secondary' : 'ghost'}
//               className={cn("w-full justify-start", activeTab === 'wallets' && "bg-secondary font-semibold")}
//               onClick={() => setActiveTab('wallets')}
//             >
//               <ShoppingBag className="mr-2 h-4 w-4" />
//               Shopify Orders
//               <Wallet className="mr-2 h-4 w-4" />
//               Wallets
//             </Button>
//             <Button
//               variant={activeTab === 'fulfillment' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'fulfillment' && "bg-secondary font-semibold"
//               )}
//               onClick={() => setActiveTab('fulfillment')}
//               variant={activeTab === 'withdrawals' ? 'secondary' : 'ghost'}
//               className={cn("w-full justify-start", activeTab === 'withdrawals' && "bg-secondary font-semibold")}
//               onClick={() => setActiveTab('withdrawals')}
//             >
//               <Truck className="mr-2 h-4 w-4" />
//               Fulfillment
//               <Banknote className="mr-2 h-4 w-4" />
//               Withdrawals
//             </Button>
//           </div>

//           {/* POD Pipeline */}
//           {/* POD PIPELINE Section */}
//           <div className="space-y-1">
//             <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
//               POD Pipeline
//             </p>
//             <Button
//               variant={activeTab === 'shopify-orders' ? 'secondary' : 'ghost'}
//               className={cn("w-full justify-start", activeTab === 'shopify-orders' && "bg-secondary font-semibold")}
//               onClick={() => setActiveTab('shopify-orders')}
//             >
//               <ShoppingBag className="mr-2 h-4 w-4" />
//               Shopify Orders
//             </Button>
//             <Button
//               variant={activeTab === 'import-orders' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'import-orders' && "bg-secondary font-semibold"
//               )}
//               className={cn("w-full justify-start", activeTab === 'import-orders' && "bg-secondary font-semibold")}
//               onClick={() => setActiveTab('import-orders')}
//             >
//               <Download className="mr-2 h-4 w-4" />
//               Import Orders
//             </Button>
//             <Button
//               variant={activeTab === 'product-mappings' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'product-mappings' && "bg-secondary font-semibold"
//               )}
//               className={cn("w-full justify-start", activeTab === 'product-mappings' && "bg-secondary font-semibold")}
//               onClick={() => setActiveTab('product-mappings')}
//             >
//               <Palette className="mr-2 h-4 w-4" />
//               Product Mapping
//             </Button>
//             <Button
//               variant={activeTab === 'production-jobs' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'production-jobs' && "bg-secondary font-semibold"
//               )}
//               className={cn("w-full justify-start", activeTab === 'production-jobs' && "bg-secondary font-semibold")}
//               onClick={() => setActiveTab('production-jobs')}
//             >
//               <Activity className="mr-2 h-4 w-4" />
//               Production Jobs
//             </Button>
//           </div>

//           {/* Finance */}
//           <div className="space-y-1">
//             <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
//               Finance
//             </p>
//             <Button
//               variant={activeTab === 'wallets' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'wallets' && "bg-secondary font-semibold"
//               )}
//               onClick={() => setActiveTab('wallets')}
//             >
//               <Wallet className="mr-2 h-4 w-4" />
//               Wallets
//             </Button>
//             <Button
//               variant={activeTab === 'invoices' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'invoices' && "bg-secondary font-semibold"
//               )}
//               onClick={() => setActiveTab('invoices')}
//             >
//               <FileText className="mr-2 h-4 w-4" />
//               Invoices
//             </Button>
//             <Button
//               variant={activeTab === 'withdrawals' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'withdrawals' && "bg-secondary font-semibold"
//               )}
//               onClick={() => setActiveTab('withdrawals')}
//             >
//               <Banknote className="mr-2 h-4 w-4" />
//               Withdrawals
//             </Button>
//           </div>
//           {/* Platform */}
//           {/* Platform Settings */}
//           <div className="space-y-1">
//             <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
//               Platform
//             </p>
//             <Button
//               variant={activeTab === 'stores' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'stores' && "bg-secondary font-semibold"
//               )}
//               onClick={() => setActiveTab('stores')}
//             >
//               <Store className="mr-2 h-4 w-4" />
//               Active Stores
//             </Button>
//             <Button
//               variant={activeTab === 'users' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'users' && "bg-secondary font-semibold"
//               )}
//               onClick={() => setActiveTab('users')}
//             >
//               <Users className="mr-2 h-4 w-4" />
//               User Management
//             </Button>
//             <Button
//               variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'settings' && "bg-secondary font-semibold"
//               )}
//               className={cn("w-full justify-start", activeTab === 'settings' && "bg-secondary font-semibold")}
//               onClick={() => setActiveTab('settings')}
//             >
//               <Settings className="mr-2 h-4 w-4" />
//               Platform Settings
//             </Button>
//             <Button
//               variant="ghost"
//               className="w-full justify-start"
//               asChild
//             >
//               <Link to="/admin/variant-options">
//                 <Package className="mr-2 h-4 w-4" />
//                 Variant Options
//               </Link>
//             </Button>
//             <Button
//               variant="ghost"
//               className="w-full justify-start"
//               asChild
//             >
//               <Link to="/admin/assets">
//                 <Palette className="mr-2 h-4 w-4" />
//                 Design Assets
//               </Link>
//             </Button>
//             <Button
//               variant="ghost"
//               className="w-full justify-start"
//               asChild
//             >
//               <Link to="/admin/catalogue-fields">
//                 <FileText className="mr-2 h-4 w-4" />
//                 Catalogue Fields
//               </Link>
//             </Button>
//             <Button
//               variant={activeTab === 'audit' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'audit' && "bg-secondary font-semibold"
//               )}
//               onClick={() => setActiveTab('audit')}
//             >
//               <Shield className="mr-2 h-4 w-4" />
//               Audit Logs
//             </Button>
//           </div>
//           {/* Insights & Marketing */}
//           <div className="space-y-1">
//             <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
//               Insights
//             </p>
//             <Button
//               variant={activeTab === 'analytics' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'analytics' && "bg-secondary font-semibold"
//               )}
//               onClick={() => setActiveTab('analytics')}
//             >
//               <BarChart3 className="mr-2 h-4 w-4" />
//               Analytics
//             </Button>
//             <Button
//               variant={activeTab === 'marketing' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'marketing' && "bg-secondary font-semibold"
//               )}
//               onClick={() => setActiveTab('marketing')}
//             >
//               <Megaphone className="mr-2 h-4 w-4" />
//               Marketing
//               Settings
//             </Button>
//             <Button
//               variant={activeTab === 'support' ? 'secondary' : 'ghost'}
//               className={cn(
//                 "w-full justify-start",
//                 activeTab === 'support' && "bg-secondary font-semibold"
//               )}
//               className={cn("w-full justify-start", activeTab === 'support' && "bg-secondary font-semibold")}
//               onClick={() => setActiveTab('support')}
//             >
//               <MessageSquare className="mr-2 h-4 w-4" />
//               <HelpCircle className="mr-2 h-4 w-4" />
//               Support
//             </Button>
//           </div>
//         </nav>
//       </aside>
//       {/* Main Content */}
//       <main className="ml-64 mt-16 p-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Overview Tab */}
//           {activeTab === 'overview' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">Platform Overview</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Monitor your print-on-demand business at a glance
//                   </p>
//                 </div>
//                 <div className="flex gap-2">
//                   <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
//                     <SelectTrigger className="w-32">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="week">This Week</SelectItem>
//                       <SelectItem value="month">This Month</SelectItem>
//                       <SelectItem value="quarter">This Quarter</SelectItem>
//                       <SelectItem value="year">This Year</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <Button variant="outline" className="gap-2">
//                     <Download className="h-4 w-4" />
//                     Export
//                   </Button>
//                 </div>
//               </div>

//               {/* Stats Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                 {stats.map((stat) => (
//                   <Card key={stat.label}>
//                     <CardContent className="p-6">
//                       <div className="flex items-center justify-between mb-2">
//                         <stat.icon className="h-8 w-8 text-primary" />
//                         <div className="flex items-center gap-1">
//                           {stat.trend === 'up' ? (
//                             <ArrowUpRight className="h-4 w-4 text-green-500" />
//                           ) : (
//                             <ArrowDownRight className="h-4 w-4 text-destructive" />
//                           )}
//                           <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-destructive'}`}>
//                             {stat.change}
//                           </span>
//                         </div>
//                       </div>
//                       <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
//                       <p className="text-3xl font-bold">{stat.value}</p>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>

//               {/* Charts Row */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Revenue Trend</CardTitle>
//                     <CardDescription>Monthly revenue and order volume</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <ResponsiveContainer width="100%" height={300}>
//                       <LineChart data={revenueData}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                         <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
//                         <YAxis stroke="hsl(var(--muted-foreground))" />
//                         <Tooltip
//                           contentStyle={{
//                             backgroundColor: 'hsl(var(--card))',
//                             border: '1px solid hsl(var(--border))',
//                             borderRadius: '8px'
//                           }}
//                         />
//                         <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Sales by Region</CardTitle>
//                     <CardDescription>Global distribution of orders</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <ResponsiveContainer width="100%" height={300}>
//                       <PieChart>
//                         <Pie
//                           data={regionData}
//                           cx="50%"
//                           cy="50%"
//                           labelLine={false}
//                           label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                           outerRadius={80}
//                           fill="hsl(var(--primary))"
//                           dataKey="value"
//                         >
//                           {regionData.map((entry, index) => (
//                             <Cell key={`cell-${index}`} fill={entry.color} />
//                           ))}
//                         </Pie>
//                         <Tooltip />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Top Products */}
//               <Card className="mb-8">
//                 <CardHeader>
//                   <CardTitle>Top Performing Products</CardTitle>
//                   <CardDescription>Best sellers this month</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Product</TableHead>
//                         <TableHead>Sales</TableHead>
//                         <TableHead>Revenue</TableHead>
//                         <TableHead>Store</TableHead>
//                         <TableHead className="text-right">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {topProducts.map((product) => (
//                         <TableRow key={product.id}>
//                           <TableCell>
//                             <div className="flex items-center gap-3">
//                               {product.imageUrl && (
//                                 <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded object-cover" />
//                               )}
//                               <span className="font-medium">{product.name}</span>
//                             </div>
//                           </TableCell>
//                           <TableCell>{product.sales} units</TableCell>
//                           <TableCell>₹{product.revenue.toLocaleString()}</TableCell>
//                           <TableCell>
//                             <Badge variant="secondary">
//                               {product.userId
//                                 ? allStores.find(s => s.userId === product.userId)?.storeName || 'Unknown'
//                                 : 'Unknown'}
//                             </Badge>
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <Button variant="ghost" size="sm">
//                               <ChevronRight className="h-4 w-4" />
//                             </Button>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>
//             </>
//           )}

//           {/* Stores Tab */}
//           {activeTab === 'stores' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">Active Stores</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Manage all merchant stores on the platform
//                   </p>
//                 </div>
//                 <Button className="gap-2">
//                   <Download className="h-4 w-4" />
//                   Export Store Data
//                 </Button>
//               </div>

//               <Card>
//                 <CardHeader>
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <CardTitle>All Stores ({storesTotal})</CardTitle>
//                       <CardDescription>Monitor and manage merchant storefronts</CardDescription>
//                     </div>
//                     <div className="relative">
//                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                       <Input
//                         placeholder="Search stores..."
//                         className="pl-9 w-64"
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                       />
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   {loading && stores.length === 0 ? (
//                     <div className="flex justify-center py-8">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//                     </div>
//                   ) : error ? (
//                     <div className="text-center py-8 text-red-500">{error}</div>
//                   ) : (
//                     <>
//                       <div className="rounded-md border">
//                         <Table>
//                           <TableHeader>
//                             <TableRow>
//                               <TableHead>Store ID</TableHead>
//                               <TableHead>Store Name</TableHead>
//                               <TableHead>Owner</TableHead>
//                               <TableHead>Created At</TableHead>
//                               <TableHead>Products</TableHead>
//                               <TableHead>Status</TableHead>
//                               <TableHead>Last Updated</TableHead>
//                               <TableHead className="text-right">Actions</TableHead>
//                             </TableRow>
//                           </TableHeader>
//                           <TableBody>
//                             {stores.length === 0 ? (
//                               <TableRow>
//                                 <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
//                                   No stores found
//                                 </TableCell>
//                               </TableRow>
//                             ) : (
//                               stores.map((store) => (
//                                 <TableRow key={store.id}>
//                                   <TableCell className="font-mono text-xs text-muted-foreground">
//                                     {store.id.substring(0, 8)}...
//                                   </TableCell>
//                                   <TableCell>
//                                     <div className="font-medium">{store.storeName}</div>
//                                     <div className="text-xs text-muted-foreground">
//                                       {store.subdomain}.shelfmerch.com
//                                     </div>
//                                   </TableCell>
//                                   <TableCell>
//                                     <div className="text-sm">{store.owner?.name || 'Unknown'}</div>
//                                     <div className="text-xs text-muted-foreground">{store.owner?.email}</div>
//                                   </TableCell>
//                                   <TableCell>
//                                     {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : '-'}
//                                   </TableCell>
//                                   <TableCell>{store.productsCount || 0}</TableCell>
//                                   <TableCell>
//                                     <Badge
//                                       variant={store.isActive ? "secondary" : "destructive"}
//                                       className={store.isActive ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""}
//                                     >
//                                       {store.isActive ? 'Active' : 'Inactive'}
//                                     </Badge>
//                                   </TableCell>
//                                   <TableCell>
//                                     {store.updatedAt ? new Date(store.updatedAt).toLocaleDateString() : '-'}
//                                   </TableCell>
//                                   <TableCell className="text-right">
//                                     <div className="flex gap-2 justify-end">
//                                       <Button variant="ghost" size="sm" asChild>
//                                         <Link to={`/store/${store.subdomain}`}>View</Link>
//                                       </Button>
//                                       <AlertDialog open={suspendingStoreId === store.id} onOpenChange={(open) => {
//                                         if (open) {
//                                           setSuspendingStoreId(store.id);
//                                         } else {
//                                           setSuspendingStoreId(null);
//                                         }
//                                       }}>
//                                         <AlertDialogTrigger asChild>
//                                           <Button variant="ghost" size="sm">
//                                             <Ban className="h-4 w-4" />
//                                           </Button>
//                                         </AlertDialogTrigger>
//                                         <AlertDialogContent>
//                                           <AlertDialogHeader>
//                                             <AlertDialogTitle>{store.isActive ? 'Suspend Store?' : 'Reactivate Store?'}</AlertDialogTitle>
//                                             <AlertDialogDescription>
//                                               {store.isActive
//                                                 ? 'This will temporarily disable the store and prevent new orders.'
//                                                 : 'This will reactivate the store and allow new orders.'
//                                               }
//                                             </AlertDialogDescription>
//                                           </AlertDialogHeader>
//                                           <AlertDialogFooter>
//                                             <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                             <AlertDialogAction onClick={handleSuspendStore} disabled={isSuspendingStore}>
//                                               {isSuspendingStore ? 'Processing...' : (store.isActive ? 'Suspend' : 'Reactivate')}
//                                             </AlertDialogAction>
//                                           </AlertDialogFooter>
//                                         </AlertDialogContent>
//                                       </AlertDialog>
//                                     </div>
//                                   </TableCell>
//                                 </TableRow>
//                               ))
//                             )}
//                           </TableBody>
//                         </Table>
//                       </div>

//                       {storesTotal > storesLimit && (
//                         <div className="mt-4">
//                           <Pagination>
//                             <PaginationContent>
//                               <PaginationItem>
//                                 <PaginationPrevious
//                                   onClick={() => setStoresPage(p => Math.max(1, p - 1))}
//                                   className={storesPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
//                                 />
//                               </PaginationItem>

//                               {Array.from({ length: Math.min(5, Math.ceil(storesTotal / storesLimit)) }, (_, i) => {
//                                 const totalPages = Math.ceil(storesTotal / storesLimit);
//                                 let startPage = Math.max(1, storesPage - 2);
//                                 if (startPage + 4 > totalPages) {
//                                   startPage = Math.max(1, totalPages - 4);
//                                 let pageNum = i + 1;
//                                 if (totalPages > 5 && storesPage > 3) {
//                                   pageNum = storesPage - 2 + i;
//                                   if (pageNum > totalPages) pageNum = totalPages - (4 - i);
//                                 }
//                                 const p = startPage + i;
//                                 if (p > totalPages) return null;

//                                 return (
//                                   <PaginationItem key={p}>
//                                   <PaginationItem key={i}>
//                                     <PaginationLink
//                                       isActive={storesPage === p}
//                                       onClick={() => setStoresPage(p)}
//                                       onClick={() => setStoresPage(pageNum)}
//                                       isActive={storesPage === pageNum}
//                                       className="cursor-pointer"
//                                     >
//                                       {p}
//                                       {pageNum}
//                                     </PaginationLink>
//                                   </PaginationItem>
//                                 );
//                               })}

//                               <PaginationItem>
//                                 <PaginationNext
//                                   onClick={() => setStoresPage(p => Math.min(Math.ceil(storesTotal / storesLimit), p + 1))}
//                                   className={storesPage >= Math.ceil(storesTotal / storesLimit) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
//                                 />
//                               </PaginationItem>
//                             </PaginationContent>
//                           </Pagination>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </CardContent>
//               </Card>
//             </>
//           )}

//           {/* Users Tab */}
//           {activeTab === 'users' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">User Management</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Manage creators, partners, and platform users
//                   </p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                 <Card>
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-muted-foreground">Total Users</p>
//                         <p className="text-2xl font-bold mt-1">
//                           {isLoadingUsers ? '...' : totalUsers}
//                         </p>
//                       </div>
//                       <Users className="h-8 w-8 text-primary" />
//                     </div>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-muted-foreground">Active Stores</p>
//                         <p className="text-2xl font-bold mt-1">{effectiveStores.length}</p>
//                       </div>
//                       <Store className="h-8 w-8 text-primary" />
//                     </div>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-muted-foreground">Pending Approval</p>
//                         <p className="text-2xl font-bold mt-1">3</p>
//                       </div>
//                       <Clock className="h-8 w-8 text-yellow-500" />
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>All Users</CardTitle>
//                   <CardDescription>View and manage platform members</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>User</TableHead>
//                         <TableHead>Stores</TableHead>
//                         <TableHead>Revenue</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead className="text-right">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {isLoadingUsersData ? (
//                         <TableRow>
//                           <TableCell colSpan={5} className="text-center py-8">
//                             <div className="flex items-center justify-center gap-2">
//                               <Clock className="h-4 w-4 animate-spin" />
//                               <span className="text-sm text-muted-foreground">Loading users...</span>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ) : usersData.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={5} className="text-center py-8">
//                             <span className="text-sm text-muted-foreground">No users found</span>
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         usersData.map((userData) => (
//                           <TableRow key={userData.userId}>
//                             <TableCell>
//                               <div>
//                                 <p className="font-medium">{userData.userName}</p>
//                                 <p className="text-sm text-muted-foreground">{userData.userEmail}</p>
//                               </div>
//                             </TableCell>
//                             <TableCell>
//                               {userData.stores.length} {userData.stores.length === 1 ? 'store' : 'stores'}
//                             </TableCell>
//                             <TableCell>
//                               {isLoadingUsersData ? (
//                                 <span className="text-sm text-muted-foreground">Loading...</span>
//                               ) : (
//                                 <span className="font-medium">₹{userData.revenueRupees}</span>
//                               )}
//                             </TableCell>
//                             <TableCell>
//                               <Badge
//                                 variant="secondary"
//                                 className={userData.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}
//                               >
//                                 {userData.status}
//                               </Badge>
//                             </TableCell>
//                             <TableCell className="text-right">
//                               <div className="flex gap-2 justify-end">
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   onClick={() => {
//                                     setEditingUserId(userData.userId);
//                                     toast.info('Edit user functionality - Open user details modal or navigate to edit page');
//                                     // TODO: Implement edit user modal or navigation
//                                   }}
//                                   disabled={editingUserId === userData.userId}
//                                 >
//                                   <Edit className="h-4 w-4" />
//                                 </Button>
//                                 <AlertDialog>
//                                   <AlertDialogTrigger asChild>
//                                     <Button
//                                       variant="ghost"
//                                       size="sm"
//                                       className="text-destructive"
//                                       disabled={disablingUserId === userData.userId}
//                                     >
//                                       <Ban className="h-4 w-4" />
//                                     </Button>
//                                   </AlertDialogTrigger>
//                                   <AlertDialogContent>
//                                     <AlertDialogHeader>
//                                       <AlertDialogTitle>Disable User</AlertDialogTitle>
//                                       <AlertDialogDescription>
//                                         Are you sure you want to disable {userData.userName}? This will prevent them from accessing their account.
//                                       </AlertDialogDescription>
//                                     </AlertDialogHeader>
//                                     <AlertDialogFooter>
//                                       <AlertDialogCancel>Cancel</AlertDialogCancel>
//                                       <AlertDialogAction
//                                         onClick={async () => {
//                                           setDisablingUserId(userData.userId);
//                                           try {
//                                             // TODO: Call backend API to disable user
//                                             // For now, just show a toast
//                                             toast.info('Disable user functionality - Call backend API to update user status');
//                                             // After successful API call, refresh users data
//                                             // await fetchUsersData();
//                                           } catch (error: any) {
//                                             toast.error(error.message || 'Failed to disable user');
//                                           } finally {
//                                             setDisablingUserId(null);
//                                           }
//                                         }}
//                                         className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                                       >
//                                         Disable
//                                       </AlertDialogAction>
//                                     </AlertDialogFooter>
//                                   </AlertDialogContent>
//                                 </AlertDialog>
//                               </div>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>
//             </>
//           )}


//           {/* Products Tab */}
//           {activeTab === 'products' && (
//             <>
//               {/* Page Header */}
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h1 className="text-3xl font-bold">Product Catalog</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Manage platform-wide base products for merchants
//                   </p>
//                 </div>
//                 <Button asChild className="gap-2">
//                   <Link to="/admin/products/new">
//                     <Plus className="h-4 w-4" />
//                     Add Base Product
//                   </Link>
//                 </Button>
//               </div>

//               {/* Error Banner */}
//               {!isLoadingProducts && databaseProducts.length === 0 && productsSearchQuery && (
//                 <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                   <p className="text-sm text-yellow-800">
//                     Could not load base products. Please try again.
//                   </p>
//                 </div>
//               )}

//               {/* Toolbar */}
//               <CatalogToolbar
//                 searchQuery={productsSearchQuery}
//                 onSearchChange={(value) => {
//                   setProductsSearchQuery(value);
//                   setProductsPage(1);
//                 }}
//                 statusFilter={statusFilter}
//                 onStatusFilterChange={setStatusFilter}
//                 categoryFilter={categoryFilter}
//                 onCategoryFilterChange={setCategoryFilter}
//                 sortBy={sortBy}
//                 onSortChange={setSortBy}
//                 totalCount={productsTotal}
//                 activeCount={databaseProducts.filter(p => p.isActive).length}
//                 draftCount={0} // TODO: Add draft status to products
//                 archivedCount={databaseProducts.filter(p => !p.isActive).length}
//               />

//               {/* Products Table */}
//               <div className="mt-4">
//                 <BaseProductsTable
//                   products={filteredAndSortedProducts}
//                   isLoading={isLoadingProducts}
//                   onEdit={(id) => {
//                     window.location.href = `/admin/products/${id}/edit`;
//                   }}
//                   // onDuplicate={(id) => {
//                   //   toast.info('Duplicate functionality coming soon');
//                   // }}
//                   onArchive={async (id) => {
//                     try {
//                       const response = await productApi.delete(id);
//                       if (response && response.success) {
//                         toast.success('Product archived successfully');
//                       } else {
//                         toast.error('Failed to archive product');
//                       }
//                       // Refresh products list
//                       await fetchProducts();
//                     } catch (error: any) {
//                       toast.error(error.message || 'Failed to archive product');
//                     }
//                   }}
//                   onDelete={async (id) => {
//                     try {
//                       const response = await productApi.delete(id);
//                       if (response && response.success) {
//                         toast.success('Product deleted successfully');
//                       } else {
//                         toast.error('Failed to delete product');
//                       }
//                       // Refresh products list
//                       await fetchProducts();
//                     } catch (error: any) {
//                       toast.error(error.message || 'Failed to delete product');
//                     }
//                   }}
//                 />
//               </div>

//               {/* Pagination */}
//               {productsTotal > 20 && !isLoadingProducts && databaseProducts.length > 0 && (
//                 <div className="flex items-center justify-between mt-6 pt-4 border-t">
//                   <p className="text-sm text-muted-foreground">
//                     Showing {((productsPage - 1) * 20) + 1} to {Math.min(productsPage * 20, productsTotal)} of {productsTotal} products
//                   </p>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setProductsPage(p => Math.max(1, p - 1))}
//                       disabled={productsPage === 1}
//                     >
//                       Previous
//                     </Button>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setProductsPage(p => p + 1)}
//                       disabled={productsPage * 20 >= productsTotal}
//                     >
//                       Next
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}


//           {/* Orders Tab */}
//           {activeTab === 'orders' && (
//           {/* Shopify Orders Tab */}
//           {activeTab === 'shopify-orders' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">Order Management</h1>
//                   <h1 className="text-3xl font-bold">Shopify Orders</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Monitor all platform orders and fulfillment
//                     Manage and import orders directly from connected Shopify stores.
//                   </p>
//                 </div>
//                 <Button variant="outline" className="gap-2">
//                   <Download className="h-4 w-4" />
//                   Export Orders
//                 </Button>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//                 <Card>
//                   <CardContent className="p-6">
//                     <p className="text-sm text-muted-foreground">Pending</p>
//                     <p className="text-2xl font-bold mt-1">{platformOrders.filter(o => o.status === 'on-hold').length}</p>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="p-6">
//                     <p className="text-sm text-muted-foreground">In Production</p>
//                     <p className="text-2xl font-bold mt-1">{platformOrders.filter(o => o.status === 'in-production').length}</p>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="p-6">
//                     <p className="text-sm text-muted-foreground">Shipped</p>
//                     <p className="text-2xl font-bold mt-1">{platformOrders.filter(o => o.status === 'shipped').length}</p>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="p-6">
//                     <p className="text-sm text-muted-foreground">Delivered</p>
//                     <p className="text-2xl font-bold mt-1">{platformOrders.filter(o => o.status === 'delivered').length}</p>
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Search and Filters */}
//               <div className="mb-6 space-y-4">
//                 {/* Search Bar */}
//                 <div className="relative max-w-md">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               {/* Filters */}
//               <div className="flex flex-wrap gap-3 items-end mb-6">
//                 <div className="w-full sm:w-48">
//                   <Label>Shop Filter</Label>
//                   <Input
//                     placeholder="Search orders..."
//                     className="pl-10"
//                     value={ordersSearchQuery}
//                     onChange={(e) => setOrdersSearchQuery(e.target.value)}
//                     placeholder="Filter by shop..."
//                     value={shopifyOrdersShopFilter}
//                     onChange={(e) => {
//                       setShopifyOrdersPage(1);
//                       setShopifyOrdersShopFilter(e.target.value);
//                     }}
//                   />
//                 </div>
//                 {/* Filters Row */}
//                 <div className="flex flex-wrap gap-3 items-center">
//                   {/* Status Filter */}
//                   <Select value={ordersStatusFilter} onValueChange={setOrdersStatusFilter}>
//                     <SelectTrigger className="w-[140px]">
//                 <div className="w-full sm:w-40">
//                   <Label>Financial Status</Label>
//                   <Select
//                     value={shopifyOrdersFinancialStatus || 'all'}
//                     onValueChange={(val) => {
//                       setShopifyOrdersPage(1);
//                       setShopifyOrdersFinancialStatus(val === 'all' ? '' : val);
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="All Status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Status</SelectItem>
//                       <SelectItem value="on-hold">On-hold</SelectItem>
//                       <SelectItem value="in-production">In Production</SelectItem>
//                       <SelectItem value="shipped">Shipped</SelectItem>
//                       <SelectItem value="delivered">Delivered</SelectItem>
//                       <SelectItem value="authorized">Authorized</SelectItem>
//                       <SelectItem value="paid">Paid</SelectItem>
//                       <SelectItem value="partially_paid">Partially Paid</SelectItem>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="refunded">Refunded</SelectItem>
//                       <SelectItem value="cancelled">Cancelled</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   {/* Amount Sort */}
//                   <Select value={ordersAmountSort} onValueChange={setOrdersAmountSort}>
//                     <SelectTrigger className="w-[140px]">
//                       <SelectValue placeholder="Sort by Amount" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="none">None</SelectItem>
//                       <SelectItem value="low-high">Low → High</SelectItem>
//                       <SelectItem value="high-low">High → Low</SelectItem>
//                       <SelectItem value="voided">Voided</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   {/* Alphabetical Sort */}
//                   <Select value={ordersAlphabeticalSort} onValueChange={setOrdersAlphabeticalSort}>
//                     <SelectTrigger className="w-[180px]">
//                       <SelectValue placeholder="Sort Alphabetically" />
//                 </div>
//                 <div className="w-full sm:w-40">
//                   <Label>Fulfillment Status</Label>
//                   <Select
//                     value={shopifyOrdersFulfillmentStatus || 'all'}
//                     onValueChange={(val) => {
//                       setShopifyOrdersPage(1);
//                       setShopifyOrdersFulfillmentStatus(val === 'all' ? '' : val);
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="All Status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="none">None</SelectItem>
//                       <SelectItem value="store-az">Store (A → Z)</SelectItem>
//                       <SelectItem value="store-za">Store (Z → A)</SelectItem>
//                       <SelectItem value="email-az">Email (A → Z)</SelectItem>
//                       <SelectItem value="email-za">Email (Z → A)</SelectItem>
//                       <SelectItem value="all">All Status</SelectItem>
//                       <SelectItem value="fulfilled">Fulfilled</SelectItem>
//                       <SelectItem value="partial">Partial</SelectItem>
//                       <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               <Card>
//                 <CardHeader>
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <CardTitle>Recent Orders</CardTitle>
//                       <CardDescription>Latest platform-wide orders</CardDescription>
//                     </div>
//                     <Button variant="outline" className="gap-2">
//                       <Download className="h-4 w-4" />
//                       Export Orders
//                     </Button>
//                 <div className="w-full sm:w-40">
//                   <Label>Date From</Label>
//                   <Input
//                     type="date"
//                     value={shopifyOrdersDateFrom}
//                     onChange={(e) => {
//                       setShopifyOrdersPage(1);
//                       setShopifyOrdersDateFrom(e.target.value);
//                     }}
//                   />
//                 </div>
//                 <div className="w-full sm:w-40">
//                   <Label>Date To</Label>
//                   <Input
//                     type="date"
//                     value={shopifyOrdersDateTo}
//                     onChange={(e) => {
//                       setShopifyOrdersPage(1);
//                       setShopifyOrdersDateTo(e.target.value);
//                     }}
//                   />
//                 </div>
//                 <div className="w-full sm:flex-1">
//                   <Label>Search Orders</Label>
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       className="pl-9"
//                       placeholder="Search order ID or customer..."
//                       value={shopifyOrdersSearch}
//                       onChange={(e) => {
//                         setShopifyOrdersPage(1);
//                         setShopifyOrdersSearch(e.target.value);
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>
//               <Card>
//                 <CardHeader>
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <CardTitle>Recent Shopify Orders ({shopifyOrdersTotal})</CardTitle>
//                       <CardDescription>Source orders captured via webhooks</CardDescription>
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   {isLoadingShopifyOrders ? (
//                     <div className="text-center py-10">
//                       <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
//                       <p className="text-muted-foreground">Loading Shopify orders...</p>
//                     </div>
//                   ) : shopifyOrders.length === 0 ? (
//                     <div className="text-center py-12 border-2 border-dashed rounded-lg">
//                       <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
//                       <h3 className="text-lg font-medium">No Shopify orders found</h3>
//                       <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
//                     </div>
//                   ) : (
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Order</TableHead>
//                           <TableHead>Customer</TableHead>
//                           <TableHead>Shop</TableHead>
//                           <TableHead>Financial</TableHead>
//                           <TableHead>Fulfillment</TableHead>
//                           <TableHead className="text-right">Action</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {shopifyOrders.map((order: any) => (
//                           <TableRow key={order._id}>
//                             <TableCell>
//                               <div className="font-bold flex items-center gap-2">
//                                 {order.shopifyOrderName || `#${order.shopifyOrderId}`}
//                                 <Button
//                                   variant="ghost"
//                                   size="icon"
//                                   className="h-6 w-6"
//                                   onClick={() => {
//                                     setSelectedShopifyOrder(order);
//                                     setIsShopifyOrderDetailOpen(true);
//                                   }}
//                                 >
//                                   <Info className="h-3 w-3" />
//                                 </Button>
//                               </div>
//                               <div className="text-[10px] text-muted-foreground font-mono">
//                                 {new Date(order.createdAt).toLocaleString()}
//                               </div>
//                             </TableCell>
//                             <TableCell className="text-sm">
//                               {order.customer?.first_name || '—'} {order.customer?.last_name || ''}
//                             </TableCell>
//                             <TableCell className="text-xs font-mono">{order.shop}</TableCell>
//                             <TableCell>
//                               <Badge variant="outline" className={cn(
//                                 order.financialStatus === 'paid' ? "bg-green-500/10 text-green-600" :
//                                   order.financialStatus === 'pending' ? "bg-yellow-500/10 text-yellow-600" : ""
//                               )}>
//                                 {order.financialStatus}
//                               </Badge>
//                             </TableCell>
//                             <TableCell>
//                               <Badge variant="outline">
//                                 {order.fulfillmentStatus || 'unfulfilled'}
//                               </Badge>
//                             </TableCell>
//                             <TableCell className="text-right">
//                               <Button
//                                 size="sm"
//                                 disabled={isImporting}
//                                 onClick={async () => {
//                                   setIsImporting(true);
//                                   try {
//                                     const res = await adminImportOrdersApi.import({
//                                       shop: order.shop,
//                                       shopifyOrderId: order.shopifyOrderId
//                                     });
//                                     if (res.success) {
//                                       toast.success('Order imported to POD successfully');
//                                       setActiveTab('import-orders');
//                                     }
//                                   } catch (err: any) {
//                                     toast.error(err.message || 'Import failed');
//                                   } finally {
//                                     setIsImporting(false);
//                                   }
//                                 }}
//                               >
//                                 {isImporting ? 'Importing...' : 'Import to POD'}
//                               </Button>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   )}
//                 </CardContent>
//               </Card>
//               {/* Shopify Order Detail Modal */}
//               <Dialog open={isShopifyOrderDetailOpen} onOpenChange={setIsShopifyOrderDetailOpen}>
//                 <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//                   <DialogHeader>
//                     <DialogTitle>Raw Shopify Order Data</DialogTitle>
//                     <DialogDescription>
//                       Captured payload for {selectedShopifyOrder?.shopifyOrderName || `#${selectedShopifyOrder?.shopifyOrderId}`}
//                     </DialogDescription>
//                   </DialogHeader>
//                   <pre className="bg-muted p-4 rounded-lg text-[10px] overflow-auto max-h-[60vh] font-mono">
//                     {JSON.stringify(selectedShopifyOrder?.raw || {}, null, 2)}
//                   </pre>
//                 </DialogContent>
//               </Dialog>
//             </>
//           )}
//           {/* Orders Tab */}
//           {activeTab === 'orders' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">Order Management</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Monitor all platform orders and fulfillment
//                   </p>
//                 </div>
//                 <Button variant="outline" className="gap-2">
//                   <Download className="h-4 w-4" />
//                   Export Orders
//                 </Button>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//                 <Card>
//                   <CardContent className="p-6">
//                     <p className="text-sm text-muted-foreground">Pending</p>
//                     <p className="text-2xl font-bold mt-1">{platformOrders.filter(o => o.status === 'on-hold').length}</p>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="p-6">
//                     <p className="text-sm text-muted-foreground">In Production</p>
//                     <p className="text-2xl font-bold mt-1">{platformOrders.filter(o => o.status === 'in-production').length}</p>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="p-6">
//                     <p className="text-sm text-muted-foreground">Shipped</p>
//                     <p className="text-2xl font-bold mt-1">{platformOrders.filter(o => o.status === 'shipped').length}</p>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="p-6">
//                     <p className="text-sm text-muted-foreground">Delivered</p>
//                     <p className="text-2xl font-bold mt-1">{platformOrders.filter(o => o.status === 'delivered').length}</p>
//                   </CardContent>
//                 </Card>
//               </div>
//               {/* Search and Filters */}
//               <div className="mb-6 space-y-4">
//                 {/* Search Bar */}
//                 <div className="relative max-w-md">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     placeholder="Search orders..."
//                     className="pl-10"
//                     value={ordersSearchQuery}
//                     onChange={(e) => setOrdersSearchQuery(e.target.value)}
//                   />
//                 </div>
//                 {/* Filters Row */}
//                 <div className="flex flex-wrap gap-3 items-center">
//                   {/* Status Filter */}
//                   <Select value={ordersStatusFilter} onValueChange={setOrdersStatusFilter}>
//                     <SelectTrigger className="w-[140px]">
//                       <SelectValue placeholder="All Status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Status</SelectItem>
//                       <SelectItem value="on-hold">On-hold</SelectItem>
//                       <SelectItem value="in-production">In Production</SelectItem>
//                       <SelectItem value="shipped">Shipped</SelectItem>
//                       <SelectItem value="delivered">Delivered</SelectItem>
//                       <SelectItem value="refunded">Refunded</SelectItem>
//                       <SelectItem value="cancelled">Cancelled</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   {/* Amount Sort */}
//                   <Select value={ordersAmountSort} onValueChange={setOrdersAmountSort}>
//                     <SelectTrigger className="w-[140px]">
//                       <SelectValue placeholder="Sort by Amount" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="none">None</SelectItem>
//                       <SelectItem value="low-high">Low → High</SelectItem>
//                       <SelectItem value="high-low">High → Low</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   {/* Alphabetical Sort */}
//                   <Select value={ordersAlphabeticalSort} onValueChange={setOrdersAlphabeticalSort}>
//                     <SelectTrigger className="w-[180px]">
//                       <SelectValue placeholder="Sort Alphabetically" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="none">None</SelectItem>
//                       <SelectItem value="store-az">Store (A → Z)</SelectItem>
//                       <SelectItem value="store-za">Store (Z → A)</SelectItem>
//                       <SelectItem value="email-az">Email (A → Z)</SelectItem>
//                       <SelectItem value="email-za">Email (Z → A)</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//               <Card>
//                 <CardHeader>
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <CardTitle>Recent Orders</CardTitle>
//                       <CardDescription>Latest platform-wide orders</CardDescription>
//                     </div>
//                     <Button variant="outline" className="gap-2">
//                       <Download className="h-4 w-4" />
//                       Export Orders
//                     </Button>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   {ordersError && (
//                     <p className="mb-4 text-sm text-destructive">{ordersError}</p>
//                   )}
//                   {isLoadingOrders ? (
//                     <p className="text-sm text-muted-foreground">Loading orders...</p>
//                   ) : filteredOrders.length === 0 ? (
//                     <p className="text-sm text-muted-foreground">No orders found.</p>
//                   ) : (
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Order ID</TableHead>
//                           <TableHead>Customer</TableHead>
//                           <TableHead>Store</TableHead>
//                           <TableHead>Items</TableHead>
//                           <TableHead>Total</TableHead>
//                           <TableHead>Status</TableHead>
//                           <TableHead className="text-right">Actions</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {filteredOrders.map((order: any) => {
//                           const orderId = (order.id || order._id || '').toString();
//                           const storeName = order.storeId && typeof order.storeId === 'object'
//                             ? order.storeId.name
//                             : 'Direct';

//                           const currentStatus = order.status as Order['status'];

//                           const getStatusBadgeClass = (status: Order['status']) => {
//                             switch (status) {
//                               case 'delivered':
//                                 return 'bg-green-500/10 text-green-500';
//                               case 'shipped':
//                                 return 'bg-blue-500/10 text-blue-500';
//                               case 'in-production':
//                                 return 'bg-yellow-500/10 text-yellow-500';
//                               case 'refunded':
//                                 return 'bg-purple-500/10 text-purple-500';
//                               case 'cancelled':
//                                 return 'bg-red-500/10 text-red-500';
//                               case 'on-hold':
//                               default:
//                                 return 'bg-muted text-muted-foreground';
//                             }
//                           };

//                           return (
//                             <TableRow key={orderId || Math.random()}>
//                               <TableCell className="font-medium">{orderId ? orderId.slice(0, 8) : '-'}</TableCell>
//                               <TableCell>{order.customerEmail}</TableCell>
//                               <TableCell>
//                                 <Badge variant="secondary">
//                                   {storeName || 'Direct'}
//                                 </Badge>
//                               </TableCell>
//                               <TableCell>{order.items?.length ?? 0}</TableCell>
//                               <TableCell>₹{order.total?.toFixed(2) ?? '0.00'}</TableCell>
//                               <TableCell>
//                                 <Select
//                                   value={currentStatus}
//                                   onValueChange={async (value) => {
//                                     try {
//                                       // Normalize status: 'canceled' -> 'cancelled'
//                                       const normalizedStatus = value === 'canceled' ? 'cancelled' : value;
//                                       const newStatus = normalizedStatus as 'on-hold' | 'in-production' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
//                                       await storeOrdersApi.updateStatus(orderId, newStatus);
//                                       setPlatformOrders((prev) =>
//                                         prev.map((o) => {
//                                           const oId = (o as any)._id || (o as any).id;
//                                           const targetId = (order as any)._id || (order as any).id;
//                                           return oId === targetId
//                                             ? { ...o, status: newStatus }
//                                             : o;
//                                         })
//                                       );
//                                     } catch (error) {
//                                       console.error('Failed to update order status:', error);
//                                       toast.error('Failed to update order status');
//                                     }
//                                   }}
//                                 >
//                                   <SelectTrigger className="w-32 h-8 text-xs">
//                                     <SelectValue>
//                                       <Badge
//                                         variant="secondary"
//                                         className={getStatusBadgeClass(currentStatus)}
//                                       >
//                                         {currentStatus}
//                                       </Badge>
//                                     </SelectValue>
//                                   </SelectTrigger>
//                                   <SelectContent>
//                                     {statusOptions.map((opt) => (
//                                       <SelectItem key={opt.value} value={opt.value}>
//                                         {opt.label}
//                                       </SelectItem>
//                                     ))}
//                                   </SelectContent>
//                                 </Select>
//                               </TableCell>
//                               <TableCell className="text-right">
//                                 <Button variant="ghost" size="sm" asChild>
//                                   <Link to={`/admin/orders/${orderId}`}>
//                                     <ChevronRight className="h-4 w-4" />
//                                   </Link>
//                                 </Button>
//                               </TableCell>
//                             </TableRow>
//                           )
//                         })}
//                       </TableBody>
//                     </Table>
//                   )}
//                 </CardContent>
//               </Card>
//             </>
//           )}

//           {/* Import Orders Tab */}
//           {activeTab === 'import-orders' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">Imported Orders</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Normalized Shopify orders ready for mapping and production.
//                   </p>
//                 </div>
//                 <div className="flex gap-2">
//                   <Dialog>
//                     <DialogTrigger asChild>
//                       <Button className="gap-2">
//                         <Plus className="h-4 w-4" />
//                         Quick Import
//                       </Button>
//                     </DialogTrigger>
//                     <DialogContent>
//                       <DialogHeader>
//                         <DialogTitle>Import Shopify Order</DialogTitle>
//                         <DialogDescription>
//                           Enter the shop domain and Shopify Order ID to manually import into the pipeline.
//                         </DialogDescription>
//                       </DialogHeader>
//                       <div className="space-y-4 pt-4">
//                         <div className="space-y-2">
//                           <Label>Shop Domain</Label>
//                           <Input id="import-shop" placeholder="example.myshopify.com" />
//                         </div>
//                         <div className="space-y-2">
//                           <Label>Order ID</Label>
//                           <Input id="import-order-id" placeholder="1234567890" />
//                         </div>
//                         <Button
//                           className="w-full"
//                           onClick={() => {
//                             const shop = (document.getElementById('import-shop') as HTMLInputElement).value;
//                             const orderId = (document.getElementById('import-order-id') as HTMLInputElement).value;
//                             if (shop && orderId) handleImportOrder(shop, orderId);
//                           }}
//                         >
//                           Import Order
//                         </Button>
//                       </div>
//                     </DialogContent>
//                   </Dialog>
//                 </div>
//               </div>

//               {/* Filters */}
//               <div className="flex flex-wrap gap-3 items-end mb-6">
//                 <div className="w-full sm:w-48">
//                   <Label>Shop Filter</Label>
//                   <Input
//                     placeholder="Filter by shop..."
//                     value={importOrdersShopFilter}
//                     onChange={(e) => {
//                       setImportOrdersPage(1);
//                       setImportOrdersShopFilter(e.target.value);
//                     }}
//                   />
//                 </div>
//                 <div className="w-full sm:w-40">
//                   <Label>Status</Label>
//                   <Select
//                     value={importOrdersStatusFilter || 'all'}
//                     onValueChange={(val) => {
//                       setImportOrdersPage(1);
//                       setImportOrdersStatusFilter(val === 'all' ? '' : val);
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Any" />
//                       <SelectValue placeholder="All Status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">Any Status</SelectItem>
//                       <SelectItem value="imported">Imported</SelectItem>
//                       <SelectItem value="all">All Status</SelectItem>
//                       <SelectItem value="needs_mapping">Needs Mapping</SelectItem>
//                       <SelectItem value="ready_for_job">Ready for Job</SelectItem>
//                       <SelectItem value="job_created">Job Created</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="w-full sm:flex-1">
//                   <Label>Search</Label>
//                   <Label>Search Orders</Label>
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       className="pl-9"
//                       placeholder="Search ID, name, or email..."
//                       placeholder="Search order ID or customer..."
//                       value={importOrdersSearch}
//                       onChange={(e) => {
//                         setImportOrdersPage(1);
//                         setImportOrdersSearch(e.target.value);
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <Card className="overflow-hidden">
//                 <CardContent className="p-0">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Order</TableHead>
//                         <TableHead>Shop</TableHead>
//                         <TableHead>Customer</TableHead>
//                         <TableHead className="text-center">Items</TableHead>
//                         <TableHead>Shop</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead>ImportedAt</TableHead>
//                         <TableHead className="text-right">Total</TableHead>
//                         <TableHead className="text-right">Action</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {isLoadingImportOrders ? (
//                         <TableRow>
//                           <TableCell colSpan={7} className="text-center py-8">
//                             <div className="flex flex-col items-center gap-2">
//                               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
//                               <span className="text-sm text-muted-foreground">Loading imported orders...</span>
//                             </div>
//                           <TableCell colSpan={6} className="text-center py-8">
//                             Loading imported orders...
//                           </TableCell>
//                         </TableRow>
//                       ) : importOrders.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
//                           <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
//                             No imported orders found.
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         importOrders.map((order) => (
//                           <TableRow
//                             key={order._id}
//                             className="cursor-pointer hover:bg-muted/40"
//                             onClick={() => {
//                               setSelectedImportOrder(order);
//                               setIsImportOrderDialogOpen(true);
//                             }}
//                           >
//                           <TableRow key={order._id} className="cursor-pointer hover:bg-muted/40" onClick={() => {
//                             setSelectedImportOrder(order);
//                             setIsImportOrderDialogOpen(true);
//                           }}>
//                             <TableCell className="font-medium">
//                               {order.shopifyOrderName || order.shopifyOrderId}
//                             </TableCell>
//                             <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
//                               {order.shop}
//                               <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]">
//                                 {order.shopifyOrderId}
//                               </div>
//                             </TableCell>
//                             <TableCell>
//                               <div className="text-sm font-medium">{order.customer?.name}</div>
//                               <div className="text-xs text-muted-foreground">{order.customer?.email}</div>
//                               <div className="text-sm">{order.customer?.name || '—'}</div>
//                               <div className="text-xs text-muted-foreground">{order.customer?.email || '—'}</div>
//                             </TableCell>
//                             <TableCell className="text-xs text-muted-foreground font-mono">
//                               {order.shop}
//                             </TableCell>
//                             <TableCell className="text-center">{order.items?.length || 0}</TableCell>
//                             <TableCell>
//                               <Badge
//                                 variant="secondary"
//                                 variant={
//                                   order.status === 'ready_for_job' ? 'default' :
//                                     order.status === 'job_created' ? 'secondary' : 'outline'
//                                 }
//                                 className={cn(
//                                   order.status === 'needs_mapping' && "bg-yellow-500/10 text-yellow-600",
//                                   order.status === 'ready_for_job' && "bg-green-500/10 text-green-600",
//                                   order.status === 'job_created' && "bg-blue-500/10 text-blue-600"
//                                   order.status === 'needs_mapping' && "text-yellow-600 border-yellow-200 bg-yellow-50"
//                                 )}
//                               >
//                                 {order.status.replace('_', ' ')}
//                                 {order.status === 'needs_mapping' ? 'Needs Mapping' :
//                                   order.status === 'ready_for_job' ? 'Ready' :
//                                     order.status === 'job_created' ? 'Fulfilled' : order.status}
//                               </Badge>
//                             </TableCell>
//                             <TableCell className="text-xs text-muted-foreground">
//                               {new Date(order.importedAt).toLocaleString()}
//                             <TableCell className="text-right font-medium">
//                               {order.totalPrice} {order.currency}
//                             </TableCell>
//                             <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
//                               <Button
//                                 size="sm"
//                                 variant={order.status === 'ready_for_job' ? 'default' : 'outline'}
//                                 disabled={order.status !== 'ready_for_job'}
//                                 onClick={() => handleCreateProductionJob(order._id)}
//                               >
//                                 {order.status === 'job_created' ? 'Job Created' : 'Create Job'}
//                               </Button>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>

//               {/* Pagination */}
//               {importOrdersTotal > 25 && (
//                 <div className="flex items-center justify-between mt-4">
//                   <p className="text-sm text-muted-foreground">
//                     Total {importOrdersTotal} orders
//                   </p>
//                   <div className="flex items-center gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setImportOrdersPage((p) => Math.max(1, p - 1))}
//                       disabled={importOrdersPage === 1}
//                     >
//                       Previous
//                     </Button>
//                     <span className="text-sm">Page {importOrdersPage}</span>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setImportOrdersPage((p) => p + 1)}
//                       disabled={importOrders.length < 25}
//                     >
//                       Next
//                     </Button>
//                   </div>
//                 </div>
//               )}

//               {/* Order Detail View */}
//               <Dialog open={isImportOrderDialogOpen} onOpenChange={setIsImportOrderDialogOpen}>
//                 <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//                   <DialogHeader>
//                     <DialogTitle>Imported Order Details</DialogTitle>
//                     <DialogDescription>
//                       Review items and mapping status for {selectedImportOrder?.shopifyOrderName || selectedImportOrder?.shopifyOrderId}
//                     </DialogDescription>
//                   </DialogHeader>

//                   {selectedImportOrder && (
//                     <div className="space-y-6">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <Card>
//                           <CardHeader className="py-3">
//                             <CardTitle className="text-sm">Customer & Shipping</CardTitle>
//                           </CardHeader>
//                           <CardContent className="text-sm space-y-1">
//                             <p className="font-medium">{selectedImportOrder.customer?.name}</p>
//                             <p className="text-muted-foreground">{selectedImportOrder.customer?.email}</p>
//                             <p className="text-muted-foreground">{selectedImportOrder.customer?.phone}</p>
//                             <div className="mt-3 pt-3 border-t">
//                               <p className="font-medium">Shipping Address</p>
//                               <p>{selectedImportOrder.shippingAddress?.address1}</p>
//                               {selectedImportOrder.shippingAddress?.address2 && <p>{selectedImportOrder.shippingAddress?.address2}</p>}
//                               <p>{selectedImportOrder.shippingAddress?.city}, {selectedImportOrder.shippingAddress?.province} {selectedImportOrder.shippingAddress?.zip}</p>
//                               <p>{selectedImportOrder.shippingAddress?.country}</p>
//                             </div>
//                           </CardContent>
//                         </Card>

//                         <Card>
//                           <CardHeader className="py-3">
//                             <CardTitle className="text-sm">Order Info</CardTitle>
//                           </CardHeader>
//                           <CardContent className="text-sm space-y-2">
//                             <div className="flex justify-between">
//                               <span className="text-muted-foreground">Shop:</span>
//                               <span className="font-mono text-xs">{selectedImportOrder.shop}</span>
//                             </div>
//                             <div className="flex justify-between">
//                               <span className="text-muted-foreground">Total Price:</span>
//                               <span className="font-bold">{selectedImportOrder.totalPrice} {selectedImportOrder.currency}</span>
//                             </div>
//                             <div className="flex justify-between pt-2 border-t">
//                               <span className="text-muted-foreground">Status:</span>
//                               <Badge variant="outline">{selectedImportOrder.status}</Badge>
//                             </div>
//                           </CardContent>
//                         </Card>
//                       </div>

//                       <div className="space-y-3">
//                         <h3 className="font-bold flex items-center gap-2">
//                           Line Items
//                           <Badge variant="secondary">{selectedImportOrder.items?.length || 0}</Badge>
//                         </h3>
//                         <div className="border rounded-lg overflow-hidden">
//                           <Table>
//                             <TableHeader>
//                               <TableRow>
//                                 <TableHead>Product</TableHead>
//                                 <TableHead>SKU</TableHead>
//                                 <TableHead className="text-center">Qty</TableHead>
//                                 <TableHead>Mapping</TableHead>
//                                 <TableHead className="text-right">Action</TableHead>
//                               </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                               {selectedImportOrder.items?.map((item: any, idx: number) => (
//                                 <TableRow key={idx}>
//                                   <TableCell>
//                                     <div className="font-medium text-sm">{item.title}</div>
//                                     <div className="text-xs text-muted-foreground">{item.variantTitle}</div>
//                                   </TableCell>
//                                   <TableCell className="text-xs font-mono">{item.sku}</TableCell>
//                                   <TableCell className="text-center">{item.quantity}</TableCell>
//                                   <TableCell>
//                                     {item.mapped ? (
//                                       <div className="flex flex-col gap-1">
//                                         <Badge variant="secondary" className="bg-green-500/10 text-green-600 w-fit">Mapped</Badge>
//                                         <div className="flex gap-1">
//                                           {item.printAssets?.frontUrl && <Badge variant="outline" className="text-[10px] py-0">Front</Badge>}
//                                           {item.printAssets?.backUrl && <Badge variant="outline" className="text-[10px] py-0">Back</Badge>}
//                                         </div>
//                                       </div>
//                                     ) : (
//                                       <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Unmapped</Badge>
//                                     )}
//                                   </TableCell>
//                                   <TableCell className="text-right">
//                                     <Button
//                                       size="sm"
//                                       variant="ghost"
//                                       className="h-8"
//                                       // Explicitly force this button to remain clickable,
//                                       // even if parent containers apply disabled styles.
//                                       disabled={false}
//                                       className="h-8 pointer-events-auto"
//                                       onClick={() => {
//                                         console.log('[MapItem] clicked', {
//                                           importedOrderId: selectedImportOrder?._id,
//                                           item,
//                                         });
//                                         setSelectedMapping({
//                                           importedOrderId: selectedImportOrder._id,
//                                           shop: selectedImportOrder.shop,
//                                           shopifyOrderId: selectedImportOrder.shopifyOrderId,
//                                           shopifyProductId: item.shopifyProductId,
//                                           shopifyVariantId: item.shopifyVariantId,
//                                           merchantId: selectedImportOrder.merchantId,
//                                           printAssets: item.printAssets || { frontUrl: '', backUrl: '', labelUrl: '' },
//                                           mockupUrls: item.mockupUrls || []
//                                           sku: item.sku,
//                                           title: item.title,
//                                           variantTitle: item.variantTitle,
//                                           printAssets: item.printAssets || {
//                                             frontUrl: '',
//                                             backUrl: '',
//                                             labelUrl: '',
//                                           },
//                                           mockupUrls: item.mockupUrls || [],
//                                         });
//                                         setIsMappingDialogOpen(true);
//                                         useEffect(() => {
//                                           console.log('isMappingDialogOpen CHANGED ->', isMappingDialogOpen);
//                                         }, [isMappingDialogOpen]);
//                                       }}
//                                     >
//                                       {item.mapped ? 'Edit Mapping' : 'Map Item'}
//                                     </Button>
//                                   </TableCell>
//                                 </TableRow>
//                               ))}
//                             </TableBody>
//                           </Table>
//                         </div>
//                       </div>

//                       {selectedImportOrder.status === 'ready_for_job' && (
//                         <div className="flex justify-end pt-4">
//                           <Button
//                             className="gap-2 px-8 py-6 text-lg"
//                             onClick={() => {
//                               handleCreateProductionJob(selectedImportOrder._id);
//                               setIsImportOrderDialogOpen(false);
//                             }}
//                           >
//                             <Activity className="h-5 w-5" />
//                             Create Production Job
//                           </Button>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </DialogContent>
//               </Dialog>
//             </>
//           )}

//           {/* Product Mappings Tab */}
//           {activeTab === 'product-mappings' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">Product Mappings</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Manage print assets and mockups for Shopify variants.
//                     Map Shopify variants to print assets and mockups for automated fulfillment.
//                   </p>
//                 </div>
//                 <Button
//                   className="gap-2"
//                   onClick={() => {
//                     setSelectedMapping(null);
//                     setIsMappingDialogOpen(true);
//                   }}
//                 >
//                   <Plus className="h-4 w-4" />
//                   New Mapping
//                 </Button>
//               </div>

//               {/* Filters */}
//               <div className="flex flex-wrap gap-3 items-end mb-6">
//                 <div className="w-full sm:w-48">
//                   <Label>Shop Filter</Label>
//                   <Input
//                     placeholder="Filter by shop..."
//                     value={productMappingsShopFilter}
//                     onChange={(e) => {
//                       setProductMappingsPage(1);
//                       setProductMappingsShopFilter(e.target.value);
//                     }}
//                   />
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                 {/* Left: Unmapped Items from Imported Orders */}
//                 <div className="lg:col-span-2 space-y-6">
//                   <Card>
//                     <CardHeader className="flex flex-row items-center justify-between">
//                       <div>
//                         <CardTitle>Unmapped Variants</CardTitle>
//                         <CardDescription>Variants found in imported orders that need mapping</CardDescription>
//                       </div>
//                       <Button variant="outline" size="sm" onClick={fetchUnmappedItems} disabled={isLoadingUnmappedItems}>
//                         <ArrowRightLeft className={cn("h-4 w-4 mr-2", isLoadingUnmappedItems && "animate-spin")} />
//                         Refresh
//                       </Button>
//                     </CardHeader>
//                     <CardContent className="p-0">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead>Product / Variant</TableHead>
//                             <TableHead>Shop</TableHead>
//                             <TableHead>SKU</TableHead>
//                             <TableHead className="text-right">Action</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {isLoadingUnmappedItems ? (
//                             <TableRow>
//                               <TableCell colSpan={4} className="text-center py-10">
//                                 Loading unmapped variants...
//                               </TableCell>
//                             </TableRow>
//                           ) : unmappedItems.length === 0 ? (
//                             <TableRow>
//                               <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
//                                 All variants in imported orders are mapped. Great job!
//                               </TableCell>
//                             </TableRow>
//                           ) : (
//                             unmappedItems.map((item: any) => (
//                               <TableRow key={`${item.shop}_${item.shopifyVariantId}`}>
//                                 <TableCell>
//                                   <div className="font-medium text-sm">{item.title}</div>
//                                   <div className="text-xs text-muted-foreground">{item.variantTitle}</div>
//                                 </TableCell>
//                                 <TableCell className="text-xs font-mono">{item.shop}</TableCell>
//                                 <TableCell className="text-xs">{item.sku || '—'}</TableCell>
//                                 <TableCell className="text-right">
//                                   <Button size="sm" onClick={() => {
//                                     setSelectedMapping({
//                                       shop: item.shop,
//                                       shopifyProductId: item.shopifyProductId,
//                                       shopifyVariantId: item.shopifyVariantId,
//                                       title: item.title,
//                                       variantTitle: item.variantTitle,
//                                       sku: item.sku,
//                                       printAssets: [],
//                                       mockupUrls: [],
//                                       active: true
//                                     });
//                                     setIsMappingDialogOpen(true);
//                                   }}>
//                                     Map Variant
//                                   </Button>
//                                 </TableCell>
//                               </TableRow>
//                             ))
//                           )}
//                         </TableBody>
//                       </Table>
//                     </CardContent>
//                   </Card>
//                   <Card>
//                     <CardHeader>
//                       <CardTitle>Existing Mappings</CardTitle>
//                       <CardDescription>Manage active product mappings</CardDescription>
//                     </CardHeader>
//                     <CardContent className="p-0">
//                       <Table>
//                         <TableHeader>
//                           <TableRow>
//                             <TableHead>Shopify Variant</TableHead>
//                             <TableHead>Shop</TableHead>
//                             <TableHead className="text-center">Assets</TableHead>
//                             <TableHead className="text-right">Action</TableHead>
//                           </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                           {isLoadingProductMappings ? (
//                             <TableRow>
//                               <TableCell colSpan={4} className="text-center py-10">
//                                 Loading mappings...
//                               </TableCell>
//                             </TableRow>
//                           ) : productMappings.length === 0 ? (
//                             <TableRow>
//                               <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
//                                 No mappings found.
//                               </TableCell>
//                             </TableRow>
//                           ) : (
//                             productMappings.map((mapping: any) => (
//                               <TableRow key={mapping._id}>
//                                 <TableCell>
//                                   <div className="font-medium text-sm">{mapping.title || mapping.shopifyVariantId}</div>
//                                   {mapping.sku && <div className="text-[10px] text-muted-foreground">SKU: {mapping.sku}</div>}
//                                 </TableCell>
//                                 <TableCell className="text-xs font-mono">{mapping.shop}</TableCell>
//                                 <TableCell className="text-center">
//                                   <div className="flex justify-center gap-1">
//                                     {mapping.printAssets?.frontUrl && <Badge variant="outline" className="text-[10px]">Front</Badge>}
//                                     {mapping.printAssets?.backUrl && <Badge variant="outline" className="text-[10px]">Back</Badge>}
//                                   </div>
//                                 </TableCell>
//                                 <TableCell className="text-right">
//                                   <div className="flex justify-end gap-1">
//                                     <Button size="sm" variant="ghost" onClick={() => {
//                                       setSelectedMapping(mapping);
//                                       setIsMappingDialogOpen(true);
//                                     }}>
//                                       Edit
//                                     </Button>
//                                     <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => {
//                                       if (confirm('Delete this mapping?')) {
//                                         await adminProductMappingApi.delete(mapping._id);
//                                         toast.success('Mapping deleted');
//                                         // refresh
//                                         const listResp = await adminProductMappingApi.list({ page: productMappingsPage, limit: 25 });
//                                         if (listResp.success) {
//                                           setProductMappings(listResp.data);
//                                           setProductMappingsTotal(listResp.pagination.total);
//                                         }
//                                       }
//                                     }}>
//                                       Delete
//                                     </Button>
//                                   </div>
//                                 </TableCell>
//                               </TableRow>
//                             ))
//                           )}
//                         </TableBody>
//                       </Table>
//                     </CardContent>
//                   </Card>
//                 </div>
//                 <div className="w-full sm:flex-1">
//                   <Label>Search</Label>
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       className="pl-9"
//                       placeholder="Search Variant ID..."
//                       value={productMappingsSearch}
//                       onChange={(e) => {
//                         setProductMappingsPage(1);
//                         setProductMappingsSearch(e.target.value);
//                       }}
//                     />
//                   </div>
//                 {/* Right: Filters & Info */}
//                 <div className="space-y-6">
//                   <Card>
//                     <CardHeader>
//                       <CardTitle>Filters</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div className="space-y-2">
//                         <Label>Shop</Label>
//                         <Input
//                           placeholder="Filter by shop"
//                           value={productMappingsShopFilter}
//                           onChange={e => setProductMappingsShopFilter(e.target.value)}
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label>Search</Label>
//                         <Input
//                           placeholder="Search title or variant ID"
//                           value={productMappingsSearch}
//                           onChange={e => setProductMappingsSearch(e.target.value)}
//                         />
//                       </div>
//                     </CardContent>
//                   </Card>
//                   <Card className="bg-primary/5 border-primary/20">
//                     <CardHeader>
//                       <CardTitle className="text-sm">Mapping Guide</CardTitle>
//                     </CardHeader>
//                     <CardContent className="text-xs space-y-2 text-muted-foreground">
//                       <p>1. Import an order from <strong>Shopify Orders</strong>.</p>
//                       <p>2. Unmapped variants will appear in the list on the left.</p>
//                       <p>3. Click <strong>Map Variant</strong> to upload print assets.</p>
//                       <p>4. New mappings are automatically applied to all pending orders.</p>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </div>
//             </>
//           )}

//               <Card className="overflow-hidden">
//                 <CardContent className="p-0">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Variant ID</TableHead>
//                         <TableHead>Shop</TableHead>
//                         <TableHead>Assets</TableHead>
//                         <TableHead>Mockups</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead className="text-right">Action</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {isLoadingProductMappings ? (
//                         <TableRow>
//                           <TableCell colSpan={6} className="text-center py-8">
//                             Loading mappings...
//                           </TableCell>
//                         </TableRow>
//                       ) : productMappings.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
//                             No mappings found.
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         productMappings.map((mapping) => (
//                           <TableRow key={mapping._id}>
//                             <TableCell className="font-mono text-xs">{mapping.shopifyVariantId}</TableCell>
//                             <TableCell className="text-xs text-muted-foreground truncate max-w-[150px]">
//                               {mapping.shop}
//                             </TableCell>
//                             <TableCell>
//                               <div className="flex gap-1">
//                                 {mapping.printAssets?.frontUrl && <Badge variant="secondary" className="text-[10px]">Front</Badge>}
//                                 {mapping.printAssets?.backUrl && <Badge variant="secondary" className="text-[10px]">Back</Badge>}
//                                 {mapping.printAssets?.labelUrl && <Badge variant="secondary" className="text-[10px]">Label</Badge>}
//                               </div>
//                             </TableCell>
//                             <TableCell>
//                               <div className="flex -space-x-2">
//                                 {(mapping.mockupUrls || []).slice(0, 3).map((url: string, i: number) => (
//                                   <img key={i} src={url} className="w-6 h-6 rounded-full border border-background object-cover bg-muted" />
//                                 ))}
//                                 {mapping.mockupUrls?.length > 3 && (
//                                   <div className="w-6 h-6 rounded-full border border-background bg-muted flex items-center justify-center text-[10px]">
//                                     +{mapping.mockupUrls.length - 3}
//                                   </div>
//                                 )}
//                               </div>
//                             </TableCell>
//                             <TableCell>
//                               <Badge variant={mapping.active ? 'default' : 'secondary'}>
//                                 {mapping.active ? 'Active' : 'Inactive'}
//                               </Badge>
//                             </TableCell>
//                             <TableCell className="text-right">
//                               <Button
//                                 size="sm"
//                                 variant="ghost"
//                                 onClick={() => {
//                                   setSelectedMapping(mapping);
//                                   setIsMappingDialogOpen(true);
//                                 }}
//                               >
//                                 Edit
//                               </Button>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>
//           {/* Mapping Dialog (global, shared for Import Orders + Product Mappings) */}
//           <Dialog
//             open={isMappingDialogOpen}
//             onOpenChange={(open) => {
//               console.log('[MappingDialog] onOpenChange', open);
//               setIsMappingDialogOpen(open);
//             }}
//           >
//             <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[9999]">
//               <DialogHeader>
//                 <DialogTitle>{selectedMapping?._id ? 'Edit Mapping' : 'Create New Mapping'}</DialogTitle>
//                 <DialogDescription>
//                   Assign print assets and mockups to this variant.
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4 py-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-2">
//                     <Label>Shop</Label>
//                     <Input disabled value={selectedMapping?.shop || ''} />
//                   </div>
//                   <div className="space-y-2">
//                     <Label>Variant ID</Label>
//                     <Input disabled value={selectedMapping?.shopifyVariantId || ''} />
//                   </div>
//                 </div>

//               {/* Mapping Edit Dialog */}
//               <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
//                 <DialogContent className="max-w-2xl">
//                   <DialogHeader>
//                     <DialogTitle>{selectedMapping?._id ? 'Edit Mapping' : 'Create New Mapping'}</DialogTitle>
//                     <DialogDescription>
//                       Assign print assets and mockups to this Shopify variant.
//                     </DialogDescription>
//                   </DialogHeader>
//                   <div className="grid grid-cols-2 gap-4 pt-4">
//                     <div className="space-y-2">
//                       <Label>Shop</Label>
//                       <Input placeholder="shop.myshopify.com" defaultValue={selectedMapping?.shop} id="mapping-shop" />
//                     </div>
//                     <div className="space-y-2">
//                       <Label>Variant ID</Label>
//                       <Input placeholder="1234567890" defaultValue={selectedMapping?.shopifyVariantId} id="mapping-variant-id" />
//                     </div>
//                     <div className="col-span-2 grid grid-cols-3 gap-2">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-2 px-4 py-3 border rounded-lg bg-muted/30">
//                     <Label className="text-sm font-bold flex items-center gap-2">
//                       <Layers className="h-4 w-4" />
//                       Print Assets (S3/Public URLs)
//                     </Label>
//                     <div className="space-y-3 mt-2">
//                       <div className="space-y-1">
//                         <Label className="text-xs">Front URL</Label>
//                         <Input className="h-8 text-xs" defaultValue={selectedMapping?.printAssets?.frontUrl} id="mapping-front" />
//                         <Label className="text-xs text-muted-foreground">Front URL</Label>
//                         <Input
//                           className="h-8 text-xs"
//                           defaultValue={selectedMapping?.printAssets?.frontUrl}
//                           id="mapping-front"
//                           placeholder="https://..."
//                         />
//                       </div>
//                       <div className="space-y-1">
//                         <Label className="text-xs">Back URL</Label>
//                         <Input className="h-8 text-xs" defaultValue={selectedMapping?.printAssets?.backUrl} id="mapping-back" />
//                         <Label className="text-xs text-muted-foreground">Back URL</Label>
//                         <Input
//                           className="h-8 text-xs"
//                           defaultValue={selectedMapping?.printAssets?.backUrl}
//                           id="mapping-back"
//                           placeholder="https://..."
//                         />
//                       </div>
//                       <div className="space-y-1">
//                         <Label className="text-xs">Label URL</Label>
//                         <Input className="h-8 text-xs" defaultValue={selectedMapping?.printAssets?.labelUrl} id="mapping-label" />
//                         <Label className="text-xs text-muted-foreground">Label URL</Label>
//                         <Input
//                           className="h-8 text-xs"
//                           defaultValue={selectedMapping?.printAssets?.labelUrl}
//                           id="mapping-label"
//                           placeholder="https://..."
//                         />
//                       </div>
//                     </div>
//                     <div className="col-span-2 space-y-2">
//                       <Label>Mockup URLs (Comma separated)</Label>
//                       <Textarea
//                         placeholder="https://...jpg, https://...png"
//                         defaultValue={selectedMapping?.mockupUrls?.join(', ')}
//                         id="mapping-mockups"
//                       />
//                     </div>
//                   </div>
//                   <div className="flex justify-end gap-2 mt-4">
//                     <Button variant="outline" onClick={() => setIsMappingDialogOpen(false)}>Cancel</Button>
//                     <Button
//                       onClick={async () => {
//                         try {
//                           const payload = {
//                             shop: (document.getElementById('mapping-shop') as HTMLInputElement).value,
//                             shopifyVariantId: (document.getElementById('mapping-variant-id') as HTMLInputElement).value,
//                             printAssets: {
//                               frontUrl: (document.getElementById('mapping-front') as HTMLInputElement).value,
//                               backUrl: (document.getElementById('mapping-back') as HTMLInputElement).value,
//                               labelUrl: (document.getElementById('mapping-label') as HTMLInputElement).value,
//                             },
//                             mockupUrls: (document.getElementById('mapping-mockups') as HTMLTextAreaElement).value.split(',').map(s => s.trim()).filter(Boolean)
//                           };
//                           await adminProductMappingApi.upsert(payload);
//                           toast.success('Mapping saved');
//                           setIsMappingDialogOpen(false);
//                           // Refresh current tab
//                           const listResp = await adminProductMappingApi.list({ page: 1, limit: 25 });
//                           if (listResp.success) {
//                             setProductMappings(listResp.data);
//                             setProductMappingsTotal(listResp.pagination.total);
//                           }
//                           // Also refresh import orders if open
//                           if (selectedImportOrder) {
//                             const orderResp = await adminImportOrdersApi.get(selectedImportOrder._id);
//                             if (orderResp.success) setSelectedImportOrder(orderResp.data);
//                           }
//                         } catch (err: any) {
//                           toast.error(err.message || 'Save failed');
//                         }
//                       }}
//                     >
//                       Save Mapping
//                     </Button>
//                   <div className="space-y-2 px-4 py-3 border rounded-lg bg-muted/30">
//                     <Label className="text-sm font-bold flex items-center gap-2">
//                       <Package className="h-4 w-4" />
//                       Mockup URLs (Comma separated)
//                     </Label>
//                     <Textarea
//                       className="mt-2 min-h-[120px] text-xs"
//                       placeholder="https://...jpg, https://...png"
//                       defaultValue={selectedMapping?.mockupUrls?.join(', ')}
//                       id="mapping-mockups"
//                     />
//                   </div>
//                 </DialogContent>
//               </Dialog>
//             </>
//           )}
//                 </div>
//               </div>
//               <div className="flex justify-end gap-3 pt-4 border-t">
//                 <Button variant="outline" onClick={() => setIsMappingDialogOpen(false)}>
//                   Cancel
//                 </Button>
//                 <Button
//                   className="px-8"
//                   onClick={async () => {
//                     try {
//                       const payload = {
//                         shop: selectedMapping?.shop,
//                         shopifyProductId: selectedMapping?.shopifyProductId,
//                         shopifyVariantId: selectedMapping?.shopifyVariantId,
//                         title: selectedMapping?.title,
//                         variantTitle: selectedMapping?.variantTitle,
//                         sku: selectedMapping?.sku,
//                         printAssets: {
//                           frontUrl: (document.getElementById('mapping-front') as HTMLInputElement).value,
//                           backUrl: (document.getElementById('mapping-back') as HTMLInputElement).value,
//                           labelUrl: (document.getElementById('mapping-label') as HTMLInputElement).value,
//                         },
//                         mockupUrls: (document.getElementById('mapping-mockups') as HTMLTextAreaElement)
//                           .value.split(',')
//                           .map((s) => s.trim())
//                           .filter(Boolean),
//                       };
//                       await adminProductMappingApi.upsert(payload as any);
//                       toast.success('Mapping saved successfully');
//                       setIsMappingDialogOpen(false);
//                       // Refresh lists
//                       const listResp = await adminProductMappingApi.list({
//                         page: productMappingsPage,
//                         limit: 25,
//                       });
//                       if (listResp.success) {
//                         setProductMappings(listResp.data);
//                         setProductMappingsTotal(listResp.pagination.total);
//                       }
//                       fetchUnmappedItems();
//                       // If we came from an order, refresh that order
//                       if (selectedImportOrder) {
//                         const orderResp = await adminImportOrdersApi.getById(selectedImportOrder._id);
//                         if (orderResp.success) setSelectedImportOrder(orderResp.data);
//                       }
//                     } catch (err: any) {
//                       toast.error(err.message || 'Failed to save mapping');
//                     }
//                   }}
//                 >
//                   Save Mapping
//                 </Button>
//               </div>
//             </DialogContent>
//           </Dialog>

//           {/* Production Jobs Tab */}
//           {activeTab === 'production-jobs' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">Production Jobs</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Manage and track manufacturing packets.
//                   </p>
//                 </div>
//               </div>

//               {/* Filters */}
//               <div className="flex flex-wrap gap-3 items-end mb-6">
//                 <div className="w-full sm:w-48">
//                   <Label>Shop Filter</Label>
//                   <Input
//                     placeholder="Filter by shop..."
//                     value={productionJobsShopFilter}
//                     onChange={(e) => {
//                       setProductionJobsPage(1);
//                       setProductionJobsShopFilter(e.target.value);
//                     }}
//                   />
//                 </div>
//                 <div className="w-full sm:w-40">
//                   <Label>Status</Label>
//                   <Select
//                     value={productionJobsStatusFilter || 'all'}
//                     onValueChange={(val) => {
//                       setProductionJobsPage(1);
//                       setProductionJobsStatusFilter(val === 'all' ? '' : val);
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Any" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">Any Status</SelectItem>
//                       <SelectItem value="queued">Queued</SelectItem>
//                       <SelectItem value="manufacturing">Manufacturing</SelectItem>
//                       <SelectItem value="shipped">Shipped</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="w-full sm:flex-1">
//                   <Label>Search</Label>
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       className="pl-9"
//                       placeholder="Search ID or Customer..."
//                       value={productionJobsSearch}
//                       onChange={(e) => {
//                         setProductionJobsPage(1);
//                         setProductionJobsSearch(e.target.value);
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <Card className="overflow-hidden">
//                 <CardContent className="p-0">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Job ID</TableHead>
//                         <TableHead>Customer</TableHead>
//                         <TableHead className="text-center">Items</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead>Shipping</TableHead>
//                         <TableHead className="text-right">Action</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {isLoadingProductionJobs ? (
//                         <TableRow>
//                           <TableCell colSpan={6} className="text-center py-8">
//                             Loading jobs...
//                           </TableCell>
//                         </TableRow>
//                       ) : productionJobs.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
//                             No production jobs found.
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         productionJobs.map((job) => (
//                           <TableRow
//                             key={job._id}
//                             className="cursor-pointer hover:bg-muted/40"
//                             onClick={() => {
//                               setSelectedProductionJob(job);
//                               setIsProductionJobDialogOpen(true);
//                             }}
//                           >
//                             <TableCell className="font-mono text-xs">{job._id.slice(-8).toUpperCase()}</TableCell>
//                             <TableCell>
//                               <div className="text-sm font-medium">{job.customer?.name}</div>
//                               <div className="text-xs text-muted-foreground">{job.customer?.email}</div>
//                             </TableCell>
//                             <TableCell className="text-center">{job.items?.length || 0}</TableCell>
//                             <TableCell>
//                               <Badge
//                                 variant="secondary"
//                                 className={cn(
//                                   job.status === 'queued' && "bg-slate-500/10 text-slate-600",
//                                   job.status === 'manufacturing' && "bg-orange-500/10 text-orange-600",
//                                   job.status === 'shipped' && "bg-green-500/10 text-green-600"
//                                 )}
//                               >
//                                 {job.status}
//                               </Badge>
//                             </TableCell>
//                             <TableCell className="text-xs">
//                               {job.shipping?.trackingNumber ? (
//                                 <div className="text-primary font-medium">{job.shipping.trackingNumber}</div>
//                               ) : (
//                                 <span className="text-muted-foreground">No tracking</span>
//                               )}
//                             </TableCell>
//                             <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
//                               <Select
//                                 value={job.status}
//                                 onValueChange={(val) => handleUpdateJobStatus(job._id, val)}
//                                 disabled={isUpdatingStatus === job._id}
//                               >
//                                 <SelectTrigger className="w-32 h-8 text-xs">
//                                   <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   <SelectItem value="queued">Queued</SelectItem>
//                                   <SelectItem value="manufacturing">Manufacturing</SelectItem>
//                                   <SelectItem value="shipped">Shipped</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>

//               {/* Job Detail Dialog */}
//               <Dialog open={isProductionJobDialogOpen} onOpenChange={setIsProductionJobDialogOpen}>
//                 <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//                   <DialogHeader>
//                     <DialogTitle>Production Job Detail</DialogTitle>
//                     <DialogDescription>
//                       Manufacturing packet for Order {selectedProductionJob?.shopifyOrderId}
//                     </DialogDescription>
//                   </DialogHeader>

//                   {selectedProductionJob && (
//                     <div className="space-y-6">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <Card>
//                           <CardHeader className="py-3">
//                             <CardTitle className="text-sm">Shipping Destination</CardTitle>
//                           </CardHeader>
//                           <CardContent className="text-sm">
//                             <p className="font-medium">{selectedProductionJob.customer?.name}</p>
//                             <p>{selectedProductionJob.shippingAddress?.address1}</p>
//                             <p>{selectedProductionJob.shippingAddress?.city}, {selectedProductionJob.shippingAddress?.province} {selectedProductionJob.shippingAddress?.zip}</p>
//                             <p>{selectedProductionJob.shippingAddress?.country}</p>
//                           </CardContent>
//                         </Card>

//                         <Card>
//                           <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
//                             <CardTitle className="text-sm">Shipping Info</CardTitle>
//                             <Badge>{selectedProductionJob.status}</Badge>
//                           </CardHeader>
//                           <CardContent className="space-y-3">
//                             <div className="grid grid-cols-2 gap-2">
//                               <div className="space-y-1">
//                                 <Label className="text-[10px] uppercase text-muted-foreground">Carrier</Label>
//                                 <Input
//                                   className="h-8 text-xs"
//                                   placeholder="e.g. UPS"
//                                   defaultValue={selectedProductionJob.shipping?.carrier}
//                                   id="job-carrier"
//                                 />
//                               </div>
//                               <div className="space-y-1">
//                                 <Label className="text-[10px] uppercase text-muted-foreground">Tracking #</Label>
//                                 <Input
//                                   className="h-8 text-xs"
//                                   placeholder="1Z..."
//                                   defaultValue={selectedProductionJob.shipping?.trackingNumber}
//                                   id="job-tracking"
//                                 />
//                               </div>
//                             </div>
//                             <Button
//                               size="sm"
//                               className="w-full h-8 text-xs"
//                               disabled={isUpdatingShipping === selectedProductionJob._id}
//                               onClick={() => {
//                                 const carrier = (document.getElementById('job-carrier') as HTMLInputElement).value;
//                                 const number = (document.getElementById('job-tracking') as HTMLInputElement).value;
//                                 handleUpdateShipping(selectedProductionJob._id, {
//                                   carrier,
//                                   trackingNumber: number,
//                                   status: 'shipped'
//                                 });
//                               }}
//                             >
//                               Update & Mark Shipped
//                             </Button>
//                           </CardContent>
//                         </Card>
//                       </div>

//                       <div className="space-y-3">
//                         <h3 className="font-bold">Manufacturing Items</h3>
//                         <div className="border rounded-lg overflow-hidden">
//                           <Table>
//                             <TableHeader>
//                               <TableRow>
//                                 <TableHead>Item</TableHead>
//                                 <TableHead>Print Assets</TableHead>
//                                 <TableHead>Mockups</TableHead>
//                                 <TableHead className="text-center">Qty</TableHead>
//                               </TableRow>
//                             </TableHeader>
//                             <TableBody>
//                               {selectedProductionJob.items?.map((item: any, idx: number) => (
//                                 <TableRow key={idx}>
//                                   <TableCell>
//                                     <div className="font-medium text-sm">{item.title}</div>
//                                     <div className="text-xs text-muted-foreground">{item.variantTitle}</div>
//                                     <div className="text-[10px] font-mono mt-1">{item.sku}</div>
//                                   </TableCell>
//                                   <TableCell>
//                                     <div className="flex flex-col gap-1">
//                                       {item.printAssets?.frontUrl && (
//                                         <a href={item.printAssets.frontUrl} target="_blank" className="text-[10px] text-primary hover:underline">Front Asset ↗</a>
//                                       )}
//                                       {item.printAssets?.backUrl && (
//                                         <a href={item.printAssets.backUrl} target="_blank" className="text-[10px] text-primary hover:underline">Back Asset ↗</a>
//                                       )}
//                                     </div>
//                                   </TableCell>
//                                   <TableCell>
//                                     <div className="flex gap-1 overflow-x-auto max-w-[200px]">
//                                       {(item.mockupUrls || []).map((m: string, i: number) => (
//                                         <img key={i} src={m} className="w-10 h-10 rounded border object-cover bg-muted" />
//                                       ))}
//                                     </div>
//                                   </TableCell>
//                                   <TableCell className="text-center font-bold">{item.quantity}</TableCell>
//                                 </TableRow>
//                               ))}
//                             </TableBody>
//                           </Table>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </DialogContent>
//               </Dialog>
//             </>
//           )}

//           {/* Shopify Orders Tab */}
//           {activeTab === 'shopify-orders' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">Shopify Orders</h1>
//                   <p className="text-muted-foreground mt-1">
//                     View Shopify orders synced via webhooks.
//                   </p>
//                 </div>
//               </div>
//               {/* Filters */}
//               <div className="flex flex-wrap gap-3 items-end mb-6">
//                 <div className="w-full sm:w-48">
//                   <Label htmlFor="shopify-orders-shop">Shop</Label>
//                   <Input
//                     id="shopify-orders-shop"
//                     placeholder="tees-graphy-2.myshopify.com"
//                     value={shopifyOrdersShopFilter}
//                     onChange={(e) => {
//                       setShopifyOrdersPage(1);
//                       setShopifyOrdersShopFilter(e.target.value);
//                     }}
//                   />
//                 </div>
//                 <div className="w-full sm:w-40">
//                   <Label>Financial Status</Label>
//                   <Select
//                     value={shopifyOrdersFinancialStatus || 'any'}
//                     onValueChange={(val) => {
//                       setShopifyOrdersPage(1);
//                       setShopifyOrdersFinancialStatus(val === 'any' ? '' : val);
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Any" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="any">Any</SelectItem>
//                       <SelectItem value="paid">Paid</SelectItem>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="refunded">Refunded</SelectItem>
//                       <SelectItem value="voided">Voided</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="w-full sm:w-44">
//                   <Label>Fulfillment Status</Label>
//                   <Select
//                     value={shopifyOrdersFulfillmentStatus || 'any'}
//                     onValueChange={(val) => {
//                       setShopifyOrdersPage(1);
//                       setShopifyOrdersFulfillmentStatus(val === 'any' ? '' : val);
//                     }}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Any" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="any">Any</SelectItem>
//                       <SelectItem value="fulfilled">Fulfilled</SelectItem>
//                       <SelectItem value="partial">Partial</SelectItem>
//                       <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="w-full sm:w-40">
//                   <Label>Date From</Label>
//                   <Input
//                     type="date"
//                     value={shopifyOrdersDateFrom}
//                     onChange={(e) => {
//                       setShopifyOrdersPage(1);
//                       setShopifyOrdersDateFrom(e.target.value);
//                     }}
//                   />
//                 </div>
//                 <div className="w-full sm:w-40">
//                   <Label>Date To</Label>
//                   <Input
//                     type="date"
//                     value={shopifyOrdersDateTo}
//                     onChange={(e) => {
//                       setShopifyOrdersPage(1);
//                       setShopifyOrdersDateTo(e.target.value);
//                     }}
//                   />
//                 </div>
//                 <div className="w-full sm:flex-1">
//                   <Label>Search (Order ID / Email)</Label>
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       className="pl-9"
//                       placeholder="Search by Shopify order ID or customer email"
//                       value={shopifyOrdersSearch}
//                       onChange={(e) => {
//                         setShopifyOrdersPage(1);
//                         setShopifyOrdersSearch(e.target.value);
//                       }}
//                     />
//                   </div>
//                 </div>
//               </div>
//               {/* Table */}
//               <Card className="overflow-hidden">
//                 <CardContent className="p-0">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Order ID</TableHead>
//                         <TableHead>Shop</TableHead>
//                         <TableHead>Customer Email</TableHead>
//                         <TableHead className="text-right">Items</TableHead>
//                         <TableHead className="text-right">Total</TableHead>
//                         <TableHead>Financial</TableHead>
//                         <TableHead>Fulfillment</TableHead>
//                         <TableHead>Created At</TableHead>
//                         <TableHead className="text-right">Action</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {isLoadingShopifyOrders ? (
//                         <TableRow>
//                           <TableCell colSpan={9} className="text-center py-6 text-sm text-muted-foreground">
//                             Loading Shopify orders...
//                           </TableCell>
//                         </TableRow>
//                       ) : shopifyOrders.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={9} className="text-center py-6 text-sm text-muted-foreground">
//                             No Shopify orders found.
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         shopifyOrders.map((order) => (
//                           <TableRow
//                             key={order._id}
//                             className="cursor-pointer hover:bg-muted/40"
//                             onClick={() => {
//                               setSelectedShopifyOrder(order);
//                               setIsShopifyOrderDialogOpen(true);
//                             }}
//                           >
//                             <TableCell>{order.shopifyOrderId}</TableCell>
//                             <TableCell>{order.shop}</TableCell>
//                             <TableCell>{order.customerEmail || '—'}</TableCell>
//                             <TableCell className="text-right">{order.itemsCount ?? 0}</TableCell>
//                             <TableCell className="text-right">
//                               {order.totalPrice
//                                 ? `${order.totalPrice} ${order.currency || ''}`.trim()
//                                 : '—'}
//                             </TableCell>
//                             <TableCell>{order.financialStatus || '—'}</TableCell>
//                             <TableCell>{order.fulfillmentStatus || '—'}</TableCell>
//                             <TableCell>
//                               {order.createdAtShopify
//                                 ? new Date(order.createdAtShopify).toLocaleString()
//                                 : '—'}
//                             </TableCell>
//                             <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 disabled={!!fulfillmentCreatingFor}
//                                 onClick={async () => {
//                                   try {
//                                     setFulfillmentCreatingFor(order._id);
//                                     await adminFulfillmentOrdersApi.create({
//                                       shop: order.shop,
//                                       shopifyOrderId: order.shopifyOrderId,
//                                     });
//                                     toast.success('Fulfillment job queued');
//                                   } catch (err: any) {
//                                     console.error('Failed to queue fulfillment job', err);
//                                     toast.error(err?.message || 'Failed to queue fulfillment job');
//                                   } finally {
//                                     setFulfillmentCreatingFor(null);
//                                   }
//                                 }}
//                               >
//                                 {fulfillmentCreatingFor === order._id ? 'Queuing...' : 'Create Fulfillment Job'}
//                               </Button>
//                             </TableCell>
//                           </TableRow>
//                         ))
//                       )}
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>
//               {/* Pagination */}
//               {shopifyOrdersTotal > shopifyOrdersLimit && (
//                 <div className="flex items-center justify-between mt-4">
//                   <p className="text-sm text-muted-foreground">
//                     Showing {(shopifyOrdersPage - 1) * shopifyOrdersLimit + 1}–
//                     {Math.min(shopifyOrdersPage * shopifyOrdersLimit, shopifyOrdersTotal)} of{' '}
//                     {shopifyOrdersTotal} orders
//                   </p>
//                   <div className="flex items-center gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setShopifyOrdersPage((p) => Math.max(1, p - 1))}
//                       disabled={shopifyOrdersPage === 1}
//                     >
//                       Previous
//                     </Button>
//                     <span className="text-sm text-muted-foreground">
//                       Page {shopifyOrdersPage} of {shopifyOrdersPages}
//                     </span>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() =>
//                         setShopifyOrdersPage((p) =>
//                           p < shopifyOrdersPages ? p + 1 : p
//                         )
//                       }
//                       disabled={shopifyOrdersPage >= shopifyOrdersPages}
//                     >
//                       Next
//                     </Button>
//                   </div>
//                 </div>
//               )}
//               {/* Order Detail Drawer/Modal */}
//               <Dialog open={isShopifyOrderDialogOpen} onOpenChange={setIsShopifyOrderDialogOpen}>
//                 <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
//                   <DialogHeader>
//                     <DialogTitle>Shopify Order Details</DialogTitle>
//                     <DialogDescription>
//                       Inspect raw Shopify order payload and extracted fields.
//                     </DialogDescription>
//                   </DialogHeader>
//                   {selectedShopifyOrder && (
//                     <div className="space-y-4">
//                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
//                         <p><span className="font-medium">Order ID:</span> {selectedShopifyOrder.shopifyOrderId}</p>
//                         <p><span className="font-medium">Shop:</span> {selectedShopifyOrder.shop}</p>
//                         <p><span className="font-medium">Customer Email:</span> {selectedShopifyOrder.customerEmail || '—'}</p>
//                         <p><span className="font-medium">Items:</span> {selectedShopifyOrder.itemsCount ?? 0}</p>
//                         <p>
//                           <span className="font-medium">Total:</span>{' '}
//                           {selectedShopifyOrder.totalPrice
//                             ? `${selectedShopifyOrder.totalPrice} ${selectedShopifyOrder.currency || ''}`.trim()
//                             : '—'}
//                         </p>
//                         <p><span className="font-medium">Financial Status:</span> {selectedShopifyOrder.financialStatus || '—'}</p>
//                         <p><span className="font-medium">Fulfillment Status:</span> {selectedShopifyOrder.fulfillmentStatus || '—'}</p>
//                         <p>
//                           <span className="font-medium">Created At:</span>{' '}
//                           {selectedShopifyOrder.createdAtShopify
//                             ? new Date(selectedShopifyOrder.createdAtShopify).toLocaleString()
//                             : '—'}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="font-medium mb-2">Raw JSON</p>
//                         <pre className="bg-muted rounded-md p-3 text-xs max-h-[40vh] overflow-auto">
//                           {JSON.stringify(selectedShopifyOrder.raw || {}, null, 2)}
//                         </pre>
//                       </div>
//                     </div>
//                   )}
//                 </DialogContent>
//               </Dialog>
//             </>
//           )}

//           {/* Fulfillment Tab */}
//           {activeTab === 'fulfillment' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">Fulfillment & Logistics</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Monitor print partners and delivery performance
//                   </p>
//                 </div>
//                 <Button className="gap-2">
//                   <Truck className="h-4 w-4" />
//                   Add Partner
//                 </Button>
//               </div>

//               <Card className="mb-8">
//                 <CardHeader>
//                   <CardTitle>Fulfillment Partners</CardTitle>
//                   <CardDescription>Active print and shipping providers</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Partner</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead>Performance</TableHead>
//                         <TableHead>Avg. Fulfillment</TableHead>
//                         <TableHead>Orders</TableHead>
//                         <TableHead className="text-right">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {fulfillmentPartners.map((partner) => (
//                         <TableRow key={partner.id}>
//                           <TableCell className="font-medium">{partner.name}</TableCell>
//                           <TableCell>
//                             <Badge
//                               variant="secondary"
//                               className={
//                                 partner.status === 'active' ? 'bg-green-500/10 text-green-500' :
//                                   'bg-yellow-500/10 text-yellow-500'
//                               }
//                             >
//                               {partner.status}
//                             </Badge>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
//                                 <div
//                                   className={`h-full ${partner.performance >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`}
//                                   style={{ width: `${partner.performance}%` }}
//                                 />
//                               </div>
//                               <span className="text-sm font-medium">{partner.performance}%</span>
//                             </div>
//                           </TableCell>
//                           <TableCell>{partner.avgTime}</TableCell>
//                           <TableCell>{partner.orders.toLocaleString()}</TableCell>
//                           <TableCell className="text-right">
//                             <div className="flex gap-2 justify-end">
//                               <Button variant="ghost" size="sm">
//                                 <Edit className="h-4 w-4" />
//                               </Button>
//                               <Button variant="ghost" size="sm">
//                                 <MessageSquare className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>
//             </>
//           )}

//           {/* Support Tab */}
//           {activeTab === 'support' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">Support & Moderation</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Manage tickets, reports, and user inquiries
//                   </p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                 <Card>
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-muted-foreground">Open Tickets</p>
//                         <p className="text-2xl font-bold mt-1">
//                           {supportTickets.filter(t => t.status === 'open').length}
//                         </p>
//                       </div>
//                       <AlertTriangle className="h-8 w-8 text-destructive" />
//                     </div>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-muted-foreground">In Progress</p>
//                         <p className="text-2xl font-bold mt-1">
//                           {supportTickets.filter(t => t.status === 'in-progress').length}
//                         </p>
//                       </div>
//                       <Activity className="h-8 w-8 text-yellow-500" />
//                     </div>
//                   </CardContent>
//                 </Card>
//                 <Card>
//                   <CardContent className="p-6">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-muted-foreground">Resolved Today</p>
//                         <p className="text-2xl font-bold mt-1">
//                           {supportTickets.filter(t => t.status === 'resolved').length}
//                         </p>
//                       </div>
//                       <CheckCircle className="h-8 w-8 text-green-500" />
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Support Tickets</CardTitle>
//                   <CardDescription>Recent customer inquiries and issues</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Ticket ID</TableHead>
//                         <TableHead>User</TableHead>
//                         <TableHead>Subject</TableHead>
//                         <TableHead>Priority</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead className="text-right">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {supportTickets.map((ticket) => (
//                         <TableRow key={ticket.id}>
//                           <TableCell className="font-medium">{ticket.id}</TableCell>
//                           <TableCell>{ticket.user}</TableCell>
//                           <TableCell>{ticket.subject}</TableCell>
//                           <TableCell>
//                             <Badge
//                               variant="secondary"
//                               className={
//                                 ticket.priority === 'high' ? 'bg-destructive/10 text-destructive' :
//                                   ticket.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
//                                     'bg-muted text-muted-foreground'
//                               }
//                             >
//                               {ticket.priority}
//                             </Badge>
//                           </TableCell>
//                           <TableCell>
//                             <Badge
//                               variant="secondary"
//                               className={
//                                 ticket.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
//                                   ticket.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
//                                     'bg-muted text-muted-foreground'
//                               }
//                             >
//                               {ticket.status}
//                             </Badge>
//                           </TableCell>
//                           <TableCell className="text-right">
//                             <Button variant="ghost" size="sm">
//                               View Details
//                             </Button>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </CardContent>
//               </Card>
//             </>
//           )}

//           {/* Marketing Tab */}
//           {activeTab === 'marketing' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">Marketing & Announcements</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Manage platform communications and campaigns
//                   </p>
//                 </div>
//               </div>

//               <Card className="mb-8">
//                 <CardHeader>
//                   <CardTitle>Send Announcement</CardTitle>
//                   <CardDescription>Broadcast message to all stores or specific users</CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div>
//                     <label className="text-sm font-medium">Recipients</label>
//                     <Select defaultValue="all">
//                       <SelectTrigger>
//                         <SelectValue />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="all">All Users</SelectItem>
//                         <SelectItem value="merchants">All Merchants</SelectItem>
//                         <SelectItem value="active">Active Stores Only</SelectItem>
//                         <SelectItem value="custom">Custom Selection</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium">Subject</label>
//                     <Input placeholder="Enter announcement subject" />
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium">Message</label>
//                     <Textarea
//                       placeholder="Write your announcement..."
//                       rows={6}
//                       value={announcementText}
//                       onChange={(e) => setAnnouncementText(e.target.value)}
//                     />
//                   </div>
//                   <Button className="w-full gap-2">
//                     <Mail className="h-4 w-4" />
//                     Send Announcement
//                   </Button>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Previous Announcements</CardTitle>
//                   <CardDescription>History of platform communications</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {[
//                       { date: '2 days ago', subject: 'New product templates available', recipients: 'All Merchants' },
//                       { date: '1 week ago', subject: 'Platform maintenance scheduled', recipients: 'All Users' },
//                       { date: '2 weeks ago', subject: 'Shipping rates update', recipients: 'Active Stores' },
//                     ].map((announcement, i) => (
//                       <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
//                         <div>
//                           <p className="font-medium">{announcement.subject}</p>
//                           <p className="text-sm text-muted-foreground">
//                             Sent to {announcement.recipients} • {announcement.date}
//                           </p>
//                         </div>
//                         <Button variant="ghost" size="sm">
//                           View
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </>
//           )}

//           {/* Analytics Tab */}
//           {activeTab === 'analytics' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">Platform Analytics</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Detailed insights and performance metrics
//                   </p>
//                 </div>
//                 <div className="flex gap-2">
//                   <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
//                     <SelectTrigger className="w-32">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="week">This Week</SelectItem>
//                       <SelectItem value="month">This Month</SelectItem>
//                       <SelectItem value="quarter">This Quarter</SelectItem>
//                       <SelectItem value="year">This Year</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <Button variant="outline" className="gap-2">
//                     <Download className="h-4 w-4" />
//                     Export PDF
//                   </Button>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Revenue Over Time</CardTitle>
//                     <CardDescription>Monthly revenue trends</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <ResponsiveContainer width="100%" height={300}>
//                       <BarChart data={revenueData}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                         <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
//                         <YAxis stroke="hsl(var(--muted-foreground))" />
//                         <Tooltip
//                           contentStyle={{
//                             backgroundColor: 'hsl(var(--card))',
//                             border: '1px solid hsl(var(--border))',
//                             borderRadius: '8px'
//                           }}
//                         />
//                         <Bar dataKey="revenue" fill="hsl(var(--primary))" />
//                       </BarChart>
//                     </ResponsiveContainer>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Order Volume</CardTitle>
//                     <CardDescription>Monthly order count</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <ResponsiveContainer width="100%" height={300}>
//                       <LineChart data={revenueData}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
//                         <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
//                         <YAxis stroke="hsl(var(--muted-foreground))" />
//                         <Tooltip
//                           contentStyle={{
//                             backgroundColor: 'hsl(var(--card))',
//                             border: '1px solid hsl(var(--border))',
//                             borderRadius: '8px'
//                           }}
//                         />
//                         <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} />
//                       </LineChart>
//                     </ResponsiveContainer>
//                   </CardContent>
//                 </Card>
//               </div>

//               <Card>
//                 <CardHeader>
//                   <CardTitle>Key Metrics Summary</CardTitle>
//                   <CardDescription>Platform performance indicators</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                     <div>
//                       <p className="text-sm text-muted-foreground">Avg. Order Value</p>
//                       <p className="text-2xl font-bold mt-1">
//                         ₹{(totalRevenue / (platformOrders.length || 1)).toFixed(2)}
//                       </p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-muted-foreground">Fulfillment Rate</p>
//                       <p className="text-2xl font-bold mt-1">96%</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
//                       <p className="text-2xl font-bold mt-1">4.8/5.0</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-muted-foreground">Return Rate</p>
//                       <p className="text-2xl font-bold mt-1">2.1%</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </>
//           )}

//           {/* Wallets Tab */}
//           {activeTab === 'wallets' && <WalletManagement />}

//           {/* Invoices Tab */}
//           {activeTab === 'invoices' && <InvoiceManagement />}

//           {/* Audit Logs Tab */}
//           {activeTab === 'audit' && <AuditLogs />}

//           {/* Settings Tab */}
//           {activeTab === 'settings' && (
//             <>
//               <div className="flex items-center justify-between mb-8">
//                 <div>
//                   <h1 className="text-3xl font-bold">Platform Settings</h1>
//                   <p className="text-muted-foreground mt-1">
//                     Configure global platform options
//                   </p>
//                 </div>
//               </div>

//               <div className="space-y-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Payment Settings</CardTitle>
//                     <CardDescription>Manage payment methods and fees</CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium">Platform Commission</p>
//                         <p className="text-sm text-muted-foreground">Percentage taken from each sale</p>
//                       </div>
//                       <Input className="w-24" defaultValue="15%" />
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium">Transaction Fee</p>
//                         <p className="text-sm text-muted-foreground">Fixed fee per transaction</p>
//                       </div>
//                       <Input className="w-24" defaultValue="₹0.30" />
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Shipping Configuration</CardTitle>
//                     <CardDescription>Global shipping rates and regions</CardDescription>
//                   </CardHeader>
//                   <CardContent className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium">Domestic Shipping</p>
//                         <p className="text-sm text-muted-foreground">Base rate for domestic orders</p>
//                       </div>
//                       <Input className="w-24" defaultValue="₹5.99" />
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="font-medium">International Shipping</p>
//                         <p className="text-sm text-muted-foreground">Base rate for international orders</p>
//                       </div>
//                       <Input className="w-24" defaultValue="₹12.99" />
//                     </div>
//                   </CardContent>
//                 </Card>

//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Print Partners Integration</CardTitle>
//                     <CardDescription>Connect fulfillment providers</CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <Button variant="outline" className="w-full gap-2">
//                       <Globe className="h-4 w-4" />
//                       Configure API Integrations
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </div>
//             </>
//           )}

//           {activeTab === 'withdrawals' && (
//             <div className="space-y-6">
//               <WithdrawalsManagement />
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Admin;

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Order, Store as StoreType } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Users,
  Package,
  Palette,
  Store,
  TrendingUp,
  Settings,
  LogOut,
  Search,
  Filter,
  Download,
  ShoppingBag,
  DollarSign,
  Globe,
  Truck,
  AlertTriangle,
  Bell,
  MessageSquare,
  Ban,
  CheckCircle,
  XCircle,
  Edit,
  BarChart3,
  Megaphone,
  HelpCircle,
  FileText,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  ChevronRight,
  Wallet,
  Shield,
  Plus,
  Banknote,
  Info,
  ArrowRightLeft,
  Layers,
  CreditCard,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { WalletManagement } from '@/components/admin/WalletManagement';
import { WithdrawalsManagement } from '@/components/admin/WithdrawalsManagement';
import { InvoiceManagement } from '@/components/admin/InvoiceManagement';
import { AuditLogs } from '@/components/admin/AuditLogs';
import { PayoutManagement } from '@/components/admin/PayoutManagement';
import {
  productApi,
  storeOrdersApi,
  adminWalletApi,
  adminShopifyOrdersApi,
  adminFulfillmentOrdersApi,
  adminImportOrdersApi,
  adminProductMappingApi,
  adminProductionJobApi
} from '@/lib/api';
import { storeApi } from '@/lib/api';
import { toast } from 'sonner';
import { CatalogToolbar } from '@/components/admin/CatalogToolbar';
import { BaseProductsTable } from '@/components/admin/BaseProductsTable';
import logo from '@/assets/logo.webp';
import { ShopifyOrdersTab } from '@/components/admin/ShopifyOrdersTab';

const Admin = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL params for tab
    const tabParam = searchParams.get('tab');
    return tabParam || 'overview';
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');
  const [announcementText, setAnnouncementText] = useState('');
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersData, setUsersData] = useState<Array<{
    userId: string;
    userName: string;
    userEmail: string;
    stores: any[];
    revenue: number;
    revenueRupees: string;
    status: string;
  }>>([]);
  const [isLoadingUsersData, setIsLoadingUsersData] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [disablingUserId, setDisablingUserId] = useState<string | null>(null);

  // Products from database
  const [databaseProducts, setDatabaseProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productsSearchQuery, setProductsSearchQuery] = useState('');
  const [productsPage, setProductsPage] = useState(1);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productsCount, setProductsCount] = useState<number>(0); // For stats display
  const [isLoadingProductsCount, setIsLoadingProductsCount] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storesPage, setStoresPage] = useState(1);
  const [storesLimit, setStoresLimit] = useState(10);
  const [storesTotal, setStoresTotal] = useState(0);
  const [storesSortBy, setStoresSortBy] = useState('createdAt');
  const [storesSortOrder, setStoresSortOrder] = useState<'asc' | 'desc'>('desc');
  const [suspendingStoreId, setSuspendingStoreId] = useState<string | null>(null);
  const [isSuspendingStore, setIsSuspendingStore] = useState(false);


  // Admin sees ALL data across platform (stores/products from localStorage snapshot)
  const allStores = JSON.parse(localStorage.getItem('shelfmerch_all_stores') || '[]') as StoreType[];
  const allProducts = JSON.parse(localStorage.getItem('shelfmerch_all_products') || '[]') as Product[];

  // Live platform orders for Admin Orders tab (superadmin only)
  const [platformOrders, setPlatformOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Orders filter states
  const [ordersSearchQuery, setOrdersSearchQuery] = useState('');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<string>('all');
  const [ordersAmountSort, setOrdersAmountSort] = useState<string>('none');
  const [ordersAlphabeticalSort, setOrdersAlphabeticalSort] = useState<string>('none');


  // POD Fulfillment Pipeline (deprecated) - keep minimal state so legacy JSX compiles

  // Shopify Orders (Super Admin)
  const [shopifyOrders, setShopifyOrders] = useState<any[]>([]);
  const [isLoadingShopifyOrders, setIsLoadingShopifyOrders] = useState(false);
  const [shopifyOrdersPage, setShopifyOrdersPage] = useState(1);
  const [shopifyOrdersLimit, setShopifyOrdersLimit] = useState(25);
  const [shopifyOrdersTotal, setShopifyOrdersTotal] = useState(0);
  const [shopifyOrdersPages, setShopifyOrdersPages] = useState(1);
  const [shopifyOrdersShopFilter, setShopifyOrdersShopFilter] = useState('');
  const [shopifyOrdersFinancialStatus, setShopifyOrdersFinancialStatus] = useState<string>('');
  const [shopifyOrdersFulfillmentStatus, setShopifyOrdersFulfillmentStatus] = useState<string>('');
  const [shopifyOrdersDateFrom, setShopifyOrdersDateFrom] = useState<string>('');
  const [shopifyOrdersDateTo, setShopifyOrdersDateTo] = useState<string>('');
  const [shopifyOrdersSearch, setShopifyOrdersSearch] = useState<string>('');
  const [selectedShopifyOrder, setSelectedShopifyOrder] = useState<any | null>(null);
  const [isShopifyOrderDialogOpen, setIsShopifyOrderDialogOpen] = useState(false);
  const [isShopifyOrderDetailOpen, setIsShopifyOrderDetailOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [fulfillmentCreatingFor, setFulfillmentCreatingFor] = useState<string | null>(null);

  // POD Fulfillment Pipeline - Import Orders

  const [importOrders, setImportOrders] = useState<any[]>([]);
  const [isLoadingImportOrders, setIsLoadingImportOrders] = useState(false);
  const [importOrdersPage, setImportOrdersPage] = useState(1);
  const [importOrdersTotal, setImportOrdersTotal] = useState(0);
  const [importOrdersStatusFilter, setImportOrdersStatusFilter] = useState('');
  const [importOrdersShopFilter, setImportOrdersShopFilter] = useState('');
  const [importOrdersSearch, setImportOrdersSearch] = useState('');
  const [selectedImportOrder, setSelectedImportOrder] = useState<any | null>(null);
  const [isImportOrderDialogOpen, setIsImportOrderDialogOpen] = useState(false);

  const [productMappings, setProductMappings] = useState<any[]>([]);
  const [isLoadingProductMappings, setIsLoadingProductMappings] = useState(false);
  const [productMappingsPage, setProductMappingsPage] = useState(1);
  const [productMappingsTotal, setProductMappingsTotal] = useState(0);
  const [productMappingsShopFilter, setProductMappingsShopFilter] = useState('');
  const [productMappingsSearch, setProductMappingsSearch] = useState('');
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<any | null>(null);

  const [productionJobs, setProductionJobs] = useState<any[]>([]);
  const [isLoadingProductionJobs, setIsLoadingProductionJobs] = useState(false);
  const [productionJobsPage, setProductionJobsPage] = useState(1);
  const [productionJobsTotal, setProductionJobsTotal] = useState(0);
  const [productionJobsStatusFilter, setProductionJobsStatusFilter] = useState('');
  const [productionJobsShopFilter, setProductionJobsShopFilter] = useState('');
  const [productionJobsSearch, setProductionJobsSearch] = useState('');
  const [selectedProductionJob, setSelectedProductionJob] = useState<any | null>(null);
  const [isProductionJobDialogOpen, setIsProductionJobDialogOpen] = useState(false);
  const [unmappedItems, setUnmappedItems] = useState<any[]>([]);
  const [isLoadingUnmappedItems, setIsLoadingUnmappedItems] = useState(false);

  // Platform Statistics
  const [adminStats, setAdminStats] = useState<{
    totalRevenue: number;
    totalOrders: number;
    deliveredOrders: number;
    monthlyRevenue: number;
    monthlyOrders: number;
    topProducts: any[];
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Derive effective stores list: prefer backend data when available, otherwise fall back to local snapshot
  const effectiveStores: StoreType[] = !error && stores.length > 0 ? stores : allStores;

  // Calculate real stats from data
  const totalRevenue = adminStats?.totalRevenue || 0;
  const activeStores = effectiveStores.length;
  const totalProducts = allProducts.length;
  const pendingOrders = platformOrders.filter(o => o.status === 'on-hold').length;

  const statusOptions: Array<{ value: Order['status']; label: string }> = [
    { value: 'on-hold', label: 'On hold' },
    { value: 'in-production', label: 'In production' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Fetch total user count from backend
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const { authApi } = await import('@/lib/api');
        const response = await authApi.getUserCount();
        // The apiRequest returns the full response object for auth endpoints
        if (response && typeof response.count === 'number') {
          setTotalUsers(response.count);
        } else if (response && response.success && typeof response.count === 'number') {
          setTotalUsers(response.count);
        }
      } catch (error) {
        console.error('Failed to fetch user count:', error);
        // Fallback to stores length if API fails
        setTotalUsers(allStores.length);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (user?.role === 'superadmin') {
      fetchUserCount();
    } else {
      // If not admin, just show stores length
      setTotalUsers(allStores.length);
      setIsLoadingUsers(false);
    }
  }, [user?.role, allStores.length]);

  // Fetch users data with stores and wallet information
  useEffect(() => {
    const fetchUsersData = async () => {
      if (user?.role !== 'superadmin' || activeTab !== 'users') {
        return;
      }

      setIsLoadingUsersData(true);
      try {
        // Fetch wallets (contains user info and balance)
        const walletsResponse = await adminWalletApi.listWallets({ limit: 1000 });
        const wallets = walletsResponse.data || [];

        // Fetch all stores to map users to their stores
        const storesResponse = await storeApi.listAllStores({ limit: 1000 });
        const allStoresData = storesResponse.data || [];

        // Group stores by merchant (userId)
        const storesByUser: Record<string, any[]> = {};
        allStoresData.forEach((store: any) => {
          const merchantId = store.merchant?._id || store.merchant || store.userId;
          if (merchantId) {
            if (!storesByUser[merchantId]) {
              storesByUser[merchantId] = [];
            }
            storesByUser[merchantId].push(store);
          }
        });

        // Combine wallet data with stores
        const usersList = wallets.map((wallet: any) => {
          const userId = wallet.userId;
          const userStores = storesByUser[userId] || [];
          const revenue = wallet.balancePaise || 0;

          return {
            userId,
            userName: wallet.userName || 'Unknown',
            userEmail: wallet.userEmail || 'N/A',
            stores: userStores,
            revenue,
            revenueRupees: wallet.balanceRupees || '0.00',
            status: wallet.status === 'ACTIVE' ? 'Active' : 'Inactive',
          };
        });

        setUsersData(usersList);
      } catch (error) {
        console.error('Failed to fetch users data:', error);
        toast.error('Failed to load users data');
      } finally {
        setIsLoadingUsersData(false);
      }
    };

    fetchUsersData();
  }, [user?.role, activeTab]);

  // Fetch products count from backend for stats
  useEffect(() => {
    const fetchProductsCount = async () => {
      if (user?.role !== 'superadmin') {
        return;
      }

      setIsLoadingProductsCount(true);
      try {
        // Fetch with minimal limit to get just the pagination info
        const response = await productApi.getAll({
          page: 1,
          limit: 1,
        });

        if (response && response.success !== false) {
          const pagination = response.pagination || { total: 0 };
          setProductsCount(pagination.total || 0);
        } else {
          // Fallback to localStorage count if API fails
          setProductsCount(totalProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products count:', error);
        // Fallback to localStorage count if API fails
        setProductsCount(totalProducts);
      } finally {
        setIsLoadingProductsCount(false);
      }
    };

    fetchProductsCount();
  }, [user?.role, totalProducts]);

  // Fetch platform-wide orders for Orders tab (superadmin)
  useEffect(() => {
    const fetchOrders = async () => {
      if (user?.role !== 'superadmin') return;
      if (activeTab !== 'orders') return;

      setIsLoadingOrders(true);
      setOrdersError(null);
      try {
        const data = await storeOrdersApi.listForMerchant();
        setPlatformOrders(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error('Failed to fetch platform orders:', error);
        setOrdersError(error?.message || 'Failed to load orders');
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [user?.role, activeTab]);

  // Filter and sort orders based on all criteria
  const filteredOrders = useMemo(() => {
    let filtered = [...platformOrders];

    // Apply search filter
    if (ordersSearchQuery.trim()) {
      const query = ordersSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((order) => {
        // Search by customer email
        const emailMatch = order.customerEmail?.toLowerCase().includes(query);

        // Search by store name (from order.storeId)
        let storeName = '';
        if (order.storeId && typeof order.storeId === 'object' && order.storeId !== null) {
          storeName = (order.storeId as { name?: string }).name || '';
        }
        const storeMatch = storeName.toLowerCase().includes(query);

        return emailMatch || storeMatch;
      });
    }

    // Apply status filter
    if (ordersStatusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === ordersStatusFilter);
    }

    // Apply amount sorting
    if (ordersAmountSort !== 'none') {
      filtered.sort((a, b) => {
        const amountA = a.total !== undefined ? a.total : 0;
        const amountB = b.total !== undefined ? b.total : 0;

        if (ordersAmountSort === 'low-high') {
          return amountA - amountB;
        } else if (ordersAmountSort === 'high-low') {
          return amountB - amountA;
        }
        return 0;
      });
    }

    // Apply alphabetical sorting
    if (ordersAlphabeticalSort !== 'none') {
      filtered.sort((a, b) => {
        let compareA = '';
        let compareB = '';

        if (ordersAlphabeticalSort === 'store-az' || ordersAlphabeticalSort === 'store-za') {
          // Sort by store name
          let storeNameA = '';
          let storeNameB = '';
          if (a.storeId && typeof a.storeId === 'object' && a.storeId !== null) {
            storeNameA = (a.storeId as { name?: string }).name || '';
          }
          if (b.storeId && typeof b.storeId === 'object' && b.storeId !== null) {
            storeNameB = (b.storeId as { name?: string }).name || '';
          }
          compareA = storeNameA.toLowerCase();
          compareB = storeNameB.toLowerCase();
        } else if (ordersAlphabeticalSort === 'email-az' || ordersAlphabeticalSort === 'email-za') {
          // Sort by customer email
          compareA = (a.customerEmail || '').toLowerCase();
          compareB = (b.customerEmail || '').toLowerCase();
        }

        const comparison = compareA.localeCompare(compareB);

        if (ordersAlphabeticalSort === 'store-za' || ordersAlphabeticalSort === 'email-za') {
          return -comparison; // Reverse for Z-A
        }
        return comparison; // A-Z
      });
    }

    return filtered;
  }, [platformOrders, ordersSearchQuery, ordersStatusFilter, ordersAmountSort, ordersAlphabeticalSort]);

  // Fetch admin dashboard statistics
  useEffect(() => {
    const fetchAdminStats = async () => {
      if (user?.role !== 'superadmin' || activeTab !== 'overview') return;

      setIsLoadingStats(true);
      try {
        // TODO: Implement getAdminStats API endpoint
        // const response = await storeOrdersApi.getAdminStats();
        // if (response.success) {
        //   setAdminStats(response.data);
        // }
        // For now, set empty stats
        setAdminStats(null);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchAdminStats();
  }, [user?.role, activeTab]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...databaseProducts];

    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(p => p.isActive);
      } else if (statusFilter === 'archived') {
        filtered = filtered.filter(p => !p.isActive);
      }
      // TODO: Add draft status filtering when draft status is implemented
    }

    // Apply category filter (placeholder - can be enhanced when categories are added)
    // For now, category filter doesn't do anything

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'price-low':
          return (a.catalogue?.basePrice || 0) - (b.catalogue?.basePrice || 0);
        case 'price-high':
          return (b.catalogue?.basePrice || 0) - (a.catalogue?.basePrice || 0);
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return filtered;
  }, [databaseProducts, statusFilter, categoryFilter, sortBy]);

  // Fetch products from database
  const fetchProducts = useCallback(async () => {
    if (activeTab !== 'products') {
      return;
    }

    if (user?.role !== 'superadmin') {
      return;
    }

    console.log('Fetching products from database...', { productsPage, productsSearchQuery });
    setIsLoadingProducts(true);
    try {
      const response = await productApi.getAll({
        page: productsPage,
        limit: 20,
        search: productsSearchQuery.trim() || undefined,
      });

      console.log('Products API response:', response);

      // Handle response structure
      if (response && response.success !== false) {
        const productsArray = Array.isArray(response.data) ? response.data : [];
        const pagination = response.pagination || { total: productsArray.length };

        console.log(`Loaded ${productsArray.length} products out of ${pagination.total} total`);
        setDatabaseProducts(productsArray);
        setProductsTotal(pagination.total || productsArray.length);
      } else {
        console.warn('API response indicates failure:', response);
        setDatabaseProducts([]);
        setProductsTotal(0);
      }
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      toast.error(error.message || 'Failed to load products from database');
      setDatabaseProducts([]);
      setProductsTotal(0);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [activeTab, user?.role, productsPage, productsSearchQuery]);

  // Fetch All Stores
  useEffect(() => {
    let isMounted = true;

    const loadStores = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await storeApi.listAllStores({
          page: storesPage,
          limit: storesLimit,
          search: searchQuery,
          sortBy: storesSortBy,
          sortOrder: storesSortOrder
        });

        if (isMounted) {
          if (response.success) {
            setStores(response.data || []);
            if (response.pagination) {
              setStoresTotal(response.pagination.total);
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load stores');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      loadStores();
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [storesPage, storesLimit, searchQuery, storesSortBy, storesSortOrder]);


  // Update URL when tab changes
  useEffect(() => {
    if (activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams]);

  // Shopify Orders data is now handled inside ShopifyOrdersTab component


  // POD Pipeline Helpers
  const handleImportOrder = async (shop: string, orderId: string) => {
    try {
      const resp = await adminImportOrdersApi.import({ shop, shopifyOrderId: orderId });
      if (resp.success) {
        toast.success('Order imported and normalized');
        setActiveTab('import-orders');
        // Refresh list
        const listResp = await adminImportOrdersApi.list({ page: 1, limit: 25 });
        if (listResp.success) {
          setImportOrders(listResp.data);
          setImportOrdersTotal(listResp.pagination.total);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    }
  };

  const handleCreateProductionJob = async (orderId: string) => {
    try {
      const resp = await adminProductionJobApi.create(orderId);
      if (resp.success) {
        toast.success('Production job created');
        setActiveTab('production-jobs');
        // Refresh list
        const listResp = await adminProductionJobApi.list({ page: 1, limit: 25 });
        if (listResp.success) {
          setProductionJobs(listResp.data);
          setProductionJobsTotal(listResp.pagination.total);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Job creation failed');
    }
  };

  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(jobId);
      const resp = await adminProductionJobApi.updateStatus(jobId, newStatus);
      if (resp.success) {
        toast.success(`Status updated to ${newStatus}`);
        setProductionJobs(prev => prev.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
      }
    } catch (err: any) {
      toast.error(err.message || 'Status update failed');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const [isUpdatingShipping, setIsUpdatingShipping] = useState<string | null>(null);
  const handleUpdateShipping = async (jobId: string, shipping: any) => {
    try {
      setIsUpdatingShipping(jobId);
      const resp = await adminProductionJobApi.updateShipping(jobId, shipping);
      if (resp.success) {
        toast.success('Shipping info updated');
        setProductionJobs(prev => prev.map(j => j._id === jobId ? { ...j, ...resp.data } : j));
      }
    } catch (err: any) {
      toast.error(err.message || 'Shipping update failed');
    } finally {
      setIsUpdatingShipping(null);
    }
  };

  const fetchUnmappedItems = useCallback(async () => {
    if (activeTab !== 'product-mappings' && activeTab !== 'import-orders') return;
    setIsLoadingUnmappedItems(true);
    try {
      const resp = await adminImportOrdersApi.getUnmappedItems();
      if (resp.success) {
        setUnmappedItems(resp.data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch unmapped items:', err);
    } finally {
      setIsLoadingUnmappedItems(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchUnmappedItems();
  }, [activeTab, fetchUnmappedItems]);

  useEffect(() => {
    // Fetch immediately when tab becomes active or page changes
    if (activeTab === 'products' && user?.role === 'superadmin') {
      if (productsSearchQuery) {
        // Debounce search query
        const timeoutId = setTimeout(() => {
          fetchProducts();
        }, 500);
        return () => clearTimeout(timeoutId);
      } else {
        // Fetch immediately for page changes or initial load
        fetchProducts();
      }
    }
  }, [activeTab, productsPage, productsSearchQuery, user?.role, fetchProducts]);

  // Handle suspending/unsuspending a store
  const handleSuspendStore = async () => {
    if (!suspendingStoreId) return;

    try {
      setIsSuspendingStore(true);
      // TODO: Implement suspend API endpoint
      // const response = await storeApi.suspend(suspendingStoreId);
      // For now, use update method to toggle isActive status
      const store = stores.find(s => s.id === suspendingStoreId);
      if (store) {
        const response = await storeApi.update(suspendingStoreId, {
          // Note: This may need to be adjusted based on actual API structure
        });
        if (response.success) {
          toast.success(response.message || 'Store status updated successfully');
          setSuspendingStoreId(null);
          // Reload stores list
          const updatedResponse = await storeApi.listAllStores({
            page: storesPage,
            limit: storesLimit,
            search: searchQuery,
            sortBy: storesSortBy,
            sortOrder: storesSortOrder
          });
          if (updatedResponse.success) {
            setStores(updatedResponse.data || []);
            setStoresTotal(updatedResponse.pagination.total);
          }
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update store status');
    } finally {
      setIsSuspendingStore(false);
    }
  };


  const stats = [
    {
      label: 'Monthly Revenue',
      value: isLoadingStats ? '...' : `₹${(adminStats?.monthlyRevenue || 0).toLocaleString()}`,
      change: '+23%',
      trend: 'up',
      icon: DollarSign
    },
    {
      label: 'Active Stores',
      value: `${effectiveStores.length}`,
      change: '+15%',
      trend: 'up',
      icon: Store
    },
    {
      label: 'Base Products',
      value: isLoadingProductsCount ? '...' : (productsCount > 0 ? productsCount.toString() : totalProducts.toString()),
      change: '+8%',
      trend: 'up',
      icon: Package
    },
    {
      label: 'Orders Delivered',
      value: isLoadingStats ? '...' : (adminStats?.deliveredOrders || 0).toString(),
      change: '+12%',
      trend: 'up',
      icon: Truck
    },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 12400, orders: 89 },
    { month: 'Feb', revenue: 15800, orders: 112 },
    { month: 'Mar', revenue: 19200, orders: 145 },
    { month: 'Apr', revenue: 22100, orders: 167 },
    { month: 'May', revenue: 28400, orders: 198 },
    { month: 'Jun', revenue: 32600, orders: 234 },
  ];

  const regionData = [
    { name: 'North America', value: 45, color: 'hsl(var(--primary))' },
    { name: 'Europe', value: 30, color: 'hsl(var(--accent-foreground))' },
    { name: 'Asia', value: 18, color: 'hsl(159 58% 60%)' },
    { name: 'Others', value: 7, color: 'hsl(var(--muted-foreground))' },
  ];

  const topProducts = adminStats?.topProducts?.map(p => ({
    id: p._id,
    name: p.storeName || p.name || 'Unknown',
    sales: p.salesCount || 0,
    revenue: p.revenue || 0,
    imageUrl: p.imageUrl || p.mockupUrl || '', // Support both imageUrl and mockupUrl
    userId: p.userId || p.storeId || '' // Support both userId and storeId
  })) || [];

  const fulfillmentPartners = [
    { id: 2, name: 'EuroFulfill', status: 'active', performance: 95, avgTime: '3.1 days', orders: 892 },
    { id: 3, name: 'AsiaPress', status: 'warning', performance: 87, avgTime: '4.2 days', orders: 567 },
    { id: 4, name: 'QuickShip Global', status: 'active', performance: 96, avgTime: '2.8 days', orders: 1034 },
  ];

  const supportTickets = [
    { id: 'TKT-001', user: 'john@example.com', subject: 'Payment issue', priority: 'high', status: 'open' },
    { id: 'TKT-002', user: 'jane@example.com', subject: 'Product quality question', priority: 'medium', status: 'in-progress' },
    { id: 'TKT-003', user: 'mike@example.com', subject: 'Shipping delay', priority: 'high', status: 'open' },
    { id: 'TKT-004', user: 'sara@example.com', subject: 'Account access', priority: 'low', status: 'resolved' },
  ];

  const alerts = [
    { id: 1, type: 'warning', message: 'High order volume in North America region', time: '2h ago' },
    { id: 2, type: 'error', message: 'Fulfillment delay from AsiaPress partner', time: '5h ago' },
    { id: 3, type: 'info', message: '3 new stores pending approval', time: '1d ago' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b bg-card z-50 px-6">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="ShelfMerch" className="h-8 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/products">Catalog</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#pricing">Pricing</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#support">Support</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#help">Help Center</a>
              </Button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {alerts.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>System Alerts</DialogTitle>
                  <DialogDescription>Recent platform notifications</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex gap-3 p-3 rounded-lg border">
                      {alert.type === 'error' && <AlertTriangle className="h-5 w-5 text-destructive" />}
                      {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                      {alert.type === 'info' && <Bell className="h-5 w-5 text-primary" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="Open user menu">
                  <Avatar className="h-10 w-10 rounded-full bg-primary text-primary-foreground">
                    <AvatarFallback className="rounded-full bg-primary text-primary-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 border-r bg-card p-6 overflow-y-auto">
        <div className="mb-6 p-3 bg-primary/10 rounded-lg">
          <p className="text-xs font-semibold text-primary">SUPER ADMIN</p>
        </div>

        <nav className="space-y-6">
          {/* Core */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Core
            </p>
            <Button
              variant={activeTab === 'overview' ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start",
                activeTab === 'overview' && "bg-secondary font-semibold"
              )}
              onClick={() => setActiveTab('overview')}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'products' ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start relative",
                activeTab === 'products' && "bg-secondary font-semibold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary before:rounded-r"
              )}
              onClick={() => setActiveTab('products')}
            >
              <Package className="mr-2 h-4 w-4" />
              Product Catalog
            </Button>
            <Button
              variant={activeTab === 'orders' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeTab === 'orders' && "bg-secondary font-semibold")}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Direct Orders
            </Button>
          </div>

          {/* Platform - Shopify Orders only */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Platform
            </p>
            <Button
              variant={activeTab === 'shopify-orders' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeTab === 'shopify-orders' && "bg-secondary font-semibold")}
              onClick={() => setActiveTab('shopify-orders')}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Shopify Orders
            </Button>
          </div>

          {/* Finance */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Finance
            </p>
            <Button
              variant={activeTab === 'wallets' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeTab === 'wallets' && "bg-secondary font-semibold")}
              onClick={() => setActiveTab('wallets')}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Wallets
            </Button>
            <Button
              variant={activeTab === 'invoices' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeTab === 'invoices' && "bg-secondary font-semibold")}
              onClick={() => setActiveTab('invoices')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Invoices
            </Button>
            <Button
              variant={activeTab === 'withdrawals' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeTab === 'withdrawals' && "bg-secondary font-semibold")}
              onClick={() => setActiveTab('withdrawals')}
            >
              <Banknote className="mr-2 h-4 w-4" />
              Withdrawals
            </Button>
          </div>

          {/* Platform Settings */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Platform
            </p>
            <Button
              variant={activeTab === 'stores' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeTab === 'stores' && "bg-secondary font-semibold")}
              onClick={() => setActiveTab('stores')}
            >
              <Store className="mr-2 h-4 w-4" />
              Active Stores
            </Button>
            <Button
              variant={activeTab === 'users' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeTab === 'users' && "bg-secondary font-semibold")}
              onClick={() => setActiveTab('users')}
            >
              <Users className="mr-2 h-4 w-4" />
              User Management
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeTab === 'settings' && "bg-secondary font-semibold")}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Platform Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link to="/admin/variant-options">
                <Package className="mr-2 h-4 w-4" />
                Variant Options
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link to="/admin/assets">
                <Palette className="mr-2 h-4 w-4" />
                Design Assets
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              asChild
            >
              <Link to="/admin/catalogue-fields">
                <FileText className="mr-2 h-4 w-4" />
                Catalogue Fields
              </Link>
            </Button>
            <Button
              variant={activeTab === 'audit' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeTab === 'audit' && "bg-secondary font-semibold")}
              onClick={() => setActiveTab('audit')}
            >
              <Shield className="mr-2 h-4 w-4" />
              Audit Logs
            </Button>
          </div>

          {/* Insights & Marketing */}
          <div className="space-y-1">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Insights
            </p>
            <Button
              variant={activeTab === 'analytics' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeTab === 'analytics' && "bg-secondary font-semibold")}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button
              variant={activeTab === 'marketing' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeTab === 'marketing' && "bg-secondary font-semibold")}
              onClick={() => setActiveTab('marketing')}
            >
              <Megaphone className="mr-2 h-4 w-4" />
              Marketing
            </Button>
            <Button
              variant={activeTab === 'support' ? 'secondary' : 'ghost'}
              className={cn("w-full justify-start", activeTab === 'support' && "bg-secondary font-semibold")}
              onClick={() => setActiveTab('support')}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Support
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 mt-16 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Platform Overview</h1>
                  <p className="text-muted-foreground mt-1">
                    Monitor your print-on-demand business at a glance
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className="h-8 w-8 text-primary" />
                        <div className="flex items-center gap-1">
                          {stat.trend === 'up' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-destructive" />
                          )}
                          <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-destructive'}`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Monthly revenue and order volume</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sales by Region</CardTitle>
                    <CardDescription>Global distribution of orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={regionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="hsl(var(--primary))"
                          dataKey="value"
                        >
                          {regionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Top Products */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Top Performing Products</CardTitle>
                  <CardDescription>Best sellers this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Store</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.imageUrl && (
                                <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded object-cover" />
                              )}
                              <span className="font-medium">{product.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{product.sales} units</TableCell>
                          <TableCell>₹{product.revenue.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {product.userId
                                ? allStores.find(s => s.userId === product.userId)?.storeName || 'Unknown'
                                : 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {/* Stores Tab */}
          {activeTab === 'stores' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Active Stores</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage all merchant stores on the platform
                  </p>
                </div>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Store Data
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>All Stores ({storesTotal})</CardTitle>
                      <CardDescription>Monitor and manage merchant storefronts</CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search stores..."
                        className="pl-9 w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading && stores.length === 0 ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                  ) : (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Store ID</TableHead>
                              <TableHead>Store Name</TableHead>
                              <TableHead>Owner</TableHead>
                              <TableHead>Created At</TableHead>
                              <TableHead>Products</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Last Updated</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {stores.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                  No stores found
                                </TableCell>
                              </TableRow>
                            ) : (
                              stores.map((store) => (
                                <TableRow key={store.id}>
                                  <TableCell className="font-mono text-xs text-muted-foreground">
                                    {store.id.substring(0, 8)}...
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">{store.storeName}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {store.subdomain}.shelfmerch.com
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">{store.owner?.name || 'Unknown'}</div>
                                    <div className="text-xs text-muted-foreground">{store.owner?.email}</div>
                                  </TableCell>
                                  <TableCell>
                                    {store.createdAt ? new Date(store.createdAt).toLocaleDateString() : '-'}
                                  </TableCell>
                                  <TableCell>{store.productsCount || 0}</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={store.isActive ? "secondary" : "destructive"}
                                      className={store.isActive ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""}
                                    >
                                      {store.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {store.updatedAt ? new Date(store.updatedAt).toLocaleDateString() : '-'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex gap-2 justify-end">
                                      <Button variant="ghost" size="sm" asChild>
                                        <Link to={`/store/${store.subdomain}`}>View</Link>
                                      </Button>
                                      <AlertDialog open={suspendingStoreId === store.id} onOpenChange={(open) => {
                                        if (open) {
                                          setSuspendingStoreId(store.id);
                                        } else {
                                          setSuspendingStoreId(null);
                                        }
                                      }}>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <Ban className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>{store.isActive ? 'Suspend Store?' : 'Reactivate Store?'}</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              {store.isActive
                                                ? 'This will temporarily disable the store and prevent new orders.'
                                                : 'This will reactivate the store and allow new orders.'
                                              }
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleSuspendStore} disabled={isSuspendingStore}>
                                              {isSuspendingStore ? 'Processing...' : (store.isActive ? 'Suspend' : 'Reactivate')}
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {storesTotal > storesLimit && (
                        <div className="mt-4">
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() => setStoresPage(p => Math.max(1, p - 1))}
                                  className={storesPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                              </PaginationItem>

                              {Array.from({ length: Math.min(5, Math.ceil(storesTotal / storesLimit)) }, (_, i) => {
                                const totalPages = Math.ceil(storesTotal / storesLimit);
                                let startPage = Math.max(1, storesPage - 2);
                                if (startPage + 4 > totalPages) {
                                  startPage = Math.max(1, totalPages - 4);
                                }
                                const p = startPage + i;
                                if (p > totalPages) return null;

                                return (
                                  <PaginationItem key={p}>
                                    <PaginationLink
                                      isActive={storesPage === p}
                                      onClick={() => setStoresPage(p)}
                                      className="cursor-pointer"
                                    >
                                      {p}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              })}

                              <PaginationItem>
                                <PaginationNext
                                  onClick={() => setStoresPage(p => Math.min(Math.ceil(storesTotal / storesLimit), p + 1))}
                                  className={storesPage >= Math.ceil(storesTotal / storesLimit) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">User Management</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage creators, partners, and platform users
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold mt-1">
                          {isLoadingUsers ? '...' : totalUsers}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Stores</p>
                        <p className="text-2xl font-bold mt-1">{effectiveStores.length}</p>
                      </div>
                      <Store className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Approval</p>
                        <p className="text-2xl font-bold mt-1">3</p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>View and manage platform members</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Stores</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingUsersData ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <div className="flex items-center justify-center gap-2">
                              <Clock className="h-4 w-4 animate-spin" />
                              <span className="text-sm text-muted-foreground">Loading users...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : usersData.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <span className="text-sm text-muted-foreground">No users found</span>
                          </TableCell>
                        </TableRow>
                      ) : (
                        usersData.map((userData) => (
                          <TableRow key={userData.userId}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{userData.userName}</p>
                                <p className="text-sm text-muted-foreground">{userData.userEmail}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {userData.stores.length} {userData.stores.length === 1 ? 'store' : 'stores'}
                            </TableCell>
                            <TableCell>
                              {isLoadingUsersData ? (
                                <span className="text-sm text-muted-foreground">Loading...</span>
                              ) : (
                                <span className="font-medium">₹{userData.revenueRupees}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={userData.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}
                              >
                                {userData.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingUserId(userData.userId);
                                    toast.info('Edit user functionality - Open user details modal or navigate to edit page');
                                    // TODO: Implement edit user modal or navigation
                                  }}
                                  disabled={editingUserId === userData.userId}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive"
                                      disabled={disablingUserId === userData.userId}
                                    >
                                      <Ban className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Disable User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to disable {userData.userName}? This will prevent them from accessing their account.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={async () => {
                                          setDisablingUserId(userData.userId);
                                          try {
                                            // TODO: Call backend API to disable user
                                            // For now, just show a toast
                                            toast.info('Disable user functionality - Call backend API to update user status');
                                            // After successful API call, refresh users data
                                            // await fetchUsersData();
                                          } catch (error: any) {
                                            toast.error(error.message || 'Failed to disable user');
                                          } finally {
                                            setDisablingUserId(null);
                                          }
                                        }}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Disable
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <>
              {/* Page Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold">Product Catalog</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage platform-wide base products for merchants
                  </p>
                </div>
                <Button asChild className="gap-2">
                  <Link to="/admin/products/new">
                    <Plus className="h-4 w-4" />
                    Add Base Product
                  </Link>
                </Button>
              </div>

              {/* Error Banner */}
              {!isLoadingProducts && databaseProducts.length === 0 && productsSearchQuery && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Could not load base products. Please try again.
                  </p>
                </div>
              )}

              {/* Toolbar */}
              <CatalogToolbar
                searchQuery={productsSearchQuery}
                onSearchChange={(value) => {
                  setProductsSearchQuery(value);
                  setProductsPage(1);
                }}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalCount={productsTotal}
                activeCount={databaseProducts.filter(p => p.isActive).length}
                draftCount={0} // TODO: Add draft status to products
                archivedCount={databaseProducts.filter(p => !p.isActive).length}
              />

              {/* Products Table */}
              <div className="mt-4">
                <BaseProductsTable
                  products={filteredAndSortedProducts}
                  isLoading={isLoadingProducts}
                  onEdit={(id) => {
                    window.location.href = `/admin/products/${id}/edit`;
                  }}
                  onArchive={async (id) => {
                    try {
                      const response = await productApi.delete(id);
                      if (response && response.success) {
                        toast.success('Product archived successfully');
                      } else {
                        toast.error('Failed to archive product');
                      }
                      // Refresh products list
                      await fetchProducts();
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to archive product');
                    }
                  }}
                  onDelete={async (id) => {
                    try {
                      const response = await productApi.delete(id);
                      if (response && response.success) {
                        toast.success('Product deleted successfully');
                      } else {
                        toast.error('Failed to delete product');
                      }
                      // Refresh products list
                      await fetchProducts();
                    } catch (error: any) {
                      toast.error(error.message || 'Failed to delete product');
                    }
                  }}
                />
              </div>

              {/* Pagination */}
              {productsTotal > 20 && !isLoadingProducts && databaseProducts.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {((productsPage - 1) * 20) + 1} to {Math.min(productsPage * 20, productsTotal)} of {productsTotal} products
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProductsPage(p => Math.max(1, p - 1))}
                      disabled={productsPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProductsPage(p => p + 1)}
                      disabled={productsPage * 20 >= productsTotal}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}



          {/* Shopify Orders Tab */}
          {activeTab === 'shopify-orders' && <ShopifyOrdersTab />}


          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Order Management</h1>
                  <p className="text-muted-foreground mt-1">
                    Monitor all platform orders and fulfillment
                  </p>
                </div>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Orders
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold mt-1">{platformOrders.filter(o => o.status === 'on-hold').length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">In Production</p>
                    <p className="text-2xl font-bold mt-1">{platformOrders.filter(o => o.status === 'in-production').length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Shipped</p>
                    <p className="text-2xl font-bold mt-1">{platformOrders.filter(o => o.status === 'shipped').length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Delivered</p>
                    <p className="text-2xl font-bold mt-1">{platformOrders.filter(o => o.status === 'delivered').length}</p>
                  </CardContent>
                </Card>
              </div>
              {/* Search and Filters */}
              <div className="mb-6 space-y-4">
                {/* Search Bar */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-10"
                    value={ordersSearchQuery}
                    onChange={(e) => setOrdersSearchQuery(e.target.value)}
                  />
                </div>
                {/* Filters Row */}
                <div className="flex flex-wrap gap-3 items-center">
                  {/* Status Filter */}
                  <Select value={ordersStatusFilter} onValueChange={setOrdersStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="on-hold">On-hold</SelectItem>
                      <SelectItem value="in-production">In Production</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Amount Sort */}
                  <Select value={ordersAmountSort} onValueChange={setOrdersAmountSort}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort by Amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="low-high">Low → High</SelectItem>
                      <SelectItem value="high-low">High → Low</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Alphabetical Sort */}
                  <Select value={ordersAlphabeticalSort} onValueChange={setOrdersAlphabeticalSort}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort Alphabetically" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="store-az">Store (A → Z)</SelectItem>
                      <SelectItem value="store-za">Store (Z → A)</SelectItem>
                      <SelectItem value="email-az">Email (A → Z)</SelectItem>
                      <SelectItem value="email-za">Email (Z → A)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Orders</CardTitle>
                      <CardDescription>Latest platform-wide orders</CardDescription>
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Export Orders
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {ordersError && (
                    <p className="mb-4 text-sm text-destructive">{ordersError}</p>
                  )}
                  {isLoadingOrders ? (
                    <p className="text-sm text-muted-foreground">Loading orders...</p>
                  ) : filteredOrders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No orders found.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Store</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order: any) => {
                          const orderId = (order.id || order._id || '').toString();
                          const storeName = order.storeId && typeof order.storeId === 'object'
                            ? order.storeId.name
                            : 'Direct';

                          const currentStatus = order.status as Order['status'];

                          const getStatusBadgeClass = (status: Order['status']) => {
                            switch (status) {
                              case 'delivered':
                                return 'bg-green-500/10 text-green-500';
                              case 'shipped':
                                return 'bg-blue-500/10 text-blue-500';
                              case 'in-production':
                                return 'bg-yellow-500/10 text-yellow-500';
                              case 'refunded':
                                return 'bg-purple-500/10 text-purple-500';
                              case 'cancelled':
                                return 'bg-red-500/10 text-red-500';
                              case 'on-hold':
                              default:
                                return 'bg-muted text-muted-foreground';
                            }
                          };

                          return (
                            <TableRow key={orderId || Math.random()}>
                              <TableCell className="font-medium">{orderId ? orderId.slice(0, 8) : '-'}</TableCell>
                              <TableCell>{order.customerEmail}</TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {storeName || 'Direct'}
                                </Badge>
                              </TableCell>
                              <TableCell>{order.items?.length ?? 0}</TableCell>
                              <TableCell>₹{order.total?.toFixed(2) ?? '0.00'}</TableCell>
                              <TableCell>
                                <Select
                                  value={currentStatus}
                                  onValueChange={async (value) => {
                                    try {
                                      // Normalize status: 'canceled' -> 'cancelled'
                                      const normalizedStatus = value === 'canceled' ? 'cancelled' : value;
                                      const newStatus = normalizedStatus as 'on-hold' | 'in-production' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
                                      await storeOrdersApi.updateStatus(orderId, newStatus);
                                      setPlatformOrders((prev) =>
                                        prev.map((o) => {
                                          const oId = (o as any)._id || (o as any).id;
                                          const targetId = (order as any)._id || (order as any).id;
                                          return oId === targetId
                                            ? { ...o, status: newStatus }
                                            : o;
                                        })
                                      );
                                    } catch (error) {
                                      console.error('Failed to update order status:', error);
                                      toast.error('Failed to update order status');
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-32 h-8 text-xs">
                                    <SelectValue>
                                      <Badge
                                        variant="secondary"
                                        className={getStatusBadgeClass(currentStatus)}
                                      >
                                        {currentStatus}
                                      </Badge>
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {statusOptions.map((opt) => (
                                      <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/admin/orders/${orderId}`}>
                                    <ChevronRight className="h-4 w-4" />
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Import Orders Tab (removed from UI) */}
          {false && activeTab === 'import-orders' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Imported Orders</h1>
                  <p className="text-muted-foreground mt-1">
                    Normalized Shopify orders ready for mapping and production.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Quick Import
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import Shopify Order</DialogTitle>
                        <DialogDescription>
                          Enter the shop domain and Shopify Order ID to manually import into the pipeline.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Shop Domain</Label>
                          <Input id="import-shop" placeholder="example.myshopify.com" />
                        </div>
                        <div className="space-y-2">
                          <Label>Order ID</Label>
                          <Input id="import-order-id" placeholder="1234567890" />
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => {
                            const shop = (document.getElementById('import-shop') as HTMLInputElement).value;
                            const orderId = (document.getElementById('import-order-id') as HTMLInputElement).value;
                            if (shop && orderId) handleImportOrder(shop, orderId);
                          }}
                        >
                          Import Order
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-end mb-6">
                <div className="w-full sm:w-48">
                  <Label>Shop Filter</Label>
                  <Input
                    placeholder="Filter by shop..."
                    value={importOrdersShopFilter}
                    onChange={(e) => {
                      setImportOrdersPage(1);
                      setImportOrdersShopFilter(e.target.value);
                    }}
                  />
                </div>
                <div className="w-full sm:w-40">
                  <Label>Status</Label>
                  <Select
                    value={importOrdersStatusFilter || 'all'}
                    onValueChange={(val) => {
                      setImportOrdersPage(1);
                      setImportOrdersStatusFilter(val === 'all' ? '' : val);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="imported">Imported</SelectItem>
                      <SelectItem value="needs_mapping">Needs Mapping</SelectItem>
                      <SelectItem value="ready_for_job">Ready for Job</SelectItem>
                      <SelectItem value="job_created">Job Created</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:flex-1">
                  <Label>Search Orders</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search order ID or customer..."
                      value={importOrdersSearch}
                      onChange={(e) => {
                        setImportOrdersPage(1);
                        setImportOrdersSearch(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-center">Items</TableHead>
                        <TableHead>Shop</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>ImportedAt</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingImportOrders ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                              <span className="text-sm text-muted-foreground">Loading imported orders...</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : importOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No imported orders found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        importOrders.map((order) => (
                          <TableRow
                            key={order._id}
                            className="cursor-pointer hover:bg-muted/40"
                            onClick={() => {
                              setSelectedImportOrder(order);
                              setIsImportOrderDialogOpen(true);
                            }}
                          >
                            <TableCell className="font-medium">
                              {order.shopifyOrderName || order.shopifyOrderId}
                              <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]">
                                {order.shopifyOrderId}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">{order.customer?.name || '—'}</div>
                              <div className="text-xs text-muted-foreground">{order.customer?.email || '—'}</div>
                            </TableCell>
                            <TableCell className="text-center">{order.items?.length || 0}</TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">
                              {order.shop}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  order.status === 'ready_for_job' ? 'default' :
                                    order.status === 'job_created' ? 'secondary' : 'outline'
                                }
                                className={cn(
                                  order.status === 'needs_mapping' && "text-yellow-600 border-yellow-200 bg-yellow-50"
                                )}
                              >
                                {order.status === 'needs_mapping' ? 'Needs Mapping' :
                                  order.status === 'ready_for_job' ? 'Ready' :
                                    order.status === 'job_created' ? 'Fulfilled' : order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(order.importedAt).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {order.totalPrice} {order.currency}
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant={order.status === 'ready_for_job' ? 'default' : 'outline'}
                                disabled={order.status !== 'ready_for_job'}
                                onClick={() => handleCreateProductionJob(order._id)}
                              >
                                {order.status === 'job_created' ? 'Job Created' : 'Create Job'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Pagination */}
              {importOrdersTotal > 25 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Total {importOrdersTotal} orders
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setImportOrdersPage((p) => Math.max(1, p - 1))}
                      disabled={importOrdersPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">Page {importOrdersPage}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setImportOrdersPage((p) => p + 1)}
                      disabled={importOrders.length < 25}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* Order Detail View */}
              <Dialog open={isImportOrderDialogOpen} onOpenChange={setIsImportOrderDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Imported Order Details</DialogTitle>
                    <DialogDescription>
                      Review items and mapping status for {selectedImportOrder?.shopifyOrderName || selectedImportOrder?.shopifyOrderId}
                    </DialogDescription>
                  </DialogHeader>

                  {selectedImportOrder && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm">Customer & Shipping</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1">
                            <p className="font-medium">{selectedImportOrder.customer?.name}</p>
                            <p className="text-muted-foreground">{selectedImportOrder.customer?.email}</p>
                            <p className="text-muted-foreground">{selectedImportOrder.customer?.phone}</p>
                            <div className="mt-3 pt-3 border-t">
                              <p className="font-medium">Shipping Address</p>
                              <p>{selectedImportOrder.shippingAddress?.address1}</p>
                              {selectedImportOrder.shippingAddress?.address2 && <p>{selectedImportOrder.shippingAddress?.address2}</p>}
                              <p>{selectedImportOrder.shippingAddress?.city}, {selectedImportOrder.shippingAddress?.province} {selectedImportOrder.shippingAddress?.zip}</p>
                              <p>{selectedImportOrder.shippingAddress?.country}</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm">Order Info</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shop:</span>
                              <span className="font-mono text-xs">{selectedImportOrder.shop}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Price:</span>
                              <span className="font-bold">{selectedImportOrder.totalPrice} {selectedImportOrder.currency}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                              <span className="text-muted-foreground">Status:</span>
                              <Badge variant="outline">{selectedImportOrder.status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold flex items-center gap-2">
                          Line Items
                          <Badge variant="secondary">{selectedImportOrder.items?.length || 0}</Badge>
                        </h3>
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead>Mapping</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedImportOrder.items?.map((item: any, idx: number) => (
                                <TableRow key={idx}>
                                  <TableCell>
                                    <div className="font-medium text-sm">{item.title}</div>
                                    <div className="text-xs text-muted-foreground">{item.variantTitle}</div>
                                  </TableCell>
                                  <TableCell className="text-xs font-mono">{item.sku}</TableCell>
                                  <TableCell className="text-center">{item.quantity}</TableCell>
                                  <TableCell>
                                    {item.mapped ? (
                                      <div className="flex flex-col gap-1">
                                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 w-fit">Mapped</Badge>
                                        <div className="flex gap-1">
                                          {item.printAssets?.frontUrl && <Badge variant="outline" className="text-[10px] py-0">Front</Badge>}
                                          {item.printAssets?.backUrl && <Badge variant="outline" className="text-[10px] py-0">Back</Badge>}
                                        </div>
                                      </div>
                                    ) : (
                                      <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">Unmapped</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 pointer-events-auto"
                                      onClick={() => {
                                        console.log('[MapItem] clicked', {
                                          importedOrderId: selectedImportOrder?._id,
                                          item,
                                        });
                                        setSelectedMapping({
                                          importedOrderId: selectedImportOrder._id,
                                          shop: selectedImportOrder.shop,
                                          shopifyOrderId: selectedImportOrder.shopifyOrderId,
                                          shopifyProductId: item.shopifyProductId,
                                          shopifyVariantId: item.shopifyVariantId,
                                          merchantId: selectedImportOrder.merchantId,
                                          sku: item.sku,
                                          title: item.title,
                                          variantTitle: item.variantTitle,
                                          printAssets: item.printAssets || {
                                            frontUrl: '',
                                            backUrl: '',
                                            labelUrl: '',
                                          },
                                          mockupUrls: item.mockupUrls || [],
                                        });
                                        setIsMappingDialogOpen(true);
                                      }}
                                    >
                                      {item.mapped ? 'Edit Mapping' : 'Map Item'}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {selectedImportOrder.status === 'ready_for_job' && (
                        <div className="flex justify-end pt-4">
                          <Button
                            className="gap-2 px-8 py-6 text-lg"
                            onClick={() => {
                              handleCreateProductionJob(selectedImportOrder._id);
                              setIsImportOrderDialogOpen(false);
                            }}
                          >
                            <Activity className="h-5 w-5" />
                            Create Production Job
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* Product Mappings Tab (removed from UI) */}
          {false && activeTab === 'product-mappings' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Product Mappings</h1>
                  <p className="text-muted-foreground mt-1">
                    Map Shopify variants to print assets and mockups for automated fulfillment.
                  </p>
                </div>
                <Button
                  className="gap-2"
                  onClick={() => {
                    setSelectedMapping(null);
                    setIsMappingDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  New Mapping
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Unmapped Items from Imported Orders */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Unmapped Variants</CardTitle>
                        <CardDescription>Variants found in imported orders that need mapping</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={fetchUnmappedItems} disabled={isLoadingUnmappedItems}>
                        <ArrowRightLeft className={cn("h-4 w-4 mr-2", isLoadingUnmappedItems && "animate-spin")} />
                        Refresh
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product / Variant</TableHead>
                            <TableHead>Shop</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingUnmappedItems ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-10">
                                Loading unmapped variants...
                              </TableCell>
                            </TableRow>
                          ) : unmappedItems.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                All variants in imported orders are mapped. Great job!
                              </TableCell>
                            </TableRow>
                          ) : (
                            unmappedItems.map((item: any) => (
                              <TableRow key={`${item.shop}_${item.shopifyVariantId}`}>
                                <TableCell>
                                  <div className="font-medium text-sm">{item.title}</div>
                                  <div className="text-xs text-muted-foreground">{item.variantTitle}</div>
                                </TableCell>
                                <TableCell className="text-xs font-mono">{item.shop}</TableCell>
                                <TableCell className="text-xs">{item.sku || '—'}</TableCell>
                                <TableCell className="text-right">
                                  <Button size="sm" onClick={() => {
                                    setSelectedMapping({
                                      shop: item.shop,
                                      shopifyProductId: item.shopifyProductId,
                                      shopifyVariantId: item.shopifyVariantId,
                                      title: item.title,
                                      variantTitle: item.variantTitle,
                                      sku: item.sku,
                                      printAssets: [],
                                      mockupUrls: [],
                                      active: true
                                    });
                                    setIsMappingDialogOpen(true);
                                  }}>
                                    Map Variant
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Existing Mappings</CardTitle>
                      <CardDescription>Manage active product mappings</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Shopify Variant</TableHead>
                            <TableHead>Shop</TableHead>
                            <TableHead className="text-center">Assets</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {isLoadingProductMappings ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-10">
                                Loading mappings...
                              </TableCell>
                            </TableRow>
                          ) : productMappings.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                No mappings found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            productMappings.map((mapping: any) => (
                              <TableRow key={mapping._id}>
                                <TableCell>
                                  <div className="font-medium text-sm">{mapping.title || mapping.shopifyVariantId}</div>
                                  {mapping.sku && <div className="text-[10px] text-muted-foreground">SKU: {mapping.sku}</div>}
                                </TableCell>
                                <TableCell className="text-xs font-mono">{mapping.shop}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex justify-center gap-1">
                                    {mapping.printAssets?.frontUrl && <Badge variant="outline" className="text-[10px]">Front</Badge>}
                                    {mapping.printAssets?.backUrl && <Badge variant="outline" className="text-[10px]">Back</Badge>}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <Button size="sm" variant="ghost" onClick={() => {
                                      setSelectedMapping(mapping);
                                      setIsMappingDialogOpen(true);
                                    }}>
                                      Edit
                                    </Button>
                                    <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => {
                                      if (confirm('Delete this mapping?')) {
                                        await adminProductMappingApi.delete(mapping._id);
                                        toast.success('Mapping deleted');
                                        // refresh
                                        const listResp = await adminProductMappingApi.list({ page: productMappingsPage, limit: 25 });
                                        if (listResp.success) {
                                          setProductMappings(listResp.data);
                                          setProductMappingsTotal(listResp.pagination.total);
                                        }
                                      }
                                    }}>
                                      Delete
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Filters & Info */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Shop</Label>
                        <Input
                          placeholder="Filter by shop"
                          value={productMappingsShopFilter}
                          onChange={e => setProductMappingsShopFilter(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Search</Label>
                        <Input
                          placeholder="Search title or variant ID"
                          value={productMappingsSearch}
                          onChange={e => setProductMappingsSearch(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-sm">Mapping Guide</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2 text-muted-foreground">
                      <p>1. Import an order from <strong>Shopify Orders</strong>.</p>
                      <p>2. Unmapped variants will appear in the list on the left.</p>
                      <p>3. Click <strong>Map Variant</strong> to upload print assets.</p>
                      <p>4. New mappings are automatically applied to all pending orders.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {/* Mapping Dialog (global, shared for Import Orders + Product Mappings) */}
          <Dialog
            open={isMappingDialogOpen}
            onOpenChange={(open) => {
              console.log('[MappingDialog] onOpenChange', open);
              setIsMappingDialogOpen(open);
            }}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[9999]">
              <DialogHeader>
                <DialogTitle>{selectedMapping?._id ? 'Edit Mapping' : 'Create New Mapping'}</DialogTitle>
                <DialogDescription>
                  Assign print assets and mockups to this variant.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shop</Label>
                    <Input disabled value={selectedMapping?.shop || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label>Variant ID</Label>
                    <Input disabled value={selectedMapping?.shopifyVariantId || ''} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 px-4 py-3 border rounded-lg bg-muted/30">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Print Assets (S3/Public URLs)
                    </Label>
                    <div className="space-y-3 mt-2">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Front URL</Label>
                        <Input
                          className="h-8 text-xs"
                          defaultValue={selectedMapping?.printAssets?.frontUrl}
                          id="mapping-front"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Back URL</Label>
                        <Input
                          className="h-8 text-xs"
                          defaultValue={selectedMapping?.printAssets?.backUrl}
                          id="mapping-back"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Label URL</Label>
                        <Input
                          className="h-8 text-xs"
                          defaultValue={selectedMapping?.printAssets?.labelUrl}
                          id="mapping-label"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 px-4 py-3 border rounded-lg bg-muted/30">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Mockup URLs (Comma separated)
                    </Label>
                    <Textarea
                      className="mt-2 min-h-[120px] text-xs"
                      placeholder="https://...jpg, https://...png"
                      defaultValue={selectedMapping?.mockupUrls?.join(', ')}
                      id="mapping-mockups"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsMappingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="px-8"
                  onClick={async () => {
                    try {
                      const payload = {
                        shop: selectedMapping?.shop,
                        shopifyProductId: selectedMapping?.shopifyProductId,
                        shopifyVariantId: selectedMapping?.shopifyVariantId,
                        title: selectedMapping?.title,
                        variantTitle: selectedMapping?.variantTitle,
                        sku: selectedMapping?.sku,
                        printAssets: {
                          frontUrl: (document.getElementById('mapping-front') as HTMLInputElement).value,
                          backUrl: (document.getElementById('mapping-back') as HTMLInputElement).value,
                          labelUrl: (document.getElementById('mapping-label') as HTMLInputElement).value,
                        },
                        mockupUrls: (document.getElementById('mapping-mockups') as HTMLTextAreaElement)
                          .value.split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      };
                      await adminProductMappingApi.upsert(payload as any);
                      toast.success('Mapping saved successfully');
                      setIsMappingDialogOpen(false);
                      // Refresh lists
                      const listResp = await adminProductMappingApi.list({
                        page: productMappingsPage,
                        limit: 25,
                      });
                      if (listResp.success) {
                        setProductMappings(listResp.data);
                        setProductMappingsTotal(listResp.pagination.total);
                      }
                      fetchUnmappedItems();
                      // If we came from an order, refresh that order
                      if (selectedImportOrder) {
                        const orderResp = await adminImportOrdersApi.getById(selectedImportOrder._id);
                        if (orderResp.success) setSelectedImportOrder(orderResp.data);
                      }
                    } catch (err: any) {
                      toast.error(err.message || 'Failed to save mapping');
                    }
                  }}
                >
                  Save Mapping
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Production Jobs Tab (removed from UI) */}
          {false && activeTab === 'production-jobs' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Production Jobs</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage and track manufacturing packets.
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-end mb-6">
                <div className="w-full sm:w-48">
                  <Label>Shop Filter</Label>
                  <Input
                    placeholder="Filter by shop..."
                    value={productionJobsShopFilter}
                    onChange={(e) => {
                      setProductionJobsPage(1);
                      setProductionJobsShopFilter(e.target.value);
                    }}
                  />
                </div>
                <div className="w-full sm:w-40">
                  <Label>Status</Label>
                  <Select
                    value={productionJobsStatusFilter || 'all'}
                    onValueChange={(val) => {
                      setProductionJobsPage(1);
                      setProductionJobsStatusFilter(val === 'all' ? '' : val);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Status</SelectItem>
                      <SelectItem value="queued">Queued</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:flex-1">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search ID or Customer..."
                      value={productionJobsSearch}
                      onChange={(e) => {
                        setProductionJobsPage(1);
                        setProductionJobsSearch(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>

              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-center">Items</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Shipping</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingProductionJobs ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Loading jobs...
                          </TableCell>
                        </TableRow>
                      ) : productionJobs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No production jobs found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        productionJobs.map((job) => (
                          <TableRow
                            key={job._id}
                            className="cursor-pointer hover:bg-muted/40"
                            onClick={() => {
                              setSelectedProductionJob(job);
                              setIsProductionJobDialogOpen(true);
                            }}
                          >
                            <TableCell className="font-mono text-xs">{job._id.slice(-8).toUpperCase()}</TableCell>
                            <TableCell>
                              <div className="text-sm font-medium">{job.customer?.name}</div>
                              <div className="text-xs text-muted-foreground">{job.customer?.email}</div>
                            </TableCell>
                            <TableCell className="text-center">{job.items?.length || 0}</TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  job.status === 'queued' && "bg-slate-500/10 text-slate-600",
                                  job.status === 'manufacturing' && "bg-orange-500/10 text-orange-600",
                                  job.status === 'shipped' && "bg-green-500/10 text-green-600"
                                )}
                              >
                                {job.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {job.shipping?.trackingNumber ? (
                                <div className="text-primary font-medium">{job.shipping.trackingNumber}</div>
                              ) : (
                                <span className="text-muted-foreground">No tracking</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <Select
                                value={job.status}
                                onValueChange={(val) => handleUpdateJobStatus(job._id, val)}
                                disabled={isUpdatingStatus === job._id}
                              >
                                <SelectTrigger className="w-32 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="queued">Queued</SelectItem>
                                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                  <SelectItem value="shipped">Shipped</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Job Detail Dialog */}
              <Dialog open={isProductionJobDialogOpen} onOpenChange={setIsProductionJobDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Production Job Detail</DialogTitle>
                    <DialogDescription>
                      Manufacturing packet for Order {selectedProductionJob?.shopifyOrderId}
                    </DialogDescription>
                  </DialogHeader>

                  {selectedProductionJob && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm">Shipping Destination</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm">
                            <p className="font-medium">{selectedProductionJob.customer?.name}</p>
                            <p>{selectedProductionJob.shippingAddress?.address1}</p>
                            <p>{selectedProductionJob.shippingAddress?.city}, {selectedProductionJob.shippingAddress?.province} {selectedProductionJob.shippingAddress?.zip}</p>
                            <p>{selectedProductionJob.shippingAddress?.country}</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm">Shipping Info</CardTitle>
                            <Badge>{selectedProductionJob.status}</Badge>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-muted-foreground">Carrier</Label>
                                <Input
                                  className="h-8 text-xs"
                                  placeholder="e.g. UPS"
                                  defaultValue={selectedProductionJob.shipping?.carrier}
                                  id="job-carrier"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px] uppercase text-muted-foreground">Tracking #</Label>
                                <Input
                                  className="h-8 text-xs"
                                  placeholder="1Z..."
                                  defaultValue={selectedProductionJob.shipping?.trackingNumber}
                                  id="job-tracking"
                                />
                              </div>
                            </div>
                            <Button
                              size="sm"
                              className="w-full h-8 text-xs"
                              disabled={isUpdatingShipping === selectedProductionJob._id}
                              onClick={() => {
                                const carrier = (document.getElementById('job-carrier') as HTMLInputElement).value;
                                const number = (document.getElementById('job-tracking') as HTMLInputElement).value;
                                handleUpdateShipping(selectedProductionJob._id, {
                                  carrier,
                                  trackingNumber: number,
                                  status: 'shipped'
                                });
                              }}
                            >
                              Update & Mark Shipped
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-bold">Manufacturing Items</h3>
                        <div className="border rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Print Assets</TableHead>
                                <TableHead>Mockups</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedProductionJob.items?.map((item: any, idx: number) => (
                                <TableRow key={idx}>
                                  <TableCell>
                                    <div className="font-medium text-sm">{item.title}</div>
                                    <div className="text-xs text-muted-foreground">{item.variantTitle}</div>
                                    <div className="text-[10px] font-mono mt-1">{item.sku}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      {item.printAssets?.frontUrl && (
                                        <a href={item.printAssets.frontUrl} target="_blank" className="text-[10px] text-primary hover:underline">Front Asset ↗</a>
                                      )}
                                      {item.printAssets?.backUrl && (
                                        <a href={item.printAssets.backUrl} target="_blank" className="text-[10px] text-primary hover:underline">Back Asset ↗</a>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1 overflow-x-auto max-w-[200px]">
                                      {(item.mockupUrls || []).map((m: string, i: number) => (
                                        <img key={i} src={m} className="w-10 h-10 rounded border object-cover bg-muted" />
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center font-bold">{item.quantity}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* Shopify Orders Tab */}
          {activeTab === 'shopify-orders' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Shopify Orders</h1>
                  <p className="text-muted-foreground mt-1">
                    View Shopify orders synced via webhooks.
                  </p>
                </div>
              </div>
              {/* Filters */}
              <div className="flex flex-wrap gap-3 items-end mb-6">
                <div className="w-full sm:w-48">
                  <Label htmlFor="shopify-orders-shop">Shop</Label>
                  <Input
                    id="shopify-orders-shop"
                    placeholder="tees-graphy-2.myshopify.com"
                    value={shopifyOrdersShopFilter}
                    onChange={(e) => {
                      setShopifyOrdersPage(1);
                      setShopifyOrdersShopFilter(e.target.value);
                    }}
                  />
                </div>
                <div className="w-full sm:w-40">
                  <Label>Financial Status</Label>
                  <Select
                    value={shopifyOrdersFinancialStatus || 'any'}
                    onValueChange={(val) => {
                      setShopifyOrdersPage(1);
                      setShopifyOrdersFinancialStatus(val === 'any' ? '' : val);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="voided">Voided</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-44">
                  <Label>Fulfillment Status</Label>
                  <Select
                    value={shopifyOrdersFulfillmentStatus || 'any'}
                    onValueChange={(val) => {
                      setShopifyOrdersPage(1);
                      setShopifyOrdersFulfillmentStatus(val === 'any' ? '' : val);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="fulfilled">Fulfilled</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-40">
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={shopifyOrdersDateFrom}
                    onChange={(e) => {
                      setShopifyOrdersPage(1);
                      setShopifyOrdersDateFrom(e.target.value);
                    }}
                  />
                </div>
                <div className="w-full sm:w-40">
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={shopifyOrdersDateTo}
                    onChange={(e) => {
                      setShopifyOrdersPage(1);
                      setShopifyOrdersDateTo(e.target.value);
                    }}
                  />
                </div>
                <div className="w-full sm:flex-1">
                  <Label>Search (Order ID / Email)</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      placeholder="Search by Shopify order ID or customer email"
                      value={shopifyOrdersSearch}
                      onChange={(e) => {
                        setShopifyOrdersPage(1);
                        setShopifyOrdersSearch(e.target.value);
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* Table */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Shop</TableHead>
                        <TableHead>Customer Email</TableHead>
                        <TableHead className="text-right">Items</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Financial</TableHead>
                        <TableHead>Fulfillment</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingShopifyOrders ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-6 text-sm text-muted-foreground">
                            Loading Shopify orders...
                          </TableCell>
                        </TableRow>
                      ) : shopifyOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-6 text-sm text-muted-foreground">
                            No Shopify orders found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        shopifyOrders.map((order) => (
                          <TableRow
                            key={order._id}
                            className="cursor-pointer hover:bg-muted/40"
                            onClick={() => {
                              setSelectedShopifyOrder(order);
                              setIsShopifyOrderDialogOpen(true);
                            }}
                          >
                            <TableCell>{order.shopifyOrderId}</TableCell>
                            <TableCell>{order.shop}</TableCell>
                            <TableCell>{order.customerEmail || '—'}</TableCell>
                            <TableCell className="text-right">{order.itemsCount ?? 0}</TableCell>
                            <TableCell className="text-right">
                              {order.totalPrice
                                ? `${order.totalPrice} ${order.currency || ''}`.trim()
                                : '—'}
                            </TableCell>
                            <TableCell>{order.financialStatus || '—'}</TableCell>
                            <TableCell>{order.fulfillmentStatus || '—'}</TableCell>
                            <TableCell>
                              {order.createdAtShopify
                                ? new Date(order.createdAtShopify).toLocaleString()
                                : '—'}
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!!fulfillmentCreatingFor}
                                onClick={async () => {
                                  try {
                                    setFulfillmentCreatingFor(order._id);
                                    await adminFulfillmentOrdersApi.create({
                                      shop: order.shop,
                                      shopifyOrderId: order.shopifyOrderId,
                                    });
                                    toast.success('Fulfillment job queued');
                                  } catch (err: any) {
                                    console.error('Failed to queue fulfillment job', err);
                                    toast.error(err?.message || 'Failed to queue fulfillment job');
                                  } finally {
                                    setFulfillmentCreatingFor(null);
                                  }
                                }}
                              >
                                {fulfillmentCreatingFor === order._id ? 'Queuing...' : 'Create Fulfillment Job'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              {/* Pagination */}
              {shopifyOrdersTotal > shopifyOrdersLimit && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(shopifyOrdersPage - 1) * shopifyOrdersLimit + 1}–
                    {Math.min(shopifyOrdersPage * shopifyOrdersLimit, shopifyOrdersTotal)} of{' '}
                    {shopifyOrdersTotal} orders
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShopifyOrdersPage((p) => Math.max(1, p - 1))}
                      disabled={shopifyOrdersPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {shopifyOrdersPage} of {shopifyOrdersPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setShopifyOrdersPage((p) =>
                          p < shopifyOrdersPages ? p + 1 : p
                        )
                      }
                      disabled={shopifyOrdersPage >= shopifyOrdersPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              {/* Order Detail Drawer/Modal */}
              <Dialog open={isShopifyOrderDialogOpen} onOpenChange={setIsShopifyOrderDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Shopify Order Details</DialogTitle>
                    <DialogDescription>
                      Inspect raw Shopify order payload and extracted fields.
                    </DialogDescription>
                  </DialogHeader>
                  {selectedShopifyOrder && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <p><span className="font-medium">Order ID:</span> {selectedShopifyOrder.shopifyOrderId}</p>
                        <p><span className="font-medium">Shop:</span> {selectedShopifyOrder.shop}</p>
                        <p><span className="font-medium">Customer Email:</span> {selectedShopifyOrder.customerEmail || '—'}</p>
                        <p><span className="font-medium">Items:</span> {selectedShopifyOrder.itemsCount ?? 0}</p>
                        <p>
                          <span className="font-medium">Total:</span>{' '}
                          {selectedShopifyOrder.totalPrice
                            ? `${selectedShopifyOrder.totalPrice} ${selectedShopifyOrder.currency || ''}`.trim()
                            : '—'}
                        </p>
                        <p><span className="font-medium">Financial Status:</span> {selectedShopifyOrder.financialStatus || '—'}</p>
                        <p><span className="font-medium">Fulfillment Status:</span> {selectedShopifyOrder.fulfillmentStatus || '—'}</p>
                        <p>
                          <span className="font-medium">Created At:</span>{' '}
                          {selectedShopifyOrder.createdAtShopify
                            ? new Date(selectedShopifyOrder.createdAtShopify).toLocaleString()
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium mb-2">Raw JSON</p>
                        <pre className="bg-muted rounded-md p-3 text-xs max-h-[40vh] overflow-auto">
                          {JSON.stringify(selectedShopifyOrder.raw || {}, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* Fulfillment Tab */}
          {activeTab === 'fulfillment' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Fulfillment & Logistics</h1>
                  <p className="text-muted-foreground mt-1">
                    Monitor print partners and delivery performance
                  </p>
                </div>
                <Button className="gap-2">
                  <Truck className="h-4 w-4" />
                  Add Partner
                </Button>
              </div>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Fulfillment Partners</CardTitle>
                  <CardDescription>Active print and shipping providers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Partner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead>Avg. Fulfillment</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fulfillmentPartners.map((partner) => (
                        <TableRow key={partner.id}>
                          <TableCell className="font-medium">{partner.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                partner.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                  'bg-yellow-500/10 text-yellow-500'
                              }
                            >
                              {partner.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${partner.performance >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                  style={{ width: `${partner.performance}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{partner.performance}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{partner.avgTime}</TableCell>
                          <TableCell>{partner.orders.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Support & Moderation</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage tickets, reports, and user inquiries
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Open Tickets</p>
                        <p className="text-2xl font-bold mt-1">
                          {supportTickets.filter(t => t.status === 'open').length}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">In Progress</p>
                        <p className="text-2xl font-bold mt-1">
                          {supportTickets.filter(t => t.status === 'in-progress').length}
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Resolved Today</p>
                        <p className="text-2xl font-bold mt-1">
                          {supportTickets.filter(t => t.status === 'resolved').length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                  <CardDescription>Recent customer inquiries and issues</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supportTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.id}</TableCell>
                          <TableCell>{ticket.user}</TableCell>
                          <TableCell>{ticket.subject}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                ticket.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                                  ticket.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                    'bg-muted text-muted-foreground'
                              }
                            >
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                ticket.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                                  ticket.status === 'in-progress' ? 'bg-blue-500/10 text-blue-500' :
                                    'bg-muted text-muted-foreground'
                              }
                            >
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}

          {/* Marketing Tab */}
          {activeTab === 'marketing' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Marketing & Announcements</h1>
                  <p className="text-muted-foreground mt-1">
                    Manage platform communications and campaigns
                  </p>
                </div>
              </div>

              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Send Announcement</CardTitle>
                  <CardDescription>Broadcast message to all stores or specific users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Recipients</label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="merchants">All Merchants</SelectItem>
                        <SelectItem value="active">Active Stores Only</SelectItem>
                        <SelectItem value="custom">Custom Selection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="Enter announcement subject" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="Write your announcement..."
                      rows={6}
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                    />
                  </div>
                  <Button className="w-full gap-2">
                    <Mail className="h-4 w-4" />
                    Send Announcement
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Previous Announcements</CardTitle>
                  <CardDescription>History of platform communications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: '2 days ago', subject: 'New product templates available', recipients: 'All Merchants' },
                      { date: '1 week ago', subject: 'Platform maintenance scheduled', recipients: 'All Users' },
                      { date: '2 weeks ago', subject: 'Shipping rates update', recipients: 'Active Stores' },
                    ].map((announcement, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{announcement.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            Sent to {announcement.recipients} • {announcement.date}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Platform Analytics</h1>
                  <p className="text-muted-foreground mt-1">
                    Detailed insights and performance metrics
                  </p>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export PDF
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Over Time</CardTitle>
                    <CardDescription>Monthly revenue trends</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Volume</CardTitle>
                    <CardDescription>Monthly order count</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics Summary</CardTitle>
                  <CardDescription>Platform performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                      <p className="text-2xl font-bold mt-1">
                        ₹{(totalRevenue / (platformOrders.length || 1)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fulfillment Rate</p>
                      <p className="text-2xl font-bold mt-1">96%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                      <p className="text-2xl font-bold mt-1">4.8/5.0</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Return Rate</p>
                      <p className="text-2xl font-bold mt-1">2.1%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Wallets Tab */}
          {activeTab === 'wallets' && <WalletManagement />}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && <InvoiceManagement />}

          {/* Audit Logs Tab */}
          {activeTab === 'audit' && <AuditLogs />}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Platform Settings</h1>
                  <p className="text-muted-foreground mt-1">
                    Configure global platform options
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                    <CardDescription>Manage payment methods and fees</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Platform Commission</p>
                        <p className="text-sm text-muted-foreground">Percentage taken from each sale</p>
                      </div>
                      <Input className="w-24" defaultValue="15%" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Transaction Fee</p>
                        <p className="text-sm text-muted-foreground">Fixed fee per transaction</p>
                      </div>
                      <Input className="w-24" defaultValue="₹0.30" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Configuration</CardTitle>
                    <CardDescription>Global shipping rates and regions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Domestic Shipping</p>
                        <p className="text-sm text-muted-foreground">Base rate for domestic orders</p>
                      </div>
                      <Input className="w-24" defaultValue="₹5.99" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">International Shipping</p>
                        <p className="text-sm text-muted-foreground">Base rate for international orders</p>
                      </div>
                      <Input className="w-24" defaultValue="₹12.99" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Print Partners Integration</CardTitle>
                    <CardDescription>Connect fulfillment providers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full gap-2">
                      <Globe className="h-4 w-4" />
                      Configure API Integrations
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'withdrawals' && (
            <div className="space-y-6">
              <WithdrawalsManagement />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
