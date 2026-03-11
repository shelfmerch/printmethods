import React from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { AppProvider, Frame } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import '@shopify/polaris/build/esm/styles.css';
import { ShopifyHeader } from './ShopifyHeader';

interface ShopifyLayoutProps {
    children: React.ReactNode;
}

export const ShopifyLayout: React.FC<ShopifyLayoutProps> = ({ children }) => {
    const [searchParams] = useSearchParams();
    const { shop: urlShop } = useParams<{ shop: string }>();

    // Try to get shop from URL params, then search params
    const shop = urlShop || searchParams.get('shop') || 'Store';

    return (
        <AppProvider i18n={enTranslations}>
            <Frame topBar={<ShopifyHeader shop={decodeURIComponent(shop)} />}>
                <div style={{ backgroundColor: 'var(--p-color-bg-surface-secondary)', minHeight: '100vh', paddingBlockEnd: '400px' }}>
                    {children}
                </div>
            </Frame>
        </AppProvider>
    );
};
