# ContractEase

This is a Next.js application for managing contracts, built with AI features powered by Genkit.

## Desarrollo Local

Para ejecutar la aplicación en tu máquina local, sigue estos pasos.

### Prerrequisitos

- [Node.js](https://nodejs.org/) (se recomienda la versión 20 o posterior)
- npm o un gestor de paquetes compatible
- [Docker](https://www.docker.com/get-started) (para el despliegue en contenedores)
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (para el despliegue)
- [Make](https://www.gnu.org/software/make/) (para usar los comandos de ayuda)

### 1. Configurar Variables de Entorno

La aplicación utiliza Genkit para conectarse a los modelos de IA de Google. Necesitarás una clave de API para esto.

1.  Crea un archivo llamado `.env` en la raíz del proyecto.
2.  Añade tu clave de API de Google AI:

    ```
    GOOGLE_API_KEY=tu_api_key_aqui
    ```

    Puedes obtener una clave en [Google AI Studio](https://aistudio.google.com/app/apikey).

### 2. Instalar Dependencias

Abre tu terminal en el directorio raíz del proyecto y ejecuta:

```bash
make install
# o
npm install
```

### 3. Ejecutar los Servidores de Desarrollo

Este proyecto requiere que dos procesos se ejecuten simultáneamente para el desarrollo local.

**Terminal 1: Iniciar el Frontend de Next.js**

```bash
make dev
# o
npm run dev
```
Esto iniciará la aplicación principal, típicamente disponible en `http://localhost:3000`.

**Terminal 2: Iniciar los Flujos de IA de Genkit**

```bash
npm run genkit:watch
```
Esto inicia el servidor de desarrollo de Genkit, que pone las funciones de IA a disposición de tu aplicación Next.js.

Una vez que ambos servidores estén funcionando, puedes abrir tu navegador en `http://localhost:3000` para usar la aplicación.

---

## Despliegue (Docker y Kubernetes)

Esta aplicación está configurada para ser desplegada como un contenedor usando Docker y gestionada en Kubernetes. El pipeline de CircleCI automatiza este proceso.

### Flujo de Trabajo con Docker Local

Para construir y probar la imagen de Docker en tu máquina local (separado del pipeline de CI/CD), puedes usar los siguientes comandos.

#### 1. Autenticar Docker con Google Cloud (Prerrequisito)

Antes de poder interactuar con el registro de imágenes de Covalto, necesitas autenticar tu cliente de Docker local con Google Artifact Registry. **Este paso solo se necesita hacer una vez.**

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

#### 2. Construir la Imagen de Docker

Usa `make` para construir la imagen. Esto creará una imagen con la etiqueta `latest`.

```bash
make docker-build
```

#### 3. Ejecutar la Aplicación en un Contenedor Local

Para probar la aplicación en un contenedor localmente:

```bash
make docker-run
```
La aplicación estará disponible en [http://localhost:8080](http://localhost:8080).

Para detener el contenedor, ejecuta:
```bash
make docker-stop
```

### Proceso de Construcción y Despliegue con CI/CD

El flujo de trabajo automatizado es el siguiente:
1. Un desarrollador hace un `push` a la rama `main`.
2. CircleCI se activa, ejecuta las pruebas y el linter.
3. Si todo es correcto, CircleCI construye una nueva imagen de Docker usando el `Dockerfile` y la sube a Google Artifact Registry.
4. Finalmente, CircleCI le notifica a Argo CD que hay una nueva versión, y Argo CD se encarga de sincronizar el clúster de Kubernetes para que use la nueva imagen.

---

## 🛠️ Comandos del Makefile

| Comando              | Descripción                                                                 |
|----------------------|-----------------------------------------------------------------------------|
| `make help`          | Muestra este mensaje de ayuda.                                              |
| `make install`       | Instala las dependencias del proyecto con npm.                              |
| `make dev`           | Ejecuta el servidor de desarrollo local de Next.js.                         |
| `make lint`          | Ejecuta el linter para revisar el estilo del código.                        |
| `make format`        | Formatea el código con Prettier.                                            |
| `make test`          | Ejecuta las pruebas (actualmente no hay pruebas especificadas).             |
| `make docker-build`  | Construye la imagen de Docker para producción.                              |
| `make docker-run`    | Ejecuta la aplicación dentro de un contenedor Docker.                       |
| `make docker-stop`   | Detiene el contenedor Docker que se está ejecutando.                        |
| `make clean`         | Elimina los artefactos de construcción y las dependencias instaladas.       |
| `make full-clean`    | Limpia todo, incluida la imagen de Docker construida localmente.            |
