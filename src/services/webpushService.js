import { api } from "./api";

const VAPID_PUBLIC_KEY = "BN5EfzM7Asc3NCHngCLvX62sPm7945eViuvbY0EV2Q7xaNzgEYTDu1dkS1tV3CkjBcO7BzyZx5psDEncqocDw_4";

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export async function suscribirPush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const permiso = await Notification.requestPermission();
    if (permiso !== "granted") return;

    const registro = await navigator.serviceWorker.ready;

    const suscripcion = await registro.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await api.post("/webpush/suscribir", suscripcion.toJSON());
}

export async function desuscribirPush() {
    if (!("serviceWorker" in navigator)) return;

    const registro = await navigator.serviceWorker.getRegistration();
    if (!registro) return;

    const suscripcion = await registro.pushManager.getSubscription();
    if (!suscripcion) return;

    await api.post("/webpush/desuscribir", { endpoint: suscripcion.endpoint });
    await suscripcion.unsubscribe();
}

export async function registrarServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    await navigator.serviceWorker.register("/sw.js");
}
