# ----------------------------
# Stage 1: Base (基礎設施)
# ----------------------------
FROM node:20-slim AS base
WORKDIR /app

# 更新 npm 並安裝必要的系統憑證與套件
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g npm@latest

# ----------------------------
# Stage 2: Development (開發環境)
# ----------------------------
FROM base AS development
ENV NODE_ENV=development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ----------------------------
# Stage 3: Builder (生產環境套件打包)
# ----------------------------
FROM base AS builder
COPY package*.json ./
# 🔑 自動判斷使用 npm ci 或 npm install，僅安裝生產所需套件
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
COPY . .

# ----------------------------
# Stage 4: Production (最終生產映像檔)
# ----------------------------
FROM base AS production
ENV NODE_ENV=production

# 從 builder 階段複製乾淨的 node_modules
COPY --from=builder /app/node_modules ./node_modules
# 複製原始碼
COPY . .

EXPOSE 8080
CMD ["npm", "start"]
