# Setup

1. Start PostgreSQL:
   - `docker compose up -d`

2. Run backend:
   - `cd backend`
   - `dotnet restore`
   - `dotnet run --project src/FoodOrdering.Api`

3. Run frontend:
   - `cd frontend`
   - `npm install`
   - copy `.env.example` to `.env`
   - `npm run dev`

4. Open:
   - Frontend: `http://localhost:5173`
   - Swagger: `http://localhost:5288/swagger`

