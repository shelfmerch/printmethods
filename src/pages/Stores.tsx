// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
// import { getStoreUrl } from '@/utils/storeUrl';
// import { Card } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import ManageStoreDialog from '@/components/ManageStoreDialog';
// import { storeApi, storeProductsApi } from '@/lib/api';
// import type { Store as StoreType } from '@/types';
// import { toast } from 'sonner';
// import {
//   Package,
//   Store,
//   TrendingUp,
//   ShoppingBag,
//   Users,
//   Settings,
//   LogOut,
//   Plus,
//   ArrowRight,
//   ExternalLink,
//   Info,
//   Paintbrush,
//   CheckCircle2,
//   Loader2,
// } from 'lucide-react';
// import { Separator } from '@/components/ui/separator';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';

// const ChannelButton = ({ name, icon, isNew }: { name: string; icon?: React.ReactNode; isNew?: boolean }) => (
//   <Button variant="outline" className="h-14 justify-start px-4 gap-3 relative hover:border-primary/50 hover:bg-muted/50 transition-all group">
//     {icon ? icon : <div className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-bold text-muted-foreground">?</div>}
//     <span className="font-semibold text-lg">{name}</span>
//     {isNew && (
//       <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] h-4 px-1.5 bg-blue-100 text-blue-700 hover:bg-blue-100">
//         New
//       </Badge>
//     )}
//   </Button>
// );

// const Stores = () => {
//   const { user, logout, isAdmin } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const state = location.state as any; // Product data from listing editor

//   const [stores, setStores] = useState<StoreType[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [manageDialogOpen, setManageDialogOpen] = useState(false);
//   const [isCreatingInternal, setIsCreatingInternal] = useState(false);
//   const [createStoreDialogOpen, setCreateStoreDialogOpen] = useState(false);
//   const [newStoreName, setNewStoreName] = useState('');
//   const [newStoreDescription, setNewStoreDescription] = useState('');
//   const [isCreatingStore, setIsCreatingStore] = useState(false);

//   useEffect(() => {
//     const fetchStores = async () => {
//       try {
//         setLoading(true);
//         const response = await storeApi.listMyStores();
//         if (response.success) {
//           setStores(response.data || []);
//         }
//       } catch (err: any) {
//         console.error('Error fetching stores:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchStores();
//   }, []);

//   const handleLaunchPopupStore = async () => {
//     // If we have product data, we want to create the store AND publish the product
//     setIsCreatingInternal(true);
//     try {
//       // 1. Create the store
//       const storeName = `Store ${new Date().toLocaleDateString().replace(/\//g, '-')}`;
//       const createResp = await storeApi.create({
//         name: storeName,
//         description: 'My ShelfMerch Pop-Up Store',
//       });

//       if (!createResp.success || !createResp.data) {
//         throw new Error(createResp.message || 'Failed to create store');
//       }

//       const newStore = createResp.data;
//       toast.success('ShelfMerch Pop-Up store created!');

//       // 2. If coming from Listing Editor, publish the product
//       if (state && state.productId && state.variantRows) {
//         const loadingToast = toast.loading('Publishing product to your new store...');

//         try {
//           // Prepare variants payload (reused logic from ListingEditor)
//           const variantsPayload = state.variantRows
//             .filter((v: any) => v.id)
//             .map((v: any) => ({
//               catalogProductVariantId: v.id,
//               sku: v.sku,
//               sellingPrice: v.retailPrice,
//               isActive: true,
//             }));

//           const baseSellingPrice = state.baseSellingPrice ?? state.variantRows[0]?.retailPrice ?? 0;

//           const prodResp = await storeProductsApi.create({
//             storeId: newStore.id,
//             catalogProductId: state.productId,
//             sellingPrice: baseSellingPrice,
//             title: state.title,
//             description: state.description,
//             galleryImages: state.galleryImages,
//             designData: state.designData,
//             variants: variantsPayload.length > 0 ? variantsPayload : undefined,
//           });

