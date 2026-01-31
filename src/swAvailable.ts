export function serviceWorkerAvailable() {
    return ("serviceWorker" in navigator) && (typeof navigator.serviceWorker.register === 'function');
}
export async function serviceWorkerWorking() {
    return (await (await fetch('/__/_/_w')).text()) === 'true';
}

