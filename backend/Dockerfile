# Stage 1: Build frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json frontend/tsconfig.json frontend/vite.config.ts frontend/index.html ./
RUN npm install
COPY frontend/src/ ./src/
RUN npm run build

# Stage 2: Build and run unified application
FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json backend/tsconfig.json ./
RUN npm install
COPY backend/src/ ./src/
COPY mock/ ./mock/
RUN npm run build

# Copy compiled frontend assets for Express static hosting
COPY --from=frontend-builder /app/frontend/dist ./public/

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/server.js"]
