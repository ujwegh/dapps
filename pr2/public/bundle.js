let contractABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "hello",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "pure",
        "type": "function"
    }
];
let contractAddress = '0xbC6869655003C554cCF0B1307c88ad355154ab28';

const web3 = new Web3('http://localhost:8545');
let helloWorld = new web3.eth.Contract(contractABI, contractAddress);

document.addEventListener('DOMContentLoaded', () => {
    helloWorld.methods.hello().call()
        .then(result => {
            document.getElementById('hello').innerHTML = result;
        });
});


