<script setup lang="ts">

</script>

<template>
    <div class="app-container">
        <router-view />
    </div>
</template>

<style scoped>
.app-container {
    display: flex;
    flex-direction: column;
    position: absolute;
    inset: 0;
    z-index: 0;
}
</style>
