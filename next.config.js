/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para exportar como un sitio estático
  output: 'export',

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // La optimización de imágenes de Next.js no es compatible con 'output: export'
    unoptimized: true, 
  },
};

module.exports = nextConfig;
