const SimpleSmartContract = artifacts.require('SimpleSmartContract')

contract('SimpleStorageContract', ()=> {
    it('doploy smart contract properly', async () => {
        const simpleSmartContract = await SimpleSmartContract.deployed();
        console.log(simpleSmartContract.address);
    })
});