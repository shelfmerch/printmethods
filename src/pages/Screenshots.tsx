import React from 'react';
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
    Badge,
    Grid,
} from '@shopify/polaris';
import {
    StoreIcon,
    ProductIcon,
    OrderIcon,
    CheckCircleIcon,
    PlusIcon,
} from '@shopify/polaris-icons';
import { ShopifyHeader } from '@/components/ShopifyHeader';

const Screenshots: React.FC = () => {
    return (
        <div style={{ backgroundColor: 'var(--p-color-bg-surface-secondary)', minHeight: '100vh' }}>
            <ShopifyHeader shop="screenshot-preview.myshopify.com" />

            {/* Hero Section for Screenshot 1 */}
            <Page fullWidth>
                <Box padding="1000" background="bg-surface-brand-selected" borderRadius="300">
                    <Layout>
                        <Layout.Section>
                            <BlockStack gap="600" align="center">
                                <InlineStack align="center">
                                    <Badge tone="success">New: AI Design Engine</Badge>
                                </InlineStack>
                                <Text as="h1" variant="heading3xl" alignment="center">
                                    Scale Your Shopify Store with <br />
                                    <span style={{ color: 'var(--p-color-text-brand)' }}>Automated Print-on-Demand</span>
                                </Text>
                                <Text as="p" variant="bodyLg" alignment="center" tone="subdued">
                                    The all-in-one platform for printing, branding, and shipping your custom merchandise <br />
                                    directly to your Shopify customers. No inventory, no risk.
                                </Text>
                                <InlineStack align="center" gap="400">
                                    <Button variant="primary" size="large">Get Started for Free</Button>
                                    <Button size="large">View Demo Store</Button>
                                </InlineStack>
                            </BlockStack>
                        </Layout.Section>
                    </Layout>
                </Box>
            </Page>

            {/* Feature Grid for Screenshot 2 */}
            <Page fullWidth>
                <Layout>
                    <Layout.Section>
                        <Box paddingBlockStart="800" paddingBlockEnd="400">
                            <Text as="h2" variant="heading2xl" alignment="center">Everything you need to succeed</Text>
                        </Box>
                    </Layout.Section>

                    <Layout.Section variant="oneThird">
                        <Card>
                            <BlockStack gap="400">
                                <Icon source={ProductIcon} tone="primary" />
                                <Text as="h3" variant="headingMd">Infinite Designs</Text>
                                <Text as="p" variant="bodyMd" tone="subdued">
                                    Upload your own artwork or use our AI design engine to create unique products in seconds.
                                </Text>
                            </BlockStack>
                        </Card>
                    </Layout.Section>

                    <Layout.Section variant="oneThird">
                        <Card>
                            <BlockStack gap="400">
                                <Icon source={StoreIcon} tone="primary" />
                                <Text as="h3" variant="headingMd">Seamless Integration</Text>
                                <Text as="p" variant="bodyMd" tone="subdued">
                                    One-click sync with your Shopify store. Automated order fulfillment and tracking.
                                </Text>
                            </BlockStack>
                        </Card>
                    </Layout.Section>

                    <Layout.Section variant="oneThird">
                        <Card>
                            <BlockStack gap="400">
                                <Icon source={PlusIcon} tone="primary" />
                                <Text as="h3" variant="headingMd">Global Shipping</Text>
                                <Text as="p" variant="bodyMd" tone="subdued">
                                    We print and ship from 30+ locations worldwide to ensure fast delivery to your customers.
                                </Text>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </Page>

            {/* Stats Section for Screenshot 3 */}
            <Page fullWidth>
                <Box paddingBlockStart="800" paddingBlockEnd="800">
                    <Grid>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                            <Card>
                                <BlockStack gap="200" align="center">
                                    <Text as="h2" variant="heading2xl">500k+</Text>
                                    <Text as="p" variant="bodySm" tone="subdued">Products Shipped</Text>
                                </BlockStack>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                            <Card>
                                <BlockStack gap="200" align="center">
                                    <Text as="h2" variant="heading2xl">99.8%</Text>
                                    <Text as="p" variant="bodySm" tone="subdued">Quality Rating</Text>
                                </BlockStack>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                            <Card>
                                <BlockStack gap="200" align="center">
                                    <Text as="h2" variant="heading2xl">24/7</Text>
                                    <Text as="p" variant="bodySm" tone="subdued">Global Support</Text>
                                </BlockStack>
                            </Card>
                        </Grid.Cell>
                        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                            <Card>
                                <BlockStack gap="200" align="center">
                                    <Text as="h2" variant="heading2xl">30+</Text>
                                    <Text as="p" variant="bodySm" tone="subdued">Print Centers</Text>
                                </BlockStack>
                            </Card>
                        </Grid.Cell>
                    </Grid>
                </Box>
            </Page>
        </div>
    );
};

export default Screenshots;
