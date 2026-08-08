# Production Dockerfile for NestJS Backend with Playwright & Camoufox support
FROM node:22-slim

# Install Linux system dependencies required by Chromium (Playwright) and Firefox (Camoufox / libgtk-3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdbus-glib-1-2 \
    libdrm2 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc-s1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxtst6 \
    libxt6 \
    libxkbcommon0 \
    wget \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Step 1: Install npm dependencies
COPY package*.json ./
RUN npm ci

# Step 2: Install Playwright & Camoufox browser binaries inside container
ENV PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright
RUN npx playwright install chromium firefox

# Step 3: Copy source code and build NestJS
COPY . .
RUN npm run build

# Step 4: Environment settings
ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/main.js"]
