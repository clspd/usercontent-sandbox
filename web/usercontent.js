((async function () {
    const mainfile = await (await fetch('/__/sandbox/runtime/mainfile.txt', { cache: 'no-cache' })).text();
    const script = document.createElement('script');
    script.src = `/__/sandbox/runtime/${mainfile}`;
    document.head.append(script);
})());