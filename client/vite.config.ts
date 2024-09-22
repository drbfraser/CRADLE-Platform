import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    base: '/',
    plugins: [
      react({ 
        jsxImportSource: '@emotion/react', 
        babel: {
          plugins: ['@emotion/babel-plugin']
        } 
      }),
      viteTsconfigPaths()
    ],
    server: {    
        open: true, // Open browser when server starts.
        port: 3000, 
    },
})
