//Einbinden der APIs
let io = require("socket.io-client");
let socket = io.connect(); //"http://localhost:3000"

//Variablen
let sender_nickname;
let receiver_nickname;
let user_chosen = false;
let messagesRightCount = 0;
let messagesLeftCount = 0;

function countUnreadMessages(user_nickname){
    return new Promise(function(resolve){
        let unreadMessages = 0;
        getMessages(user_nickname).then(function (messages) {
            for(let i = 0; i < messages.length; i++){
                if(user_nickname == messages[i].sender && sender_nickname === messages[i].receiver && !messages[i].messageread)
                {
                    unreadMessages++;
                }
            }
            resolve(unreadMessages);
        });
    });
}

function lastMessageInfo(user_nickname) {
    return new Promise(function (resolve, reject) {
        let lastMessage = [];

        getMessages(user_nickname).then(function (messages) {
            let options = { year: 'numeric', month: 'long', day: 'numeric' };
            let date = new Date().toLocaleDateString('de-DE', options);
            if(messages.length != 0){
                for (let i = 0; i < messages.length; i++) {
                    if (user_nickname === messages[i].sender && sender_nickname === messages[i].receiver || user_nickname === messages[i].receiver && sender_nickname === messages[i].sender) {
                        lastMessage[0] = messages[i].fullmessagedate.substr(messages[i].fullmessagedate.indexOf(",") + 2, messages[i].fullmessagedate.length);
                        lastMessage[1] = messages[i].message;
                        lastMessage[2] = messages[i].sender;
                        if(date !== messages[i].fullmessagedate.substr(0,messages[i].fullmessagedate.indexOf(",")))
                        {
                            lastMessage[0] = messages[i].fullmessagedate.substr(0,messages[i].fullmessagedate.indexOf(","));
                        }
                    }
                }
                resolve(lastMessage);
            }
        });
    });
}
//Ändert den Wert der Variable messageread auf true in den DBs
function setReadToTrue(chosen_user_name) {
    getMessages(chosen_user_name).then(function (messages) {
        let messageread = {messageread: true};
        messages.forEach(function (message) {
            if(message.sender === chosen_user_name && message.receiver === sender_nickname){
                //Änderung in der MongoDB
                $.ajax({
                    url: "/messages/messageRead/" + message._id,
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify(messageread),
                    success: function(data) {}
                });
                //Änderung in der IndexedDB
                setMessageFromUnreadToRead(message.fullmessagedate, messageread.messageread);
            }
        })
    });
}

