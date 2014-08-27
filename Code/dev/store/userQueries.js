/*
  userQueries.js:    MongoDB/Mongoose functions
  By:                Matt, Cody, Jess
*/

var userQueries = function(){
  // Connect to database
  var mongoose = require('mongoose');
  var conn = mongoose.connect("mongodb://localhost/tr/");

  // Create mongoose schema
  var activities = new mongoose.Schema({
      username: {
        type: String,
        required: true,
        //index: {unique: true}
      },
      //Must be hashed before being stored/compared
      password: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true,
        //index: {unique:true}
      },

      // Create object of tasks
      tasks: [
      {
        title: {type:String, default:'Task'},
        description: {type: String, default: 'Description'},
        time: {type:Number, default:30},
        category: {type: String, default: 'Activity'},
        actualTime: {type: Number, default: 30}
      }]
    }
   );

  var User = mongoose.model('Activities', activities);


  // Function called during signup
  var createUser = function(name, pass, mail, callback){
    console.log("creating user");

    // Checks if an account exists with the given username
    var accountExists = false;
    User.findOne({'username': name}, function(err,testUserA){
      if (err){ callback(null);}
      else if(testUserA != null){ accountExists = true;}
    });

    // Checks if an account exists with the given email
    User.findOne({'email': mail}, function(err,testUserB){
      if (err){ callback(null);}
      else if(testUserB != null){ accountExists = true;}
    });

    // Username/email free, make account!
    if(accountExists == false){
      var user = new User({username: name, password : pass, email: mail, tasks: []})
      console.log(user._id);
      user.save(function(err){
        if (err) throw err;
        else callback(user._id);
      });
    }
    else{callback(null)};

  };

// Finds objectID for a given username and password
// An objectID returned means the credentials are valid.
  var query = function(name, pass, callback){
    console.log("query");

    var id = null;

    User.findOne({'username': name, 'password': pass}, function(err,user){
      if (err){
          callback(null);
        }else if(user != null){
          id = user._id;
          callback(id);
        }else {callback(null)};
    });
  };

// Checks if an ObjectID from a cookie is valid
  var checkID = function(id,cookie_set, callback){
   if(!cookie_set){
        console.log("cookie not set");
        callback(null);
        return;
    }
    else{
     User.findOne({_id: id},function(err, user){
        if (err){
          callback(null);
        }else if(user != null){
          callback(user.username);
        }else{
          callback(null);
        }
     });
   }
  }

  // Function used to get a single task from user based off of time
  var getTask = function(id, time, callback){
    console.log("id in getTask: ", id);
    console.log("Time: ", time);
    if(id ===null){
      callback(null);
      return;
    }
    
    // Finding a random task that is greater than or equal to the time given
    User.aggregate([{$match: {username: id}}, {$unwind: "$tasks"}, {$match: {"tasks.time": {$lte: time}}}, {$group: {_id: 1, count: {$sum: 1}}}], function(err, task){
      if(err){
        console.log("error" + err);
      }
      else if(task != null){
        console.log(task);

        var N  = JSON.stringify(task);
        console.log("N: ", N);

        var S = JSON.parse(N);
        console.log("S: ", S);

        var A = S[0];
        console.log("A: ", A);
        console.log(typeof(A));

        if(A != null){
          var cnt = A.count;
          console.log("cnt: ", cnt);
          console.log("type cnt: ", typeof(cnt));
        }
        else{
          var cnt = 1;
        }

        var rands =  Math.floor((Math.random()*100))%cnt;
        console.log("Rands: ", rands);

        // Using aggregate in mongoose, get a random task
        User.aggregate([{$match: {username: id}}, {$unwind: "$tasks"}, {$match: {"tasks.time": {$lte: time}}}, {$skip: rands}, {$limit: 1}], function(err, task){
          if (err)
          {
            console.log(err);
            callback(null);
          }

          else if(task[0] != null)
          {
            console.log("proper");
            console.log(task[0]);
            callback(task[0]);
          }

          else
          {
            console.log("improper");
            callback(null);
          }
         });
      }
      else
      {
        console.log("User has no tasks");
        callback(null);
      }

    });

  };

  // Function used to get a list of all tasks for a given user
  var showTasks = function(id, callback){

    User.findOne({_id: id}, function(err, tasks){
      if (err)
      {
        console.log(err);
        callback(null);
      }

      else if(tasks != null)
      {
        //console.log(tasks);
        callback(tasks);
      }

      else
      {
        callback(null);
      };

    });

  };

  // Function used delete a given task for a given user
  var delTask = function(id, task, callback){

    User.update({_id: id}, {$pull : {tasks: {title: task}}}, function(err, tasks){
      if (err)
      {
        console.log("Error removing from db");
        callback(null);
      }
      else
      {
        console.log("Removed from db");
        callback(null);
      }
    });

  };

  // Function used to add a task
  var addTask = function(id, title, category, description, timeGiven, callback){
    if(timeGiven == null){
      timeGiven = 30;
    }
    var task = {title: title, description: description, time: timeGiven, category: category};

    User.update({_id: id}, {$push : {tasks: task}}, function(err, tasks){
      if (err)
      {
        console.log("Error adding to db");
        callback(null);
      }
      else
      {
        console.log("Added to db");
        callback(tasks);
      }
    });

  };

  return {
    createUser: createUser,
    query: query,
    getTask: getTask,
    showTasks: showTasks,
    addTask: addTask,
    delTask:delTask,
    checkID:checkID
  };

// Disconnect MongoDB
conn.disconnect();
};

exports.userQueries = userQueries;
