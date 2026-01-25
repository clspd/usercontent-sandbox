<template>
    <div class="editor">
        <div class="editor-header">
            <h1>{{ lang }} Editor</h1>
            <router-link to="/" class="btn-back">← Back to Home</router-link>
        </div>
        <div class="editor-content">
            <div class="placeholder">
                <p>editor placeholder - {{ lang }}</p>
                <p class="hint">Coming soon!</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    lang: {
        type: String,
        required: true,
    },
})
</script>

<style scoped>
.editor {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 1rem;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e0e0e0;
}

h1 {
    margin: 0;
    color: #333;
}

.btn-back {
    padding: 0.5rem 1rem;
    background-color: #2196F3;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.btn-back:hover {
    background-color: #0b7dda;
}

.editor-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.placeholder {
    text-align: center;
    padding: 2rem;
    background-color: #f5f5f5;
    border-radius: 8px;
    border: 2px dashed #ccc;
}

.placeholder p {
    margin: 0.5rem 0;
    color: #666;
}

.hint {
    font-size: 0.9rem;
    color: #999;
}
</style>
