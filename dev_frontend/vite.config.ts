import { defineConfig } from 'vite';
import path from 'path';
import chokidar from 'chokidar';

export default defineConfig({
  root: './src', // on sert à partir du dossier dev_frontend
  server: {
    open: true,
    port: 5173,
    watch: {
      usePolling: true,
	  ignored: [],
    },
	  },

});