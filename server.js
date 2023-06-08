const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('db/justbalancetest.db');

app.use(express.static(__dirname + '/public'));

// routes
app.get('/', function(request, response){
    console.log("GET request recieved at /");
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

