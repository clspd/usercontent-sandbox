<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

const code = ref('');
const appmode = ref('private');
const result = ref('');
const random = ref('12345678');
const frame = ref<HTMLIFrameElement | null>(null);
const originHash = ref('');

const sha256 = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

sha256(location.origin).then(hash => {
    originHash.value = hash.substring(0, 32);
});

const prefix = computed(() => {
    return appmode.value === 'public' ? 'public1' : (random.value + '-' + originHash.value);
});
const framesrc = computed(() => {
    return `https://${prefix.value}.usercontent.clspd.top/__/usercontent.html`;
});
const frameorigin = computed(() => {
    try {
        return new URL(framesrc.value).origin;
    } catch (error) {
        return '';
    }
});

const config = reactive({
    topLevelAwait: true,
    simple: false,
    unwrap: false,
})

const isRunning = ref(false), isSuccess = ref(true);

onMounted(() => { 
    window.addEventListener('message', handleMessage);
})

const handleMessage = (event: MessageEvent) => {
    if (event.origin !== frameorigin.value) return;
    if (event.data.type !== 'evaluateResult') return;
    isSuccess.value = event.data.success;
    if (event.data.success) {
        result.value = event.data.result;
    } else {
        result.value = 'Error: ' + event.data.error + '\n' + event.data.stack;
    }
    isRunning.value = false;
}

const execcode = async () => {
    try {
        isRunning.value = true;

        // @ts-expect-error
        frame.value.contentWindow.postMessage({
            type: 'evaluate',
            code: code.value,
            config: JSON.parse(JSON.stringify(config)),
        }, frameorigin.value);
    } catch (error) {
        result.value = 'Error: ' + error;
        isSuccess.value = false;
        isRunning.value = false;
    }
};
</script>

<template>
    <div class="app-main">
        <div class="app-header">
            <b>Mode:&nbsp;</b>
            <label><input type="radio" name="appmode" v-model="appmode" value="public"> Use public endpoint</label>
            <label><input type="radio" name="appmode" v-model="appmode" value="private"> Use private endpoint</label>
        </div>

        <div class="random-prefix" v-if="appmode === 'private'">
            <b>Random prefix:&nbsp;</b>
            <input v-model="random" type="text" readonly>
            <button @click="random = Math.random().toString(36).substring(2, 10)">Randomalize</button>
        </div>

        <div class="input-code">
            <b>Input the JavaScript code you want to execute:</b>
            <textarea v-model="code"></textarea>
        </div>

        <div class="exec-settings">
            <b>Settings:</b>
            <label><input type="checkbox" v-model="config.topLevelAwait"> Top Level Await supports (Wrap the code in an async function)</label>
            <label><input type="checkbox" v-model="config.simple"> Simple (Use arrow functions so that you don't need to return explicitly)</label>
            <label><input type="checkbox" v-model="config.unwrap"> Unwrap (Directly eval instead of wrap in a function)</label>
        </div>

        <div class="exec-and-res">
            <button @click="execcode" :disabled="!code">Execut{{ isRunning ? 'ing...' : 'e' }}</button>
            <button @click="result = ''">Clear</button>
            <div class="result">
                <b>Result:</b>
                <pre :data-err="!isSuccess" style="white-space: pre-wrap; max-height: 300px; overflow: auto;">{{ String(result) }}</pre>
            </div>
        </div>

        <iframe :src="framesrc" class="myframe" ref="frame"></iframe>
    </div>
</template>

<style scoped>
.app-main {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: 12px;
    font-family: system-ui, -apple-system, sans-serif;
}

.app-header {
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.app-header label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
}

.random-prefix {
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.random-prefix input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
    font-family: monospace;
}

.random-prefix button {
    padding: 6px 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
}

.random-prefix button:hover {
    background: #2563eb;
}

.input-code {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
    min-height: 200px;
}

.input-code b {
    margin-bottom: 8px;
}

.input-code textarea {
    flex: 1;
    resize: none;
    padding: 10px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-family: monospace;
    font-size: 14px;
}

.input-code textarea:focus {
    outline: none;
    border-color: #3b82f6;
}

.exec-settings {
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
}

.exec-settings b {
    margin-right: 8px;
}

.exec-settings label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
}

.exec-and-res {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.exec-and-res button {
    padding: 8px 20px;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    margin-right: 8px;
}

.exec-and-res button:first-child {
    background: #3b82f6;
    color: white;
}

.exec-and-res button:first-child:hover:not(:disabled) {
    background: #2563eb;
}

.exec-and-res button:first-child:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.exec-and-res button:last-child {
    background: #e5e7eb;
    color: #374151;
}

.exec-and-res button:last-child:hover {
    background: #d1d5db;
}

.result pre {
    margin: 0;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    font-family: monospace;
    font-size: 13px;
    white-space: pre-wrap;
    max-height: 300px;
    overflow: auto;
}

.result pre[data-err="true"] {
    color: #dc2626;
    border-color: #fca5a5;
    background: #fef2f2;
}

.myframe {
    display: none;
}
</style>
