import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inline-runtime-feed',
      transformIndexHtml(html) {
        const feedPath = path.resolve(__dirname, 'public/runtime/published-feed.json')
        if (fs.existsSync(feedPath)) {
          const feed = fs.readFileSync(feedPath, 'utf-8')
          return html.replace(
            '</head>',
            '<script>window.__RUNTIME_FEED__=' + feed + '</script></head>'
          )
        }
        return html
      }
    }
  ],
})
