import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { shopifyApi } from '@/lib/shopifyApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ShopifyApp Component (Embedded Page)
 * Route: /shopify/app?shop=xxx.myshopify.com
 *
 * Flow (Qikink-style):
 * 1. Check /status → if app not installed → redirect to OAuth (_top)
 * 2. If installed but no user → show login/signup (iframe)
 * 3. If installed + user but not linked → auto-link
 * 4. If installed + user + linked → show success
 */
const ShopifyApp: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    const location = useLocation();

    const shop = searchParams.get('shop');

    // Status states
    const [statusLoading, setStatusLoading] = useState(true);
    const [installed, setInstalled] = useState(false);
    const [linked, setLinked] = useState(false);
    const [linking, setLinking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [linkAttempted, setLinkAttempted] = useState(false);

    // Step 1: Check install status on mount
    useEffect(() => {
        if (!shop) {
            setStatusLoading(false);
            return;
        }

        const checkStatus = async () => {
            try {
                const status = await shopifyApi.getStatus(shop);
                console.log('[ShopifyApp] status:', status);

                if (!status.installed) {
                    // Not installed → redirect to OAuth (must be top-level for Shopify)
                    console.log('[ShopifyApp] Not installed, redirecting to OAuth');
                    if (status.authUrl) {
                        // Always perform a top-level redirect out of the iframe
                        if (window.top && window.top !== window.self) {
                            window.top.location.href = status.authUrl;
                        } else {
                            window.location.href = status.authUrl;
                        }
                    }
                    return; // Don't update state, page will navigate away
                }

                setInstalled(true);
                setLinked(status.linked);
            } catch (err: any) {
                console.error('[ShopifyApp] Status check failed:', err);
                setError(err.message || 'Failed to check app status');
            } finally {
                setStatusLoading(false);
            }
        };

        checkStatus();
    }, [shop]);

    // Step 3 (fallback only): If user is present and store is still unlinked, attempt one safe link.
    useEffect(() => {
        if (authLoading || statusLoading || !shop || !user || !installed || linked || linking || linkAttempted) return;

        const performLinking = async () => {
            setLinking(true);
            setLinkAttempted(true);
            try {
                // Guard against retries across fast remounts/rerenders
                const key = `shopify_link_inflight:${shop}:${user?._id || 'unknown'}`;
                const now = Date.now();
                const last = Number(localStorage.getItem(key) || '0');
                if (last && now - last < 60_000) {
                    console.log('[ShopifyApp] Link already attempted recently, skipping duplicate call');
                    return;
                }
                localStorage.setItem(key, String(now));

                await shopifyApi.linkAccount(shop);
                setLinked(true);
                localStorage.removeItem(key);
                console.log('[ShopifyApp] Successfully linked');
            } catch (err: any) {
                console.error('[ShopifyApp] Link failed:', err);
                setError(err.message || 'Failed to link account');
                toast.error('Failed to link ShelfMerch account');
            } finally {
                setLinking(false);
            }
        };

        performLinking();
    }, [user, authLoading, statusLoading, shop, installed, linked, linking, linkAttempted]);

    const renderContent = () => {
        if (!shop) {
            return (
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                        <CardDescription>Missing shop parameter. Please open this app from your Shopify Admin.</CardDescription>
                    </CardHeader>
                </Card>
            );
        }

        if (authLoading) {
            return <div className="text-muted-foreground text-center py-12">Loading ShelfMerch context...</div>;
        }

        // Step 2: Installed but no user → show login/signup
        if (!user) {
            const host = searchParams.get('host');
            let returnPath = `/shopify/app?shop=${encodeURIComponent(shop)}`;
            if (host) returnPath += `&host=${encodeURIComponent(host)}`;
            const returnUrl = encodeURIComponent(returnPath);
            const hostParam = host ? `&host=${encodeURIComponent(host)}` : '';

            return (
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Welcome to ShelfMerch</CardTitle>
                        <CardDescription>Please login or sign up to connect your store.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {statusLoading && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="animate-spin h-3.5 w-3.5" />
                                <span>Checking store connection in the background…</span>
                            </div>
                        )}
                        <Button
                            className="w-full"
                            onClick={() => navigate(`/auth?mode=login&returnTo=${returnUrl}${hostParam}`)}
                        >
                            Login to ShelfMerch
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate(`/auth?mode=signup&returnTo=${returnUrl}${hostParam}`)}
                        >
                            Sign up for ShelfMerch
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            You'll return to Shopify after login.
                        </p>
                    </CardContent>
                </Card>
            );
        }

        // If status check is still running, don't block login UI above—only show minimal UI here when user exists.
        if (statusLoading) {
            return (
                <div className="flex flex-col items-center gap-3 py-12">
                    <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Preparing your store connection…</p>
                </div>
            );
        }

        if (!installed) {
            return (
                <div className="flex flex-col items-center gap-3 py-12">
                    <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Redirecting to install...</p>
                </div>
            );
        }

        // Step 3: Linking in progress
        if (linking) {
            return (
                <div className="flex flex-col items-center gap-3 py-12">
                    <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">Linking your account...</p>
                </div>
            );
        }

        // Step 4: Linked → success screen (Qikink style)
        if (linked) {
            return (
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="text-green-500 w-6 h-6" />
                            Store Connected
                        </CardTitle>
                        <CardDescription>
                            Your Shopify store has been successfully linked with your ShelfMerch account.
                            You can now design products and publish them to your store.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm border-b pb-2">
                                <span className="text-muted-foreground">Store:</span>
                                <span className="font-mono font-bold">{shop}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b pb-2">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="font-bold text-green-600">Connected ✅</span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                className="w-full gap-2"
                                onClick={() => window.open('https://app.shelfmerch.com/dashboard', '_blank')}
                            >
                                Open ShelfMerch Dashboard
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        // Error state
        if (error) {
            return (
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xs text-destructive text-center p-2 bg-destructive/10 rounded">
                            {error}
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-8 bg-slate-50">
            <div className="w-full max-w-md mb-6 text-center border-b pb-4">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">ShelfMerch Shopify App</h1>
                <p className="text-sm text-slate-500">
                    Domain: <span className="font-mono font-semibold">{shop || 'None'}</span>
                </p>
            </div>

            {renderContent()}

            <div className="mt-8 text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                SECURE EMBEDDED CONTEXT
            </div>
        </div>
    );
};

export default ShopifyApp;
