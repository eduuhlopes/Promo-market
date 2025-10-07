export interface ProductPrice {
  supermarket: string;
  price: number;
  promotion: string | null;
  supermarketLogoUrl: string;
  supermarketWebsite: string;
  productUrl: string;
  address?: string;
  openingHours?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  prices: ProductPrice[];
}

export enum View {
  SEARCH = 'SEARCH',
  LIST = 'LIST',
}