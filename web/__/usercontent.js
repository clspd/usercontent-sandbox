((async function() {
    const manifest = await (await fetch('/__/sandbox/runtime/.vite/manifest.json', { cache: 'no-cache' })).json();
    const script = document.createElement('script');
    script.src = `/__/sandbox/${manifest['src/ucs-runtime.ts'].file}`;
    document.head.append(script);
})());