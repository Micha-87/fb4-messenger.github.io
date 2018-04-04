//APIs einbinden
let $ = jQuery = require("jquery");
require("./bootstrap.min");
require("angular");
require("angular-route");
require("es6-promise").polyfill();

angular.module("chatApp", ["ngRoute", "appRoutes", "MainCtrl", "HomeCtrl", "ProfileCtrl", "AboutCtrl", "LoginCtrl", "LoginSer", "RegisterCtrl"])
    .config(["$httpProvider", function ($httpProvider) {
        //Löst das Problem mit IE ajax-Caching Anfragen( IE hat die Daten von der DB nicht geladen und die neuen Nachrichten nach Seitenreload nicht angezeigt)
        //Initialisiert get wenn nicht da
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        //IE Ajax-Anfrage-Caching deaktivieren
        $httpProvider.defaults.headers.get["If-Modified-Since"] = "0";
    }]);

//Variable zum Abfragen der Fenstergröße beim Minimieren bzw. Vergrößern des Browserfensters
let windowsize = window.innerWidth;

$(function () {
    //Registrieren des Service-Workers
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("./service-worker.js")
            .then(function () {
                console.log("Service Worker Aktiv");
            })
    }

    //Loader Beim Starten der App
    $(".loader").fadeOut(1000);

    //Aktiviert <li> abhängig davon welche View gerade offen ist (Falls man die Seite neugeladen hat)
    $(".nav a").filter(function () {
        return this.href == location.href
    }).parent().addClass("active").siblings().removeClass("active");

    //Reagiert auf Verkleinerung bzw. ergrößerung des Fensters und ändert die Werte der HTML-Elemente
    $(window).resize(function () {
        windowsize = window.innerWidth;
        //Wenn mann bei einer größeren Webseitengröße einen Benutzer ausgewählt hat, soll beim Verkleinern der Webseite zur
        //mobilen Größe nur die Nachrichtensicht angezeigt werden, wie auf einem Handy
        if(windowsize <= 416 && user_chosen)
        {
            $(".user-list").hide();
            $(".user-info").show();
            $(".message-window").show();
            $(".input-area").show();
            $(".back2").show();
        }
        else{
            if(windowsize <= 416 )
            {
                $(".user-list").show();
                $(".user-info").hide();
                $(".message-window").hide();
                $(".input-area").hide();
                $(".back2").hide();
            }
            if(windowsize >= 416)
            {
                $(".user-list").show();
                $(".user-info").show();
                $(".message-window").show();
                $(".input-area").show();
                $(".back2").hide();
            }
        }
    });

    //Leert alle Fenster beim Anklicken des Home-Menübuttons
    $(".home").on("click", function () {
        $(".user-info").empty();
        $("#messages").empty();
        $(".list-group-item").each(function (index, ele) {
            $(ele).removeClass("active");
            $(".lastMessage").css("color", "#9d9d9d");
        });
        user_chosen = false;
        messagesRightCount = 0;
        messagesLeftCount = 0;

        //Versteckt auf einem mobilen Gerät beim Anklicken des Homebuttons Nachrichtenfenster und zeigt die Benutzerliste an
        if (windowsize <= 416) {
            $(".user-list").show();
            $(".user-info").hide();
            $(".message-window").hide();
            $(".input-area").hide();
            $(".back2").hide();
        }
    });

    //Aktiviert <li> beim Navigieren
    $("li").click(function () {
        $("li").each(function (index, ele) {
            $(ele).removeClass("active");
        });
        $(this).addClass("active");
        $(".navbar-collapse").collapse("hide");
    });

    //Versteckt die Navbar nach dem Auswählen der Route
    $(document).on("click touchstart",function (e) {
        let container = $(".navbar-collapse");

        if (!container.is(e.target) && container.has(e.target).length === 0)
        {
            container.collapse("hide");
        }
        $(".install").delay(1500).addClass("in").fadeOut(2000);
    });

    //Dropdown Liste beim Anklicken anzeigen
    $(".dropdown-toggle").dropdown();

    //Aktuelles-Modal beim Anklicken anzeigen
    $(".news").on("click", function () {
        $("#fhNewsModal").modal();
    });
});