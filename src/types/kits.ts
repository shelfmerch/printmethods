export interface KitProduct {
  _id: string;
  name: string;
  description?: string;
  basePrice: number;
  fulfillmentType?: 'print_on_demand' | 'inventory';
  productionHours?: number;
  stocks?: {
    minimumQuantity?: number;
  };
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
      }>;
    }>;
  };
}

export interface KitItem {
  catalogProductId: string | KitProduct;
  uploadedLogoUrl: string;
}

export interface Kit {
  _id: string;
  brandId: string;
  name: string;
  status: 'draft' | 'live' | 'archived';
  items: KitItem[];
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
  deliveryMode: 'redeem' | 'surprise';
  fromName: string;
  message: string;
  sendInviteAt: 'immediate' | 'scheduled';
  scheduledAt?: string;
  recipientCount: number;
  recipientEmails?: string[];
  itemsCostPerRecipient: number;
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
