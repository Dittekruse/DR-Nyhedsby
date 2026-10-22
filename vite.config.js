
const { defineConfig } = require('vite');
const { resolve } = require('node:path');

module.exports = defineConfig({
  base: '/DR-Nyhedsby/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        by: resolve(__dirname, 'by.html'),
        by3d: resolve(__dirname, 'by3d.html'),
        minispil: resolve(__dirname, 'godt-eller-daarligt.html'),
        quiz: resolve(__dirname, 'nyhedsquiz_med_moenter.html')
      }
    }
  }
});
