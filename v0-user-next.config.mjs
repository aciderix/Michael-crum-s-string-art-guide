/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Configurez le chemin de base pour GitHub Pages
  // Si vous déployez sur un dépôt nommé "string-art-guide", utilisez:
  basePath: process.env.NODE_ENV === 'production' ? '/string-art-guide' : '',
  // Désactivez l'image optimization car elle n'est pas compatible avec l'export statique
  images: {
    unoptimized: true,
  },
  // Assurez-vous que les liens sont relatifs pour GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '/string-art-guide' : '',
  // Désactivez le strict mode pour éviter les doubles rendus en développement
  reactStrictMode: false,
};

export default nextConfig;

