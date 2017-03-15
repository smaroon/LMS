/**
 * Created by Sarah.Maroon on 4/10/2016.
 */
(function () {
    'use strict';
    /**
     * Service to interact with the REST endpoints
     * @param $http
     * @returns {{search: Function, login: Function, register: Function, checkout: Function, checkin: Function, addmedia: Function}}
     */
    var dataService = function($http){
        /**
         * Search media
         * @param search
         * @returns {*|Promise}
         */
        var search = function(search){
            return $http.post("http://localhost:8089/api/search", search)
                .then(function(response){
                    return response.data;
                });
        };

        /**
         * User login
         * @param user
         * @returns {*|Promise}
         */
        var login = function(user){
            return $http.post('http://localhost:8089/api/login',user)
                .then(function(response){
                    return response.data;
                });
        };

        /**
         * register new user
         * @param user
         * @returns {*|Promise}
         */
        var register = function(user){
            console.log('in service ' + user);
            return $http.post('http://localhost:8089/api/register', user)
                .then(function(response){
                    console.log( response);
                    return response.data;
                });
        };
        /**
         * checkout media item
         * @param userid
         * @param book
         * @returns {*|Promise}
         */
        var checkout = function(userid, book){
            console.log(userid);
            return $http.post('http://localhost:8089/api/checkout/' + userid  , book)
                .then(function(response){
                    return response.data;
                });
        };

        /**
         * checkin media item
         * @param data
         * @returns {*|Promise}
         */
        var checkin = function(data){
            return $http.post('http://localhost:8089/api/checkin/',data)
                .then(function(response){
                    return response.data;
                });
        };
        /**
         * add new media
         * @param data
         * @returns {*|Promise}
         */
        var addmedia = function(data){
            return $http.post('http://localhost:8089/api/books',data)
                .then(function(response){
                    return response.data;
                })
        }
        // expose the functions to the rest of the application
        return {
            search: search,
            login: login,
            register: register,
            checkout: checkout,
            checkin: checkin,
            addmedia: addmedia
        };
    };
    var app = angular.module("lms");
    app.factory("dataService", dataService); // Register service with the app
}());