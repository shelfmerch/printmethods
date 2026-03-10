import React from 'react';
import { TopBar, ActionList, Icon, Text } from '@shopify/polaris';
import { QuestionCircleIcon, OrderIcon, PersonIcon } from '@shopify/polaris-icons';

interface ShopifyHeaderProps {
    shop: string;
}

export const ShopifyHeader: React.FC<ShopifyHeaderProps> = ({ shop }) => {
    const userMenuMarkup = (
        <TopBar.UserMenu
            actions={[
                {
                    items: [{ content: 'Account', icon: PersonIcon }],
                },
            ]}
            name="Merchant"
            detail={shop}
            initials="M"
            open={false}
            onToggle={() => { }}
        />
    );

    const searchFieldMarkup = (
        <TopBar.SearchField
            onChange={() => { }}
            value=""
            placeholder="Search"
            focused={false}
            onBlur={() => { }}
            onFocus={() => { }}
        />
    );

    const secondaryMenuMarkup = (
        <TopBar.Menu
            activatorContent={
                <span>
                    <Icon source={QuestionCircleIcon} />
                    <Text as="span" variant="bodyMd" fontWeight="medium">
                        Help
                    </Text>
                </span>
            }
            open={false}
            onOpen={() => { }}
            onClose={() => { }}
            actions={[
                {
                    items: [
                        { content: 'Documentation', icon: OrderIcon },
                        { content: 'Help Center', icon: QuestionCircleIcon },
                    ],
                },
            ]}
        />
    );

    return (
        <TopBar
            userMenu={userMenuMarkup}
            secondaryMenu={secondaryMenuMarkup}
            searchField={searchFieldMarkup}
        />
    );
};
