export interface OrderFilters {
  orderStatus?: string;
  // Add other filter properties as needed
}

export enum OrderStatus {
    Assigned = 'Assigned',
    ReadyForPickup = 'ReadyForPickup',
    Pickup = 'Pickup',
    OnTheWay = 'OnTheWay',
    Delivered = 'Delivered',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
    DeliveryFailed = 'DeliveryFailed'
}

interface OrderType {
  id: string;
  orderNumber: string;
  orderStatus: string;
  totalPrice: number;
  deliveryPrice: number;
  customerName: string;
  paymentStatus: string;
  orderDate: string;
  // ... other existing properties
} 