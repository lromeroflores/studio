# Dockerfile

# Etapa 1: Construcción de la aplicación
FROM node:20-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero para aprovechar el caché de Docker
COPY package*.json ./

# Instalar todas las dependencias (incluidas las de desarrollo)
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Construir y exportar la aplicación como sitio estático
# La bandera --force es para evitar errores si hay conflictos de dependencias menores.
RUN npm run build

# Etapa 2: Servidor de producción con Nginx
FROM nginx:alpine

# Eliminar la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nuestra configuración personalizada de Nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/

# Establecer el directorio de trabajo para los archivos estáticos
WORKDIR /usr/share/nginx/html

# Limpiar cualquier contenido preexistente
RUN rm -rf ./*

# Copiar los archivos estáticos construidos desde la etapa 'builder'
COPY --from=builder /app/out .

# Exponer el puerto 8080
EXPOSE 8080

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
