import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Always attach Bearer token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("fusion_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("fusion_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => client.post("/register", data).then((r) => r.data),
  login: (data) => client.post("/login", data).then((r) => r.data),
};

// ─── PRODUCTS ─────────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll:  ()         => client.get('/products').then(r => r.data),
  getById: (id)       => client.get(`/products/${id}`).then(r => r.data),
  create:  (formData) => client.post('/admin/product', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data),
  update:  (id, formData) => client.put(`/admin/update-product/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data),
  delete:  (id) => client.delete(`/admin/delete-product/${id}`).then(r => r.data),
}

// ─── CART ─────────────────────────────────────────────────────────────────────
export const cartAPI = {
  getAll: () => client.get("/cart/all").then((r) => r.data),
  addItem: (product_id, user_id, quantity, size) =>
    client
      .post("/cart", { product_id, user_id, quantity, size })
      .then((r) => r.data),
  removeItem: (productId) =>
    client.delete(`/cart/${productId}`).then((r) => r.data),
  clearAll: () => client.delete("/cart/delete").then((r) => r.data),
};

// ─── ORDERS ───────────────────────────────────────────────────────────────────
export const ordersAPI = {
  getAll: () => client.get("/orders").then((r) => r.data),
  getAllAdmin: () => client.get("/admin/all/orders").then((r) => r.data), // ← add
  getById: (id) => client.get(`/order/${id}`).then((r) => r.data),
  create: (d) => client.post("/order/create", d).then((r) => r.data),
  delete: (id) => client.delete(`/order/delete/${id}`).then((r) => r.data),
};

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  getAll: () => client.get("/payments").then((r) => r.data),
  getById: (id) => client.get(`/payment/${id}`).then((r) => r.data),
  initiate: (id, email) =>
    client.post(`/payment/initiate/${id}`, { email }).then((r) => r.data),
  verify: (reference) =>
    client.get(`/payment/verify/${reference}`).then((r) => r.data),
  getAllAdmin: () => client.get("/admin/all/payments").then((r) => r.data), // ← add
};

export default client;
