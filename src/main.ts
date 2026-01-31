
export async function usercontent_main() {
    const { setupEventHandlers } = await import("./usercontent/message.js");
    setupEventHandlers();

    console.log('[usercontent]', 'load success');
}


export async function main() {
    const { AUTO_REGISTER } = await (await fetch('/__/config.json')).json();
    const { serviceWorkerAvailable } = await import('./swAvailable.ts');
    if (serviceWorkerAvailable() && AUTO_REGISTER) {
        navigator.serviceWorker.register("/__service_worker__.js", { scope: "/" })
            .then(function (registration) {
                console.log('[usercontent]', 'service worker has been registered');
            })
            .catch(function (error) {
                console.error('[usercontent]', 'Unable to register service worker:', error);
            });
    }

    const { setupEventHandlers } = await import("./management/message.js");
    setupEventHandlers();

    console.log('[usercontent]', 'load success');
}
