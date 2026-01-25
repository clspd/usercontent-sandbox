import manifest from './sandbox/.vite/manifest.json' with { type: 'json' };
const { main } = await import(`./sandbox/${manifest['src/main.js'].file}`);
await main();