//Reagieren auf Ereignis "add-message", das ausgelöst wird, wenn Nachrichten versendet werden
socket.on("add-message", function (data) {
    //Variablen für das Anzeigen der Nachricht
    let $li = $("<li>");
    let $image;
    let $span;
    let $date;
    let $p;
    let message;

    //Wenn ein User ausgewählt  und
    //da socket.io standardmäßig Ereignisse an alle angeschlossenen User verschickt, muss sischergestellt werden, dass die Nachricht
    //nur die gewünschte Person erreicht und nur im Nachrichtenverauf des Senders und des Empfängers angezeigt wird.
    if (user_chosen && (data.sender === sender_nickname && data.receiver === receiver_nickname || data.sender === receiver_nickname && data.receiver === sender_nickname)) {
        $p = $("<p>").text(data.time);

        //Hier wird die Position der Nachricht im Chatverlauf bestimmt (Rechts oder Links) Sender immer rechts
        if (data.sender === sender_nickname) {
            if(messagesRightCount == 0 || data.date != ""){
                $image = $("<img class='img-rounded' src='../images/standard_profile_image/standard_profile_image.png'   style='float: right'>")
                $span = $("<span class='right'>").text(data.content);
            }
            else {
                $span = $("<span class='right2' style='margin-right: 3em'>").text(data.content);
            }

            messagesLeftCount = 0;
            messagesRightCount++;
        }
        else {
            if(messagesLeftCount == 0 || data.date != "")
            {
                $image = $("<img class='img-rounded' src='../images/standard_profile_image/standard_profile_image.png' alt='profile image' style='float: left'>")
                $span = $("<span class='left'>").text(data.content);
            }
            else {
                $span = $("<span class='left2' style='margin-left: 3em'>").text(data.content);
            }

            messagesRightCount = 0;
            messagesLeftCount++;
        }
        $span.append($p);

        $li.append($image);
        $li.append($span);
        //Damit Datum nicht nach jeder Nachricht sondern nur ein mal am Tag hinzugefügt wird.
        if(data.date != "") {
            $("#messages").append("<li class='date_li'><span class='date'>" + data.date + "</span></li>");
        }
        $("#messages").append($li);
    }
    //Message-Objekt
    message = {
        sender: data.sender,
        receiver: data.receiver,
        message: data.content,
        time: data.time,
        date: data.date,
        fullmessagedate: data.fullmessagedate,
        messageread: data.messageread
    };

    //Hinzufügen der Message zur IndexedDB
    addMessageToObjectStore("messages", message);

    countUnreadMessages(data.sender).then(function(unreadMessages){console.log(unreadMessages)
        $(".list-group-item").each(function (index, ele) {
            let button = $(ele);
            let chosen_user = $(".chosen_user", button).text();

            if (!button.hasClass("active") && chosen_user === data.sender && sender_nickname === data.receiver) {
                $(".new-message", button).text(unreadMessages);
            }

            if(button.hasClass("active")){
                setReadToTrue($(".active .chosen_user", button).text());
            }
        });
    });

    lastMessageInfo(sender_nickname === data.sender ? data.receiver : data.sender).then(function (lastMessage) {
        $(".list-group-item").each(function (index, ele) {
            let button = $(ele);
            let chosen_user = $(".chosen_user", button).text();

            if(chosen_user === data.sender && sender_nickname === data.receiver){
                $(this).insertBefore($(".list-group-item").eq(0));
                $(".lastMessageTime", button).text(lastMessage[0].substr(0, 5));
                $(".lastMessage", button).text(lastMessage[1] == ""? "": lastMessage[1]);

                if($(".lastMessage", button).text() &&$(".lastMessage", button).text().length > 14)
                {
                    $(".lastMessage", button).text(lastMessage[1].substr(0, 13)+"...");
                }
            }
        });
    });

    //Setzen des Schiebereglers nach unten bei der Eingabe einer neuen Nachricht
    $(".message-window").animate({scrollTop: $(document).height() + $(".message-window").css("height")}, "slow");
});

