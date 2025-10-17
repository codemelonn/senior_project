# ============================
#   FRONTEND BUILD STAGE
# ============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# ✅ Build ONLY the client side (skip the nonexistent server build)
RUN pnpm run build:client

# ============================
#   PRODUCTION SERVER STAGE
# ============================
FROM node:20-alpine AS runner

WORKDIR /app

# Copy the built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Install a lightweight static file server
RUN npm install -g serve

# Expose port 8080
EXPOSE 8080

# Serve the built frontend
CMD ["serve", "-s", "dist/spa", "-l", "8080"]
