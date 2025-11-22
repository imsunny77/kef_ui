# Mini Order & Payment System - Frontend

A React-based e-commerce frontend application for the Mini Order & Payment System. This application provides a complete shopping experience with product browsing, cart management, order placement, and Stripe payment integration.

## Features

- **User Authentication**: Registration and login with JWT token management
- **Product Management**: Browse products with category filtering and search
- **Shopping Cart**: Add, update, and remove items with server-side cart synchronization
- **Order Management**: Create orders, view order history, and track order status
- **Payment Integration**: Stripe payment processing with secure checkout
- **User Profile**: Update profile information and change password
- **Reports Dashboard**: Admin view for order and revenue statistics (admin only)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend repository for setup)
- Stripe account (for payment processing)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kef_ui
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Environment Variables

### Required Variables

- `VITE_API_BASE_URL`: Base URL for the backend API (default: `http://localhost:8000/api/v1`)
- `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key for payment processing

### Getting Your Stripe Publishable Key

1. Sign up or log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Paste it in your `.env` file

**Note**: Use test mode keys for development. Never commit your actual keys to version control.

## Running the Project

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:5173` (or the next available port).

### Production Build

```bash
npm run build
```

The production build will be created in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── common/      # Common components (ErrorBoundary)
│   └── Layout/      # Layout components (AppLayout, ProtectedRoute, AdminRoute)
├── contexts/        # React Context providers (AuthContext, CartContext)
├── pages/           # Page components
│   ├── Auth/        # Login, Register, Profile
│   ├── Cart/        # Shopping cart
│   ├── Orders/      # Order checkout, history, success
│   ├── Products/    # Product list and detail
│   └── Reports/     # Reports dashboard (admin only)
├── services/        # API service functions
├── styles/          # Theme and styling
└── utils/           # Utility functions and constants
```

## API Integration

The frontend communicates with the backend API at the base URL specified in `VITE_API_BASE_URL`. All API requests are authenticated using JWT tokens stored in localStorage.

### API Endpoints Used

- **Authentication**: `/api/v1/auth/register/`, `/api/v1/auth/login/`, `/api/v1/auth/profile/`
- **Products**: `/api/v1/products/`, `/api/v1/products/{id}/`
- **Cart**: `/api/v1/cart/`, `/api/v1/cart/items/{id}/`, `/api/v1/cart/checkout/`
- **Orders**: `/api/v1/orders/`, `/api/v1/orders/{id}/`, `/api/v1/orders/{id}/create-payment/`, `/api/v1/orders/{id}/confirm-payment/`
- **Reports**: `/api/v1/reports/summary/` (admin only)

See `urls.md` for complete API documentation.

## Testing Payment Flow

1. **Start the backend server** (ensure it's running on the configured API base URL)

2. **Start the frontend**:
```bash
npm run dev
```

3. **Register/Login** as a customer

4. **Browse products** and add items to cart

5. **Proceed to checkout**:
   - Click "Proceed to Checkout" from the cart
   - Enter shipping and billing addresses
   - Click "Continue to Payment"

6. **Complete payment**:
   - Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date (e.g., 12/34)
   - Any 3-digit CVC (e.g., 123)
   - Any ZIP code (e.g., 12345)

7. **View order success**:
   - After successful payment, you'll see the order confirmation page
   - CRM sync status will be displayed if the backend has synced the order

## User Types

### Customer
- Register and login
- Browse and search products
- Add products to cart
- Create orders and make payments
- View order history
- Manage profile

### Admin
- All customer features
- Access to reports dashboard
- View order statistics and revenue

**Note**: Admin users are created via Django admin panel. No admin UI is provided in the React frontend.

## CRM Integration

After successful payment, the backend automatically syncs order details to an external CRM API. The CRM sync status is displayed on the order success page:
- **Success**: Order successfully synced to CRM
- **Failed**: CRM sync failed (order still completed)
- **Pending**: CRM sync in progress

## Technologies Used

- **React 19**: UI library
- **Vite**: Build tool and dev server
- **React Router DOM**: Client-side routing
- **Ant Design**: UI component library
- **Axios**: HTTP client for API requests
- **Stripe.js**: Payment processing
- **Styled Components**: CSS-in-JS styling

## Development Notes

- JWT tokens are stored in localStorage
- Token refresh is handled automatically via axios interceptors
- Cart state is synchronized with the backend API
- All routes are protected except login and registration
- Admin routes require admin user type

## Troubleshooting

### API Connection Issues
- Verify the backend server is running
- Check `VITE_API_BASE_URL` in `.env` matches your backend URL
- Ensure CORS is properly configured on the backend

### Payment Issues
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set correctly
- Use Stripe test mode keys for development
- Check browser console for error messages

### Authentication Issues
- Clear localStorage if experiencing token issues
- Ensure backend token refresh endpoint is working
- Check token expiration settings

## License

This project is part of the Mini Order & Payment System.
