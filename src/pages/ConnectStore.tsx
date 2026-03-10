import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { storeApi, storeProductsApi } from "@/lib/api";
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
    Paintbrush,
    Loader2,
    Terminal,
    ExternalLink,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layout/DashboardLayout";

const ChannelButton = ({
    name,
    icon,
    isNew,
}: {
    name: string;
    icon?: React.ReactNode;
    isNew?: boolean;
}) => (
    <Button
        variant="outline"
        className="h-14 justify-start px-4 gap-3 relative hover:border-primary/50 hover:bg-muted/50 transition-all group w-full"
    >
        {icon ? (
            icon
        ) : (
            <div className="w-6 h-6 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-bold text-muted-foreground">
                ?
            </div>
        )}
        <span className="font-semibold text-lg">{name}</span>
        {isNew && (
            <Badge
                variant="secondary"
                className="absolute top-2 right-2 text-[10px] h-4 px-1.5 bg-blue-100 text-blue-700 hover:bg-blue-100"
            >
                New
            </Badge>
        )}
    </Button>
);

export default function ConnectStore() {
    const { user, logout, isAdmin } = useAuth();
    const { refreshStores, selectStoreById } = useStore();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as any; // Product data from listing editor

    const [isCreatingInternal, setIsCreatingInternal] = useState(false);
    const [createStoreDialogOpen, setCreateStoreDialogOpen] = useState(false);
    const [newStoreName, setNewStoreName] = useState("");
    const [newStoreDescription, setNewStoreDescription] = useState("");
    const [isCreatingStore, setIsCreatingStore] = useState(false);

    const handleLaunchPopupStore = async () => {
        setIsCreatingInternal(true);
        try {
            const storeName = `Store ${new Date()
                .toLocaleDateString()
                .replace(/\//g, "-")}`;

            const createResp = await storeApi.create({
                name: storeName,
                description: "My ShelfMerch Pop-Up Store",
            });

            if (!createResp.success || !createResp.data) {
                throw new Error(createResp.message || "Failed to create store");
            }

            const newStore = createResp.data;
            toast.success("ShelfMerch Pop-Up store created!");
            await refreshStores();
            selectStoreById(newStore.id || newStore._id || "");

            // If coming from Listing Editor, publish the product
            if (state && state.productId && state.variantRows) {
                const loadingToast = toast.loading(
                    "Publishing product to your new store..."
                );

                try {
                    const variantsPayload = state.variantRows
                        .filter((v: any) => v.id)
                        .map((v: any) => ({
                            catalogProductVariantId: v.id,
                            sku: v.sku,
                            sellingPrice: v.retailPrice,
                            isActive: true,
                        }));

                    const baseSellingPrice =
                        state.baseSellingPrice ?? state.variantRows?.[0]?.retailPrice ?? 0;

                    const prodResp = await storeProductsApi.create({
                        storeId: newStore.id,
                        catalogProductId: state.productId,
                        sellingPrice: baseSellingPrice,
                        title: state.title,
                        description: state.description,
                        galleryImages: state.galleryImages,
                        designData: state.designData,
                        variants: variantsPayload.length > 0 ? variantsPayload : undefined,
                    });

                    toast.dismiss(loadingToast);

                    if (prodResp.success) {
                        toast.success("Product published successfully!");
                        navigate("/stores");
                    } else {
                        toast.error(
                            "Store created, but product publishing failed: " + prodResp.message
                        );
                    }
                } catch (pubErr: any) {
                    console.error("Publishing error", pubErr);
                    toast.dismiss();
                    toast.error("Store created, but product publishing failed.");
                }
            } else {
                navigate("/stores");
            }
        } catch (error: any) {
            console.error("Error launching store:", error);
            toast.error(error.message || "Failed to launch store");
        } finally {
            setIsCreatingInternal(false);
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
            setNewStoreName("");
            setNewStoreDescription("");
            setCreateStoreDialogOpen(false);
            await refreshStores();
            if (createResp.data?.id || createResp.data?._id) {
                selectStoreById(createResp.data.id || createResp.data._id);
            }
            navigate("/stores");
        } catch (error: any) {
            console.error("Error creating store:", error);
            toast.error(error.message || "Failed to create store");
        } finally {
            setIsCreatingStore(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Let's connect your store!
                    </h1>
                </div>

                {/* Channels Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">
                        Already have a sales channel? Connect your store now.
                    </h2>
                    <p className="text-muted-foreground">
                        Choose a sales channel below to connect your store.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <div onClick={() => handleConnectChannel("Shopify")}>
                            <ChannelButton
                                name="Shopify"
                                icon={<ShoppingBag className="text-[#95BF47] fill-current" />}
                            />
                        </div>
                        <div onClick={() => handleConnectChannel("Amazon")}>
                            <ChannelButton
                                name="Amazon"
                                icon={<span className="font-bold text-lg">amazon</span>}
                            />
                        </div>
                        <div onClick={() => setCreateStoreDialogOpen(true)}>
                            <ChannelButton
                                name="ShelfMerch Pop-Up"
                                icon={<StoreIcon className="text-primary" />}
                            />
                        </div>
                        <div onClick={() => handleConnectChannel("WooCommerce")}>
                            <ChannelButton
                                name="WooCommerce"
                                icon={
                                    <span className="font-bold text-lg text-[#96588A]">Woo</span>
                                }
                            />
                        </div>
                        <div onClick={() => handleConnectChannel("API")}>
                            <ChannelButton name="API" icon={<Settings />} />
                        </div>
                    </div>
                </div>

                {/* Help Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-semibold">
                        No sales channel yet? We're here to help.
                    </h2>
                    <p className="text-muted-foreground">
                        Choose a sales channel that fits your business and needs.
                    </p>

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
                <div className="space-y-6 pt-4">
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
