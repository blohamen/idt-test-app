FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json backend/tsconfig.json ./
RUN npm install

COPY backend/src/ ./src/
# Copy mock data directory for standalone seed script execution
COPY mock/ ./mock/

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]