//           toast.dismiss(loadingToast);

//           if (prodResp.success) {
//             toast.success('Product published successfully!');
//             navigate('/dashboard'); // Or to the store view
//           } else {
//             toast.error('Store created, but product publishing failed: ' + prodResp.message);
//           }
//         } catch (pubErr: any) {
//           toast.dismiss(loadingToast);
//           console.error("Publishing error", pubErr);
//           toast.error('Store created, but product publishing failed.');
//         }

//       } else {
//         // Just redirect to dashboard if no product data
//         navigate('/dashboard');
//       }

//     } catch (error: any) {
//       console.error('Error launching store:', error);
//       toast.error(error.message || 'Failed to launch store');
//     } finally {
//       setIsCreatingInternal(false);
//     }
//   };

//   const handleConnectChannel = (channel: string) => {
//     toast.info(`Integration with ${channel} is coming soon!`);
//   };

//   const handleCreateStore = async () => {
//     if (!newStoreName.trim()) {
//       toast.error('Please enter a store name');
//       return;
//     }

//     setIsCreatingStore(true);
//     try {
//       const createResp = await storeApi.create({
//         name: newStoreName.trim(),
//         description: newStoreDescription.trim() || 'My ShelfMerch Store',
//       });

//       if (!createResp.success || !createResp.data) {
//         throw new Error(createResp.message || 'Failed to create store');
//       }

//       const newStore = createResp.data;
//       toast.success('Store created successfully!');

//       // Refresh stores list
//       const response = await storeApi.listMyStores();
//       if (response.success) {
//         setStores(response.data || []);
//       }

//       // Reset form and close dialog
//       setNewStoreName('');
//       setNewStoreDescription('');
//       setCreateStoreDialogOpen(false);
//     } catch (error: any) {
//       console.error('Error creating store:', error);
//       toast.error(error.message || 'Failed to create store');
//     } finally {
//       setIsCreatingStore(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background flex">
//       {/* Sidebar */}
//       <aside className="hidden lg:block w-64 border-r bg-muted/10 p-6 space-y-8 sticky top-0 h-screen overflow-y-auto">
//         <Link to="/" className="flex items-center space-x-2">
//           <span className="font-heading text-xl font-bold text-foreground">
//             Shelf<span className="text-primary">Merch</span>
//           </span>
//         </Link>

//         <nav className="space-y-2">
//           <Button variant="ghost" className="w-full justify-start" asChild>
//             <Link to="/dashboard">
//               <Package className="mr-2 h-4 w-4" />
//               My Products
//             </Link>
//           </Button>

//           <Button variant="ghost" className="w-full justify-start" asChild>
//             <Link to="/orders">
//               <ShoppingBag className="mr-2 h-4 w-4" />
//               Orders
//             </Link>
//           </Button>

//           <Button variant="secondary" className="w-full justify-start">
//             <Store className="mr-2 h-4 w-4" />
//             My Stores
//           </Button>

//           <Button variant="ghost" className="w-full justify-start" asChild>
//             <Link to="/analytics">
//               <TrendingUp className="mr-2 h-4 w-4" />
//               Analytics
//             </Link>
//           </Button>

//           {isAdmin && (
//             <Button variant="ghost" className="w-full justify-start" asChild>
//               <Link to="/admin">
//                 <Users className="mr-2 h-4 w-4" />
//                 Admin Panel
//               </Link>
//             </Button>
//           )}

//           <Button variant="ghost" className="w-full justify-start" asChild>
//             <Link to="/settings">
//               <Settings className="mr-2 h-4 w-4" />
//               Settings
//             </Link>
//           </Button>
//         </nav>

