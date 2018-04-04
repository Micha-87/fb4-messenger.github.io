/* Noch in Entwicklung

let webpush = require("web-push");

/!**
 * Sends a push message to all subscriptions
 *!/

function notify(pushPayload) {
    let pushKeys;
    $.getJSON("/pushkeys/", function (data) {
        pushKeys = data;
        pushPayload = JSON.stringify(pushPayload);
        webpush.setGCMAPIKey(pushKeys[0].GCMAPIKey);
        webpush.setVapidDetails(
            pushKeys[0].subject,
            pushKeys[0].publicKey,
            pushKeys[0].privateKey
        );

        $.getJSON("/subscriptions/", function (subscriptions) {
            subscriptions.forEach(function (subscription) {
                webpush
                    .sendNotification(subscription, pushPayload)
                    .then(function () {
                        console.log("Notification sent");
                    })
                    .catch(function (err) {
                        console.log(err);

                        console.log("Notification failed");
                    });
            });
        });
    });
};
*/
