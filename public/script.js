const container = document.getElementById('testcontainer');
let testname = "Johnny";
let node = document.createTextNode('initalized');
let row = document.createElement('div');


document.getElementById("transFriendSubmit").addEventListener("click", testFetch);

async function testFetch() {
    const response = await fetch('/transactions', {
        method: "GET"
    });
    const jsonData = await response.json();
    console.log(jsonData);


    for (let i = 0; i < jsonData.length; i++){
        console.log(jsonData[i]);
        let transaction = jsonData[i];

        node = document.createTextNode(transaction.cost);
        row = document.createElement('div');
        row.appendChild(node);
        row.setAttribute('class','row');
        container.appendChild(row);
}
}

