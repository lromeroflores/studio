# ==============================================================================
# Dockerfile para la aplicación Next.js (ContractEase)
#
# Utiliza una construcción multi-etapa para optimizar el tamaño de la imagen
# final y mejorar la seguridad.
# ==============================================================================

# --- Etapa 1: Dependencias ---
# Esta etapa instala todas las dependencias de Node.js.
FROM us-central1-docker.pkg.dev/covalto-registry-spt/covalto-base-images/node:20.15.0-alpine as deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# --- Etapa 2: Construcción ---
# Esta etapa construye la aplicación de producción de Next.js.
FROM us-central1-docker.pkg.dev/covalto-registry-spt/covalto-base-images/node:20.15.0-alpine as builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Etapa 3: Producción ---
# Esta es la etapa final que crea la imagen ligera para producción.
FROM us-central1-docker.pkg.dev/covalto-registry-spt/covalto-base-images/node:20.15.0-alpine as runner
WORKDIR /app

# Establecer el usuario a 'node' por seguridad, en lugar de 'root'.
USER node

# Copiar artefactos de construcción y dependencias de producción.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Exponer el puerto en el que se ejecutará la aplicación.
EXPOSE 8080

# Comando para iniciar la aplicación.
CMD ["node", "server.js"]

    