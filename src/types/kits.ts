export interface KitProduct {
  _id: string;
  name: string;
  description?: string;
  basePrice: number;
  categoryId?: string;
  subcategoryIds?: string[];
  fulfillmentType?: 'print_on_demand' | 'inventory';
  productionHours?: number;
  sampleAvailable?: boolean;
  stocks?: {
    minimumQuantity?: number;
  };
  variants?: Array<{
    _id?: string;
    size?: string;
    color?: string;
    colorHex?: string;
    isActive?: boolean;
    stockStatus?: string;
  }>;
  availableSizes?: string[];
  availableColors?: string[];
  galleryImages?: Array<{ url: string; isPrimary?: boolean }>;
  design?: {
    physicalDimensions?: {
      width?: number;
      height?: number;
    };
    views?: Array<{
      key: string;
      mockupImageUrl: string;
      placeholders?: Array<{
        xIn?: number;
        yIn?: number;
        widthIn?: number;
        heightIn?: number;
        rotationDeg?: number;
      }>;
    }>;
  };
}

export interface KitItem {
  catalogProductId: string | KitProduct;
  uploadedLogoUrl: string;
}

export interface KitPackaging {
  mode: 'none' | 'catalog_product';
  catalogProductId?: string | KitProduct;
  branding: 'none' | 'logo' | 'custom';
  notes?: string;
}

export interface Kit {
  _id: string;
  brandId: string;
  name: string;
  status: 'draft' | 'live' | 'archived';
  items: KitItem[];
  packaging?: KitPackaging;
  sampleRequested?: boolean;
  createdAt: string;
  updatedAt: string;
  lastSentAt?: string | null;
}

export interface KitSendStats {
  total: number;
  pending: number;
  redeemed: number;
  closed: number;
}

export interface KitSend {
  _id: string;
  kitId: string | Kit;
  brandId: string;
  deliveryMode: 'redeem' | 'surprise' | 'single_location';
  fromName: string;
  message: string;
  sendInviteAt: 'immediate' | 'scheduled';
  scheduledAt?: string;
  recipientCount: number;
  recipientEmails?: string[];
  singleLocationQuantity?: number;
  singleLocationType?: 'office' | 'event' | 'other';
  singleLocationAddress?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  singleLocationNotes?: string;
  singleLocationSelections?: Array<{
    catalogProductId: string;
    color?: string;
    size?: string;
    quantity: number;
  }>;
  itemsCostPerRecipient: number;
  packagingCost?: number;
  serviceFee: number;
  tax?: number;
  total: number;
  overageItems: Array<{ catalogProductId: string; overageQty: number }>;
  status: 'pending_payment' | 'paid' | 'invites_sent' | 'partially_redeemed' | 'completed' | 'closed';
  payment?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  createdAt: string;
}

export interface KitRedemption {
  _id: string;
  kitSendId: any;
  brandId: string;
  recipientEmail?: string;
  recipientName?: string;
  token: string;
  status: 'pending' | 'redeemed' | 'closed';
  selectedItems: Array<{
    catalogProductId: string;
    color?: string;
    size?: string;
    quantity: number;
  }>;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    address1?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  redeemedAt?: string;
}
