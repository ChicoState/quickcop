# Future NestJS API/worker image. It intentionally cannot be built until the
# application implementation creates apps/api and its package manifest.
FROM node:22.14-bookworm-slim AS dependencies
WORKDIR /app
COPY apps/api/package*.json ./
RUN npm ci --omit=dev

FROM node:22.14-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY apps/api/dist ./dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 CMD node -e "process.exit(0)"
CMD ["node", "dist/main.js"]
