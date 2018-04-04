//Push-Event -> Noch in Entwicklung
self.addEventListener("push", function(event) { console.log("hier");
    let data = event.data.json(); console.log(data);
    if (data.type === "user-registration") {
        let user = data.user;
        event.waitUntil(
                self.registration.showNotification("Neur Nutzer :", {
                    body: user.nickname + " hat sich registriert.",
                    icon: "/images/icons/icon-64x64.png",
                    tag: "user-registration",
                    vibrate: [500,110,500,110,450,110,200,110,170,40,450,110,200,110]
                })

        );
    }
});