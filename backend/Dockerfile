FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install --only=production
COPY . .

EXPOSE 4000
CMD ["node", "dist/server.js"]
