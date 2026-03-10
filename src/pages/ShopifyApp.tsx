import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { shopifyApi } from '@/lib/shopifyApi';
import {
    Page,
    Layout,
    Card,
    BlockStack,
    Text,
    Button,
    Box,
    InlineStack,
    Icon,
    List,
    Grid,
    Divider,
    ProgressBar,
    Badge,
    CalloutCard,
    EmptyState,
    Thumbnail,
} from '@shopify/polaris';
import {
    StoreIcon,
    ProductIcon,
    OrderIcon,
    CheckCircleIcon,
    ExternalIcon,
    AlertCircleIcon,
} from '@shopify/polaris-icons';
import createApp from '@shopify/app-bridge';
import { Redirect } from '@shopify/app-bridge/actions';
import { ShopifyHeader } from '@/components/ShopifyHeader';

const ShopifyApp: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    const shop = searchParams.get('shop');

    useEffect(() => {
        const host = searchParams.get('host');
        const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
        if (host && apiKey) {
            createApp({ apiKey, host, forceRedirect: true });
        }
    }, [searchParams]);

    const [statusLoading, setStatusLoading] = useState(true);
    const [installed, setInstalled] = useState(false);
    const [linked, setLinked] = useState(false);
    const [linking, setLinking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!shop) {
            setStatusLoading(false);
            return;
        }
        const checkStatus = async () => {
            try {
                const status = await shopifyApi.getStatus(shop);
                if (!status.installed && status.authUrl) {
                    const host = searchParams.get('host');
                    const apiKey = import.meta.env.VITE_SHOPIFY_API_KEY;
                    if (host && apiKey) {
                        const app = createApp({ apiKey, host, forceRedirect: true });
                        Redirect.create(app).dispatch(Redirect.Action.REMOTE, status.authUrl);
                    } else {
                        window.top.location.href = status.authUrl;
                    }
                    return;
                }
                setInstalled(true);
                setLinked(status.linked);
            } catch (err: any) {
                setError(err.message || 'Failed to check app status');
            } finally {
                setStatusLoading(false);
            }
        };
        checkStatus();
    }, [shop]);

    useEffect(() => {
        if (authLoading || !shop || !user || !installed || linked || linking) return;
        const performLinking = async () => {
            setLinking(true);
            try {
                await shopifyApi.linkAccount(shop);
                setLinked(true);
            } catch (err: any) {
                setError(err.message || 'Failed to link account');
            } finally {
                setLinking(false);
            }
        };
        performLinking();
    }, [user, authLoading, shop, installed, linked, linking]);

    const renderOnboarding = () => {
        const host = searchParams.get('host');
        const embedded = searchParams.get('embedded') || '1';
        let returnPath = `/shopify/app?shop=${encodeURIComponent(shop!)}&embedded=${embedded}`;
        if (host) returnPath += `&host=${encodeURIComponent(host)}`;
        const returnTo = encodeURIComponent(returnPath);
        const authBase = `/auth?embedded=${embedded}${host ? `&host=${encodeURIComponent(host)}` : ''}`;

        return (
            <Page narrowWidth>
                <Layout>
                    <Layout.Section>
                        <Card padding="600">
                            <BlockStack gap="500">
                                <BlockStack gap="200" align="center">
                                    <Text as="h1" variant="headingLg" alignment="center">
                                        ShelfMerch – Print on Demand for Shopify
                                    </Text>
                                    <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                                        Create custom products and start selling instantly.
                                    </Text>
                                </BlockStack>

                                <Box paddingBlockStart="400">
                                    <BlockStack gap="400">
                                        <InlineStack align="start" gap="400" wrap={false}>
                                            <Badge tone="info">Step 1</Badge>
                                            <Text as="p" variant="bodyMd">Connect your ShelfMerch account</Text>
                                        </InlineStack>
                                        <InlineStack align="start" gap="400" wrap={false}>
                                            <Badge tone="info">Step 2</Badge>
                                            <Text as="p" variant="bodyMd">Choose products and add designs</Text>
                                        </InlineStack>
                                        <InlineStack align="start" gap="400" wrap={false}>
                                            <Badge tone="info">Step 3</Badge>
                                            <Text as="p" variant="bodyMd">Publish products to your store</Text>
                                        </InlineStack>
                                        <InlineStack align="start" gap="400" wrap={false}>
                                            <Badge tone="info">Step 4</Badge>
                                            <Text as="p" variant="bodyMd">We print and ship automatically</Text>
                                        </InlineStack>
                                    </BlockStack>
                                </Box>

                                <InlineStack align="center" gap="300">
                                    <Button
                                        variant="primary"
                                        size="large"
                                        onClick={() => navigate(`${authBase}&mode=login&returnTo=${returnTo}`)}
                                    >
                                        Connect Account
                                    </Button>
                                    <Button
                                        size="large"
                                        onClick={() => navigate(`${authBase}&mode=signup&returnTo=${returnTo}`)}
                                    >
                                        Create Free Account
                                    </Button>
                                </InlineStack>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>
        );
    };

    const renderDashboard = () => (
        <Page
            title="ShelfMerch Dashboard"
            subtitle="Manage your print-on-demand products."
        >
            <Layout>
                <Layout.Section>
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 4, xl: 4 }}>
                            <Card>
                                <BlockStack gap="200">
                                    <InlineStack align="space-between">
                                        <Text as="h2" variant="headingSm">Products Synced</Text>
                                        <Icon source={ProductIcon} tone="base" />
                                    </InlineStack>
                                    <Text as="p" variant="headingLg">24</Text>
                                </BlockStack>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 4, xl: 4 }}>
                            <Card>
                                <BlockStack gap="200">
                                    <InlineStack align="space-between">
                                        <Text as="h2" variant="headingSm">Orders Received</Text>
                                        <Icon source={OrderIcon} tone="base" />
                                    </InlineStack>
                                    <Text as="p" variant="headingLg">156</Text>
                                </BlockStack>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 4, xl: 4 }}>
                            <Card>
                                <BlockStack gap="200">
                                    <InlineStack align="space-between">
                                        <Text as="h2" variant="headingSm">Orders Fulfilled</Text>
                                        <Icon source={OrderIcon} tone="base" />
                                    </InlineStack>
                                    <Text as="p" variant="headingLg">142</Text>
                                </BlockStack>
                            </Card>
                        </Grid.Cell>
                    </Grid>
                </Layout.Section>
                <Layout.Section>
                    <CalloutCard
                        title="Start Designing Now"
                        illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customize-20-80-d02f7413f41219b12cc8eb9095627236526e0e0f8078dbb4764831633cf46d29.svg"
                        primaryAction={{
                            content: 'Create Product',
                            onAction: () => window.open('https://app.shelfmerch.com/designer', '_blank'),
                        }}
                    >
                        <p>Unlock your creativity and start building your custom merchandise collection today.</p>
                    </CalloutCard>
                </Layout.Section>
            </Layout>
        </Page>
    );

    if (!shop) return <Page><Text as="p">Error: Missing shop parameter</Text></Page>;
    if (statusLoading || authLoading || linking) return <Box padding="500"><InlineStack align="center"><ProgressBar size="small" /></InlineStack></Box>;
    if (error) return <Page><Card><Text as="p" tone="critical">{error}</Text></Card></Page>;

    return (
        <div style={{ backgroundColor: 'var(--p-color-bg-surface-secondary)', minHeight: '100vh' }}>
            <ShopifyHeader shop={shop} />
            {!user || !linked ? renderOnboarding() : renderDashboard()}
        </div>
    );
};

export default ShopifyApp;
