const SplitPayment = artifacts.require('SplitPayment');

contract('SplitPayment', (accounts) => {
    let splitPayment = null;
    before(async () => {
        splitPayment = await SplitPayment.deployed();
    });

    it('Should split payment', async () => {
        const recipients = [accounts[1], accounts[2], accounts[3]];
        const amounts = [40, 20, 30];
        const initialBalances = await Promise.all(
            recipients.map(recipient => {
                return web3.eth.getBalance(recipient);
            })
        );
        await splitPayment.send(recipients, amounts, {from: accounts[0], value: 90});

        const finalBalances = await Promise.all(
            recipients.map(recipient => {
                return web3.eth.getBalance(recipient);
            })
        );

        recipients.forEach((_item, index) => {
            const initialBalance = web3.utils.toBN(initialBalances[index]);
            const finalBalance = web3.utils.toBN(finalBalances[index]);
            assert(finalBalance.sub(initialBalance).toNumber() === amounts[index]);
        });
    });

    it('Should not split payment if array length mismatch', async () => {
        const recipients = [accounts[1], accounts[2], accounts[3]];
        const amounts = [40, 20];
        try{
            await splitPayment.send(recipients, amounts, {from: accounts[0], value: 90});
        } catch (e) {
            assert(e.message.includes('to must be same length as amount'));
            return;
        }
        assert(false);
    });

    it('Should not split payment if caller is not owner', async () => {
        const recipients = [accounts[1], accounts[2], accounts[3]];
        const amounts = [40, 20, 30];
        const initialBalances = await Promise.all(
            recipients.map(recipient => {
                return web3.eth.getBalance(recipient);
            })
        );
        try {
            await splitPayment.send(recipients, amounts, {from: accounts[1], value: 90});
        } catch (e) {
            assert(e.message.includes('only owner can send transfer'));
            return;
        }
        assert(false);
    });

});
