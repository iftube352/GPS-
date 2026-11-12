import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['apple-touch-icon.png', 'icon.svg', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
        manifest: {
          id: '/',
          name: 'GPS Chambai - Govt Primary School Kohat',
          short_name: 'GPS Chambai',
          description: 'Native Android & Web educational management app for Government Primary School Chambai Kohat, Khyber Pakhtunkhwa.',
          theme_color: '#046C4E',
          background_color: '#064E3B',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          globIgnores: ['**/*.apk', '**/*.zip', '**/releases/**', '**/build-outputs/**'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      {
        name: 'serve-android-apk',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const rawUrl = req.url?.split('?')[0] || '';
            if (rawUrl.endsWith('.apk')) {
              const cleanRel = decodeURIComponent(rawUrl).replace(/^\/+/, '');
              // Always prioritize the exact requested v1.0.5 release APK first
              const candidates = [
                path.resolve(__dirname, cleanRel),
                path.resolve(__dirname, 'public', cleanRel),
                path.resolve(__dirname, 'build', cleanRel),
                path.resolve(__dirname, 'build/GPS_Chambai_v1.0.5.apk'),
                path.resolve(__dirname, 'public/build/GPS_Chambai_v1.0.5.apk'),
                path.resolve(__dirname, 'releases/GPS_Chambai_v1.0.5.apk'),
                path.resolve(__dirname, 'public/releases/GPS_Chambai_v1.0.5.apk'),
                path.resolve(__dirname, 'releases/GPS_Chambai_v1.0.5_build006.apk'),
                path.resolve(__dirname, 'public/releases/GPS_Chambai_v1.0.5_build006.apk'),
                path.resolve(__dirname, 'build-outputs/app-debug.apk'),
                path.resolve(__dirname, 'public/build-outputs/app-debug.apk'),
                path.resolve(__dirname, 'build/app-release.apk'),
              ];

              // Only select a verified full-size v1.0.5 APK (> 40 MB), never an old 10 MB APK
              const targetFile = candidates.find(
                (p) => fs.existsSync(p) && fs.statSync(p).size > 40 * 1024 * 1024
              );

              if (targetFile) {
                const stat = fs.statSync(targetFile);
                const requestedBase = path.basename(cleanRel);
                const downloadFileName =
                  requestedBase && requestedBase.endsWith('.apk')
                    ? requestedBase
                    : 'GPS_Chambai_v1.0.5.apk';
                res.writeHead(200, {
                  'Content-Type': 'application/vnd.android.package-archive',
                  'Content-Disposition': `attachment; filename="${downloadFileName}"`,
                  'Content-Length': stat.size.toString(),
                  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                  Pragma: 'no-cache',
                  Expires: '0',
                });
                fs.createReadStream(targetFile).pipe(res);
                return;
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
