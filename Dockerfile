# ---- Etapa 1: Builder ----
# Construye la aplicación Next.js y genera los archivos estáticos

FROM node:20-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de manifiesto y de bloqueo
COPY package.json ./
COPY package-lock.json ./

# Instala las dependencias de producción
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

# Construye y exporta la aplicación como un sitio estático
RUN npm run build


# ---- Etapa 2: Production ----
# Sirve los archivos estáticos con Nginx

FROM nginx:alpine

# Elimina la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nuestra configuración personalizada de Nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/

# Establece el directorio de trabajo
WORKDIR /usr/share/nginx/html

# Limpia el contenido por defecto de Nginx
RUN rm -rf ./*

# Copia los archivos estáticos desde la etapa 'builder'
COPY --from=builder /app/out .

# Expone el puerto 8080 (el mismo que en nuestra configuración de K8s)
EXPOSE 8080

# Inicia Nginx en modo 'daemon off' para que se mantenga en primer plano
CMD ["nginx", "-g", "daemon off;"]
