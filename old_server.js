const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const app = express();
require("dotenv").config();
const bcrypt = require('bcrypt');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: process.env.MARIADB_HOST,
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    port: 3306,
    database: "test"
});


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
    console.log(req.session.id);
    session = req.session;
    console.log(session.userid);
    if (req.session.userid) next()
    else{
        res.status(401).sendFile('login.html', {root:__dirname});
    }
}

// routes
/* app.post('/useradd', async function(req, res){
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

    
}); */

app.post('/useradd', async function(req, res){
    console.log('POST request recieved at /useradd');
    const saltRounds = 10;
    let username = req.body.username.toLowerCase();
    let password = req.body.password;
    let displayname = req.body.username;
    let password_hash = "";
    var rows = await pool.query("SELECT * FROM users WHERE username = (?)", [username]);
    var user = rows[0];
    if(user == null){
        await bcrypt.hash(password, saltRounds, function(err, hash){
            if(err) throw err;
            password_hash = hash;
            pool.query("INSERT INTO users (username, displayname, password) values (?, ?, ?)", [username, displayname, password_hash], function (err, result){
                if (err) throw err;
            });
        });
        res.sendFile('login.html',{root:__dirname});      
    } else{
        res.status(401).send("Username already exists");
        console.log("User not created.");
    }
});

////////////////////////////////////////////
// POST
app.post('/testput', async function(req, res) {
    let infoName = req.body.name;
    let infoPhone = req.body.phone;
    try {
        const result = await pool.query("INSERT into test_table (name, user_phone) values (?, ?)", [infoName, infoPhone]);
        res.status(200).send("Info Added to Database.");
    } catch (err) {
        throw err;
    }
});
///////////////////////////////////////////

app.post('/login', async function(req, res){
    console.log('POST request recieved at /login')
    let username = req.body.username.toLowerCase();
    console.log('Username: ' + username);
    let password = req.body.password;
    const rows = await pool.query("SELECT * FROM users WHERE username = (?)", [username]);
    const user = rows[0];

    if (user != null){
        bcrypt.compare(password, user.password, function(err, result){
            if (err) throw err;
            if (result == true){
                session=req.session;
                session.userid=req.body.username;
                console.log("Session created \n" + req.session.id);
                res.status(200).send(user.DisplayName + " has logged on <a href=\'/index.html'>Home</a>");
            } else{
                res.status(401).send("Wrong Username or Password");
                console.log("Session not created \n" + req.session.id);
            }
            
        });
    } else{
        res.status(401).send("User not found");
    }
});

/* app.post('/transactions', isAuthenticated, async function(req, res){
    console.log("POST request recieved at /transactions");
    const transactions = await findTransactionsBetweenUsers(client, session.userid, req.body.friendname);
    res.setHeader('Content-Type', 'application/json');
    console.log(transactions);
    res.status(200).send(transactions);
}); */

app.get('/', isAuthenticated, function(req,res){
    res.send("Welcome User <a href=\'/logout'>click to logout</a>");
});


app.get('/logout', function(req, res){
    console.log("GET request recieved at /logout")
    session = req.session;
    if(session.userid){
        session.destroy(err => {
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

app.post('/transactions',isAuthenticated, async function(req,res){
    console.log("POST request recieved at /transactions");
    console.log(req.body);
    const transactions = await findTransactionsBetweenUsers(client, session.userid, req.body.friendname);
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

app.get('/testpage6.html', function(req,res){
    console.log("GET recieved at /testpage6");
    res.sendFile('testpage6.html',{root:__dirname})
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

/* app.post('/transactions', function(request,response){
    console.log("POST request recieved at /transactions");
    console.log(request);
}); */

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
    let cursor = client.db("JustBalance").collection("Transactions").find({
        borrower_name: borrower,
        lender_name: lender
    });

    let negTransactions = await cursor.toArray();

    cursor = client.db("JustBalance").collection("Transactions").find({
        borrower_name: lender,
        lender_name: borrower
    });

    let posTransactions = await cursor.toArray();
    let transactions;

    if (negTransactions.length > 0 && posTransactions.length > 0){
        transactions = posTransactions.concat(negTransactions);
    }else if(negTransactions.length > 0 && posTransactions.length == 0){
        transactions = negTransactions;
    }else if (negTransactions.length == 0 && posTransactions.length > 0){
        transactions = posTransactions;
    }else {
        transactions = null;
    }


    if (transactions != null) {
        console.log(`Found ${transactions.length} transactions between ${borrower} and ${lender}`);
        const transactionsJSON = JSON.stringify(transactions);
        return transactionsJSON;
    } else {
        console.log("Did not find any transactions.");
        return JSON.stringify([{cost: "No Transactions Found"}]);
    }
}