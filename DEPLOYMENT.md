# SmartDine – Deployment Guide 🚀

SmartDine is built as a complete full-stack web application:
- **Frontend**: React 19 + Vite (built to `dist/`)
- **Backend**: Node.js + Express (serving REST APIs + static React build)
- **AI**: Google Gemini API integration via `@google/genai`
- **Database**: MongoDB (Mongoose) with automatic resilient in-memory fallback

---

## ⚡ Option 1: Deploy to Render.com (Recommended – 100% Free Full-Stack)

Render allows you to host both the React frontend and Node.js backend together as a single Web Service on a free public `https://*.onrender.com` URL.

### Step-by-Step:
1. Push your code to your **GitHub** repository (`krishpatel2710/smartdine`).
2. Sign in to [Render.com](https://render.com) with GitHub and click **New + > Web Service**.
3. Select your GitHub repository (`smartdine`).
4. Fill in the service details:
   - **Name**: `smartdine`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Build Command**:
     ```bash
     npm install && npm run build && cd backend && npm install
     ```
   - **Start Command**:
     ```bash
     node backend/server.js
     ```
5. In **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `GEMINI_API_KEY` = `YOUR_GEMINI_API_KEY`
   - `JWT_SECRET` = `smartdine_production_secret_key_2026`
   - `MONGODB_URI` = `mongodb+srv://...` (or leave unset to use resilient in-memory mode)
6. Click **Deploy Web Service**!
   Render will build the Vite app, start the Express server, and provide your live HTTPS URL (e.g. `https://smartdine.onrender.com`).

*(Note: The pre-configured [render.yaml](./render.yaml) is already included in your project root.)*

---

## 🌐 Option 2: Deploy Frontend on Vercel

If you prefer hosting the React frontend on Vercel:
1. Push your project to **GitHub**.
2. Go to [Vercel.com](https://vercel.com) and import the repository.
3. Vercel automatically detects Vite:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com/api` (if backend is on Render) or leave default if using relative `/api`.
5. Click **Deploy**!
   *(The included [vercel.json](./vercel.json) handles client-side SPA routing rewrites automatically).*

---

## 📱 Option 3: Instant Live Access on Your Local Wi-Fi (Phone, Tablet, PC)

Your production server can run locally and be accessed by any smartphone or device connected to your Wi-Fi network:

1. Find your computer's local IP address.
2. Ensure port 5000 is accessible.
3. Open any browser on your phone or tablet and visit `http://<YOUR_LOCAL_IP>:5000`.
4. You can scan table QR codes, chat with the movable Burger AI assistant, and test checkout live from your phone!

---

## 🐳 Option 4: Deploy with Docker Container

A multi-stage production [Dockerfile](./Dockerfile) is provided in the project root.

### Build and Run:
```bash
# 1. Build the Docker image
docker build -t smartdine:latest .

# 2. Run the container
docker run -d -p 5000:5000 \
  -e GEMINI_API_KEY="YOUR_GEMINI_API_KEY" \
  -e NODE_ENV="production" \
  --name smartdine-app smartdine:latest
```
Then visit `http://localhost:5000`.

---

## 📋 Production Environment Variables Reference

| Variable | Description | Recommended Value |
|---|---|---|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server listening port | `5000` (or `10000` on Render) |
| `GEMINI_API_KEY` | Google Gemini API key | Get from Google AI Studio |
| `JWT_SECRET` | Secret token encryption key | Any strong random string |
| `MONGODB_URI` | MongoDB Connection URI | `mongodb://127.0.0.1:27017/smartdine` or MongoDB Atlas URI |
