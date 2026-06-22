# Architecture Overview

## Backend
- `FoodOrdering.Domain`: entities and enums
- `FoodOrdering.Application`: DTOs, interfaces, and business services
- `FoodOrdering.Infrastructure`: EF Core `DbContext`, PostgreSQL configuration, JWT token generation, image upload storage, seeding
- `FoodOrdering.Api`: controllers, middleware, program startup

## Frontend
- React app with routing, auth/cart contexts, i18n, responsive layout, admin pages, and customer ordering pages

## Database
- `Users`
- `Categories`
- `MenuItems`
- `Orders`
- `OrderItems`
- `OrderStatusHistories`

## Language Support
- Frontend uses `react-i18next`
- Language switcher persists `en` / `ar`
- `dir` is switched between `ltr` and `rtl`

