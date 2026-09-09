export interface UserInput {
  name: string;
  email: string;
  password: string;
}

export interface CategoryInput {
  name: string;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  categoryId: string;
}

export interface OrderProductInput {
  productId: string;
  quantity: number;
}

export interface OrderInput {
  userId: string;
  products: OrderProductInput[];
}

export interface ValidatedRequestData {
  body?: unknown;
  params?: unknown;
  query?: unknown;
}

declare global {
  namespace Express {
    interface Request {
      validated?: ValidatedRequestData;
    }
  }
}
