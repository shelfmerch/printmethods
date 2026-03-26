/**
 * Product Categories and Subcategories Configuration
 * 
 * This file defines all valid categories and subcategories for products.
 * Field definitions for each category/subcategory combination will be defined
 * in a separate configuration file.
 */

const CATEGORIES = {
  apparel: {
    id: 'apparel',
    name: 'Apparel',
    subcategories: [
      'T-Shirt',
      'Hoodies',
      'Sweatshirts',
      'Jackets',
      'Oversized'
    ]
  },
  accessories: {
    id: 'accessories',
    name: 'Accessories',
    subcategories: [
      'Tote Bags',
      'Caps',
      'Hand Fans',
      // 'Gaming Pads',
      'Beanies',
      // 'Socks',
      'Backpacks'
    ]
  },
  home: {
    id: 'home',
    name: 'Home & Living',
    subcategories: [
      'Kitchen Accessories',
      'Mugs',
      'Cushions',
      'Frames',
      'Coasters',
      'Bottles',
    ]
  },
  print: {
    id: 'print',
    name: 'Print',
    subcategories: [
      'Business Cards',
      'Books',
      'ID Cards',
      'Stickers',
      'Posters',
      'Notebook'
    ]
  },
  packaging: {
    id: 'packaging',
    name: 'Packaging',
    subcategories: [
      'Box',
      'Pouch'
    ]
  },
  tech: {
    id: 'tech',
    name: 'Tech',
    subcategories: [
      'Phone Covers',
      'Cable Card',
      'Bluetooth Speaker',
      'Wireless Charger',
      'Mouse Pad'
    ]
  },
  jewelry: {
    id: 'jewelry',
    name: 'Jewelry',
    subcategories: [
      'Ring',
      'Necklace',
      'Earring'
    ]
  }
};

/**
 * Get all valid category IDs
 */
const getCategoryIds = () => Object.keys(CATEGORIES);

/**
 * Get subcategories for a given category
 */
const getSubcategories = (categoryId) => {
  const category = CATEGORIES[categoryId];
  return category ? category.subcategories : [];
};

/**
 * Check if a category ID is valid
 */
const isValidCategory = (categoryId) => {
  return categoryId in CATEGORIES;
};

/**
 * Check if a subcategory is valid for a given category
 */
const isValidSubcategory = (categoryId, subcategory) => {
  const subcategories = getSubcategories(categoryId);
  return subcategories.includes(subcategory);
};

/**
 * Normalize subcategory name to a consistent format
 * This can be used to convert display names to internal IDs if needed
 */
const normalizeSubcategory = (subcategory) => {
  // For now, keep as-is. Can be extended to normalize to IDs like "t_shirt" if needed
  return subcategory;
};

module.exports = {
  CATEGORIES,
  getCategoryIds,
  getSubcategories,
  isValidCategory,
  isValidSubcategory,
  normalizeSubcategory
};


