var express = require('express');
var app = express();
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('db/justbalancetest.db');

// routes
app.get('/', function(request, response){
    response.send("Hello World");
});

app.get('/transactions', function(request, response){
    console.log("GET request recieved at /transactions");
});

app.post('/transactions', function(request,response){
    console.log("POST request recieved at /transactions");
});

app.listen(3000, function(){
    console.log("Server is running at port 3000");
});

