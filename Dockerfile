## Multi-stage Dockerfile
# 1) Build the Vite React app
# 2) Serve the built static files with nginx

FROM node:18-alpine AS builder
WORKDIR /app

# Install build deps
COPY package.json package-lock.json* ./
COPY tsconfig.json .
COPY vite.config.ts .
COPY tailwind.config.js .
COPY postcss.config.js .

RUN npm ci --silent

# Copy source
COPY . .

# Build production assets
RUN npm run build

FROM nginx:stable-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config: keep defaults but expose on container port 80
EXPOSE 80

CMD ["/bin/sh", "-c", "nginx -g 'daemon off;'" ]
