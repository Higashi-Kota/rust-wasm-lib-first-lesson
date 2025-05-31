# Multi-stage build for Rust WASM + React application
FROM rust:1.86-slim as rust-builder

# Install system dependencies for Rust/WASM build
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install wasm-pack
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Set working directory
WORKDIR /app

# Copy Rust workspace configuration
COPY Cargo.toml Cargo.lock ./
COPY rust-toolchain.toml ./

# Add WASM target
RUN rustup target add wasm32-unknown-unknown

# Copy WASM source code
COPY packages/crates/ ./packages/crates/

# Build WASM packages with locked dependencies
RUN wasm-pack build packages/crates/wasm-math --target web --scope internal --release && \
    wasm-pack build packages/crates/wasm-text --target web --scope internal --release && \
    wasm-pack build packages/crates/wasm-utils --target web --scope internal --release

# Node.js build stage
FROM node:22.11.0-slim as node-builder

# Install pnpm
RUN npm install -g pnpm@10.11.0

# Set working directory
WORKDIR /app

# Copy package configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/app/package.json ./packages/app/
COPY packages/utils/package.json ./packages/utils/
COPY packages/shared-config/package.json ./packages/shared-config/

# Copy shared configuration
COPY packages/shared-config/ ./packages/shared-config/

# Copy WASM packages from rust-builder stage
COPY --from=rust-builder /app/packages/crates/wasm-math/pkg/ ./packages/crates/wasm-math/pkg/
COPY --from=rust-builder /app/packages/crates/wasm-text/pkg/ ./packages/crates/wasm-text/pkg/
COPY --from=rust-builder /app/packages/crates/wasm-utils/pkg/ ./packages/crates/wasm-utils/pkg/

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/utils/ ./packages/utils/
COPY packages/app/ ./packages/app/

# Build utils package
RUN pnpm --filter @internal/utils build

# Build React application
RUN pnpm --filter app build

# Production runtime stage
FROM node:22.11.0-alpine as runtime

# Install serve globally for SPA hosting
RUN npm install -g serve@14

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs nextjs

# Set working directory
WORKDIR /app

# Copy built application from node-builder stage
COPY --from=node-builder --chown=nextjs:nodejs /app/packages/app/dist/ ./dist/

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start serve in SPA mode
CMD ["serve", "-s", "dist", "-l", "3000"]