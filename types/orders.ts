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