//Controller des Views "login.hmtl"
angular.module("LoginCtrl", []).controller("LoginController", ["$scope", "$location", "$http", "LoginService",
    function ($scope, $location, $http, LoginService) {
        let checked = false;
        $(".alert").hide();

        $scope.toggleSelection = function (event) {
            // Prfen, ob die Checkbox angeklickt wurde
            checked = event.target.checked;
        };

        //Anmeldung
        $scope.login = function () {
            let hashPassword = sha512($scope.password);
            let email = $scope.email,
                password = hashPassword.toString("hex");

            //Prüfen der Eingaben-> ob User in der DB existiert
            getUsers().then(function(users) {
                if(users.length != 0)
                {
                    for(let i = 0; i<users.length; i++) {
                        let user = users[i];
                        if (email === user.email && password === user.password) {
                            LoginService.setLoggedin(true);
                            LoginService.setLoggedinUserNickname(user.nickname);
                            //Prüft ob chekbox "Angemeldet bleiben" angeklickt wurde
                            LoginService.setChecked(checked);
                            if (LoginService.isChecked()) {
                                localStorage.setItem("loggedin", LoginService.isLoggedin());
                                localStorage.setItem("isChecked", LoginService.isChecked());
                                localStorage.setItem("user_nickname", LoginService.getLoggedinUserNickname());
                            }

                            let loggedin = {loggedin: LoginService.isLoggedin()};
                            $http.put("/users/loggedin/" + user._id, JSON.stringify(loggedin));

                            //Speichsern des Passworts in die IndexedDB um sich offline anmelden zu können.
                            updateUserPassword(user.nickname, password);
                            $location.path("/");
                        }
                        else {
                            $("#alert_text strong").text("Es existiert kein Benutzer mit diesen Anmeldedaten!");
                            $(".alert").removeClass("in").show();
                            $(".alert").delay(1500).addClass("in").fadeOut(2000);
                        }
                    }
                }
                else{
                    $("#alert_text strong").text("Es existiert kein Benutzer mit diesen Anmeldedaten!");
                    $(".alert").removeClass("in").show();
                    $(".alert").delay(1500).addClass("in").fadeOut(2000);
                }
            });
        };
    }
]);

