import axios from "axios";

// Определяем интерфейсы для типизации
export interface UserData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CartItemData {
  userId: string;
  productId: string;
  img1: string;
  title: string;
  price: number;
  quantity: number;
  size: string;
}

export interface OrderData {
  userId: string;
  products: unknown[];
  totalPrice: number;
  shippingAddress: string;
  paymentStatus: string;
  orderStatus: string;
}

const api = axios.create({
  //baseURL: "https://edgistify-assignment.vercel.app/api",
  baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const signup = async (userData: UserData) => {
  return await api.post("/users/register", userData);
};

export const login = async (credentials: LoginCredentials) => {
  return await api.post("/users/login", credentials);
};

export const getProducts = async () => {
  return await api.get("/products");
};

export const getProductById = async (id: string) => {
  return await api.get(`/products/${id}`);
};

export const addToCart = async (cartItems: CartItemData) => {
  return await api.post("/cart/add", cartItems);
};

export const getCartItems = async () => {
  return await api.get("/cart");
};

export const deleteCartItem = async (itemId: string) => {
  return await api.delete(`/cart/remove/${itemId}`);
};

export const createOrder = async (orderData: OrderData) => {
  return await api.post("/orders/create", orderData);
};

export const getOrder = async () => {
  return await api.get("/orders/get");
};

export default api;
