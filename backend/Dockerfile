# Efficient Production Dockerfile for NestJS Backend on AWS EC2
FROM node:22-slim
WORKDIR /app

# Step 1: Install dependencies (runs npm ci ONCE)
COPY package*.json ./
RUN npm ci

# Step 2: Copy source code and build NestJS via SWC compiler
COPY . .
RUN npm run build

# Step 3: Remove devDependencies for production runtime
RUN npm prune --production

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/main.js"]
