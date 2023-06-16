const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('db/justbalancetest.db');
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://application:HelloWorld@justbalance.5omg9.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);


app.use(express.static(__dirname + '/public'));


// routes
app.get('/', function(request, response){
    console.log("GET request recieved at /");
    console.log(request);
});

app.get('/friends', function(request, response){
    console.log("GET request recieved at /friends");
    console.log(request);
});

app.post('/transactions', function(request,response){
    console.log("POST request recieved at /transactions");
    console.log(request);
});

app.get('/transactions', async function(request, response){
    console.log("GET request recieved at /transactions");
    const transactions = await findTransactionsBetweenUsers(client, "Kepheous", "oneNonlyBennett");
    response.setHeader('Content-Type', 'application/json');
    console.log(transactions);
    response.status(200).send(transactions);
});

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