import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { shopifyApi } from '@/lib/shopifyApi';
import {
    Page,
    Layout,
    Card,
    IndexTable,
    Text,
    Badge,
    Button,
    InlineStack,
    BlockStack,
    Box,
    TextField,
    Grid,
    ProgressBar,
    useIndexResourceState,
} from '@shopify/polaris';
import {
    RefreshIcon,
    PlusIcon,
    ProductIcon,
    OrderIcon,
    ExternalIcon,
} from '@shopify/polaris-icons';
import { toast } from 'sonner';
import { ShopifyHeader } from '@/components/ShopifyHeader';

interface ShopifyStore {
    shop: string;
    isActive: boolean;
    lastSyncAt: string | null;
    scopes: string[] | string;
    createdAt: string;
    updatedAt: string;
}

const ShopifyDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stores, setStores] = useState<ShopifyStore[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectShop, setConnectShop] = useState('');
    const [syncing, setSyncing] = useState<Record<string, boolean>>({});

    const fetchStores = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await shopifyApi.getStores();
            setStores(response.stores || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load stores');
            toast.error('Failed to load stores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const handleConnect = async () => {
        let shopInput = connectShop.trim();
        if (!shopInput) {
            toast.error('Please enter a shop domain');
            return;
        }
        shopInput = shopInput.replace(/^https?:\/\//, '').replace(/\/$/, '');
        if (!shopInput.includes('.')) {
            shopInput = `${shopInput}.myshopify.com`;
        }
        if (!shopInput.endsWith('.myshopify.com')) {
            toast.error('Please enter a valid .myshopify.com domain');
            return;
        }

        try {
            toast.loading(`Redirecting to Shopify for ${shopInput}...`, { id: 'connect' });
            const token = localStorage.getItem('token');
            const publicBase = import.meta.env.VITE_SHOPIFY_PUBLIC_BASE_URL || 'https://bumblingly-graspless-fran.ngrok-free.dev';
            const startUrl = `${publicBase}/api/shopify/start?shop=${encodeURIComponent(shopInput)}${token ? `&token=${token}` : ''}`;
            window.location.assign(startUrl);
        } catch (err: any) {
            toast.error(err.message || 'Failed to connect to Shopify', { id: 'connect' });
        }
    };

    const handleSync = async (shop: string, mode: 'products' | 'orders') => {
        const key = `${shop}-${mode}`;
        setSyncing(prev => ({ ...prev, [key]: true }));
        try {
            await shopifyApi.syncOrders(shop, mode);
            toast.success(`Sync ${mode} successful for ${shop}`);
            fetchStores();
        } catch (err: any) {
            toast.error(`Sync failed: ${err.message}`);
        } finally {
            setSyncing(prev => ({ ...prev, [key]: false }));
        }
    };

    const resourceName = {
        singular: 'store',
        plural: 'stores',
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(stores as any);

    const rowMarkup = stores.map(
        ({ shop, isActive, lastSyncAt, createdAt }, index) => (
            <IndexTable.Row
                id={shop}
                key={shop}
                selected={selectedResources.includes(shop)}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {shop}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge tone={isActive ? 'success' : 'critical'}>
                        {isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : 'Never'}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {new Date(createdAt).toLocaleDateString()}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <InlineStack gap="200">
                        <Button
                            size="slim"
                            icon={ProductIcon}
                            onClick={() => handleSync(shop, 'products')}
                            loading={syncing[`${shop}-products`]}
                        >
                            Sync Products
                        </Button>
                        <Button
                            size="slim"
                            icon={OrderIcon}
                            onClick={() => handleSync(shop, 'orders')}
                            loading={syncing[`${shop}-orders`]}
                        >
                            Sync Orders
                        </Button>
                        <Button
                            size="slim"
                            icon={ExternalIcon}
                            onClick={() => navigate(`/dashboard/shopify/${encodeURIComponent(shop)}/products`)}
                        >
                            View Products
                        </Button>
                    </InlineStack>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    return (
        <Page
            title="Shopify Integration"
            subtitle="Manage your connected Shopify stores and sync data."
            primaryAction={
                <Button icon={RefreshIcon} onClick={fetchStores} loading={loading}>
                    Refresh
                </Button>
            }
        >
            <Layout>
                <Layout.Section>
                    <Card>
                        <BlockStack gap="400">
                            <Text as="h2" variant="headingMd">Connect New Store</Text>
                            <InlineStack gap="400" align="start" blockAlign="end">
                                <Box minWidth="300px">
                                    <TextField
                                        label="Store Domain"
                                        placeholder="example.myshopify.com"
                                        value={connectShop}
                                        onChange={setConnectShop}
                                        autoComplete="off"
                                    />
                                </Box>
                                <Button variant="primary" icon={PlusIcon} onClick={handleConnect}>
                                    Connect
                                </Button>
                            </InlineStack>
                        </BlockStack>
                    </Card>
                </Layout.Section>

                <Layout.Section>
                    <Card padding="0">
                        {loading && stores.length === 0 ? (
                            <Box padding="1000">
                                <InlineStack align="center">
                                    <ProgressBar size="small" />
                                </InlineStack>
                            </Box>
                        ) : stores.length === 0 ? (
                            <Box padding="1000">
                                <Text as="p" alignment="center" tone="subdued">
                                    No Shopify stores connected yet.
                                </Text>
                            </Box>
                        ) : (
                            <IndexTable
                                resourceName={resourceName}
                                itemCount={stores.length}
                                selectedItemsCount={
                                    allResourcesSelected ? 'All' : selectedResources.length
                                }
                                onSelectionChange={handleSelectionChange}
                                headings={[
                                    { title: 'Shop' },
                                    { title: 'Status' },
                                    { title: 'Last Sync' },
                                    { title: 'Connected At' },
                                    { title: 'Actions' },
                                ]}
                            >
                                {rowMarkup}
                            </IndexTable>
                        )}
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
};

export default ShopifyDashboard;

