const {expectRevert, time} = require('@openzeppelin/test-helpers');
const DAO = artifacts.require('DAO');

contract('DAO', (accounts) => {
    let dao;

    const [investor1, investor2, investor3] = [accounts[1], accounts[2], accounts[3]];
    const nonInvestor = accounts[4];
    before(async () => {
        dao = await DAO.new(10, 10, 50);
    });

    it('Should accept contribution', async () => {
        const resultsBefore = await Promise.all(
            [investor1, investor2, investor3]
                .map(investor => dao.investors(investor))
        );
        resultsBefore.forEach(result => assert(result === false));

        await Promise.all(
            [investor1, investor2, investor3]
                .map(investor => dao.contribute({from: investor, value: 1000}))
        );
        const resultsAfter = await Promise.all(
            [investor1, investor2, investor3]
                .map(investor => dao.investors(investor))
        );
        resultsAfter.forEach(result => assert(result === true));
    });

    it('Should NOT accept contribution after contributionTime', async () => {
        await time.increase(10001);
        await expectRevert(
            dao.contribute({from: investor1}),
            'cannot contribute after contributionEnd'
        );
    });

    it('Should create proposal', async () => {
        const proposalName1 = 'Proposal 1';
        const proposalName2 = 'Proposal 2';
        const amount = 100;

        await dao.createProposal(proposalName1, amount, investor2, {from: investor1});
        await dao.createProposal(proposalName2, amount, investor3, {from: investor1});

        const proposal1 = await dao.proposals(0);
        assert(proposal1.name === proposalName1);
        assert(web3.utils.toBN(proposal1.id).toNumber() === 0);
        assert(web3.utils.toBN(proposal1.amount).toNumber() === 100);
        assert(proposal1.recipient === investor2);

        const proposal2 = await dao.proposals(1);
        assert(proposal2.name === proposalName2);
        assert(web3.utils.toBN(proposal2.id).toNumber() === 1);
        assert(web3.utils.toBN(proposal2.amount).toNumber() === 100);
        assert(proposal2.recipient === investor3);
    });

    it('Should NOT create proposal if not from investor', async () => {
        const proposalName = 'Proposal 3';
        const amount = 100;
        await expectRevert(
            dao.createProposal(proposalName, amount, investor2, {from: nonInvestor}),
            'only investors'
        );
    });

    it('Should NOT create proposal if amount too big', async () => {
        const proposalName = 'Proposal 4';
        const amount = 10000;
        await expectRevert(
            dao.createProposal(proposalName, amount, investor2, {from: investor2}),
            'amount too big'
        );
    });

    it('Should vote', async () => {
        const proposalId = 0;
        const proposalBefore = await dao.proposals(0);
        assert(web3.utils.toBN(proposalBefore.id).toNumber() === proposalId);
        assert(web3.utils.toBN(proposalBefore.votes).toNumber() === 0);

        //voting
        await dao.vote(proposalId, {from: investor1});
        await dao.vote(proposalId, {from: investor2});

        const proposalAfter = await dao.proposals(0);
        assert(web3.utils.toBN(proposalAfter.id).toNumber() === proposalId);
        assert(web3.utils.toBN(proposalAfter.votes).toNumber() === 2000);
    });

    it('Should NOT vote if not investor', async () => {
        const proposalId = 0;
        await expectRevert(
            dao.vote(proposalId, {from: nonInvestor}),
            'only investors'
        );
    });

    it('Should NOT vote if already voted', async () => {
        const proposalId = 0;
        await expectRevert(
            dao.vote(proposalId, {from: investor1}),
            'investor can only vote once for a proposal'
        );
    });

    it('Should NOT vote if after proposal end date', async () => {
        const proposalId = 0;
        await time.increase(10001);
        await expectRevert(
            dao.vote(proposalId, {from: investor3}),
            'can only vote until proposal end date'
        );
    });

    it('Should execute proposal', async () => {
        const proposalId = 0;
        const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(investor2));

        await dao.executeProposal(proposalId, {from: accounts[0]});

        const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(investor2));
        assert(balanceAfter.sub(balanceBefore).toNumber() === 100);
    });

    it('Should NOT execute proposal if not enough votes', async () => {
        const proposalId = 1;
        await expectRevert(
            dao.executeProposal(proposalId, {from: accounts[0]}),
            'cannot execute proposal with votes # below quorum'
        );
    });

    it('Should NOT execute proposal twice', async () => {
        const proposalId = 0;
        await expectRevert(
            dao.executeProposal(proposalId, {from: accounts[0]}),
            'cannot execute proposal already executed'
        );
    });

    it('Should withdraw ether', async () => {
        const amount = 123;
        const balanceBefore = web3.utils.toBN(await dao.availableFunds());

        await dao.withdrawEther(amount, investor3, {from: accounts[0]});

        const balanceAfter = web3.utils.toBN(await dao.availableFunds());
        assert(balanceBefore.sub(balanceAfter).toNumber() === amount);
    });

    it('Should NOT withdraw ether if not admin', async () => {
        const amount = 123;
        await expectRevert(
            dao.withdrawEther(amount, investor2, {from: investor1}),
            'only admin'
        );
    });

    it('Should NOT withdraw ether if trying to withdraw too much', async () => {
        const amount = 100000;
        await expectRevert(
            dao.withdrawEther(amount, investor2, {from: accounts[0]}),
            'not enough availableFunds'
        );
    });
});
