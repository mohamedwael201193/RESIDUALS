# RESIDUALS API — always-on Node 20 image (Render / Fly / Railway)
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
RUN npm ci --workspace=@residuals/api --workspace=@residuals/shared --include-workspace-root

FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build -w @residuals/shared && npm run build -w @residuals/api

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/apps/api ./apps/api
EXPOSE 3000
WORKDIR /app/apps/api
# Secrets injected by host (Render/Fly/Railway). Do not bake .env into the image.
CMD ["node", "dist/index.js"]
