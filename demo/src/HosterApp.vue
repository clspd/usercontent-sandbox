<template>
    <div class="app">
        <div class="header">
            <h1>Site Hoster Demo</h1>
            <p>Deploy a virtual site using the usercontent sandbox</p>
        </div>

        <div class="step" v-if="!frameLoaded">
            <h2>Step 1: Choose assets</h2>
            <p>Select the assets you want to deploy.</p>
            <div class="choose">
                <label><input type="radio" v-model="assetType" name="asset-type" value="zip"> Upload Zip</label>
                <label><input type="radio" v-model="assetType" name="asset-type" value="files"> Upload Files</label>
                <label hidden><input type="radio" v-model="assetType" name="asset-type" value="dir"> Choose Directory</label>
            </div>
            <div class="upload-file" v-if="assetType === 'zip' || assetType === 'files'">
                <b>Upload File</b>
                <input type="file" :multiple="assetType === 'files'" @change="handleFiles">
            </div>
            <div class="upload-file" v-if="assetType === 'dir'">
                <b>Upload Directory</b>
                TODO!!
            </div>
            <div class="file-count">
                <p>Selected {{ files.size }} files</p>
                <button @click="files.clear()">Clear</button>
            </div>
        </div>

        <div class="step" v-if="!frameLoaded">
            <h2>Step 2: Choose prefix</h2>
            <p>Choose an virtual prefix for the site. Note that the suffix is fixed due to the security reason.</p>
            <input type="text" v-model="prefix" placeholder="e.g. mysite">
            <button @click="prefix = Math.random().toString(36).substring(2, 10)">Give me a random prefix</button>
        </div>

        <div class="step" v-if="!frameLoaded">
            <h2>Step 3: Load the window</h2>
            <p>An window must be loaded so that we can put the site content into it.</p>
            <button @click="loadFrame">Load window</button>
        </div>

        <div class="step" hidden>
            <p>The frame is as follows. It is not intended to be used directly.</p>
            <iframe ref="frame" :src="frameSrc"></iframe>
        </div>

        <div class="step" v-if="frameLoaded" hidden>
            <h2>Step 4: Activate Service Worker</h2>
            <p>Service worker is required to enable the site content to be cached.</p>
            <button @click="activateServiceWorker" v-if="!isServiceWorkerActive">Activate Service Worker</button>
            <p v-else>Service worker is active now!</p>
        </div>

        <div class="step" v-if="1">
            <h2>Step 4: Put your files to the frame</h2>
            <p>Don't worry -- you just need to click the button below.</p>
            <button @click="putFilesToFrame" v-if="!success">Put Files to Frame</button>
            <p>Progress: {{ putProgress }} / {{ files.size }}</p>
        </div>

        <div class="step" v-if="success">
            <h2>Success! You're all set</h2>
            <p>Now you can <a :href="frameOrigin" target="_blank">visit your site</a></p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { unzip } from 'fflate';
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getMimeType } from './util';

const assetType = ref('zip');
const prefix = ref('');
// const frame = ref<HTMLIFrameElement | null>(null);
const win = ref<Window | null>(null);
const originHash = ref('');
const files = ref<Map<string, Blob>>(new Map());
const frameLoaded = ref(false);
const frameSrc = ref('');

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

const handleFiles = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    if (assetType.value === 'zip') {
        const zipPack = target.files[0];
        if (!zipPack) return;
        unzip(new Uint8Array(await zipPack.arrayBuffer()), (err, out) => {
            if (err) {
                alert('Failed to unzip the file:' + err);
                return;
            }
            for (const i of Object.entries(out)) {
                // @ts-ignore
                files.value.set(i[0], new Blob([i[1]], { type: getMimeType(i[0]) }));
            }
        });
    } else {
        for (const i of target.files) {
            files.value.set(i.name, i);
        }
    }
}

const frameOrigin = ref('');
const loadFrame = () => {
    // if (!frame.value) return;
    if (!prefix.value || files.value.size === 0) {
        alert('Please choose a prefix and upload some files before you can load the iframe.');
        return;
    }
    frameSrc.value = `https://${prefix.value}-${originHash.value}.usercontent.clspd.top/__/`;
    frameOrigin.value = new URL(frameSrc.value).origin;
    frameLoaded.value = true;
    win.value = window.open(frameSrc.value, '_blank');
}

const isServiceWorkerActive = ref(false);
onMounted(() => {
    window.addEventListener('message', handleMessage);
});
onBeforeUnmount(() => {
    window.removeEventListener('message', handleMessage);
});

const reqNonce = ref(0);
const replyHandler = ref<(data: any) => void>(() => {});
const handleMessage = (event: MessageEvent) => {
    if (event.origin !== frameOrigin.value) return;
    if (event.data.type === 'putFileResult' && event.data.nonce === reqNonce.value) {
        replyHandler.value(event.data);
        return;
    }
    if (event.data.type !== 'registerResult') return;
    isServiceWorkerActive.value = event.data.success;
    if (!event.data.success) {
        alert('Failed to register service worker: ' + event.data.reason + '\n' + event.data.stack);
    }
}

const activateServiceWorker = async function () {
    if (!win.value) return;
    win.value.postMessage({ type: 'register' }, frameOrigin.value);
}

const putProgress = ref(0);
const success = ref(false);
const putFilesToFrame = async function () {
    if (!win.value) return;
    try {
        for (const i of files.value) {
            putProgress.value++;
            reqNonce.value = Date.now();
            win.value.postMessage({ type: 'putFile', name: i[0], content: i[1], nonce: reqNonce.value }, frameOrigin.value);
            await new Promise((resolve, reject) => {
                replyHandler.value = (data) => {
                    if (data.success) {
                        resolve(data);
                    } else {
                        reject(data);
                    }
                }
            });
        }
        success.value = true;
    } catch (error) {
        alert('Failed to put files to frame: ' + error);
    }
}
</script>

<style scoped>
.app {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    padding: 10px;
    overflow: auto;
}
.header {
    border-bottom: 1px solid #000000;
}
.header > h1 {
    margin: 0;
}
</style>
