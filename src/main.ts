import './assets/main.css'
import './assets/theme.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'

// Configuração inicial do tema
const savedTheme = localStorage.getItem('theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
document.documentElement.classList.toggle('dark', savedTheme === 'dark')

const app = createApp(App)

app.use(router)

app.mount('#app')

// Extend RegExp type to include 'opened' property
declare global {
  interface RegExp {
    opened?: boolean;
  }
}
if (process.env.NODE_ENV === 'production') {
  // Desabilitar console 
  const noop = () => {}
  ['log', 'warn', 'error', 'debug'].forEach(method => {
    (console as { [key: string]: any })[method] = noop
  })

  // Detectar DevTools
  function detectDevTools() {
    const devtools = {
      isOpen: false,
      orientation: undefined as undefined | string
    }
    
    const threshold = 160
    const emitEvent = (isOpen: boolean, orientation: string | undefined) => {
      window.dispatchEvent(new CustomEvent('devtoolschange', {
        detail: {
          isOpen,
          orientation
        }
      }))
    }

    setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      
      if (widthThreshold || heightThreshold) {
        devtools.isOpen = true
        devtools.orientation = widthThreshold ? 'vertical' : 'horizontal'
      } else {
        devtools.isOpen = false
        devtools.orientation = undefined  
      }
      
      emitEvent(devtools.isOpen, devtools.orientation)
    }, 500)
  }

  detectDevTools()
}
