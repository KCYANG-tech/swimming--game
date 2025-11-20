import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  server: {
    host: '0.0.0.0', // 允许局域网设备访问（手机）
    port: 5173,      // 固定端口，方便记忆；占用则需手动换
    strictPort: true, // 如果 5173 被占用直接报错，避免自动换端口导致你找不到
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