# === Stage 1: Dependencias ===
# Utiliza la imagen base de Node.js de Covalto para instalar dependencias.
# Esto asegura consistencia con el entorno de CI/CD.
FROM us-central1-docker.pkg.dev/covalto-registry-spt/covalto-base-images/nodejs:20.15.0-alpine as deps
WORKDIR /app

# Copia solo los archivos de manifiesto del paquete y el lockfile.
COPY package.json package-lock.json ./
# Instala las dependencias de producción.
RUN npm install --omit=dev


# === Stage 2: Construcción ===
# Utiliza la misma imagen base para construir la aplicación.
FROM us-central1-docker.pkg.dev/covalto-registry-spt/covalto-base-images/nodejs:20.15.0-alpine as builder
WORKDIR /app

# Copia las dependencias instaladas de la etapa anterior.
COPY --from=deps /app/node_modules ./node_modules
# Copia el resto del código fuente de la aplicación.
COPY . .

# Construye la aplicación de Next.js para producción.
RUN npm run build


# === Stage 3: Producción ===
# Utiliza la misma imagen base, que es ligera, para la etapa final.
FROM us-central1-docker.pkg.dev/covalto-registry-spt/covalto-base-images/nodejs:20.15.0-alpine as runner
WORKDIR /app

# Establece el entorno a producción.
ENV NODE_ENV=production

# Copia los artefactos de construcción de la etapa anterior.
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copia el directorio .next, que contiene la salida de la construcción de Next.js.
# La estructura recomendada para Standalone Output es copiar la carpeta completa.
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Expone el puerto 8080, que es el que la aplicación usará.
EXPOSE 8080

# El comando para iniciar la aplicación.
# Utiliza el script "start" de package.json, que ejecuta "next start -p 8080".
CMD ["npm", "start"]
