/*
  encryption.js:    Encryption function
  By:               Matt, Cody
*/

// Encryption function for password
var encrypt = function(pass, salt){
    // Salt username
    var salt = salt || "salt";
    var saltyPass = "";
    var len;

    if(pass.length > salt.length){
        len = pass.length;
        for(var i = 0; i < len; i++){
            if(i >= salt.length)
                saltyPass += pass.charAt(i);
            else
                saltyPass += String.fromCharCode(33+((pass.charCodeAt(i) + salt.charCodeAt(i)-32)%(94)));
        }
    }
    
    else{
        len = salt.length;
        for(var i = 0; i < len; i++){
            if(i >= pass.length)
                saltyPass += salt.charAt(i);
            else
                saltyPass += String.fromCharCode(33+((pass.charCodeAt(i) + salt.charCodeAt(i)-32)%(94)));
        }
    }
    
    var crypto = require("crypto");
    var sha256 = crypto.createHash("sha256");
    sha256.update(saltyPass, "utf8");
    var result = sha256.digest("base64");

    return result;
};

exports.encrypt = encrypt;