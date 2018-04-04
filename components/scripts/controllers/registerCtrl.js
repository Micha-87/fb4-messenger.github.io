let sha512 = require("sha512");

//Controller des Views "register.html"
angular.module("RegisterCtrl", []).controller("RegisterController", ["$scope", "$http", "$location", "$timeout",
    function ($scope, $http, $location, $timeout) {
        $(".alert").hide();

        //Prüft die Übereinstimmung der Passwörter (geht nicht mit JQuery)
        let password = document.getElementById("password")
            , confirm_password = document.getElementById("confirm_password")
            , nickname = document.getElementById("nickname");

        //Validieren des Passworts
        function validatePassword(){
            if(password.value != confirm_password.value && confirm_password.value != "") {
                confirm_password.setCustomValidity("Passwörter stimmen nicht überein");
            } else {
                confirm_password.setCustomValidity('');
            }
        }
        //Validieren des Nicknames
        function validateNickname() {
            if(nickname.value.length > 15) {
                nickname.setCustomValidity("Der Nickname ist zu lang!");
            } else {
                nickname.setCustomValidity('');
            }
        }

        password.onchange = validatePassword;
        confirm_password.onkeyup = validatePassword;
        nickname.onkeyup = validateNickname;
        nickname.oninput = validateNickname;

        //User registrieren
        $scope.register = function () {
            //Haschen des Passworts
            let hashPassword = sha512($scope.password);
            let user = {
                nickname: $scope.nickname,
                name: $scope.name,
                email: $scope.email,
                password: hashPassword.toString("hex")
            };

            //Prüfen ob einen Benutzer mit dem gleichen Nickname oder der gleichen Email gibt
            //Wenn ja, werden entsprechende Allerts angezeigt.
            let existing_email,
                existing_nickname;
            $http.get("/users/getByEmail/"+user.email).then(function mySuccess(response) {
                $http.get("/users/getByNickname/"+user.nickname).then(function mySuccess(response2) {
                    if(response.data.length!=0)
                    {
                        existing_email = response.data[0].email;
                    }
                    if (existing_email == user.email) {
                        $("#alert_text strong").text("Es existiert bereits ein Benutzer mit dieser Email-Adresse!")
                        $(".alert").removeClass("in").show();
                        $(".alert").delay(1500).addClass("in").fadeOut(2000);
                    }
                    if(response2.data.length!=0)
                    {
                        existing_nickname = response2.data[0].nickname;
                    }
                    if (existing_nickname == user.nickname) {
                        $("#alert_text strong").text("Es existiert bereits ein Benutzer mit diesem Nickname!")
                        $(".alert").removeClass("in").show();
                        $(".alert").delay(1500).addClass("in").fadeOut(2000);
                    }
                    //Wenn nicht, wird der Benutzer registriert
                    if(existing_email != user.email && existing_nickname != user.nickname) {
                        $http.post("/users/", JSON.stringify(user));

                      /*  notify({
                            type: "user-registration",
                            user: user
                        });*/
                        //Ereignis wird ausgelöst, das den neuregistrierten User, bei allen anderen in die Userliste hinzufügt
                        socket.emit("db-changes", {
                            "nickname": user.nickname,
                            "name": user.name,
                            "email": user.email,
                            "password": user.password
                        });
                        //Benachrictigun, dass der Benutzer sich Registriert hat und Navigation zum Anmeldeformular
                        $(".alert").show();
                        $("#alert_text strong").text("Glückwunsch! Sie haben sich erfolgreich registriert!");
                        $timeout(function () {
                            $(".alert").fadeTo(500, 0).slideUp(500, function () {
                                $(this).hide();
                            });
                            $location.path("/login");
                        }, 2000);
                    }
                });
            });
        };
    }
]);