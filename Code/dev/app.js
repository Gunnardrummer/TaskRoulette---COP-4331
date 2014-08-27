/*
  app.js:       Node server
  By:           Gunnar, Cody, Jess
*/

var http = require('http');
var querystring = require('querystring');
var util = require('util');
var fs = require('fs');
var url = require('url');
var path = require('path');
var queryresult = require('./store/userQueries');
var encryption = require('./store/encryption');
var queryresult = queryresult.userQueries();


http.createServer(function(req, res) {
  var cookie_set = false;
  var cookie_valid = false;
  var cookie = req.headers.cookie || '';

  if(cookie != ''){
    cookie = cookie.split('=');
    cookie = cookie[1].split(';');
    cookie = cookie[0];
    cookie_set = true;
  }

  queryresult.checkID(cookie, cookie_set, function(DBResults){
    if(DBResults !== null){
      cookie_valid = true;
    }

    var pathname = url.parse(req.url).pathname;
    if((pathname === "/home" || pathname === "/list" || pathname === "/add" || pathname === "/delete") && (!cookie_valid)){
      pathname = '/login';
      req.method = 'GET';
    }

    if (req.method == 'POST') {
      // Get the post info
      var postinfo = '';
      var encryptedPassword = '';
      var username = '';
      var email = '';

      // Receive incoming info from login
      req.on('data', function(chunk) {
          postinfo += chunk.toString();
      });

      req.on('end', function() {
        var decodedBody = JSON.parse(postinfo);

        // Add logininfo for a post request from
        if (pathname === '/login') {
          console.log("pathname: "+pathname);
          console.log("cookie: "+cookie);

          var username = decodedBody.username;
          var password = decodedBody.password;

          var encryptedPassword = encryption.encrypt(password, username);
          console.log("username:" + username);
          console.log("password:" +encryptedPassword);

          queryresult.query(username, encryptedPassword, function(DBResults) {

            // If the login is not successful then return to the login page.
            if (DBResults == null) {
              console.log("failed login attempt for - " + username + " " + encryptedPassword);
              res.write("fail");
              res.end();
            }
            else {
              // Query the database for the user's tasks if none send them to list, else continue into home.html
              queryresult.showTasks(DBResults, function(taskResult){

                  // If they don't have tasks send them to add tasks
                  if (taskResult === null) {
                      console.log("No tasks for this user, redirecting to list.html");
                      fs.readFile('pages/list.html', function(err, data) {
                          res.writeHead(200, {
                              'Set-Cookie ': 'tr_session='+ DBResults
                          });
                          res.write('no');
                          res.end();
                      });

                    }
                    else {
                      console.log("Do have task");
                      res.writeHead(200, "OK", {
                          'Content-Type': 'text/html'
                      });
                      fs.readFile('pages/list.html', function(err, data) {
                          res.writeHead(200, {
                              'Set-Cookie ': 'tr_session='+ DBResults
                          });
                          res.write('success');
                          res.end();
                      });
                    }
                });
              }
            });
        }


        else if (pathname === '/signup') {
          console.log("pathname: "+pathname);
          console.log("cookie: "+cookie);

          console.log("signup");
           var username = decodedBody.username || '' ;
             var password = decodedBody.password || '';
             var email = decodedBody.email || '';

    	    if(email === '' || username ==='' || password ===''){
    	   		res.write("fail");
    			  res.end();
    		  }else{
            var encryptedPassword = encryption.encrypt(password, username);
	          console.log(username);
            console.log(encryptedPassword);
            console.log(email);
            queryresult.createUser(username, encryptedPassword, email, function(objectID){
              res.writeHead(200, {
                'Set-Cookie ': 'tr_session='+objectID
              });
              res.end();
            });
	       }
        }

        // Used for home.html / taskController.html
        else if (pathname === '/home') {
          console.log("pathname: "+pathname);
          console.log("cookie: "+cookie);

          var decodedBody = JSON.parse(postinfo);
          var timeGiven = decodedBody.timeGiven;

          console.log("Userid: " + cookie);
          console.log("Time: " + parseInt(timeGiven));
          timeGiven = parseInt(timeGiven);
          queryresult.checkID(cookie, cookie_set, function(username){
            queryresult.getTask(username, timeGiven, function(DBResults) {

              console.log(DBResults);

              if(DBResults == null){
                console.log("There are no tasks for that time!");
                res.write("noTasks");
              }

              else {
                res.writeHead(200, { 'Content-Type' : 'application/json' });
                res.write( JSON.stringify(DBResults) );
              }
            res.end();
            })
          });
        }

        // Used for list.html / listController.html
        else if (pathname === '/list') {
          console.log("pathname: "+pathname);
          console.log("cookie: "+cookie);

          queryresult.showTasks(cookie, function(DBResults) {
            res.writeHead(200, { 'Content-Type' : 'application/json' });
            res.write( JSON.stringify(DBResults) );
            res.end();
          });
        }

        // Used for list.html / listController.html / to delete
        else if (pathname === '/delete') {
          console.log("pathname: "+pathname);
          console.log("cookie: "+cookie);

          var decodedBody = JSON.parse(postinfo);
          var username = cookie;
          var taskTitle = decodedBody.taskTitle;

          console.log("Username: " + username);
          console.log("Task Title: " + taskTitle);

          queryresult.delTask(username, taskTitle, function(DBResults) {
            res.writeHead(200, {});
            res.end()
          });
        }

        // Used for list.html / listController.html / add task
        else if (pathname === '/add') {
          console.log("pathname: "+pathname);
          console.log("cookie: "+cookie);

          var decodedBody = JSON.parse(postinfo);
          var userid = cookie;
          var title = decodedBody.title;
          var category = decodedBody.category;
          var description = decodedBody.description;
          var timeGiven = decodedBody.timeGiven;

          console.log("Username: " + userid);
          console.log("Title: " + title);
          console.log("Category: " + category);
          console.log("Description: " + description);
          console.log("Time: " + timeGiven);

          queryresult.addTask(userid, title, category, description, timeGiven, function(DBResults) {
            res.writeHead(200, {});
            res.end()
          });
        }else {
          load_files(pathname,res);
        }
      });
    }

    //GET METHODOLOGY==================================================================================
    //=================================================================================================
    else if (req.method == 'GET') {
        if (pathname === '/' || pathname === '/login') {
            fs.readFile('pages/login.html', function(err, data) {
                res.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Content-Length': data.length
                });
                res.write(data);
                res.end();
            });
        }

        else if (pathname === '/signup') {
            fs.readFile('pages/signup.html', function(err, data) {
                res.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Content-Length': data.length
                });
                res.write(data);
                res.end();
            });
        }

        else if (pathname === '/home' && cookie_set) {
            if(cookie_set){
              fs.readFile('pages/home.html', function(err, data) {
                  res.writeHead(200, {
                      'Content-Type': 'text/html',
                      'Content-Length': data.length
                  });
                  res.write(data);
                  res.end();
              });
            }else{
              // 404 page
              fs.readFile('pages/404.html', function(err, data) {
                res.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Content-Length': data.length
                });
                res.write(data);
                res.end();
              });
            }
        }

        else if (pathname === '/list') {
            if(cookie_set){
              fs.readFile('pages/list.html', function(err, data) {
                  res.writeHead(200, {
                      'Content-Type': 'text/html',
                      'Content-Length': data.length
                  });
                  res.write(data);
                  res.end();
              });
            }else{
              // 404 page
              fs.readFile('pages/404.html', function(err, data) {
                res.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Content-Length': data.length
                });
                res.write(data);
                res.end();
              });
            }
        } else {
            load_files(pathname,res);
        }
    }
  });
}).listen(80);

