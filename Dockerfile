# syntax=docker/dockerfile:1

# The build only produces static files, which are identical on every CPU, so it runs
# natively on the build machine. Only the runtime stage is per-platform.
FROM --platform=$BUILDPLATFORM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# The server has no dependencies; the runtime is Node, ffmpeg (Alpine's has LAME and Opus) and the
# built app. Encore's state is one SQLite file in /data; staging and the library are mounts.
FROM node:24-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
ENV NODE_ENV=production PORT=8080 TZ=Europe/Berlin ENCORE_STAGING=/staging ENCORE_LIBRARY=/library ENCORE_DATA=/data
COPY --from=build /app/dist ./dist
COPY server ./server
COPY shared ./shared
COPY package.json ./
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 8080
# Every ~13½ minutes at Encore's own slot, so no two containers line up (plans/nas-load.md).
# Shell form so $PORT expands: the NAS stack runs on a different port than the default.
HEALTHCHECK --interval=817s --timeout=10s --start-period=60s --retries=3 CMD wget -qO- "http://127.0.0.1:${PORT}/healthz" || exit 1
CMD ["node", "server/server.mjs"]
