self.addEventListener("push", (event) => {
    const data = event.data?.json() ?? { title: "OptiLuxe", body: "Tienes una nueva notificación" };

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: "/vite.svg",
            badge: "/vite.svg",
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) return clientList[0].focus();
            return clients.openWindow("/");
        })
    );
});
