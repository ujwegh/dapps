let contractABI = [];
let contractAddress = '0x1307cEcF02fdd1B1f8b5a35c5A24D69083476a83';

const web3 = new Web3('http://localhost:8545');
let simpleSmartContract = new web3.eth.Contract(contractABI, contractAddress);

console.log(simpleSmartContract);

web3.eth.getAccounts()
.then(console.log);
