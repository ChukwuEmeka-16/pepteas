export type ProductVariant = {
  dose: string;
  price: number; // in Naira
};

export type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  variants: ProductVariant[];
};

export type CartItem = {
  key: string; // productId + dose
  productId: string;
  name: string;
  dose: string;
  price: number;
  qty: number;
};

export type Transaction = {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: "completed" | "pending" | "processing";
};

export type UserProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  dateOfBirth: string;
  registeredAt: string;
};



export type Page = "home" | "products" | "profile" | "history" | "admin" | "login" | "register";
