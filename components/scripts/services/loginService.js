//Angular Service mit deren Hilfe man getter und setter definieren kann und in anderen Angular-Controller verwenden kann
angular.module("LoginSer", []).factory("LoginService", function() {

    //Variablen
    let loggedin = false;
    let checked = false;
    let loggedin_user_nickname;

    //Getter und Setter
    return {
        isLoggedin: function () {
            return loggedin;
        },
        setLoggedin: function(value) {
            loggedin = value;
        },

        isChecked: function () {
            return checked;
        },
        setChecked: function(value) {
            checked = value;
        },

        getLoggedinUserNickname: function () {
            return loggedin_user_nickname;
        },
        setLoggedinUserNickname: function(value) {
            loggedin_user_nickname = value;
        }
    };
});