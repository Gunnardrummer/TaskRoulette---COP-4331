/*
  listController.js:    Angular controller for list.html
  By:                   Jess, Cody
*/

var myApp = angular.module("TaskRoulette", ['ngCookies']);

// Get list of tasks to be displayed on list.html
function ListController($scope, $cookieStore, $http, $location, $window, $templateCache) {
    $scope.noTasks = null;

    var method = 'POST';
    var inserturl ='/list';

    var jdata = JSON.stringify({});

    $http({
        method : method,
        url : inserturl,
        data : jdata,
        headers: {
            'Content-Type': 'application/json'
        }
    }).success(function(response) {
        console.log("success");
        console.log(String(response.tasks));

        // User has no tasks
        if(String(response.tasks) == ""){
            $scope.noTasks = true;
            console.log("no task");
        }

        // User has tasks
        else{
            $scope.tasks = response.tasks;
        }

    }).error(function(error){
        $scope.noTasks = true;
        console.log("error");
        return false;
    });


    // Add a task
    $scope.addTask = function(){
        var method = 'POST';
        var inserturl ='/add';

        var title = $scope.task.taskTitle;
        var category = $scope.task.category;
        var description = $scope.task.desc;
        var timeGiven = $scope.task.timeGiven;

        var formData ={
            'title' : title,
            'category' : category,
            'description' : description,
            'timeGiven' : timeGiven
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
            $window.location.href = '/list';

        }).error(function(error){
            console.log("error");
            return false;
        });
    };


    // View the details (description, time, category, mandatory)
    $scope.viewInfo = function(task){
        if(task == $scope.view)
            $scope.view = null;
        else
            $scope.view = task;
    };

    // Delete the task from the above object
    $scope.delete = function(task){
        var index=$scope.tasks.indexOf(task)
        $scope.tasks.splice(index,1);

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
            // Task was deleted from database
            console.log("success");
            console.log(response);

        }).error(function(error){
            console.log("error");
            return false;
        });

    };

    // Cookies provider
    $scope.logout = function(){
        $cookieStore.remove('tr_session');
        $window.location.href = '/login';
    };
}