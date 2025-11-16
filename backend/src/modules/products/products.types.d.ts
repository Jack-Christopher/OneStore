export interface ProductDTO {
  name: string;
  category: string;
  stock: number;
  price: number;
}

export interface ProductEntity {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
}

export interface ProductUpdateDTO {
  name?: string;
  category?: string;
  stock?: number;
  price?: number;
}