//         <div className="pt-4 border-t">
//           <p className="text-sm text-muted-foreground mb-2 px-2">Signed in as</p>
//           <p className="text-sm font-medium px-2 truncate mb-4">{user?.email}</p>
//           <Button variant="ghost" className="w-full justify-start text-destructive" onClick={logout}>
//             <LogOut className="mr-2 h-4 w-4" /> Log out
//           </Button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-8 lg:p-12 max-w-[1600px] mx-auto overflow-y-auto">
//         <div className="max-w-6xl mx-auto space-y-12">

//           {/* My Stores List (if any) */}
//           {!loading && (
//             <div className="space-y-6">
//               <div className="flex items-center justify-between">
//                 <h2 className="text-2xl font-bold">My Stores</h2>
//                 <Button onClick={() => setCreateStoreDialogOpen(true)} className="gap-2">
//                   <Plus className="h-4 w-4" />
//                   Create New Store
//                 </Button>
//               </div>

//               {stores.length === 0 ? (
//                 <Card className="p-12 text-center">
//                   <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
//                   <h3 className="text-lg font-semibold mb-2">No stores yet</h3>
//                   <p className="text-sm text-muted-foreground mb-6">
//                     Create your first store to start selling your products
//                   </p>
//                   <Button onClick={() => setCreateStoreDialogOpen(true)} className="gap-2">
//                     <Plus className="h-4 w-4" />
//                     Create Your First Store
//                   </Button>
//                 </Card>
//               ) : (
//                 <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
//                   {stores.map((store) => (
//                   <Card key={store.id} className="p-6 flex flex-col justify-between gap-4 border-l-4 border-l-primary">
//                     <div className="flex items-start justify-between">
//                       <div>
//                         <h3 className="font-bold text-lg">{store.storeName}</h3>
//                         <p className="text-sm text-muted-foreground">{store.subdomain}.shelfmerch.com</p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         {store.useBuilder && (
//                           <Badge variant="secondary" className="text-xs flex items-center gap-1 bg-green-100 text-green-700 border-green-200">
//                             <CheckCircle2 className="w-3 h-3" />
//                             Builder
//                           </Badge>
//                         )}
//                         <Badge variant="outline" className="text-xs">Active</Badge>
//                       </div>
//                     </div>

//                     {store.builderLastPublishedAt && (
//                       <p className="text-xs text-muted-foreground">
//                         Last published: {new Date(store.builderLastPublishedAt).toLocaleDateString()}
//                       </p>
//                     )}

//                     <div className="flex flex-col gap-2 pt-2">
//                       <div className="flex items-center gap-2">
//                         <Button variant="outline" size="sm" className="flex-1" asChild>
//                           <a href={getStoreUrl(store.subdomain)} target="_blank" rel="noreferrer">
//                             <ExternalLink className="w-4 h-4 mr-2" />
//                             Visit Store
//                           </a>
//                         </Button>
//                         <Button variant="default" size="sm" className="flex-1" onClick={() => toast.info('Dashboard coming soon')}>
//                           Dashboard
//                         </Button>
//                       </div>
//                       <Button 
//                         variant="secondary" 
//                         size="sm" 
//                         className="w-full"
//                         onClick={() => navigate(`/stores/${store.id}/builder`)}
//                       >
//                         <Paintbrush className="w-4 h-4 mr-2" />
//                         Customize Storefront
//                       </Button>
//                     </div>
//                   </Card>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//           <Separator className="my-8" />

//           <div className="text-center space-y-4">
//             <h1 className="text-4xl font-bold tracking-tight">Let's connect your store!</h1>
//           </div>

//           {/* Channels Section */}
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold">Already have a sales channel? Connect your store now.</h2>
//             <p className="text-muted-foreground">Choose a sales channel below to connect your store.</p>

