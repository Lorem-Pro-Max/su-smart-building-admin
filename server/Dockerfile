# Use the same Node version as your frontend for consistency
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 8124

CMD ["node", "server.js"]