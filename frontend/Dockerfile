# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY frontend/package*.json frontend/tsconfig.json frontend/vite.config.ts frontend/index.html ./
RUN npm install

COPY frontend/src/ ./src/
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
