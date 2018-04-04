//Controller des View "about.html"
angular.module("AboutCtrl", []).controller("AboutController", ["$scope",
    function ($scope) {
        //Beim Navigieren zur View "about" wird der Werte der Variablen user_chosen auf false gesetzt, damit
        //bei Navigieren zurück zur Hauptseite kein User ausgewählt ist und keine Nachrichten nagezeigt werden.
        user_chosen = false;
}]);