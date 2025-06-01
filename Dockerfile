# Multi-stage build for @nap5/gnrng-id library + React demo application
# Stage 1: Rust WASM Builder
FROM rust:1.86-slim as rust-builder

# Install system dependencies for Rust/WASM build
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

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

# Build WASM package with locked dependencies for production
RUN wasm-pack build packages/crates/gnrng-id \
    --target web \
    --scope nap5 \
    --release \
    --out-dir pkg

# Verify WASM build output
RUN ls -la packages/crates/gnrng-id/pkg/ && \
    echo "WASM build completed successfully"

# Stage 2: Node.js Builder
FROM node:22.11.0-slim as node-builder

# Install pnpm
RUN npm install -g pnpm@10.11.0

# Set working directory
WORKDIR /app

# Copy package configuration files first (for better caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/app/package.json ./packages/app/
COPY packages/utils/package.json ./packages/utils/
COPY packages/lib/package.json ./packages/lib/
COPY packages/shared-config/package.json ./packages/shared-config/

# Copy shared configuration
COPY packages/shared-config/ ./packages/shared-config/

# Copy WASM packages from rust-builder stage
COPY --from=rust-builder /app/packages/crates/gnrng-id/pkg/ ./packages/crates/gnrng-id/pkg/

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile --shamefully-hoist

# Copy source code
COPY packages/utils/ ./packages/utils/
COPY packages/lib/ ./packages/lib/
COPY packages/app/ ./packages/app/

# Build packages in dependency order
RUN echo "Building @internal/utils..." && \
    pnpm --filter @internal/utils build && \
    echo "Building @nap5/gnrng-id..." && \
    pnpm --filter @nap5/gnrng-id build && \
    echo "Building React app..." && \
    pnpm --filter app build

# Verify build outputs
RUN echo "Build verification:" && \
    ls -la packages/utils/dist/ && \
    ls -la packages/lib/dist/ && \
    ls -la packages/app/dist/ && \
    echo "All builds completed successfully"

# Stage 3: Production Runtime
FROM node:22.11.0-alpine as runtime

# Install serve and security updates
RUN apk add --no-cache \
    curl \
    wget \
    ca-certificates \
    && npm install -g serve@14 \
    && npm cache clean --force

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -u 1001 -G nodejs appuser

# Set working directory
WORKDIR /app

# Copy built application from node-builder stage
COPY --from=node-builder --chown=appuser:nodejs /app/packages/app/dist/ ./dist/

# Create logs directory
RUN mkdir -p /app/logs && chown appuser:nodejs /app/logs

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start serve in SPA mode
CMD ["serve", "-s", "dist", "-l", "3000"]