# ----------------------------
# Stage 1: Base
# ----------------------------
FROM node:20-slim AS base
WORKDIR /app
# Update npm to latest just in case
RUN npm install -g npm@latest
# Install basic system libs if needed (often required for certain node modules)
RUN apt-get update -y && apt-get install -y openssl

# ----------------------------
# Stage 2: Development
# Used for local docker-compose
# ----------------------------
FROM base AS development
ENV NODE_ENV=development
COPY package*.json ./
# Install ALL dependencies (including devDependencies like nodemon)
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ----------------------------
# Stage 3: Builder
# Used to prepare clean production node_modules
# ----------------------------
FROM base AS builder
COPY package*.json ./
# Install ONLY production dependencies
RUN npm ci --omit=dev

# ----------------------------
# Stage 4: Production
# The final image for deployment
# ----------------------------
FROM base AS production
ENV NODE_ENV=production
# Copy clean node_modules from builder
COPY --from=builder /app/node_modules ./node_modules
# Copy source code
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
