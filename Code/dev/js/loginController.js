/*
  listController.js:    Angular controller for login.html
  By:                   Jess
*/

var myApp = angular.module("TaskRoulette", ['ngCookies']);

myApp.config(['$httpProvider',
    function($httpProvider){
        $httpProvider.defaults.useXDomain = true;
}]);

function LoginController($scope, $cookies, $http, $location, $window, $templateCache) {
    var method = 'POST';
    var inserturl ='/login';

    $scope.codestatus ="";

    // Login function
	$scope.login = function(){
        var username = "";
        var password = "";

        if($scope.user != null){
    		var username = $scope.user.username;
    		var password = $scope.user.password;
        }

        var formData ={
            'username': username,
            'password': password
        };

        // Username and password in JSON format
        var jdata = JSON.stringify(formData);

        $http({
            method : method,
            url : inserturl,
            data : jdata,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                cache: $templateCache,
            }
        }).success(function(response) {
            console.log("success");
            $scope.codestatus = response;
            console.log($scope.codestatus);

            // User succssfully logged in
            if($scope.codestatus !== 'fail'){
                if($scope.codestatus === 'no'){
                    $window.location.href = '/list';
                }else{
                    $window.location.href = '/home';
                }
            }

            // Something went wrong!
            else{
                alert("Login failed")
            }
            
        }).error(function(error){
            console.log("error");
            $scope.codestatus = error || "Request Failed";
            console.log($scope.codestatus);
            return false;
        });
	};
 }