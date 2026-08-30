import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'UP · Conciergerie privee',
    short_name: 'UP',
    description: 'Conciergerie privee au Gabon.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0B0C',
    theme_color: '#0B0B0C',
    orientation: 'portrait',
  };
}
