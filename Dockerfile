# === STAGE 1: Dependencias ===
# Esta etapa instala las dependencias de producción y desarrollo.
# Se utiliza una imagen base oficial de Node.js que es ligera y segura.
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# === STAGE 2: Construcción ===
# En esta etapa, se construye la aplicación de Next.js.
# Se copia el código fuente y las dependencias de la etapa anterior.
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para el proceso de construcción de Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Ejecuta el script de construcción definido en package.json
RUN npm run build

# === STAGE 3: Producción ===
# Esta es la etapa final que crea la imagen de producción.
# Es una imagen ligera que solo contiene lo necesario para ejecutar la aplicación.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copia los archivos de construcción de la etapa 'builder'.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# El puerto 8080 es el que se expone para que Kubernetes pueda dirigir el tráfico.
EXPOSE 8080

# El comando para iniciar la aplicación en producción, usando el puerto 8080.
CMD ["node", "server.js"]
