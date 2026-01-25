import { setupEventHandlers } from "./message.js";

export async function main() {
    setupEventHandlers();

    console.log('[usercontent]', 'load success');
}

