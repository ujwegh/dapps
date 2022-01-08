const simpleStorageABI = [
    {
        "constant": false,
        "inputs": [
            {
                "internalType": "string",
                "name": "_data",
                "type": "string"
            }
        ],
        "name": "set",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "get",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];
const simpleStorageAddress = '0xe3f61cD5E184d2961d651dAd04B7C070CE165800';
const web3 = new Web3('http://localhost:8545');
const simpleStorage = new web3.eth.Contract(simpleStorageABI, simpleStorageAddress);

document.addEventListener('DOMContentLoaded', () => {
    const setData = document.getElementById('setData');
    const data = document.getElementById('data');
    let accounts = [];
    web3.eth.getAccounts()
        .then(_accounts => {
            accounts = _accounts;
        });

    const getData = () => {
        simpleStorage.methods
            .get()
            .call()
            .then(result => {
                data.innerHTML = result;
            });
    };
    getData();

    setData.addEventListener('submit', e => {
        e.preventDefault();
        const data = e.target.elements[0].value;
        simpleStorage.methods
            .set(data)
            .send({
                from: accounts[0]
            })
            .then(getData);
    })
});
