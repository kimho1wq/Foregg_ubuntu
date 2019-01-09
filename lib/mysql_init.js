var mysql = require('mysql');
var config = {
     "connectionLimit" : 10
    ,"host" : "localhost"
    ,"user"     : "root"
    ,"password" : "foregg!"
    ,"database" : "foregg"
    ,insecureAuth : true
}

var connection = mysql.createConnection(config);
global.pool  = mysql.createPool(config);


module.exports = connection;