//Controller des Views "profile.html"
angular.module("ProfileCtrl", []).controller("ProfileController", ["$scope", "LoginService", "$http",
    function ($scope, LoginService, $http) {
        let sender_nickname = LoginService.getLoggedinUserNickname();

        if (localStorage.getItem("isChecked")) {
            sender_nickname = localStorage.getItem("user_nickname");
        }

        //Variablen, die validiert werden sollen
        let currentPassword = document.getElementById("current-password"),
            newPassword = document.getElementById("new-password"),
            newPasswordConfirm = document.getElementById("new-password-confirm"),
            newNickname = document.getElementById("new-nickname"),
            newEmail = document.getElementById("new-email");

        //Prüfen ob Passwörter übereinstimmen
        function validateNewPassword() {
            if (newPassword.value != newPasswordConfirm.value && newPasswordConfirm.value != "") {
                newPasswordConfirm.setCustomValidity("Passwörter stimmen nicht überein");
            } else {
                newPasswordConfirm.setCustomValidity('');
            }
        }
        newPassword.onchange = validateNewPassword;
        newPasswordConfirm.onkeyup = validateNewPassword;

        //Prüfen ob richtiges Passwort eingegeben wurde
        function validateCurrentPassword() {
            sender_nickname = LoginService.getLoggedinUserNickname();
            if (localStorage.getItem("isChecked")) {
                sender_nickname = localStorage.getItem("user_nickname");
            }

            getUsers().then(function (users) {
                users.forEach(function (user) {
                    if (user.nickname === sender_nickname) {
                        let hashPassword = sha512(currentPassword.value);
                        if (hashPassword.toString("hex") != user.password) {
                            currentPassword.setCustomValidity("Passwort stimmt nicht!");
                        } else {
                            currentPassword.setCustomValidity('');
                        }
                    }
                });
            });
        }
        currentPassword.onchange = validateCurrentPassword;
        currentPassword.oninput = validateCurrentPassword;

        //Prüfen ob Nickname gibt
        function validateNewNickname() {
            sender_nickname = LoginService.getLoggedinUserNickname();
            if (localStorage.getItem("isChecked")) {
                sender_nickname = localStorage.getItem("user_nickname");
            }

            getUsers().then(function (users) {
                for(let i = 0;i<users.length;i++)
                {
                    let user = users[i];
                    if (user.nickname == newNickname.value) {
                        if(newNickname.value == sender_nickname)
                        {
                            newNickname.setCustomValidity("Das ist Ihr aktueller Nickname!");
                        }
                        else {
                            newNickname.setCustomValidity("Benutzer mit diesem Nickname existiert bereits!");
                        }
                        break;
                    } else {
                        newNickname.setCustomValidity('');
                    }
                }
            });
        }
        newNickname.onchange = validateNewNickname;
        newNickname.oninput = validateNewNickname;

        //Prüfen ob Email gibt
        function validateNewEmail() {
            sender_nickname = LoginService.getLoggedinUserNickname();
            if (localStorage.getItem("isChecked")) {
                sender_nickname = localStorage.getItem("user_nickname");
            }

            getUsers().then(function (users) {
                let sender = users.find(function (user) {
                    return user.nickname === sender_nickname;
                });

                for(let i = 0;i<users.length;i++)
                {
                    let user = users[i];
                    if (user.email === newEmail.value) {
                        if(sender.email === newEmail.value)
                        {
                            newEmail.setCustomValidity("Das ist Ihre aktuelle E-Mail-Adresse!");
                        }
                        else{
                            newEmail.setCustomValidity("Benutzer mit dieser E-Mail-Adresse existiert bereits!");
                        }
                        break;
                    } else {
                        newEmail.setCustomValidity('');
                    }
                }
            });
        }
        newEmail.onchange = validateNewEmail;
        newEmail.oninput = validateNewEmail;

        //Setzen der Werte, die angezeigt werden, wenn Benutzer sein Profil sich ansehen möchte
        getUsers().then(function (users) {
            users.forEach(function (user) {
                if (user.nickname === sender_nickname) {
                    $(".td_nickname").html(user.nickname);
                    $(".td_name").html(user.name);
                    $(".td_email").html(user.email);
                }
            });
        });
        //Änderung des Nicknames
        $scope.changeNickname = function () {
            sender_nickname = LoginService.getLoggedinUserNickname();
            if (localStorage.getItem("isChecked")) {
                sender_nickname = localStorage.getItem("user_nickname");
            }

            getUsers().then(function (users) {
                users.forEach(function (user) {
                    if (user.nickname === sender_nickname) {
                        let newNickname = {nickname: $scope.nickname};

                        $http.put("/users/updateNickname/" + user._id, JSON.stringify(newNickname));
                        $(".user-name").text($scope.nickname);
                        $(".td_nickname").text($scope.nickname);
                        $("#nicknameModal").modal("toggle");
                        updateUserNickname(sender_nickname, $scope.nickname);

                        LoginService.setLoggedinUserNickname($scope.nickname);
                        localStorage.setItem("user_nickname", $scope.nickname);

                        socket.emit("user-nickname-changes", {
                            "oldNickname": sender_nickname,
                            "newNickname": $scope.nickname
                        });
                        $scope.nickname = "";
                    }
                });
            });
        };

        //Änderung des Names
        $scope.changeName = function () {
            sender_nickname = LoginService.getLoggedinUserNickname();
            if (localStorage.getItem("isChecked")) {
                sender_nickname = localStorage.getItem("user_nickname");
            }

            getUsers().then(function (users) {
                users.forEach(function (user) {
                    if (user.nickname === sender_nickname) {
                        let newName = {name: $scope.name};

                        $http.put("/users/updateName/" + user._id, JSON.stringify(newName));
                        $(".td_name").text($scope.name);
                        $("#nameModal").modal("toggle");
                        updateUserName(sender_nickname, $scope.name);

                        socket.emit("user-name-changes", {
                            "nickname": sender_nickname,
                            "name": $scope.name
                        });
                        $scope.name = "";
                    }
                });
            });
        };
        //Änderung der Email
        $scope.changeEmail = function () {
            sender_nickname = LoginService.getLoggedinUserNickname();
            if (localStorage.getItem("isChecked")) {
                sender_nickname = localStorage.getItem("user_nickname");
            }

            getUsers().then(function (users) {
                users.forEach(function (user) {
                    if (user.nickname === sender_nickname) {
                        let newEmail = {email: $scope.email};

                        $http.put("/users/updateEmail/" + user._id, JSON.stringify(newEmail));
                        $(".td_email").text($scope.email);
                        $("#emailModal").modal("toggle");
                        updateUserEmail(sender_nickname, $scope.email);

                        socket.emit("user-email-changes", {
                            "nickname": sender_nickname,
                            "email": $scope.email
                        });
                        $scope.email = "";
                    }
                });
            });
        };

        //Änderung des Passworts
        $scope.changePassword = function () {
            sender_nickname = LoginService.getLoggedinUserNickname();
            if (localStorage.getItem("isChecked")) {
                sender_nickname = localStorage.getItem("user_nickname");
            }

            getUsers().then(function (users) {
                users.forEach(function (user) {
                    if (user.nickname === sender_nickname) {
                        let password = sha512($scope.newPassword);
                        let newPassword = {password: password.toString("hex")};

                        $http.put("/users/updatePassword/" + user._id, JSON.stringify(newPassword));
                        $("#passwordModal").modal("toggle");
                        updateUserPassword(sender_nickname, password.toString("hex"));

                        socket.emit("user-password-changes", {
                            "nickname": sender_nickname,
                            "password": password.toString("hex")
                        });
                        $scope.currentPassword = "";
                        $scope.newPassword = "";
                        $scope.confirmPassword = "";
                    }
                });
            });
        };

        //Listener auf Buttons
        $("#showNicknameModal").click(function () {
            $("#nicknameModal").modal();
        });
        $("#showNameModal").click(function () {
            $("#nameModal").modal();
        });
        $("#showEmailModal").click(function () {
            $("#emailModal").modal();
        });
        $("#showPasswordModal").click(function () {
            $("#passwordModal").modal();
        });
    }
]);