((async function () {
    const { HOST_BASE } = await import('./config.js');
    const { hostname, pathname } = window.location;
    if (!hostname.endsWith(HOST_BASE)) {
        window.document.body.appendChild(window.document.createElement('h1')).innerHTML = "Error: Invalid Hostname";
        return;
    }
    const isEmbedded = (window.parent !== window.self);
    const host_prefix = hostname.slice(0, hostname.length - HOST_BASE.length);
    if (!host_prefix || host_prefix === 'www.') {
        if (isEmbedded) {
            // Randomly pick a subdomain for embedding
            const random_subdomain = window.crypto.randomUUID().replace(/-/g, '');
            window.location.href = `https://${random_subdomain}.${HOST_BASE}/usercontent.html#${pathname}`;
        }
        else {
            window.location.href = `https://${HOST_BASE}/frontend/#${pathname}`;
        }
        return;
    }
    window.document.body.appendChild(window.document.createElement('h1')).innerHTML = "Error: Invalid Host Prefix";
    window.document.body.appendChild(window.document.createElement('p')).innerHTML = `Did you mean to visit <a href="./usercontent.html">usercontent.html</a>?`;
})());