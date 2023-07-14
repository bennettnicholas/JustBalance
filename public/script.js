const container = document.getElementById('testcontainer');
let testname = "Johnny";
let node = document.createTextNode('initalized');
let row = document.createElement('div');


document.getElementById("transFriendSubmit").addEventListener("click", testFetch);
console.log("look here");
console.log(document.getElementById("transFriendUsername").innerText);

async function testFetch() {
    const response = await fetch('/transactions', {
        method: "POST",
        headers: {"Content-Type": "application/json",},
        body: JSON.stringify({friendname: document.getElementById("transFriendUsername").value})

    });
    const jsonData = await response.json();
    console.log(jsonData);
    container.innerHTML = "";


    for (let i = 0; i < jsonData.length; i++){
        console.log(jsonData[i]);
        let transaction = jsonData[i];

        if(transaction.lender_name == document.getElementById("transFriendUsername").value){
            node = document.createTextNode(transaction.title + " for -$" + transaction.cost);
        }else {
            node = document.createTextNode(transaction.title + " for $" + transaction.cost);
        }
        row = document.createElement('div');
        row.appendChild(node);
        row.setAttribute('class','row');
        container.appendChild(row);
}
}

