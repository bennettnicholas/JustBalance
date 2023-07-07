const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const app = express();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('db/justbalancetest.db');
const { MongoClient } = require('mongodb');
require("dotenv").config();
const client = new MongoClient(process.env.MONGO_URI);


app.use(express.static(__dirname + '/public'));
////////////////////////////////////////////////////////////////////////////////////////////////
// creating 5 minutes from milliseconds
const fiveMinutes = 1000 * 60 * 5;

//session middleware
app.use(sessions({
    secret: process.env.COOKIE_SECRET,
    saveUninitialized:true,
    cookie: { maxAge: fiveMinutes },
    resave: false
}));

// parsing the incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//username and password
const myusername = 'Kepheous'
const mypassword = 'mypassword'

// a variable to save a session
let session;

//middleware to test if authenticated
function isAuthenticated (req, res, next) {
    if (req.session.user) next()
    else{
        res.status(401).sendFile('index.html', {root:__dirname});
    }
}

// routes
app.get('/', isAuthenticated, function(req,res){
    console.log(session);
    res.send("Welcome User <a href=\'/logout'>click to logout</a>");
});

app.post('/user',(req,res) => {
    if(req.body.username == myusername && req.body.password == mypassword){
        session=req.session;
        session.userid=req.body.username;
        console.log(req.session)
        res.send(`Hey there, welcome <a href=\'/logout'>click to logout</a>`);
    }
    else{
        res.send('Invalid username or password');
    }
})

app.get('/testpage3',function(req,res){
    console.log("GET recieved at /testpage3");
    session=req.session;
    if(session.userid){
        res.sendFile('testpage3.html',{root:__dirname})
    }else
        res.sendFile('index.html',{root:__dirname})
});

app.get('/transactions',async function(req,res){
    session=req.session;
    if(session.userid){
    console.log("GET request recieved at /transactions");
    const transactions = await findTransactionsBetweenUsers(client, session.userid, "oneNonlyBennett");
    res.setHeader('Content-Type', 'application/json');
    console.log(transactions);
    res.status(200).send(transactions);
    }else
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