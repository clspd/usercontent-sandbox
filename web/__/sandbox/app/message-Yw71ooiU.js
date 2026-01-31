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
	if (await checkOrigin(i, !1) && !(!r || typeof r != "object")) switch (r.type) {
		case "ping": return reply(n, { type: "pong" });
		case "isAvailable": return reply(n, {
			type: "isAvailable",
			result: await (async () => {
				try {
					let { serviceWorkerAvailable: e } = await import("./swAvailable-d6UGXR_1.js");
					return e();
				} catch {
					return !1;
				}
			})()
		});
		case "isWorkable": return reply(n, {
			type: "isWorkable",
			result: await (async () => {
				try {
					let { serviceWorkerWorking: e } = await import("./swAvailable-d6UGXR_1.js");
					return e();
				} catch {
					return !1;
				}
			})()
		});
		case "register": try {
			return await navigator.serviceWorker.register("/__service_worker__.js", { scope: "/" }), reply(n, {
				type: "registerResult",
				success: !0
			});
		} catch (e) {
			return reply(n, {
				type: "registerResult",
				success: !1,
				reason: String(e),
				stack: String(e?.stack)
			});
		}
		default: break;
	}
}
export { setupEventHandlers };

//# sourceMappingURL=message-Yw71ooiU.js.map