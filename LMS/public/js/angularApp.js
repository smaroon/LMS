(function(){
    // create a new angular app and inject ngRoute (for page routing) and appRoutes ( the sites routing mechanism)
    angular.module("lms", ["ngRoute",
        "appRoutes"]);
}());