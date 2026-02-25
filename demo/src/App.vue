<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { stringify } from 'flatted';

const code = ref('');
const appmode = ref('private');
const result = ref(''), resultOptions = ref('');
const random = ref('12345678'), randomBuffer = ref('12345678');
const frame = ref<HTMLIFrameElement | null>(null);
const originHash = ref('');
const allowListLoaded = ref(false);
const allowList = ref('');

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
    return `https://${prefix.value}.${globalThis.config.HOST_BASE}/__/usercontent.html`;
});
const frameorigin = computed(() => {
    try {
        return new URL(framesrc.value).origin;
    } catch (error) {
        return '';
    }
});

const config = reactive({
    modularize: false,
    topLevelAwait: true,
    simple: false,
    unwrap: false,
})

const isRunning = ref(false), isSuccess = ref(true);
const showFrame = ref(false);

onMounted(async () => { 
    window.addEventListener('message', handleMessage);
    allowList.value = await (fetch('/demo/allowlist.txt').then(res => res.text()).catch(() => ''));
    allowListLoaded.value = true;
});

onBeforeUnmount(() => {
    window.removeEventListener('message', handleMessage);
});

watch(() => random.value, (newValue) => {
    randomBuffer.value = newValue;
});

const updateRandom = () => {
    // 63 是域名每一个部分（. 分隔）的最大长度
    // 1 是 - 分隔符
    // originHash.value 是 32 个字符
    // 因此 randomBuffer.value 最多只能有 63 - 1 - 32 = 30 个字符
    if (!randomBuffer.value || randomBuffer.value.length > (63 - 1 - originHash.value.length)) { 
        randomBuffer.value = random.value;
        return;
    }
    random.value = randomBuffer.value;
}

const displayResult = computed(() => {
    if (resultOptions.value === 'flatted') return stringify(result.value);
    if (resultOptions.value === 'json') return JSON.stringify(result.value, null, 2);
    return String(result.value);
})

const copyResult = async () => {
    try {
        await navigator.clipboard.writeText(displayResult.value);
    } catch (error) {
        alert('Failed to copy:' + error);
    }
};

const setSpPromise = ref<((ok: boolean) => void) | null>(null)

const handleMessage = (event: MessageEvent) => {
    if (event.origin !== frameorigin.value) return;
    if (event.data.type !== 'result') return;
    if (event.data.command === 'setSecurityPolicy') return setSpPromise.value?.(event.data.success);
    if (event.data.command !== 'evaluate') return;
    isSuccess.value = event.data.success;
    if (event.data.success) {
        result.value = event.data.result;
    } else {
        result.value = 'Error: ' + event.data.error + '\n' + event.data.stack;
    }
    isRunning.value = false;
}

const hasSetSp = ref(false);

const execcode = async () => {
    try {
        isRunning.value = true;

        // 先测试ping是否正常
        await new Promise<void>((resolve, reject) => {
            setTimeout(() => (reject(new Error('Timeout: Ping failed\nIt seems that the sandbox is not connected. Please try to refresh the page.')), window.removeEventListener('message', handleMessage)), 5000);
            function handleMessage(event: MessageEvent) {
                if (event.origin !== frameorigin.value) return;
                if (event.data.type !== 'pong') return;
                resolve();
                window.removeEventListener('message', handleMessage);
            }
            window.addEventListener('message', handleMessage);
            // @ts-expect-error
            frame.value.contentWindow.postMessage({ type: 'ping' }, frameorigin.value);
        });
        
        if (!hasSetSp.value) if (!await new Promise<boolean>((resolve) => {
            setSpPromise.value = resolve;
            // @ts-expect-error
            frame.value.contentWindow.postMessage({ type: 'setSecurityPolicy', allowEvaluate: true }, frameorigin.value);
        })) throw new Error('Failed to set security policy');
        hasSetSp.value = true;

        isSuccess.value = true;
        result.value = 'Executing...';
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
    <div class="app-wrapper">
        <div class="app-main">
            <div class="app-header">
                <b>Mode:&nbsp;</b>
                <label><input type="radio" name="appmode" v-model="appmode" value="public"> Use public endpoint</label>
                <label><input type="radio" name="appmode" v-model="appmode" value="private"> Use private endpoint</label>
            </div>
    
            <div class="random-prefix" v-if="appmode === 'private'">
                <b>Random prefix:&nbsp;</b>
                <input v-model="randomBuffer" type="text" @blur="updateRandom" @keyup.enter="updateRandom">
                <button @click="random = Math.random().toString(36).substring(2, 10)">Randomalize</button>
            </div>
    
            <div class="input-code">
                <b>Input the JavaScript code you want to execute:</b>
                <textarea v-model="code"></textarea>
            </div>
    
            <div class="exec-settings">
                <b>Settings:</b>
                <label><input type="checkbox" v-model="config.modularize"> Modularize (Wrap the code in ECMAScript module; you'll need to use export to return data)</label>
                <label><input type="checkbox" v-model="config.topLevelAwait"> Top Level Await supports (Wrap the code in an async function)</label>
                <label><input type="checkbox" v-model="config.simple"> Simple (Use arrow functions so that you don't need to return explicitly)</label>
                <label><input type="checkbox" v-model="config.unwrap"> Unwrap (Directly eval instead of wrap in a function)</label>
                <label v-if="!hasSetSp"><input type="checkbox" v-model="hasSetSp" :disabled="hasSetSp"> Ignore security policy</label>
            </div>
    
            <div class="exec-settings">
                <b>Output settings:</b>
                <label><input type="radio" name="resultOptions" value="flatted" v-model="resultOptions"> Flatted stringify</label>
                <label><input type="radio" name="resultOptions" value="json" v-model="resultOptions"> JSON stringify</label>
                <label><input type="radio" name="resultOptions" value="" v-model="resultOptions"> No stringify (Convert to string)</label>
            </div>
    
            <div class="exec-and-res">
                <button @click="execcode" :disabled="!code">Execut{{ isRunning ? 'ing...' : 'e' }}</button>
                <button @click="result = ''">Clear</button>
                <div class="result">
                    <b>Result:</b>
                    <pre :data-err="!isSuccess">{{ (displayResult) }}</pre>
                    <button @click="copyResult" :disabled="!result">Copy</button>
                </div>
            </div>
    
            <div class="frame-toggle">
                <label><input type="checkbox" v-model="showFrame"> Show iframe</label>
            </div>
    
            <iframe v-if="originHash && allowListLoaded" :src="framesrc" :allow="allowList" class="myframe" :class="{ 'myframe-visible': showFrame }" ref="frame"></iframe>
    
        </div>
    </div>
</template>

<style scoped>
.app-wrapper {
    position: absolute;
    inset: 0;
    overflow: auto;
}

.app-main {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding: 10px;
}

.app-main > * {
    overflow: auto;
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
    /* white-space: nowrap; */
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
    min-height: 300px;
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
    word-break: break-all;
    overflow: auto;
}

.result pre[data-err="true"] {
    color: #dc2626;
    border-color: #fca5a5;
    background: #fef2f2;
}

.result button {
    padding: 6px 16px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    margin-top: 8px;
}

.result button:hover:not(:disabled) {
    background: #2563eb;
}

.result button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.frame-toggle {
    padding: 12px 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
}

.frame-toggle label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
}

.myframe {
    display: none;
    width: 100%;
    height: calc(100vh - 2em);
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-sizing: border-box;
}

.myframe-visible {
    display: block;
}
</style>
