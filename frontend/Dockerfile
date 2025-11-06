# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies and install
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the rest of the source code
COPY . .

# Build the production site
RUN pnpm build

# Stage 2: Serve built files
FROM node:20-alpine
WORKDIR /app

# Install a lightweight static file server
RUN npm install -g serve

# Copy the build output from the builder stage
COPY --from=builder /app/dist/spa ./dist

# Expose the frontend port
EXPOSE 8080

# Serve the built files
CMD ["serve", "-s", "dist", "-l", "8080"]
