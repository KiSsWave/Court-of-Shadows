FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY server/ ./server/
COPY shared/ ./shared/
COPY public/ ./public/

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "server/server.js"]