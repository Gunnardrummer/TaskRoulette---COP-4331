/*
  listController.js:    Angular controller for home.html
  By:                   Jess
*/

var myApp = angular.module("TaskRouletteHome", ['ngCookies']);

function TaskController($scope, $cookieStore, $http, $location, $window, $templateCache) {
    var method = 'POST';
    var inserturl ='/home';
    $scope.showGet = true;

    // Get task function
	$scope.getTask = function(){
        $scope.currTask = null;
        $scope.tasks = null;
        $scope.noTasks = null;
        $scope.showTasks = null;
        $scope.showCurr = null;

        var timeGiven = $scope.task.timeGiven;

        var formData ={
            'timeGiven': timeGiven
        };

        var jdata = JSON.stringify(formData);

        $http({
            method : method,
            url : inserturl,
            data : jdata,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(response) {
            console.log("success");
            
            // There are no tasks for that time
            if(response == "noTasks"){
                alert("There are no tasks for that time bro");
            }

            else if(String(response.tasks) == ""){
                $scope.noTasks = true;
            }

            // The user has tasks
            else{
                $scope.showGet = null;
                $scope.tasks = response.tasks;
                $scope.showTasks = true;
                // console.log("----> ", response.tasks);
                console.log($scope.tasks.title);
            }

        }).error(function(error){
            console.log("error");
            return false;
        });
	};

    // Accept a task function
    $scope.acceptTask = function(){
        $scope.currTask = $scope.tasks;
        $scope.tasks = null;
        $scope.showCurr = true;
        $scope.showTasks = null;
    };

    // Delete task from database
    $scope.doneTask = function(task){
        $scope.showGet = true;
        $scope.tasks = null;
        $scope.currTask = null;
        $scope.showCurr = null;

        var method = 'POST';
        var inserturl ='/delete';

        var formData ={
            'taskTitle': task.title
        };

        var jdata = JSON.stringify(formData);

        $http({
            method : method,
            url : inserturl,
            data : jdata,
            headers: {
                'Content-Type': 'application/json'
            }
        }).success(function(response) {
            // Task was successfully  deleted
            console.log("success");
            console.log(response);

        }).error(function(error){
            console.log("error");
            return false;
        });
    };

    // logout!
    // cookies provider
    $scope.logout = function(){
        $cookieStore.remove('tr_session');
        $window.location.href = '/login';
    };
 }