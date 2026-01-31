import "./config-B0WMfqV1.js";
import { t as checkOrigin } from "./domain-B9LIe2WW.js";
function setupEventHandlers() {
	globalThis.addEventListener("message", handleMessage);
}
function reply(e, n) {
	return e.source.postMessage(n, e.origin);
}
async function handleMessage(n) {
	let { data: r, origin: i } = n;
	if (await checkOrigin(i) && !(!r || typeof r != "object")) switch (r.type) {
		case "ping": return reply(n, { type: "pong" });
		case "render":
			try {
				return document.documentElement.outerHTML = r.code, reply(n, {
					type: "renderResult",
					success: !0
				});
			} catch (e) {
				return reply(n, {
					type: "renderResult",
					success: !1,
					error: String(e),
					stack: String(e?.stack)
				});
			}
			break;
		case "evaluate":
			try {
				let e = r.config || {}, i;
				if (e.unwrap) i = Function("return eval(arguments[0])")(r.code);
				else {
					let n;
					n = e.topLevelAwait ? `return ((async function () { ${r.code} })());` : e.simple ? `return (() => ${r.code})();` : r.code, i = await Function(n)();
				}
				return reply(n, {
					type: "evaluateResult",
					success: !0,
					result: i
				});
			} catch (e) {
				return reply(n, {
					type: "evaluateResult",
					success: !1,
					error: String(e),
					stack: String(e?.stack)
				});
			}
			break;
		default: break;
	}
}
export { setupEventHandlers };

//# sourceMappingURL=message-5nFyMq3S.js.map