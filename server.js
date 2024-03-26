const express =  require('express');
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
        res.status(401).send("Access Denied");
    }
}

////////////////////////////////////////////////////
//routes

//GET requests
app.get('/gettransactions', async (req,res) => {
    try {
        let userName = req.query.username;
        console.log(req);
        console.log(userName);
        const result = await pool.query(
        "SELECT " +
        "payed, " +
        "share, " +
        "confirmed, " +
        "title, " +
        "amount, " +
        "transactiondate, " +
        "squad, " +
        "settled, " +
        "FROM nuts " +
        "WHERE " +
        "user = (?) " +
        "INNER JOIN transactions using (transaction)", [userName]
        );


    } catch (error) {
        throw error;
    }
})

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

//POST requests
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

app.listen(3000, function(){
    console.log("Server is running at port 3000");
});