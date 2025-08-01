FROM node:20-bullseye AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN mkdir -p public

RUN npx next build

FROM node:20-bullseye-slim

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 8080

CMD ["npm", "start"]
