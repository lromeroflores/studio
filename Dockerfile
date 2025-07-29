# Dockerfile para una aplicación Next.js

# Etapa 1: Instalación de dependencias
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Etapa 2: Construcción de la aplicación
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para la construcción (si son necesarias)
# ARG NEXT_PUBLIC_API_URL
# ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Etapa 3: Ejecución de la aplicación
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Descomentar la siguiente línea si usas un hostname personalizado en producción
# ENV HOSTNAME=0.0.0.0

# Copia los archivos de construcción
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# El puerto por defecto que expone Next.js
EXPOSE 3000

# Comando para iniciar el servidor de Next.js
CMD ["node", "server.js"]