//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//               <div onClick={() => handleConnectChannel('Etsy')}>
//                 <ChannelButton name="Etsy" icon={<span className="text-[#F1641E] font-serif font-bold text-xl">Etsy</span>} />
//               </div>
//               <div onClick={() => handleConnectChannel('Shopify')}>
//                 <ChannelButton name="Shopify" icon={<ShoppingBag className="text-[#95BF47] fill-current" />} />
//               </div>
//               <div onClick={() => handleConnectChannel('TikTok')}>
//                 <ChannelButton name="TikTok" icon={<span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-[#25F4EE] to-[#FE2C55]">TikTok</span>} />
//               </div>
//               <div onClick={() => handleConnectChannel('Amazon')}>
//                 <ChannelButton name="Amazon" icon={<span className="font-bold text-lg">amazon</span>} />
//               </div>
//               {/* Placeholder for Printify Pop-Up equivalent */}
//               <div onClick={() => handleLaunchPopupStore()}>
//                 <ChannelButton name="ShelfMerch Pop-Up" icon={<Store className="text-primary" />} />
//               </div>
//               <div onClick={() => handleConnectChannel('eBay')}>
//                 <ChannelButton name="eBay" icon={<span className="font-bold text-xl"><span className="text-[#E53238]">e</span><span className="text-[#0064D2]">B</span><span className="text-[#F5AF02]">a</span><span className="text-[#86B817]">y</span></span>} />
//               </div>
//               <div onClick={() => handleConnectChannel('Big Cartel')}>
//                 <ChannelButton name="Big Cartel" isNew icon={<ShoppingBag />} />
//               </div>
//               <div onClick={() => handleConnectChannel('Squarespace')}>
//                 <ChannelButton name="Squarespace" icon={<span className="font-bold text-lg">Squarespace</span>} />
//               </div>
//               <div onClick={() => handleConnectChannel('Wix')}>
//                 <ChannelButton name="Wix" icon={<span className="font-bold text-xl">Wix</span>} />
//               </div>
//               <div onClick={() => handleConnectChannel('WooCommerce')}>
//                 <ChannelButton name="WooCommerce" icon={<span className="font-bold text-lg text-[#96588A]">Woo</span>} />
//               </div>
//               <div onClick={() => handleConnectChannel('BigCommerce')}>
//                 <ChannelButton name="BigCommerce" icon={<span className="font-bold text-lg">B</span>} />
//               </div>
//               <div onClick={() => handleConnectChannel('PrestaShop')}>
//                 <ChannelButton name="PrestaShop" icon={<ShoppingBag className="text-[#DD2968]" />} />
//               </div>
//               <div onClick={() => handleConnectChannel('API')}>
//                 <ChannelButton name="API" icon={<Settings />} />
//               </div>
//             </div>
//           </div>

//           {/* Help Section */}
//           <div className="space-y-6">
//             <h2 className="text-2xl font-semibold">No sales channel yet? We're here to help.</h2>
//             <p className="text-muted-foreground">Choose a sales channel that fits your business and needs.</p>

//             <div className="grid gap-6">
//               {/* ShelfMerch Pop-Up Card */}
//               <Card className="p-8 bg-muted/30 border-none shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
//                 <div className="space-y-4">
//                   <div className="flex items-center gap-3">
//                     <h3 className="text-2xl font-bold flex items-center gap-2">ShelfMerch <span className="font-normal text-muted-foreground">Pop-Up</span></h3>
//                     <Badge variant="secondary" className="bg-white/50 text-xs font-normal border">Beta version</Badge>
//                   </div>
//                   <p className="text-muted-foreground max-w-2xl">
//                     Start selling right away. No need to create a website, just send out a unique link to your friends, family, or followers.
//                     <a href="#" className="underline ml-1">Learn more</a>
//                   </p>
//                 </div>
//                 <Button size="lg" className="shrink-0 bg-[#343A40] text-white hover:bg-[#212529]" onClick={handleLaunchPopupStore} disabled={isCreatingInternal}>
//                   {isCreatingInternal ? 'Launching...' : 'Launch Pop-Up store'}
//                 </Button>
//               </Card>

