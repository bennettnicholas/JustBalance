const container = document.getElementById('testcontainer');
let testname = "Johnny";
let node = document.createTextNode('initalized');
let row = document.createElement('div');

for (let i = 0; i < 100; i++){
    testname = "Johnny" + i;
    node = document.createTextNode(testname);
    row = document.createElement('div');
    row.appendChild(node);
    row.setAttribute('class','row');
    container.appendChild(row);
}
