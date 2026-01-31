// const { HOST_BASE, TRUSTED_ORIGINS } = await (await fetch('/__/config.json')).json();
import { HOST_BASE, TRUSTED_ORIGINS } from '../web/__/config.json' with { type: 'json' };
import sha256 from './sha256.js';
export const hostname = window.location.hostname;
export const isCorrectHostname = hostname.endsWith(HOST_BASE);
export const prefix = isCorrectHostname ? hostname.slice(0, hostname.length - HOST_BASE.length) : '';

const publicSiteRegex = /^public(\d+)\.$/;
const specificSiteRegex = /^([a-z0-9]+?)-([a-f0-9]+?)\.$/; // 1: random id 2: sha256(origin).substring(0, 32)

export const isPublicSite = publicSiteRegex.test(prefix);
export const publicSiteId = isPublicSite ? publicSiteRegex.exec(prefix)[1] : '';

export const isSpecificSite = specificSiteRegex.test(prefix);
export const [specificSiteId, specificSiteHash] = isSpecificSite ? specificSiteRegex.exec(prefix) : ['', ''];

export const cachedDomainName2Hash = new Map();

export async function getDomainHash(domainName: string) {
    if (cachedDomainName2Hash.has(domainName)) {
        return cachedDomainName2Hash.get(domainName);
    }
    const hash = (await sha256(domainName)).substring(0, 32);
    cachedDomainName2Hash.set(domainName, hash);
    return hash;
}

export async function checkOrigin(origin: string, allowPublic = true) {
    if (isPublicSite) return allowPublic;
    if (TRUSTED_ORIGINS.includes(origin)) return true;
    if (!isSpecificSite) return false;
    const domainHash = await getDomainHash(origin);
    return domainHash === specificSiteHash;
}