//Home Controller, Controller des Views "home.html"
angular.module("HomeCtrl", []).controller("HomeController", ["$scope", "LoginService", "$http", "$route",
    function ($scope, LoginService, $http, $route) {
        //Beim Starten der App Anzahl der ungelesenen Nachrichten anzeigen
        getUsers().then(function (users) {
            users.forEach(function (user) {
                if (user.nickname != sender_nickname) {
                    countUnreadMessages(user.nickname).then(function(unreadMessages){
                        $(".list-group-item").each(function (index, ele) {
                            let button = $(ele);
                            let chosen_user = $(".chosen_user", button).text();
                            if (chosen_user === user.nickname && unreadMessages != 0) {
                                $(".new-message", button).text(unreadMessages);
                            }
                          /*  getMessages(user.nickname).then(function (messages) {
                                messages.forEach(function (message) {
                                    if (chosen_user === message.sender && sender_nickname === message.receiver && unreadMessages != 0) {
                                        $(".new-message", button).text(unreadMessages);
                                    }
                                })
                            });*/
                        });
                    });
                }
            });
        });

        //neuer User hat sich registriert. Userliste wird aktualisiert und der Neue User erscheint bei allen anderen in der Userliste
        socket.on("db-changes-register", function (data) {
            let user = {
                nickname: data.nickname,
                name: data.name,
                email: data.email,
                password: ""
            };

            $(".list-group").empty();
            addUserToObjectStore("users",user);
            showUsers();
        });

        //Änderung des Usernicknames in IndexedDb jedes Users
        socket.on("user-nickname-changes-everywhere", function (data) {
            updateUserNickname(data.oldNickname, data.newNickname);
            $(".list-group").empty();
            showUsers();
        });
        //Änderung des Usernames in IndexedDb jedes Users
        socket.on("user-name-changes-everywhere", function (data) {
            updateUserName(data.nickname, data.name);
        });

        //Änderung der Useremail in IndexedDb jedes Users
        socket.on("user-email-changes-everywhere", function (data) {
            updateUserEmail(data.nickname, data.email);
        });

        //Änderung des Userpassworts in IndexedDb jedes Users
        socket.on("user-password-changes-everywhere", function (data) {
            updateUserPassword(data.nickname, data.password);
        });

        socket.on("connectedUsers", function (data) {
            console.log(data);
        });

        //Initialwerte
        let countUser = 0;
        $(".nouser").hide();
        $(".install").hide();
        $(".ios-add-tohomescreen").hide();

        //Anzeigen des Allerts auf einem Iphone, dass Benutzer die App dem Homescreen hinzufügen kann
        if (navigator.standalone == false) {
            //SessionStorage damit es nicht bei jedem Seiten Reload angezeigt wird. Nur bei erneutem Besuch der Seite

            let hasVisited = sessionStorage.getItem('washere');
            if (!hasVisited ) {
                // Ein Allert wird auf IOS angezeigt mit dem unteren Text
                $(".ios-add-tohomescreen").show();
                $(".ios-add-tohomescreen").delay(3000).fadeOut(1000)
                sessionStorage.setItem('washere', true);
            }
        }
        if (navigator.standalone == undefined) {
            // In einem Desktop browser Wird ein Alert mit dem Vorschlag die App zu installieren erscheinen
            if (window.matchMedia("(display-mode: browser").matches) {
                // We are in the browser
                window.addEventListener("beforeinstallprompt", function (event) {
                    event.preventDefault();
                    let $button = $("<button type='button' class='btn btn-myButton pull-right' data-dismiss='alert'><span aria-hidden='true'>Installieren</span></button>");
                    $(".install").show();
                    $(".install").find("button").remove();
                    $(".install").append($button);
                    $("#alert_text2 strong").text("Möchten Sie diese App installieren?");
                    $button.on("click", function () {
                        event.prompt();
                    });
                    /* event .userChoice.then( result => {
                            if (result.outcome == "dismissed") {
                                //TODO: Track no installation
                            } else {
                                //TODO: It was installed
                            }
                        });
                    });*/
                    return false;
                });
            }
        }

        //Abfragen ob User angemelder ist
        let loggedin = LoginService.isLoggedin();
        sender_nickname = LoginService.getLoggedinUserNickname();

        //Wenn User "angemeldet bleiben" ausgewählt hat
        if (localStorage.getItem("isChecked")) {
            loggedin = localStorage.getItem("loggedin");
            sender_nickname = localStorage.getItem("user_nickname");
        }

        //Wenn User angemeldet ist, verschwindet das Menü "anmelden" und es werden andere Menüpunkte angezeigt.
        //LocalStorage wird verwenden, damit man nach dem Anmelden, bei eine Refresh des Browsers nicht noch mal zur Startseite gelangt
        // und sich wieder anmelden muss
        if (!loggedin) {
            $scope.chatStyle = {"display": "none"};
            $scope.startlogoStyle = {"display": "inline"};
        }
        else {
            offerNotification();//Noch nicht vollständig implementiert

            socket.emit("connectedUser", {
                "connectedUser": sender_nickname,
                "socketId": socket.id
            });

            //Nach Anmeldung verschwindet das Startlogo und die User-und Nachtichtenlisten werden angezeogt
            $scope.chatStyle = {"display": "inline"};
            $scope.startlogoStyle = {"display": "none"};

            //Abfragen der User und der Nachrichten
            showUsers();

            getMessages(sender_nickname).then(function (messages) {
                let lastMessageSender,
                    lastMessageReceiver;
                for(let i = 0; i<messages.length; i++)
                {
                    lastMessageSender = messages[i].sender;
                    lastMessageReceiver = messages[i].receiver;
                }
                $(".list-group-item").each(function (index, ele) {
                    let button = $(ele);
                    let chosen_user = $(".chosen_user", button).text();

                    if(chosen_user === lastMessageSender || chosen_user === lastMessageReceiver ){
                        $(this).insertBefore($(".list-group-item").eq(0));
                    }
                });
            });

            getMessages(sender_nickname);

            //Damit auf mobilen Geräten beim Scrollen des Nachrichtenfensters die Tastatur verschwindet
            $(".message-window").on("touchstart", function() {$("textarea").blur();});

            //Versenden der Nachricht
            $scope.send = function () {
                if ($scope.message !== undefined) {
                    if (user_chosen) {
                        //Zeit und Datum für das Nachrichtenfenster
                        let options = { year: 'numeric', month: 'long', day: 'numeric' };
                        let date = new Date().toLocaleDateString('de-DE', options);

                        //Prüfen ob Nachrichten mit so einem Datum in der zentralen Datenbank existieren, damit ein Datum nur einmal angezeigt wird
                        let dateExist = false;
                        getMessages(sender_nickname).then(function (messages) {
                            for(let i = 0; i< messages.length; i++)
                            {
                                if(messages[i].date === date && (messages[i].sender === sender_nickname && messages[i].receiver === receiver_nickname || messages[i].sender === receiver_nickname && messages[i].receiver === sender_nickname))
                                {
                                    dateExist = true;
                                    break;
                                }
                            }
                            //Wenn bei einer der Nachrichten das Datum eingetragen ist, erhalten andere Nachrichten als Dateum leeren String
                            if(dateExist){
                                date = "";
                            }
                            let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
                            //Erstellen der Message
                            if ($scope.message.length != 0) {
                                let message = {
                                    sender: sender_nickname,
                                    receiver: receiver_nickname,
                                    message: $scope.message,
                                    time: new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3"),
                                    date: date,
                                    fullmessagedate: new Date().toLocaleString('de-DE', options),
                                    messageread: false
                                };

                                //Auslösen des Erreignisses, dass zuerst an den Server verschickt wird und dann oben empfangen wird
                                //socket.on("add-message")...
                                socket.emit("message", {
                                    "sender": message.sender,
                                    "receiver": message.receiver,
                                    "content": message.message,
                                    "time": message.time,
                                    "date": message.date,
                                    "fullmessagedate": message.fullmessagedate,
                                    "messageread": message.messageread
                                });
                                $scope.message = "";

                                //Speichern der Message in MongoDB
                                $http.post("/messages/", JSON.stringify(message));

                                lastMessageInfo($(".active .chosen_user").text()).then(function (lastMessage) {
                                    $(".list-group-item").each(function (index, ele) {
                                        let button = $(ele);
                                        let chosen_user = $(".chosen_user", button).text();

                                        if(chosen_user === receiver_nickname){
                                            $(this).insertBefore($(".list-group-item").eq(0));
                                        }
                                    });
                                    $(".active .lastMessageTime").text(lastMessage[0].substr(0, 5));
                                    $(".active .lastMessage").text(lastMessage[1] == ""? "": lastMessage[1]);

                                    if($(".active .lastMessage").text() && $(".active .lastMessage").text().length > 14)
                                    {
                                        $(".active .lastMessage").text(lastMessage[1].substr(0, 13)+"...");
                                    }
                                });
                            }
                        });
                    }
                    else {//Alerts
                        if (countUser == 0) {
                            $("#alert_text strong").text("Es gibt noch keine anderen Chat-Teilnehmer!");

                        }
                        else {
                            $("#alert_text strong").text("Sie haben keinen Chat-Teilnehmer gewählt!");
                        }
                        $(".nouser").removeClass("in").show();
                        $(".nouser").delay(1500).addClass("in").fadeOut(2000);
                    }
                }
                //Fokusieren des Eingabefelds der Nachrichten, denn die Tastatur sonst auf einem mobilen Gerät nach
                //dem Verschicken der Nachricht verschwindet.
                $(".form-control").focus();
            };

            //Suchen nach einem bestimmten User in der Liste
            $scope.searchUser = function () {
                // Declare variables
                let $search_input, filter, $button, $p;
                $search_input = $(".search");
                filter = $search_input.val().toUpperCase();
                $button = $(".list-group-item");
                // Listenelemente werden durchgelaufen und diejenigen, die nicht mit der Suchanfrage übereinstimmen, werden ausgeblendet
                for (i = 0; i < $button.length; i++) {
                    $p = $button[i].getElementsByTagName("p")[0];
                    if ($p.innerHTML.toUpperCase().indexOf(filter) > -1) {
                        $button[i].style.display = "";
                    } else {
                        $button[i].style.display = "none";
                    }
                }
            }
        }

        //User anzeigen-------------------------------------------------------------------------------------------------
        function showUsers() {
            getUsers().then(renderUsers);
        };

        function renderUsers(users) {
            users.forEach(function (user) {
                if (user.nickname != sender_nickname) {
                    renderUser(user);
                    countUser++;
                }
            });
        };

        function renderUser(user) {
            //Hinzufügen der Benutzer dem Benutzer Window
            let $image = ("<img class='img-rounded' src='../images/standard_profile_image/standard_profile_image.png' alt='profile image'>");
            let $button = $("<button type='button' class='list-group-item list-group-item-action'><span class='badge badge-default badge-pill new-message'></span></button>");
            $button.append($image);
            let $p = $("<p class='chosen_user'>").text(user.nickname);

            let $p2 = $("<p class='lastMessageTime'>");
            let $p3 = $("<p class='lastMessage' style='color: #9d9d9d'>");
            lastMessageInfo(user.nickname).then(function (lastMessage) {
               $p2.text(lastMessage[0]? (lastMessage[0].length > 8 ? lastMessage[0] : lastMessage[0].substr(0, 5)): "");
               $p3.text(lastMessage[1] == ""? "": lastMessage[1]);
               if(lastMessage[1] && lastMessage[1].length > 14)
               {
                   $p3.text(lastMessage[1].substr(0, 13)+"...");
               }
            });
            $button.append($p);
            $button.append($p2);
            $button.append($p3);

            $(".list-group").append($button);
        };

        //Messages anzeigen-------------------------------------------------------------------------------------------------
        function showMessages() {
            getMessages(sender_nickname).then(renderMessages);
        }

        function renderMessages(messages) {
            messages.forEach(function (message) {
                renderMessage(message);
            });
        };

        function renderMessage(message) {
            let $li = $("<li>");
            let $image;
            let $span;
            let $p;
            //Bestimmen der Position der Nachricht( Rechts oder Links)
            if (sender_nickname === message.sender && receiver_nickname === message.receiver) {
                if(messagesRightCount == 0 || message.date != ""){
                    $image = $("<img class='img-rounded' src='../images/standard_profile_image/standard_profile_image.png' alt='profile image' style='float: right'>")
                    $span = $("<span class='right'>").text(message.message);
                }
                else{
                    $span = $("<span class='right2' style='margin-right: 3em'>").text(message.message);
                }
                messagesLeftCount = 0;
                messagesRightCount++;

                $p = $("<p>").text(message.time);

                $span.append($p);
                $li.append($image);
                $li.append($span);
                if(message.date != ""){
                    $("#messages").append("<li class='date_li'><span class='date'>"+message.date+"</span></li>");
                }
                $("#messages").append($li);
            }
            else if (sender_nickname === message.receiver && receiver_nickname === message.sender) {
                if(messagesLeftCount == 0 || message.date != "")
                {
                    $image = $("<img class='img-rounded' src='../images/standard_profile_image/standard_profile_image.png' alt='profile image' style='float: left'>")
                    $span = $("<span class='left'>").text(message.message);
                }
                else{
                    $span = $("<span class='left2' style='margin-left: 3em'>").text(message.message);
                }
                messagesRightCount = 0;
                messagesLeftCount++;
                $p = $("<p>").text(message.time);

                $span.append($p);
                $li.append($image);
                $li.append($span);
                if(message.date != ""){
                    $("#messages").append("<li class='date_li'><span class='date'>"+message.date+"</span></li>");
                }
                $("#messages").append($li);
            }
        };

        //Aktiviert <Button> beim Navigieren
        //Auswählen eines Nutzers zum Chatten
        $(".list-group").on("click", "button", function () {
            $(".user-info").empty();
            //Scroller nach Unten setzen, damit beim Anklicken eines Nutzers die letzten Nachrichten angezeigt werden und man
            //nicht erstmal runterscrollen muss
            $(".message-window").animate({scrollTop: $(document).height() + $(".message-window").css("height")}, 1000);//Reicht für PCs
            $(".message-window").animate({scrollTop: window.screen.height + $(".message-window").css("height")}, 1000);//Auf mobilen Geräten wird diese Zeile benötigt

            user_chosen = true;
            $("button").each(function (index, ele) {
                $(ele).removeClass("active");
                $(".lastMessage").css("color", "#9d9d9d");
            });
            $(this).addClass("active");
            $(".new-message", $(this)).text("");
            let chosen_user_name = $(".chosen_user", $(this)).text();

            setReadToTrue(chosen_user_name);

            $(".active .lastMessage").css("color", "#FFFFFF");


            if(windowsize <= 416 && user_chosen)
            {
                $(".user-list").hide();
                $(".user-info").show();
                $(".message-window").show();
                $(".input-area").show();
                $(".back2").show();
            }

            //Hinzufügen der Infos über Benutzer, der zum chatten ausgewählt wurde
            let $image = $("<img class='img-rounded' src='../images/standard_profile_image/standard_profile_image.png' alt='profile image'>");
            let $p = $("<p>").text($(".active .chosen_user").text());
            let $dropdown = $("<div class='dropdown userInfo'>\n" +
                "<button class='dropdown-toggle' data-toggle='dropdown'><i class='glyphicon glyphicon-option-vertical'></i></button>\n" +
                "  <ul class='dropdown-menu dropdown-menu-right'>\n" +
                "    <li><a href='#'>Benutzerinfo</a></li>\n" +
                "  </ul>\n" +
                "</div>");

            $(".user-info").append($image);
            $(".user-info").append($p);
            $(".user-info").append($dropdown);
            receiver_nickname = $p.text();

            $(".dropdown-toggle").dropdown();
            $("#messages").empty();
            showMessages();
        });

        //Infos zum ausgewählten User beim Anklicken des Menüs "Benutzerinfos"
        $(".user-info").on("click","a", function () {
            getUsers().then(function(users) {
               users.forEach(function(user) {
                  if(user.nickname === $(".active .chosen_user").text()){
                      $(".modal-header b").text("Nickname: "+user.nickname);
                      $(".modal-body .name").text("Name: "+user.name);
                      $(".modal-body .email").text("Email: "+user.email);
                  }
               });
            });
            $("#userInfoModal").modal();
        });

        //-------------------Notifications--------------------------------
        function urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
                .replace(/\-/g, '+')
                .replace(/_/g, '/');

            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);

            for (let i = 0; i < rawData.length; ++i) {
                outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
        }

        function offerNotification() {
            if ("Notification" in window && "PushManager" in window && "serviceWorker" in navigator) {
                Notification.requestPermission().then(function(permission){
                    if (permission === "granted") {
                        let subscribeOptions = {
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array("BEUrtpTslB9KAV6XKVys4RdrQ_A6AqrgY5hZkeg68OZldqXDXpcQo9u0NEzufDJ7BMIQdXBNCKKaGbui4y7Zhko")
                        };
                        navigator.serviceWorker.ready.then(function(registration) {
                            return registration.pushManager.subscribe(subscribeOptions);
                        }).then(function(subscription) {
                            let fetchOptions = {
                                method: "post",
                                headers: new Headers({
                                    "Content-Type": "application/json"
                                }),
                                body: JSON.stringify(subscription)
                            };
                            return fetch("/add-subscription/", fetchOptions);
                        });
                    }
                });
            }
        };
    }
]);