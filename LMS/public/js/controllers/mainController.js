/**
 * Created by Sarah.Maroon on 4/10/2016.
 */
(function () {
    var app = angular.module("lms");

    var mainController = function ($scope, $location, dataService) {
        $scope.userAuthorized = false;
        $scope.newUser = [];
        $scope.errors = [];
        $scope.media = {};

        /**
         * Search for media.
         * @param search_type
         * @param searchItem
         * @returns {string}
         */
        $scope.performSearch = function (search_type, searchItem) {
            if (!searchItem || searchItem === '')  return 'Please Enter a value to search';

            var search = {
                search_type: search_type,
                search: searchItem
            }

            var searchPromise = dataService.search(search)
                .then(function (success) {
                    console.log('yes');
                    $scope.searchResults = success;
                }, function (error) {
                    console.log('no');
                    $scope.error = error;
                });
        };

        /**
         * Persoms initial application login
         * @param username
         * @param pw
         * @param reroute
         * @returns {*}
         */
        $scope.performLogin = function (username, pw, reroute) {
            if (!username || username === '') return "Please Enter a username";
            if (!pw || pw === '') return "Please Enter a password";

            var info = {
                username: username,
                password: pw
            }

            var loginPromise = dataService.login(info)
                .then(function (success) {
                    $scope.loggedin = success[0];
                    console.log($scope.loggedin);
                    $scope.userAuthorized = true;
                    if(reroute)
                        $location.path("/search");  // once logged in reroute the user to the search page
                }, function (error) {
                    console.log('no');
                    $scope.errors.push(error);
                });
        };

        /**
         * Registers a new user. Verifies all fields are populated with data
         * @param newUser
         */

        $scope.registerNewUser = function (newUser) {
            console.log('entering register function');
            if (!newUser.firstname || newUser.firstname === '')
                $scope.errors.push('Missing first name');
            if (!newUser.lastname || newUser.lastname === '')
                $scope.errors.push('Missing last name');
            if (!newUser.email || newUser.email === '')
                $scope.errors.push('Missing email');
            if (!newUser.username || newUser.username === '')
                $scope.errors.push('Missing username');
            if (!newUser.password || newUser.password === '')
                $scope.errors.push('Missing password');
            //if($scope.errors)
            //    return $scope.errors;
            // populate user structure with parm data
            var u = {
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                email: newUser.email,
                username: newUser.username,
                password: newUser.password
            }
            console.log(u);

            var registerPromise = dataService.register(u)
                .then(function (success) {
                    console.log('yes');
                    $scope.loggedin = success;
                    if ($scope.loggedin) {
                        $scope.userAuthorized = true;
                        $location.path("/search");
                    }
                }, function (error) {
                    console.log('no');
                    $scope.errors.push(error);
                });
        }

        /**
         * function to checkout selected media item.
         * @param media
         */
        $scope.checkout = function (media) {
            console.log('user auth ' + $scope.loggedin.person_id);
            var checkoutPromise = dataService.checkout($scope.loggedin.person_id, media)
                .then(function (success) {
                    console.log('yes');
                }, function (error) {
                    console.log('no');
                });
        };

        /**
         * Function to checkin selected media item
         * @param isbn
         */

        $scope.checkin = function(isbn) {
            var data= {
                isbn: isbn,
                person_id: $scope.loggedin.person_id
            }
            var checkinPromise = dataService.checkin(data)
                .then(function(success){
                    console.log('yes');
                    $scope.performLogin($scope.loggedin.username, $scope.loggedin.password, false);
                }, function(error) {
                    console.log('no');
                })
        };

        /**
         * function to format the due date into a readable format.
         * @param day
         * @returns {string}
         */
        $scope.getFormattedDate = function(day){
            date = new Date(day);
           return (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear()
        };

        /**
         * Add new media
         */
        $scope.addmedia = function(){
            var addPromise = dataService.addmedia($scope.media)
                .then(function(success){
                    console.log('yes');
                    $scope.success='Media has been successfully added.'
                }, function(error){
                    console.log('no');
                    $scope.error.push('Error updating media');
                });
        }


    };
    app.controller("mainController", mainController); // Register the controller with the app
}());
