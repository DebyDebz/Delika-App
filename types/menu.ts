export interface Food {
  id: string;
  menuId?: string;
  name: string;
  price: number;
  description: string;
  quantity: number;
  newPrice: number;
  newQuantity: number;
  foodImage?: {
    url: string;
  };
}

export interface MenuItem {
  id: string;
  foodType: string;
  foods: Food[];
  foodTypeImage: {
    url: string;
  };
} 