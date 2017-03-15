/**
 * Created by sarah.maroon on 4/5/2016.
 */
(function(){
    /**
     * Route between the different pages
     * @type {module}
     */
    var app = angular.module("appRoutes",[]);
    app.config(function($routeProvider){
        $routeProvider
            .when("/login", {
                templateUrl: "../view/html/login.html"
                //controller: "mainController"
            })
            .when("/search", {
                templateUrl: "../view/html/search.html"
                //controller:"mainController"
            })
            .when("/register", {
                templateUrl: "../view/html/register.html"
                //controller:"mainController"
            })
            .when("/account", {
                templateUrl: "../view/html/account.html"
                //controller: "mainController"
            })
            .when("/addmedia", {
                templateUrl: "../view/html/addmedia.html"
                //controller: "mainController"
            })
            .otherwise({redirectTo:"/login"});

    });

}());