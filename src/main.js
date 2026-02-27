import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.bundle.js'

const app = createApp(App)

app.use(i18n)
app.mount('#app')

/* Register Service Worker with Update Detection */
if ('serviceWorker' in navigator) {
  let updatePromptShown = false; // Flag to prevent multiple prompts
  
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then((registration) => {
      // Check for updates periodically (every 1 hour)
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
          // Only show the prompt once and when there's a controller (not first install)
          if (
            newWorker.state === 'installed' && 
            navigator.serviceWorker.controller && 
            !updatePromptShown
          ) {
            updatePromptShown = true; // Set flag to prevent repeated prompts
            
            // Notify user about the update
            const message = 'New version available! Please refresh your page to update.';
            
            if (confirm(message + '\n\nRefresh now?')) {
              // Tell service worker to skip waiting
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              
              // Reload after SW takes control
              let refreshing = false;
              navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                  window.location.reload();
                  refreshing = true;
                }
              });
            } else {
              // Reset flag if user cancels, so they can be prompted again on next update
              updatePromptShown = false;
            }
          }
        });
      });
    }).catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
  });
}
