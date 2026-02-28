import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    base: '/leetcode-279-perfect-squares/',
    server: {
        port: 15674,
    },
});
