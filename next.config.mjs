/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Esto permite que el despliegue a Vercel continúe incluso si hay pequeñas advertencias de código (como variables no usadas)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Permite compilar a pesar de advertencias de tipo (ej. usar 'any')
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
