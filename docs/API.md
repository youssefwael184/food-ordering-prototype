# API Summary

## Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Menu
- `GET /api/menu/categories`
- `GET /api/menu/items`
- `GET /api/menu/items/{id}`

## Orders
- `POST /api/orders`
- `GET /api/orders/my`
- `GET /api/orders/{id}`

## Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/orders`
- `PUT /api/admin/orders/{id}/status`
- `POST /api/admin/menu-items`
- `PUT /api/admin/menu-items/{id}`
- `DELETE /api/admin/menu-items/{id}`
- `POST /api/admin/upload-image`

## Seed Accounts
- Admin: `admin@foodapp.com` / `Admin123!`
- Customer: `customer@foodapp.com` / `Customer123!`

