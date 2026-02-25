((async function () {
    const { HOST_BASE, USERCODE_PLATFORM } = await (await fetch('/__/config.json')).json();
    const { hostname, pathname } = window.location;
    if (!hostname.endsWith(HOST_BASE) && !hostname.endsWith(PLATFORM_BASE)) {
        window.document.body.appendChild(window.document.createElement('h1')).innerHTML = "Error: Invalid Hostname";
        return;
    }
    const isEmbedded = (window.parent !== window.self);
    const host_prefix = hostname.slice(0, hostname.length - (hostname.endsWith(HOST_BASE) ? HOST_BASE : PLATFORM_BASE).length);
    if (!host_prefix || host_prefix === 'www.') {
        if (isEmbedded) {
            // // Randomly pick a subdomain for embedding
            const r = (Math.random() * 1e10) % 10; // 0-9
            window.location.href = `https://public${r}.${HOST_BASE}/usercontent.html#${pathname}`;
        }
        else {
            window.location.href = `https://${USERCODE_PLATFORM}/#${pathname}`;
        }
        return;
    }
    window.document.body.appendChild(window.document.createElement('h1')).innerHTML = "Error: Invalid Host Prefix";
    window.document.body.appendChild(window.document.createElement('p')).innerHTML = `Did you mean to visit <a href="./usercontent.html">usercontent.html</a>?`;
})());
