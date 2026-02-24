import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

try {
    const config = await (await fetch('/__/config.json')).json();
    globalThis.config = config;
    if (window.location.hostname !== config.PLATFORM_BASE) {
        document.body.appendChild(document.createElement('div')).innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); display: flex; align-items: center; justify-content: center; z-index: 9999;">
            <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                <p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Warning:</p>
                <p style="font-size: 14px;">This demo is only available on ${config.HOST_BASE}. Please visit the demo on ${config.HOST_BASE} to use it.</p>
            </div>
        </div>
    `;
        await new Promise(() => { });
    }
} catch (error) {
    console.error('Error loading config:', error);
}


createApp(App).mount('#app')
