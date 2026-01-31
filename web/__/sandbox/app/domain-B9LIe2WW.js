import { n as HOST_BASE, r as TRUSTED_ORIGINS } from "./config-B0WMfqV1.js";
async function asha256(e) {
	return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", e))).map((e) => e.toString(16).padStart(2, "0")).join("");
}
async function sha256(e) {
	return await asha256(new TextEncoder().encode(e));
}
const hostname = window.location.hostname, prefix = hostname.endsWith(HOST_BASE) ? hostname.slice(0, hostname.length - HOST_BASE.length) : "";
var publicSiteRegex = /^public(\d+)\.$/, specificSiteRegex = /^([a-z0-9]+?)-([a-f0-9]+?)\.$/;
const isPublicSite = publicSiteRegex.test(prefix);
isPublicSite && publicSiteRegex.exec(prefix)[1];
const isSpecificSite = specificSiteRegex.test(prefix), [specificSiteId, specificSiteHash] = isSpecificSite ? specificSiteRegex.exec(prefix) : ["", ""], cachedDomainName2Hash = /* @__PURE__ */ new Map();
async function getDomainHash(e) {
	if (cachedDomainName2Hash.has(e)) return cachedDomainName2Hash.get(e);
	let p = (await sha256(e)).substring(0, 32);
	return cachedDomainName2Hash.set(e, p), p;
}
async function checkOrigin(e, m = !0) {
	return isPublicSite ? m : TRUSTED_ORIGINS.includes(e) ? !0 : isSpecificSite ? await getDomainHash(e) === specificSiteHash : !1;
}
export { checkOrigin as t };

//# sourceMappingURL=domain-B9LIe2WW.js.map