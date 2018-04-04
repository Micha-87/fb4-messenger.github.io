//Blendet nach dem Anmelden den Anmelde Link aus und die anderen Münelinks ein
angular.module("MainCtrl", []).controller("MainController",["$scope","LoginService", "$location",
    function ($scope, LoginService, $location) {
        $(".user").empty();
        $(".back2").hide();

        if($location.path()=="/")
        {
            $(".back").hide();
        }
        else{
            $(".back").show();
        }

        let loggedin = LoginService.isLoggedin();
        let user_nickname = LoginService.getLoggedinUserNickname();
        if (localStorage.getItem("isChecked")) {
            loggedin = localStorage.getItem("loggedin");
            user_nickname = localStorage.getItem("user_nickname");
        }
        if (!loggedin) {
            $("#loggedin").hide()
            $("#notloggedin").show();
            $(".user").hide();
        }
        else {
            $("#loggedin").show();
            $("#notloggedin").hide();
            $(".user").show();

            //Username, Bild und Status(Online oder Offline)
            $(".user").append("<img class='img-rounded' src='../images/standard_profile_image/standard_profile_image.png' alt='profile image'>");
            let $table = $("<table class='table current-user'>" +
                "<tbody>" +
                "   <tr>" +
                "       <th class='current-user-name' scope='row'><b></b></th>" +
                "   </tr>"+
                "   <tr>" +
                "       <th class='online-offline' scope='row'><b></b></th>" +
                "   </tr>" +
                "</tbody>" +
                "</table>");
            $(".user").append($table);

            let $h4 = $("<h4 class='user-name'>").text(user_nickname);
            $(".current-user-name").append($h4);

            //Zeigt beim Starten der App ob es eine Internetverbindung gibt und ladet wenn man online ist die Nachrichten des Aktuelles FH Dortmund
           function updateUIonNetworkStatus() {
               $("#fhNews").empty();
               if (navigator.onLine) {
                   $(".online-offline").empty();
                   $(".online-offline").append("<span class='badge badge-success'>Online</span>");
                   //$("body").css("filter", "grayscale(0)");
                   $.ajax({
                       type: "GET",
                       url: "https://cors-anywhere.herokuapp.com/http://www.inf.fh-dortmund.de/rss.php", //cors um Cross-Browser Problem umzugehen
                       dataType: "xml",
                       cache: true,
                       success: function (xml) {
                           $("#fhNews").css("text-align", "left");
                           var $li = $("<li>").append("<h1> Aktueulles</h1><hr style='border:solid #FE7701 1px '>");
                           $("#fhNews").append($li);

                           //Parsen von xml
                           var items = $(xml).find("item");
                           for (i = 1; i < items.length; i++) {
                               $li.append("<strong>" + xml.getElementsByTagName("title")[i].childNodes[0].nodeValue + "</strong></br></br>");
                               $li.append(xml.getElementsByTagName("description")[i].childNodes[0].nodeValue + "</br>");
                               var date = new Date(xml.getElementsByTagName("pubDate")[i].childNodes[0].nodeValue);
                               var months = Array("Januar", "Februar", "M&auml;rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember");
                               var newsDate = date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear() + " " + " " + date.getHours() + ":" + date.getMinutes();
                               $li.append(newsDate);
                               $li.append("<hr style='border:solid #FE7701 1px '>");
                               $("#fhNews").append($li);
                           }
                       }
                   });
               } else {
                   $(".online-offline").empty();
                   $(".online-offline").append("<span class='badge badge-danger'>Offline</span>");

                   $("#fhNews").css("text-align", "center");
                   $("#fhNews").append("<span class='fhNewsOffline' style='color: red'>Sie sind offline!</span></br>");
                   $("#fhNews").append("<span style='color: green'>Sie brauchen eine Internetverbindung, um Aktuelles aufrufen zu können!</span>");
                  // $("body").css("filter", "grayscale(1)");
               }
           };

           updateUIonNetworkStatus();

            //Reagiert auf Veränderungen der Internetverbindung und ändert dementsprechend die Farbe von "badge"
            window.addEventListener("offline", updateUIonNetworkStatus);
            window.addEventListener("online", updateUIonNetworkStatus);
        }

        //back2 im App-Mode
        $(".back2").on("click", function () {
            $(".user-info").empty();
            $("#messages").empty();
            user_chosen = false;
            messagesRightCount = 0;
            messagesLefttCount = 0;

            $(".list-group-item").each(function (index, ele) {
                $(ele).removeClass("active");
                $(".lastMessage").css("color", "#9d9d9d");
            });

            if (windowsize <= 416) {
                $(".user-list").show();
                $(".user-info").hide();
                $(".message-window").hide();
                $(".input-area").hide();
                $(".back2").hide();
            }
        })

        $(".logout").on("click", function () {
            LoginService.setLoggedin(false);
            localStorage.clear();
            $(".user").empty();
        });
}]);