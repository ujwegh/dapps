const {expectRevert, time} = require('@openzeppelin/test-helpers');
const Lottery = artifacts.require('Lottery.sol');

contract('Lottery', (accounts) => {
    let lottery;
    beforeEach(async () => {
        lottery = await Lottery.new(2);
    });

    it('Should NOT create bet if not admin', async () => {
        const count = 5;
        const size = 10;
        await expectRevert(
            lottery.createBet(count, size, {from: accounts[1]}),
            'only admin'
        );
    });

    it('Should NOT create bet if state not idle', async () => {
        const count = 5;
        const size = 10;
        await lottery.createBet(count, size);
        await expectRevert(
            lottery.createBet(count, size),
            'current state does not allow this'
        );
    });

    it('Should create a bet', async () => {
        const count = 5;
        const size = 10;
        await lottery.createBet(count, size);
        const betSize = web3.utils.toBN(await lottery.betSize());
        const betCount = web3.utils.toBN(await lottery.betCount());
        assert(betSize.toNumber() === 10);
        assert(betCount.toNumber() === 5);
    });

    it('Should NOT bet if not in state BETTING', async () => {
        await expectRevert(
            lottery.bet({value: 1000, from: accounts[1]}),
            'current state does not allow this'
        );
    });

    it('Should NOT bet if not sending exact bet amount', async () => {
        const count = 5;
        const size = 10;
        await lottery.createBet(count, size);
        await expectRevert(
            lottery.bet({value: 1000, from: accounts[1]}),
            'can only bet exactly the bet size'
        );
    });

    it('Should bet', async () => {
        const count = 5;
        const size = 1000;
        await lottery.createBet(count, size);

        const balancesBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));

        await lottery.bet({value: 1000, from: accounts[1], gasPrice: 1});

        const balancesAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[1]));
        assert(balancesBefore.sub(balancesAfter).toNumber() === 67404);
    });

    it('Should NOT cancel if not betting', async () => {
        await expectRevert(
            lottery.cancel({from: accounts[1]}),
            'current state does not allow this'
        );
    });

    it('Should NOT cancel if not admin', async () => {
        const count = 5;
        const size = 1000;
        await lottery.createBet(count, size);
        await expectRevert(
            lottery.cancel({from: accounts[1]}),
            'only admin'
        );
    });

    it('Should cancel', async () => {
        const count = 5;
        const size = 1000;
        await lottery.createBet(count, size);
        await lottery.cancel();
        const state = await lottery.currentState();
        assert(state.toNumber() === 0);
    });
});
