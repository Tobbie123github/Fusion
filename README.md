# Fusion — Ecommerce Frontend

A modern, production-grade React ecommerce frontend for Fusion Clothing.

## Stack

- **React 18** + **React Router v6**
- **Framer Motion** — page transitions & micro-animations
- **Zustand** — global state (auth, cart, theme) with persistence
- **Axios** — API client with automatic JWT injection
- **Tailwind CSS** — utility-first styling
- **react-hot-toast** — toast notifications
- **lucide-react** — icons

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure your backend URL
```bash
cp .env.example .env
```
Edit `.env`:
```
VITE_API_URL=http://localhost:8080
```

### 3. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for production
```bash
npm run build
```

---

## Project Structure

```
src/
├── api/
│   ├── index.js        # All API calls mapped to your Go routes
│   └── mockData.js     # Fallback mock products for dev
├── components/
│   ├── Navbar.jsx      # Sticky nav with theme switcher & cart badge
│   ├── ProductCard.jsx # Animated product card with hover actions
│   ├── Footer.jsx      # Site footer
│   └── UI.jsx          # Reusable: Button, Input, Card, Spinner, etc.
├── context/
│   └── store.js        # Zustand stores: auth, cart, theme
├── pages/
│   ├── Home.jsx        # Landing page with hero, featured, CTA
│   ├── Shop.jsx        # Filterable product grid
│   ├── ProductDetail.jsx # Product page with size/qty selector
│   ├── Cart.jsx        # Cart with live totals
│   ├── Checkout.jsx    # 2-step checkout → payment redirect
│   ├── Orders.jsx      # Order history with pay-now button
│   ├── Auth.jsx        # Login & Register
│   ├── About.jsx       # Brand story
│   └── NotFound.jsx    # 404
├── App.jsx             # Routes + protected routes
├── main.jsx            # Entry point
└── index.css           # Tailwind + CSS variables for 4 themes
```

---

## Backend Routes Used

| Route | Method | Auth | Usage |
|-------|--------|------|-------|
| `/register` | POST | ✗ | Register |
| `/login` | POST | ✗ | Login |
| `/products` | GET | ✗ | Shop / Home featured |
| `/products/:id` | GET | ✗ | Product detail |
| `/cart/all` | GET | ✓ | Load cart (on login) |
| `/cart` | POST | ✓ | Add to cart |
| `/cart/:productId` | DELETE | ✓ | Remove item |
| `/cart/delete` | DELETE | ✓ | Clear cart |
| `/order/create` | POST | ✓ | Place order (checkout) |
| `/orders` | GET | ✓ | Order history page |
| `/order/:id` | GET | ✓ | Single order |
| `/order/delete/:id` | DELETE | ✓ | Cancel order |
| `/payments/initiate/:id` | POST | ✓ | Initiate payment (expects `paymentUrl` in response) |
| `/payments` | GET | ✓ | Payment history |
| `/payment/:id` | GET | ✓ | Single payment |

---

## Themes

Four built-in themes, switchable via the navbar dot button:

| Theme | Style |
|-------|-------|
| **Obsidian** | Dark luxury — charcoal + warm sand |
| **Ivory** | Clean light — off-white + jet black |
| **Midnight** | Blue dark — deep navy + sky blue |
| **Sage** | Earthy light — sage green + forest |

Theme preference is saved to `localStorage` automatically.

---

## Payment Integration

The checkout hits `POST /payments/initiate/:orderId` and expects a response with `paymentUrl` (or `authorization_url` for Paystack):

```json
{
  "data": {
    "paymentUrl": "https://paystack.com/pay/..."
  }
}
```

The frontend will redirect the user to this URL. After payment, redirect back to `/orders`.

---

## Adding Real Product Images

In `ProductCard.jsx` and `ProductDetail.jsx`, replace `<ProductPlaceholder />` with:
```jsx
<img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
```
