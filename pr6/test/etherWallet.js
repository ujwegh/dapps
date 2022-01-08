const EtherWallet = artifacts.require('EtherWallet');

contract('EtherWallet', (accounts) => {
    let etherWallet = null;
    before(async () => {
        etherWallet = await EtherWallet.deployed();
    });

    it("Should set accounts[0] as owner", async () => {
        const owner = await etherWallet.owner();
        assert(owner === accounts[0]);
    });

    it('Should deposit ether to etherWallet', async () => {
        await etherWallet.deposit({
            from: accounts[0],
            value: 100
        });
        const balance = await web3.eth.getBalance(etherWallet.address);
        assert(parseInt(balance) === 100);
    });

    it('Sould return balance of the contract', async () => {
        const balance = await etherWallet.balanceOf();
        assert(parseInt(balance) === 100);
    });

    it('Should transfer ether to another address', async () => {
        const balanceRecipientBefore = await web3.eth.getBalance(accounts[1]);
        await etherWallet.send(accounts[1], 50, {from: accounts[0]});
        const balanceWallet = await web3.eth.getBalance(etherWallet.address);
        assert(parseInt(balanceWallet) === 50);
        const balanceRecipientAfter = await web3.eth.getBalance(accounts[1]);
        const initialBalance = web3.utils.toBN(balanceRecipientBefore);
        const finalBalance = web3.utils.toBN(balanceRecipientAfter);
        assert(finalBalance.sub(initialBalance).toNumber() === 50);
    });

    it('Should not transfer ether if tx sent from owner', async () => {
        try {
            await  etherWallet.send(accounts[1], 50, {from: accounts[2]});
        } catch (e) {
            assert(e.message.includes('sender is not allowed'));
            return;
        }
        assert(false);
    });
});
