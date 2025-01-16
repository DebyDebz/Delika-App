declare global {
    var userData: any;
    var refreshOrders: (() => void) | undefined;
    var selectedDate: Date;
    var ordersData: any;
}

export {};