/*
  test.js:    Test file for MogoDB
  By: 		  Steven
*/



var userQueries = require('./userQueries.js');
var call;

var test = userQueries.userQueries();

//Test to see if username and password exist.
/*test.getTask("534d8fad2784551e232c81ea",30,function(DBresult){
    console.log(DBresult);
    return;
});*/

test.getTask("53511f0d0aa722c2344d563e", 120, function(DBresult){
    console.log(DBresult);
    return;
});

//Create a task
//var thisisatask = test.addTask("yolo","Get paid","what title says",2400, "Work", 2000);

//Delete a task
//test.delTask("yolo","Get paid");
