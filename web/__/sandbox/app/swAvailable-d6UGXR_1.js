function serviceWorkerAvailable() {
	return "serviceWorker" in navigator && typeof navigator.serviceWorker.register == "function";
}
async function serviceWorkerWorking() {
	return await (await fetch("/__/_/_w")).text() === "true";
}
export { serviceWorkerAvailable, serviceWorkerWorking };

//# sourceMappingURL=swAvailable-d6UGXR_1.js.map