# =========================
# 🚀 Stage 1 – Build Stage
# =========================
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory inside container
WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the frontend files
COPY . .

# Build the frontend for production
RUN pnpm run build:client

# =========================
# 🌐 Stage 2 – Production Stage
# =========================
FROM node:20-alpine

# Install a lightweight static server
RUN npm install -g serve

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port 5174 (you can change this to 80 if preferred)
EXPOSE 5174

# Run the static server
CMD ["serve", "-s", "dist/spa", "-l", "5174"]

