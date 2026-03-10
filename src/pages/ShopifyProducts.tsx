import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Box,
    EmptyState,
    Thumbnail,
    useIndexResourceState,
    ProgressBar,
} from '@shopify/polaris';
import {
    ArrowLeftIcon,
    RefreshIcon,
    ProductIcon,
} from '@shopify/polaris-icons';
import { ShopifyHeader } from '@/components/ShopifyHeader';

interface ShopifyProduct {
    shopifyProductId: number;
    title: string;
    handle: string;
    status: string;
    vendor: string;
    updatedAtShopify: string;
    image?: string; // Optional if available
}

const ShopifyProducts: React.FC = () => {
    const { shop } = useParams<{ shop: string }>();
    const navigate = useNavigate();
    const decodedShop = decodeURIComponent(shop || '');
    const [products, setProducts] = useState<ShopifyProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        if (!decodedShop) return;
        setLoading(true);
        setError(null);
        try {
            const response = await shopifyApi.getProducts(decodedShop);
            setProducts(response.products || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [decodedShop]);

    const resourceName = {
        singular: 'product',
        plural: 'products',
    };

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(products as any);

    const rowMarkup = products.map(
        (
            { shopifyProductId, title, handle, status, vendor, updatedAtShopify, image },
            index,
        ) => (
            <IndexTable.Row
                id={shopifyProductId.toString()}
                key={shopifyProductId}
                selected={selectedResources.includes(shopifyProductId.toString())}
                position={index}
            >
                <IndexTable.Cell>
                    <InlineStack gap="300" align="start" blockAlign="center">
                        <Thumbnail
                            source={image || ProductIcon}
                            alt={title}
                            size="small"
                        />
                        <Text variant="bodyMd" fontWeight="bold" as="span">
                            {title}
                        </Text>
                    </InlineStack>
                </IndexTable.Cell>
                <IndexTable.Cell>{handle}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Text variant="bodyMd" tone="subdued" as="span">
                        {vendor}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge tone={status === 'active' ? 'success' : 'attention'}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {new Date(updatedAtShopify).toLocaleDateString()}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Button variant="tertiary" onClick={() => window.open(`https://${decodedShop}/admin/products/${shopifyProductId}`, '_blank')}>
                        View in Shopify
                    </Button>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    if (loading && products.length === 0) {
        return (
            <Box padding="1000">
                <InlineStack align="center">
                    <ProgressBar size="small" />
                </InlineStack>
            </Box>
        );
    }

    return (
        <Page
            backAction={{ content: 'Dashboard', onAction: () => navigate('/dashboard/shopify') }}
            title="Synced Products"
            subtitle={decodedShop}
            primaryAction={
                <Button icon={RefreshIcon} onClick={fetchProducts} loading={loading}>
                    Refresh
                </Button>
            }
        >
            <Layout>
                <Layout.Section>
                    {products.length === 0 ? (
                        <Card>
                            <EmptyState
                                heading="No products yet"
                                action={{ content: 'Add Product', onAction: () => window.open('https://app.shelfmerch.com/designer', '_blank') }}
                                secondaryAction={{ content: 'Learn more', url: 'https://docs.shelfmerch.com' }}
                                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                            >
                                <p>Start by designing your first product and syncing it to your Shopify store.</p>
                            </EmptyState>
                        </Card>
                    ) : (
                        <Card padding="0">
                            <IndexTable
                                resourceName={resourceName}
                                itemCount={products.length}
                                selectedItemsCount={
                                    allResourcesSelected ? 'All' : selectedResources.length
                                }
                                onSelectionChange={handleSelectionChange}
                                headings={[
                                    { title: 'Product' },
                                    { title: 'Handle' },
                                    { title: 'Vendor' },
                                    { title: 'Status' },
                                    { title: 'Inventory' }, // Simplified for UI
                                    { title: 'Action' },
                                ]}
                            >
                                {rowMarkup}
                            </IndexTable>
                        </Card>
                    )}
                </Layout.Section>
            </Layout>
        </Page>
    );
};

export default ShopifyProducts;

