# Multi-stage Docker build for SmartDine (Frontend + Backend + Gemini AI)
FROM node:20-alpine AS build

WORKDIR /app

# Install frontend dependencies
COPY package*.json ./
RUN npm install

# Build frontend
COPY . .
RUN npm run build

# Setup backend
WORKDIR /app/backend
RUN npm install --production

# Final Production Image
FROM node:20-alpine

WORKDIR /app

# Copy built frontend assets
COPY --from=build /app/dist ./dist

# Copy backend application
COPY --from=build /app/backend ./backend

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]
