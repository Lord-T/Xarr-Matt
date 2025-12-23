import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Xarr-Matt',
        short_name: 'Xarr-Matt',
        description: 'Plateforme de services de proximité et micro-emplois au Sénégal',
        start_url: '/',
        display: 'standalone',
        background_color: '#F8FAFC',
        theme_color: '#F97316',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            },
        ],
    }
}
