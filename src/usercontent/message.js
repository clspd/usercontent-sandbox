import { checkOrigin } from "../domain.js";
import { stringify, parse } from 'flatted';

export function setupEventHandlers() { 
    globalThis.addEventListener('message', handleMessage);
}

function reply(event, data) {
    return event.source.postMessage(data, event.origin);
}

const securityOptions = {
    canSet: true,
    allowRender: true,
    allowEvaluate: true,
}

/**
 * @param {MessageEvent} event 
 */
export async function handleMessage(event) {
    const { data, origin } = event;
    if (!await checkOrigin(origin)) return;
    if (!data || typeof data !== 'object') return;

    switch (String(data.type)) {
        case 'ping':
            return reply(event, { type: 'pong' });
            break;
        
        case 'setSecurityPolicy':
            try {
                if (!securityOptions.canSet) throw new DOMException("The operation was blocked due to a security policy.", "SecurityError");
                securityOptions.canSet = false;
                securityOptions.allowRender = !!data.allowRender;
                securityOptions.allowEvaluate = !!data.allowEvaluate;
                return reply(event, {
                    type: 'result',
                    command: 'setSecurityPolicy',
                    success: true,
                });
            } catch (error) {
                return reply(event, {
                    type: 'result',
                    command: 'setSecurityPolicy',
                    success: false,
                    error: String(error),
                    stack: String(error?.stack),
                });
            }
            break;
            
        case 'render':
            try {
                if (!securityOptions.allowRender) throw new DOMException("The operation was blocked due to a security policy.", "SecurityError");
                document.documentElement.outerHTML = data.code;
                return reply(event, {
                    type: 'result',
                    command: 'render',
                    success: true,
                });
            } catch (error) {
                return reply(event, {
                    type: 'result',
                    command: 'render',
                    success: false,
                    error: String(error),
                    stack: String(error?.stack),
                });
            }
            break;
        
        case 'evaluate':
            try {
                if (!securityOptions.allowEvaluate) throw new DOMException("The operation was blocked due to a security policy.", "SecurityError");
                const config = data.config || {};
                let result;
                if (config.unwrap) {
                    result = new Function('return eval(arguments[0])')(data.code);
                }
                else if (config.modularize) {
                    const blob = new Blob([data.code], { type: 'text/javascript' });
                    const url = URL.createObjectURL(blob);
                    try {
                        const myModule = await import(url);
                        URL.revokeObjectURL(url);
                        result = parse(stringify(myModule)); // purify the module obj, remove functions
                    }
                    catch (e) {
                        URL.revokeObjectURL(url);
                        throw e;
                    }
                }
                else {
                    let body;
                    if (config.topLevelAwait) body = `return ((async function () {\n${data.code}\n})());`;
                    else if (config.simple) body = `return (() => \n${data.code}\n)();`;
                    else body = data.code;
                    result = await (new Function(body))();
                }
                return reply(event, {
                    type: 'result',
                    command: 'evaluate',
                    success: true,
                    result,
                });
            } catch (error) {
                return reply(event, {
                    type: 'result',
                    command: 'evaluate',
                    success: false,
                    error: String(error),
                    stack: String(error?.stack),
                });
            }
            break;
    
        default:
            return reply(event, {
                type: 'error',
                command: String(data.type),
                success: false,
                error: 'TypeError: Cannot find the command specified',
                stack: '',
            });
    }
}
