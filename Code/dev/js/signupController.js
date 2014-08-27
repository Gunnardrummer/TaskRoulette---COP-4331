/*
  listController.js:    Angular Controller for signup.html
  By:                   Cody
*/

var myApp = angular.module("TaskRoulette", []);

myApp.config(['$httpProvider',
    function($httpProvider){
        $httpProvider.defaults.useXDomain = true;
}]);

function SignupController($scope, $http, $location, $window, $templateCache) {
    var method = 'POST';
    var inserturl ='/signup';

    $scope.codestatus ="";

    // Signup function
    $scope.signup = function(){
        var username = $scope.user.username;
        var password = $scope.user.password;
        var email = $scope.user.email;
        var trypass = $scope.user.trypass;

        // Password and confirm password do not match
        if(password != trypass){
            alert("passwords are wrong");
            return;
        }

        var formData ={
            'email' : email,
            'username': username,
            'password': password
        };

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

            // User signed up successfully
            if(response != 'fail'){
                $window.location.href = '/list';
            }

            // Signup failed!
            else{
                alert("failing signup");
            }

        }).error(function(error){
            console.log("error");
            $scope.codestatus = error || "Request Failed";
            console.log($scope.codestatus);
            return false;
        });
    };
 }