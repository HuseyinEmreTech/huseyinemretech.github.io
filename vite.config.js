import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                gis: resolve(__dirname, 'gis-project.html'),
                makine: resolve(__dirname, 'makine-ogrenmesi.html'),
                hci: resolve(__dirname, 'hci-adaptive-ui.html'),
            },
        },
    },
});
