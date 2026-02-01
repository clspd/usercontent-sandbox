import { checkOrigin } from "../domain.js";

export function setupEventHandlers() { 
    globalThis.addEventListener('message', handleMessage);
}

function reply(event, data) {
    return event.source.postMessage(data, event.origin);
}

/**
 * @param {MessageEvent} event 
 */
export async function handleMessage(event) {
    const { data, origin } = event;
    if (!await checkOrigin(origin, false)) return;
    if (!data || typeof data !== 'object') return;

    switch (data.type) {
        case 'ping':
            return reply(event, { type: 'pong' });
            break;
        
        case 'isAvailable':
            return reply(event, {
                type: 'isAvailable',
                result: await (async () => {
                    try {
                        const { serviceWorkerAvailable } = await import('../swAvailable.ts');
                        return serviceWorkerAvailable();
                    } catch { return false }
                })()
            });
            break;
        
        case 'isWorkable':
            return reply(event, {
                type: 'isWorkable',
                result: await (async () => {
                    try {
                        const { serviceWorkerWorking } = await import('../swAvailable.ts');
                        return serviceWorkerWorking();
                    } catch { return false }
                })()
            });
            break;
            
        case 'register':
            try {
                await navigator.serviceWorker.register("/__service_worker__.js", { scope: "/" });
                return reply(event, {
                    type: 'registerResult',
                    success: true
                });
            } catch (error) {
                return reply(event, {
                    type: 'registerResult',
                    success: false,
                    reason: String(error),
                    stack: String(error?.stack)
                });
            }

        case 'putFile':
            try {
                const cache = await caches.open('usercontent_storage_v1');
                await cache.put(data.name, new Response(data.content, {
                    headers: {
                        'Content-Type': data.content?.type
                    }
                }));
                return reply(event, {
                    type: 'putFileResult',
                    success: true,
                    nonce: data.nonce
                });
            } catch (error) {
                return reply(event, {
                    type: 'putFileResult',
                    success: false,
                    reason: String(error),
                    stack: String(error?.stack)
                });
            }

        case 'clearFiles':
            try {
                await caches.delete('usercontent_storage_v1');
                return reply(event, {
                    type: 'clearFilesResult',
                    success: true
                });
            } catch (error) {
                return reply(event, {
                    type: 'clearFilesResult',
                    success: false,
                    reason: String(error),
                    stack: String(error?.stack)
                });
            }
    
        default:
            break;
    }
}
