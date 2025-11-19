import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  server: {
    hmr: {
      overlay: false // 禁用错误遮罩层
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    }
  },
  assetsInclude: ['**/*.ttf']
})