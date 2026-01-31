const manifest = await (await fetch('/__/sandbox/app/.vite/manifest.json', { cache: 'no-cache' })).json();
const { main } = await import(`/__/sandbox/${manifest['src/main.ts'].file}`);
await main();