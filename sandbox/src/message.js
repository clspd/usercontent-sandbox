import { checkOrigin } from "./domain";

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
    if (!await checkOrigin(origin)) return;
    if (!data || typeof data !== 'object') return;

    switch (data.type) {
        case 'ping':
            return reply(event, { type: 'pong' });
            break;
        
        case 'evaluate':
            try {
                const config = data.config || {};
                let result;
                if (config.unwrap) {
                    result = new Function('return eval(arguments[0])')(data.code);
                }
                else {
                    let body;
                    if (config.topLevelAwait) body = `return ((async function () { ${data.code} })());`;
                    else if (config.simple) body = `return (() => ${data.code})();`;
                    else body = data.code;
                    result = await (new Function(body))();
                }
                return reply(event, {
                    type: 'evaluateResult',
                    success: true,
                    result,
                });
            } catch (error) {
                return reply(event, {
                    type: 'evaluateResult',
                    success: false,
                    error: String(error),
                    stack: String(error?.stack),
                });
            }
            break;
    
        default:
            break;
    }
}