//               <div className="grid md:grid-cols-2 gap-6">
//                 {/* Etsy Info Card */}
//                 <Card className="p-6 bg-orange-50/50 border-orange-100 flex flex-col justify-between space-y-6">
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <h3 className="text-xl font-bold text-[#F1641E]">Etsy <span className="text-foreground">Etsy</span></h3>
//                       <Badge className="bg-muted text-muted-foreground hover:bg-muted font-normal">Easy</Badge>
//                     </div>
//                     <p className="text-sm text-muted-foreground">
//                       Etsy provides a fast and easy way to get started selling and reach over 96 million active buyers worldwide.
//                     </p>
//                     <ul className="space-y-2">
//                       <li className="flex items-center gap-2 text-sm"><span className="text-green-600">✔</span> Easy to set up and start selling</li>
//                       <li className="flex items-center gap-2 text-sm"><span className="text-green-600">✔</span> Large audience and traffic</li>
//                       <li className="flex items-center gap-2 text-sm"><span className="text-green-600">✔</span> Low listing fees</li>
//                     </ul>
//                   </div>
//                   <div className="flex gap-3">
//                     <Button className="bg-[#222] text-white hover:bg-black" onClick={() => handleConnectChannel('Etsy')}>Connect to Etsy</Button>
//                     <Button variant="outline" className="border-[#222] text-[#222]">Sign up</Button>
//                   </div>
//                 </Card>

//                 {/* Shopify Info Card */}
//                 <Card className="p-6 bg-green-50/50 border-green-100 flex flex-col justify-between space-y-6">
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <h3 className="text-xl font-bold text-[#95BF47]">Shopify</h3>
//                       <Badge className="bg-muted text-muted-foreground hover:bg-muted font-normal">Medium</Badge>
//                     </div>
//                     <p className="text-sm text-muted-foreground">
//                       Shopify is perfect for established sellers wanting to expand their brand and business with easy setup and store creation tools.
//                     </p>
//                     <ul className="space-y-2">
//                       <li className="flex items-center gap-2 text-sm"><span className="text-green-600">✔</span> 3-day free trial</li>
//                       <li className="flex items-center gap-2 text-sm"><span className="text-green-600">✔</span> SEO & marketing tools</li>
//                       <li className="flex items-center gap-2 text-sm"><span className="text-green-600">✔</span> Customizable storefronts</li>
//                     </ul>
//                   </div>
//                   <div className="flex gap-3">
//                     <Button className="bg-[#008060] text-white hover:bg-[#004C3F]" onClick={() => handleConnectChannel('Shopify')}>Connect to Shopify</Button>
//                     <Button variant="outline" className="border-[#008060] text-[#008060]">Sign up</Button>
//                   </div>
//                 </Card>
//               </div>

//             </div>
//           </div>

//         </div>
//       </main>

//       {/* Create Store Dialog */}
//       <Dialog open={createStoreDialogOpen} onOpenChange={setCreateStoreDialogOpen}>
//         <DialogContent className="sm:max-w-[500px]">
//           <DialogHeader>
//             <DialogTitle>Create New Store</DialogTitle>
//             <DialogDescription>
//               Create a new store to start selling your products. You can create as many stores as you need.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <div className="space-y-2">
//               <Label htmlFor="storeName">Store Name *</Label>
//               <Input
//                 id="storeName"
//                 value={newStoreName}
//                 onChange={(e) => setNewStoreName(e.target.value)}
//                 placeholder="My Awesome Store"
//                 disabled={isCreatingStore}
//               />
//               <p className="text-xs text-muted-foreground">
//                 This will be the display name of your store
//               </p>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="storeDescription">Description</Label>
//               <Input
//                 id="storeDescription"
//                 value={newStoreDescription}
//                 onChange={(e) => setNewStoreDescription(e.target.value)}
//                 placeholder="A brief description of your store (optional)"
//                 disabled={isCreatingStore}
//               />
//             </div>
//           </div>
//           <div className="flex gap-3 pt-4 border-t">
//             <Button
//               variant="outline"
//               className="flex-1"
//               onClick={() => {
//                 setCreateStoreDialogOpen(false);
//                 setNewStoreName('');
//                 setNewStoreDescription('');
//               }}
//               disabled={isCreatingStore}
//             >
//               Cancel
//             </Button>
//             <Button
//               className="flex-1 gap-2"
//               onClick={handleCreateStore}
//               disabled={isCreatingStore || !newStoreName.trim()}
//             >
//               {isCreatingStore ? (
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Plus className="h-4 w-4" />
//                   Create Store
//                 </>
//               )}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default Stores;

