# QuickFit Prototype

A simple full-stack wardrobe organizer and outfit designer.

## Included
- Register and log in (JWT authentication)
- Add, view, edit, and delete wardrobe items
- Take a clothing photo or choose one from the photo library
- Categorize clothing items and add tags
- Create, edit, view, categorize, and delete outfits
- Record outfit wear history and view basic statistics

## Stack
- Client: React Native, Expo, React Navigation
- Server: Node.js, Express, MongoDB/Mongoose
- Auth: bcryptjs + JSON Web Tokens

## 1. Server setup

Open a terminal in `server/`:

```bash
npm install
cp .env.example .env
```

Edit `.env` and set `MONGODB_URI` to your MongoDB connection string and a private `JWT_SECRET`.

```bash
npm run dev
```

The API runs on port 5000 by default.

### MongoDB Atlas
Use the Atlas connection string in `MONGODB_URI`. Ensure your IP is allowed in Atlas Network Access and the database user has access. Never commit `.env`.

## 2. Client setup

Open a second terminal in `client/`:

```bash
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` in `client/.env` to the API address reachable from the device:
- iOS Simulator: `http://localhost:5000/api`
- Android Emulator: `http://10.0.2.2:5000/api`
- Physical phone using Expo Go: `http://YOUR_COMPUTER_LAN_IP:5000/api`

Example `client/.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.25:5000/api
```

Your phone and computer should be on the same Wi-Fi. The server must be running. Find your Mac's LAN IP in System Settings > Wi-Fi > Details, or run `ipconfig getifaddr en0`.

## 3. Existing folders

If your repo already has a `client/` and `server/`, copy the generated files into the matching folders. Keep your real `.env` file; use `.env.example` as a template. This prototype's client is configured with Expo's `App.js` entry point.

## API routes

All routes except `/api/auth/register` and `/api/auth/login` require `Authorization: Bearer <token>`.

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET|POST /api/items`
- `GET|PUT|DELETE /api/items/:id`
- `GET|POST /api/outfits`
- `GET|PUT|DELETE /api/outfits/:id`
- `POST /api/outfits/:id/wear`
- `GET /api/stats`

## Prototype notes
Image picker results are stored as device-local image URIs, not uploaded to cloud storage. Images may not appear on another device or after the OS removes the local file. A later version can add image uploads. This intentionally excludes future-scope features such as automatic background removal, clothing recognition, recommendations, social sharing, and weather integration.
