# QuickFit API

QuickFit is a wardrobe organizer and outfit design application.

## Requirements

- Node.js
- MongoDB

## Setup

1. Open a terminal inside the server directory.
2. Run npm install.
3. Create a .env file with MONGODB_URI, JWT_SECRET, and PORT.
4. Start the development server using npm run dev.

## API

- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/items
- POST /api/items
- GET /api/items/:id
- PUT /api/items/:id
- DELETE /api/items/:id
- GET /api/outfits
- POST /api/outfits
- GET /api/outfits/:id
- PUT /api/outfits/:id
- DELETE /api/outfits/:id
- POST /api/outfits/:id/wear
- GET /api/stats

All endpoints except health, register, and login require a JWT bearer token.

## Architecture

- Routes define endpoints.
- Controllers handle HTTP requests and responses.
- Services implement application logic.
- Models define MongoDB schemas.
- Middleware handles authentication and errors.
- Config contains database setup.