import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStoreUrl } from "@/utils/storeUrl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { storeApi, storeProductsApi } from "@/lib/api";
import type { Store as StoreType } from "@/types";
import { toast } from "sonner";
import logo from "@/assets/logo.webp";

import {
  Package,
  Store as StoreIcon,
  TrendingUp,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Plus,
  ExternalLink,
  Paintbrush,
  CheckCircle2,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";



export default function Stores() {
  const { user, logout, isAdmin } = useAuth();
  const { stores, loading, refreshStores } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any; // Product data from listing editor

  // Local state for product counts since they might be fetched individually
  const [storeProductCounts, setStoreProductCounts] = useState<Record<string, number>>({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<StoreType | null>(null);
  const [isDeletingStore, setIsDeletingStore] = useState(false);

  // Suggested by user
  const [createStoreDialogOpen, setCreateStoreDialogOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreDescription, setNewStoreDescription] = useState("");
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  useEffect(() => {
    refreshStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchProductCounts = async () => {
      // Find stores that need product counts
      const storesToFetch = stores.filter(s => storeProductCounts[s.id] === undefined && s.productsCount === undefined);
      if (storesToFetch.length === 0) return;

      for (const store of storesToFetch) {
        try {
          const response = await storeProductsApi.list({ storeId: store.id });
          if (response.success) {
            setStoreProductCounts(prev => ({
              ...prev,
              [store.id]: response.data?.length || 0
            }));
          }
        } catch (err) {
          console.error(`Error fetching products for store ${store.id}:`, err);
        }
      }
    };

    if (stores.length > 0) {
      fetchProductCounts();
    }
  }, [stores, storeProductCounts]);

  const handleDeleteStore = async () => {
    if (!storeToDelete) return;
    setIsDeletingStore(true);
    try {
      const resp = await storeApi.delete(storeToDelete.id);
      if (!resp.success) throw new Error(resp.message || "Failed to delete store");

      toast.success("Store deleted successfully");
      await refreshStores();
      setDeleteDialogOpen(false);
      setStoreToDelete(null);
    } catch (error: any) {
      console.error("Error deleting store:", error);
      toast.error(error.message || "Error deleting store");
    } finally {
      setIsDeletingStore(false);
    }
  };

  const handleConnectChannel = (channel: string) => {
    toast.info(`Integration with ${channel} is coming soon!`);
  };

  const handleCreateStore = async () => {
    if (!newStoreName.trim()) {
      toast.error("Please enter a store name");
      return;
    }

    setIsCreatingStore(true);
    try {
      const createResp = await storeApi.create({
        name: newStoreName.trim(),
        description: newStoreDescription.trim() || "My ShelfMerch Store",
      });

      if (!createResp.success || !createResp.data) {
        throw new Error(createResp.message || "Failed to create store");
      }

      toast.success("Store created successfully!");
      await refreshStores();

      // Reset form and close dialog
      setNewStoreName("");
      setNewStoreDescription("");
      setCreateStoreDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating store:", error);
      toast.error(error.message || "Failed to create store");
    } finally {
      setIsCreatingStore(false);
    }
  };

  const storeLabel = (s: any) => s?.storeName ?? s?.name ?? "Untitled Store";

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12">
        {/* My Stores List */}
        {!loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">My Stores</h2>
              <Button
                onClick={() => navigate("/connect-store")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Store
              </Button>
            </div>

            {stores.length === 0 ? (
              <Card className="p-12 text-center">
                <StoreIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No stores yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Create your first store to start selling your products
                </p>
                <Button
                  onClick={() => navigate("/connect-store")}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Store
                </Button>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {stores.map((store) => (
                  <Card
                    key={store.id}
                    className="p-4 flex items-center justify-between gap-6 border-none shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Column 1: Store info */}
                    <div className="flex items-center gap-4 flex-[1.5] min-w-0">
                      <div className="w-1.5 h-12 bg-[#22C35E] rounded-full shrink-0" />
                      <div className="min-w-0">
                        <h3 className="font-bold text-xl truncate text-[#343A40]">
                          {storeLabel(store)}
                        </h3>
                        {store.subdomain && (
                          <p className="text-sm text-muted-foreground truncate font-medium">
                            {store.subdomain}.shelfmerch.com
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Status toggle */}
                    <div className="flex-1 flex justify-center">
                      <div className="flex items-center gap-2 shrink-0 bg-muted/30 px-4 py-2 rounded-full border">
                        <span className={`h-2.5 w-2.5 rounded-full ${store.isActive ? 'bg-[#22C35E]' : 'bg-muted-foreground'}`} />
                        <span className={`text-xs font-bold text-center ${store.isActive ? 'text-[#22C35E]' : 'text-muted-foreground'}`}>
                          {store.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {/* Column 3: Product count */}
                    <div className="flex-1 flex justify-center">
                      <div className="flex flex-col items-center px-8 border-x border-muted/50 h-10 justify-center">
                        <span className="text-2xl font-bold text-[#343A40] leading-none">
                          {store.productsCount ?? storeProductCounts[store.id] ?? (store.productIds?.length || 0)}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mt-1">
                          Products
                        </span>
                      </div>
                    </div>

                    {/* Column 4: Primary actions */}
                    <div className="flex-[1.5] flex items-center justify-end gap-3 shrink-0">
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-11 px-6 rounded-md border-muted text-[#495057] font-semibold hover:bg-muted/50"
                        asChild
                      >
                        <a
                          href={getStoreUrl(store.subdomain)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit Store
                        </a>
                      </Button>

                      <Button
                        variant="secondary"
                        size="lg"
                        className="h-11 px-6 rounded-md bg-muted/50 text-[#495057] font-semibold border-none hover:bg-muted/80"
                        onClick={() => navigate(`/stores/${store.id}/builder`)}
                      >
                        <Paintbrush className="w-4 h-4 mr-2" />
                        Customize Storefront
                      </Button>
                    </div>

                    {/* Column 5: Delete actions */}
                    <div className="flex items-center justify-end gap-2 shrink-0 pl-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                        onClick={() => {
                          setStoreToDelete(store);
                          setDeleteDialogOpen(true);
                        }}
                        title="Delete store"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Delete Store Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Delete Store</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {storeToDelete ? storeLabel(storeToDelete) : "this store"}
                </span>
                ? This action cannot be undone and all associated products and
                settings will be permanently removed.
              </DialogDescription>
            </DialogHeader>

            <div className="flex gap-3 pt-4 border-t mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setStoreToDelete(null);
                }}
                disabled={isDeletingStore}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                className="flex-1 gap-2"
                onClick={handleDeleteStore}
                disabled={isDeletingStore}
              >
                {isDeletingStore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-w-6xl mx-auto space-y-12 mt-12">
        <div className="space-y-6">

          <div className="grid gap-6">
            <Card className="p-8 bg-muted/30 border-none shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    ShelfMerch{" "}
                    <span className="font-normal text-muted-foreground">
                      Pop-Up
                    </span>
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-white/50 text-xs font-normal border"
                  >
                    Beta version
                  </Badge>
                </div>
                <p className="text-muted-foreground max-w-2xl">
                  Start selling right away. No need to create a website, just
                  send out a unique link to your friends, family, or followers.
                  <a href="#" className="underline ml-1">
                    Learn more
                  </a>
                </p>
              </div>

              <Button
                size="lg"
                className="shrink-0 bg-[#343A40] text-white hover:bg-[#212529]"
                onClick={() => setCreateStoreDialogOpen(true)}
              >
                Launch Pop-Up store
              </Button>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-orange-50/50 border-orange-100 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#F1641E]">
                      Etsy <span className="text-foreground">Etsy</span>
                    </h3>
                    <Badge className="bg-muted text-muted-foreground hover:bg-muted font-normal">
                      Easy
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Etsy provides a fast and easy way to get started selling
                    and reach over 96 million active buyers worldwide.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✔</span> Easy to set up
                      and start selling
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✔</span> Large audience
                      and traffic
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✔</span> Low listing fees
                    </li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="bg-[#222] text-white hover:bg-black"
                    onClick={() => handleConnectChannel("Etsy")}
                  >
                    Connect to Etsy
                  </Button>
                  <Button variant="outline" className="border-[#222] text-[#222]">
                    Sign up
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-green-50/50 border-green-100 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#95BF47]">Shopify</h3>
                    <Badge className="bg-muted text-muted-foreground hover:bg-muted font-normal">
                      Medium
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Shopify is perfect for established sellers wanting to
                    expand their brand and business with easy setup and store
                    creation tools.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✔</span> 3-day free trial
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✔</span> SEO & marketing tools
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✔</span> Customizable storefronts
                    </li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Button
                    className="bg-[#008060] text-white hover:bg-[#004C3F]"
                    onClick={() => handleConnectChannel("Shopify")}
                  >
                    Connect to Shopify
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#008060] text-[#008060]"
                  >
                    Sign up
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Developer API Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            API Integration
          </h2>
          <p className="text-muted-foreground">
            Integrate ShelfMerch with your own custom storefront or platform using our API.
          </p>

          <Card className="p-8 bg-slate-50 border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-800">Custom API Integration</h3>
                <Badge variant="secondary" className="bg-slate-200 text-slate-700 font-normal hover:bg-slate-200 hover:text-slate-800">
                  Advanced
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Build your own custom integration. Programmatically create listings, sync products, manage orders, and automate your entire workflow with our comprehensive developer API.
              </p>
            </div>

            <div className="flex shrink-0">
              <Button
                size="lg"
                className="bg-slate-900 text-white hover:bg-slate-800 gap-2"
                onClick={() => window.open('https://api.shelfmerch.com/docs', '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                View API Docs
              </Button>
            </div>
          </Card>
        </div>

        {/* Create Store Dialog */}
        <Dialog open={createStoreDialogOpen} onOpenChange={setCreateStoreDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Store</DialogTitle>
              <DialogDescription>
                Create a new store to start selling your products. You can create as many stores as you need.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="My Awesome Store"
                  disabled={isCreatingStore}
                />
                <p className="text-xs text-muted-foreground">
                  This will be the display name of your store
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeDescription">Description</Label>
                <Input
                  id="storeDescription"
                  value={newStoreDescription}
                  onChange={(e) => setNewStoreDescription(e.target.value)}
                  placeholder="A brief description of your store (optional)"
                  disabled={isCreatingStore}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCreateStoreDialogOpen(false);
                  setNewStoreName("");
                  setNewStoreDescription("");
                }}
                disabled={isCreatingStore}
              >
                Cancel
              </Button>

              <Button
                className="flex-1 gap-2"
                onClick={handleCreateStore}
                disabled={isCreatingStore || !newStoreName.trim()}
              >
                {isCreatingStore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Store
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
