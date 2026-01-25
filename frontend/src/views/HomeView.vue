<template>
    <div class="home">
        <h1>Welcome to the Usercontent Sandbox</h1>
        <p>Choose a language to start editing:</p>
        <router-link to="/editor/javascript" class="btn">JavaScript</router-link>
    </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home {
    padding: 2rem;
    text-align: center;
}

h1 {
    margin-bottom: 1rem;
    color: #333;
}

p {
    margin-bottom: 1.5rem;
    color: #666;
}

.btn {
    display: inline-block;
    margin: 0 0.5rem;
    padding: 0.75rem 1.5rem;
    background-color: #4CAF50;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.btn:hover {
    background-color: #45a049;
}
</style>
