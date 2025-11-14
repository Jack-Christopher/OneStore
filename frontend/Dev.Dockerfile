# Development Dockerfile for OneStore Frontend
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# The rest of the code will be mounted as a volume
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