console.log("Server started...");


// These files are the same regardless of whether it is a post or get request
function load_files(pathname,res) {
    // Background image
    if (pathname === '/img/bkg1.jpg') {
        fs.readFile('img/bkg1.jpg', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'image/jpeg',
                'Content-Length': data.length
            });
            res.end(data);
        });
    }

    // Main css file
    else if (pathname === '/css/style.css') {
        fs.readFile('css/style.css', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/css',
                'Content-Length': data.length
            });
            res.write(data);
            res.end();
        });
    }

    // CSS for Bootstrap
    else if (pathname === '/bower_components/bootstrap/dist/css/bootstrap.css') {
        fs.readFile('bower_components/bootstrap/dist/css/bootstrap.css', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/css',
                'Content-Length': data.length
            });
            res.write(data);
            res.end();
        });
    }

    // AngularJS
    else if (pathname === '/bower_components/angular/angular.js') {
        fs.readFile('bower_components/angular/angular.js', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/javascript',
                'Content-Length': data.length
            });
            res.write(data);
            res.end();
        });
    } else if (pathname === '/bower_components/angular/angular-cookies.js') {
        fs.readFile('bower_components/angular/angular-cookies.js', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/javascript',
                'Content-Length': data.length
            });
            res.write(data);
            res.end();
        });
    }

    // JS for Bootstrap
    else if (pathname === '/bower_components/bootstrap/dist/js/bootstrap.js') {
        fs.readFile('bower_components/bootstrap/dist/js/bootstrap.js', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/javascript',
                'Content-Length': data.length
            });
            res.write(data);
            res.end();
        });
    }

    // JQuery
    else if (pathname === '/bower_components/jquery/dist/jquery.js') {
        fs.readFile('bower_components/jquery/dist/jquery.js', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/javascript',
                'Content-Length': data.length
            });
            res.write(data);
            res.end();
        });
    }

    // JS for fade in/out background
    else if (pathname === '/js/background.js') {
        fs.readFile('js/background.js', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/javascript',
                'Content-Length': data.length
            });
            res.write(data);
            res.end();
        });
    }

    // loginController (for login.html)
    else if (pathname === '/js/loginController.js') {
        fs.readFile('js/loginController.js', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/javascript',
                'Content-Length': data.length
            });
            res.write(data);
            res.end();
        });
    } else if (pathname === '/js/signupController.js') {
        fs.readFile('js/signupController.js', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/javascript',
                'Content-Length': data.length
            });
            res.write(data);
            res.end();
        });
    }

    // listController (for list.html)
    else if (pathname === '/js/listController.js') {
        fs.readFile('js/listController.js', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/javascript',
                'Content-Length': data.length
            });
            res.write(data);
            res.end();
        });
    }

    // taskController (for home.html)
    else if (pathname === '/js/taskController.js') {
        fs.readFile('js/taskController.js', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/javascript',
                'Content-Length': data.length
            });
            res.write(data);
            res.end();
        });
    }

    // Page does not exist -> 404 page
    else {
        fs.readFile('pages/404.html', function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Content-Length': data.length
            });
            res.write(data);
            res.end();
        });
    }
}
