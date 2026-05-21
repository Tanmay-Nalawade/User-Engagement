FROM node:20-alpine AS base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

COPY app.js ./
COPY config ./config
COPY routes ./routes

ENV NODE_ENV=production
EXPOSE 8080

USER node

CMD ["node", "app.js"]
