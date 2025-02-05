import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
const app = createApp(App);
app.use(router);
app.mount('#app');
if (process.env.NODE_ENV === 'production') {
    // Desabilitar console 
    const noop = () => { };
    ['log', 'warn', 'error', 'debug'].forEach(method => {
        console[method] = noop;
    });
    // Detectar DevTools
    function detectDevTools() {
        const devtools = {
            isOpen: false,
            orientation: undefined
        };
        const threshold = 160;
        const emitEvent = (isOpen, orientation) => {
            window.dispatchEvent(new CustomEvent('devtoolschange', {
                detail: {
                    isOpen,
                    orientation
                }
            }));
        };
        setInterval(() => {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            if (widthThreshold || heightThreshold) {
                devtools.isOpen = true;
                devtools.orientation = widthThreshold ? 'vertical' : 'horizontal';
            }
            else {
                devtools.isOpen = false;
                devtools.orientation = undefined;
            }
            emitEvent(devtools.isOpen, devtools.orientation);
        }, 500);
    }
    detectDevTools();
}
