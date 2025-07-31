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
npm install
```

### 3. Ejecutar los Servidores de Desarrollo

Este proyecto requiere que dos procesos se ejecuten simultáneamente. Puedes ejecutarlos manualmente o usar el `Makefile` proporcionado.

**Opción A: Usando Makefile (en dos terminales separadas)**

**Terminal 1:**
```bash
make dev-next
```

**Terminal 2:**
```bash
make dev-genkit
```

**Opción B: Manualmente**

**Terminal 1: Iniciar el Frontend de Next.js**

```bash
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

## Despliegue (Kubernetes a través de Helm y Argo CD)

Esta aplicación está configurada para ser desplegada como un contenedor usando Docker y gestionada en Kubernetes con un Helm chart. El pipeline de CircleCI automatiza este proceso, que a su vez se integra con Argo CD para seguir una metodología GitOps.

El flujo de trabajo es el siguiente:
1. Un desarrollador hace un `push` a la rama `main`.
2. CircleCI se activa, ejecuta las pruebas y el linter.
3. Si todo es correcto, CircleCI construye una nueva imagen de Docker y la sube a Google Artifact Registry.
4. Finalmente, CircleCI le notifica a Argo CD que hay una nueva versión, y Argo CD se encarga de sincronizar el clúster de Kubernetes para que use la nueva imagen.

### Flujo de Trabajo con Docker Local

Para probar la construcción de la imagen de Docker en tu máquina local (separado del pipeline de CI/CD), puedes usar los siguientes comandos.

#### 1. Autenticar Docker con Google Cloud (Prerrequisito)

Antes de poder construir o subir imágenes, necesitas autenticar tu cliente de Docker local con Google Artifact Registry. **Este paso solo se necesita hacer una vez.**

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

#### 2. Construir la Imagen de Docker

Puedes construir la imagen manualmente o usar `make`:

```bash
# Construye la imagen y la etiqueta con 'latest'
make build
```

#### 3. Ejecutar la Aplicación en un Contenedor Local

Para probar la aplicación en un contenedor localmente:

```bash
# Este comando lee la GOOGLE_API_KEY de tu archivo .env y ejecuta el contenedor.
make run-local
```
Luego, abre [http://localhost:3000](http://localhost:3000) en tu navegador.

#### 4. Subir la Imagen a Artifact Registry

Si necesitas subir una imagen desde tu máquina local al registro (esto generalmente lo hace el pipeline de CI), primero asegúrate de haberte autenticado (paso 1) y luego ejecuta:

```bash
# Sube la imagen etiquetada como 'latest'
make push
```

---

## 🛠️ Comandos del Makefile

| Comando              | Descripción                                               |
|----------------------|-----------------------------------------------------------|
| `make build`         | Construye la imagen de Docker localmente con la etiqueta `latest`.                            |
| `make push`          | Sube la imagen `latest` a Artifact Registry.                       |
| `make run-local`     | Ejecuta la aplicación localmente dentro de un contenedor Docker. |
| `make dev-next`      | Ejecuta el frontend de Next.js para desarrollo local.     |
| `make dev-genkit`    | Ejecuta los flujos de IA de Genkit para desarrollo local. |
| `make deploy ENV=dev`| Despliega la aplicación en Cloud Run (ejemplo de comando).  |
| `make lint`          | Ejecuta el linter.                                        |
| `make lint-fix`      | Intenta corregir los problemas de lint automáticamente.      |
| `make format`        | Formatea el código con Prettier.                          |
| `make clean`         | Elimina las imágenes de Docker locales creadas para este proyecto. |
| `make help`          | Muestra una lista de todos los comandos disponibles.        |

Esta configuración asegura despliegues seguros, repetibles y escalables para la aplicación ContractEase usando herramientas modernas nativas de la nube.
