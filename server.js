const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const app = express();
const { MongoClient } = require('mongodb');
require("dotenv").config();
const client = new MongoClient(process.env.MONGO_URI);
const bcrypt = require('bcrypt');


app.use(express.static(__dirname + '/public'));
////////////////////////////////////////////////////////////////////////////////////////////////
// creating 5 minutes from milliseconds
const oneWeek = 1000 * 60 * 60 * 24 * 7;

//session middleware
app.use(sessions({
    secret: process.env.COOKIE_SECRET,
    saveUninitialized:true,
    cookie: { maxAge: oneWeek },
    resave: false
}));

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// a variable to save a session
let session;

//middleware to test if authenticated
function isAuthenticated (req, res, next) {
    console.log("Authenication");
    console.log(session);
    if (req.session.userid) next()
    else{
        res.status(401).sendFile('login.html', {root:__dirname});
    }
}

// routes
app.post('/useradd', async function(req, res){
    console.log('POST request recieved at /useradd');
    const saltRounds = 10;
    let username = req.body.username.toLowerCase();
    let password = req.body.password;
    let displayname = req.body.username;

    const user = await client.db("JustBalance").collection("Users").findOne({UserName: username});
    if (user != null) {
        res.status(200).send("Already a User with that username. No new user was created <a href=\'/testpage5.html'>Try Again</a>")
    } else{
        console.log(password);
        hash = await bcrypt.hash(password, saltRounds);
        console.log(hash);
        await client.db("JustBalance").collection("Users").insertOne({
            UserName: username,
            DisplayName: displayname,
            Password: hash
        });
            console.log('Created User');
            res.status(200).send('Created User');
    }

    
});

app.post('/login', async function(req, res){
    console.log('POST request recieved at /login')
    let username = req.body.username.toLowerCase();
    console.log('Username: ' + username);
    let password = req.body.password;
    const user = await client.db("JustBalance").collection("Users").findOne({UserName: username});
    console.log(user);

    if (user != null){
        bcrypt.compare(password, user.Password, function(err, result){
            if (err) throw err;
            if (result == true){
                session=req.session;
                session.userid=username;
                console.log("Session created \n" + session)
                res.status(200).send(user.DisplayName + " has logged on <a href=\'/index.html'>Home</a>");
            } else{
                res.status(401).send("Wrong Username or Password")
                console.log("Session not created \n" + session);
            }
            
        });
    } else{
        res.status(401).send("User not found");
    }
});

app.get('/', isAuthenticated, function(req,res){
    console.log(session);
    res.send("Welcome User <a href=\'/logout'>click to logout</a>");
});


app.get('/logout', function(req, res){
    if(req.session){
        req.session.destroy(err => {
            if (err) {
                res.status(400).send("Unable to log out")
            } else{
                res.send("Logout Successful");
            }
        });
    } else {
        res.end();
    }
});

app.get('/transactions',isAuthenticated, async function(req,res){
    console.log("GET request recieved at /transactions");
    const transactions = await findTransactionsBetweenUsers(client, session.userid, "oneNonlyBennett");
    res.setHeader('Content-Type', 'application/json');
    console.log(transactions);
    res.status(200).send(transactions);
});

app.get('/testpage4.html', isAuthenticated, function(req,res){
    console.log("GET recieved at /testpage3");
    res.sendFile('testpage4.html',{root:__dirname})
});

app.get('/testpage2.html', isAuthenticated, function(req,res){
    console.log("GET recieved at /testpage3");
    res.sendFile('testpage2.html',{root:__dirname})
});

app.get('/testpage.html', isAuthenticated, function(req,res){
    console.log("GET recieved at /testpage3");
    res.sendFile('testpage.html',{root:__dirname})
});
app.get('/testpage3.html', isAuthenticated, function(req,res){
    console.log("GET recieved at /testpage3");
    res.sendFile('testpage3.html',{root:__dirname})
});

app.get('/testpage5.html', function(req,res){
    console.log("GET recieved at /testpage5");
    res.sendFile('testpage5.html',{root:__dirname})
});

app.get('/login.html', isAuthenticated, function(req,res){
    console.log("GET recieved at /testpage5");
    res.sendFile('index.html',{root:__dirname})
});

app.get('/index.html', isAuthenticated, function(req,res){
    console.log("GET recieved at /index.html");
    res.sendFile('index.html',{root:__dirname})
});
/////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/friends', function(request, response){
    console.log("GET request recieved at /friends");
    console.log(request.body);
});

app.post('/transactions', function(request,response){
    console.log("POST request recieved at /transactions");
    console.log(request);
});

// app.get('/transactions', async function(request, response){
//     console.log("GET request recieved at /transactions");
//     const transactions = await findTransactionsBetweenUsers(client, "Kepheous", "oneNonlyBennett");
//     response.setHeader('Content-Type', 'application/json');
//     console.log(transactions);
//     response.status(200).send(transactions);
// });

app.listen(3000, function(){
    console.log("Server is running at port 3000");
});

async function findTransactionsBetweenUsers(client, borrower = "", lender = "") {
    const cursor = client.db("JustBalance").collection("Transactions").find({
        borrower_name: borrower,
        lender_name: lender
    })

    const transactions = await cursor.toArray();

    if (transactions.length > 0) {
        console.log(`Found ${transactions.length} transactions between ${borrower} and ${lender}`);
        console.log(transactions);
        const transactionsJSON = JSON.stringify(transactions);
        return transactionsJSON;
    } else (
        console.log("Did not find any transactions.")
    )
}