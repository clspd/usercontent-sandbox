<template>
    <div class="not-found">
        <div class="content">
            <h1>404</h1>
            <h2>页面未找到</h2>
            <p>抱歉，您访问的页面不存在。</p>
            <router-link to="/" class="btn-home">Take me home</router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.not-found {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
    text-align: center;
    color: white;
    padding: 2rem;
}

h1 {
    font-size: 5rem;
    margin: 0;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

h2 {
    font-size: 2rem;
    margin: 0.5rem 0 1rem 0;
}

p {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.btn-home {
    display: inline-block;
    padding: 0.75rem 2rem;
    background-color: white;
    color: #667eea;
    text-decoration: none;
    border-radius: 4px;
    font-weight: bold;
    transition: all 0.3s;
}

.btn-home:hover {
    background-color: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
