//Angularmodul in dem Routen der Single Page App definiert sind
angular.module("appRoutes", []).config(["$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {

    $routeProvider
        .when("/", {
            templateUrl: "views/home.html"
        })

        .when("/login", {
            templateUrl: "views/login.html"
        })

        .when("/register", {
            templateUrl: "views/register.html"
        })

        .when("/profile", {
            templateUrl: "views/profile.html"
        })

        .when("/about", {
            templateUrl: "views/about.html"
        })

        .otherwise({redirectTo:"/"});

    $locationProvider.html5Mode(true);
}]);