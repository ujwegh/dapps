const {expectRevert, time} = require('@openzeppelin/test-helpers');
const EventContract = artifacts.require('EventContract.sol');

contract('EventContract', (accounts) => {
    let eventContract = null;
    before(async () => {
        eventContract = await EventContract.new();
    });

    it('Should NOT create an event if date if before now', async () => {
        const eventName = "Event 1"
        const date = (await time.latest()).sub(time.duration.seconds(1));
        const price = 100;
        const ticketCount = 10;
        await expectRevert(
            eventContract.createEvent(eventName, date, price, ticketCount),
            'can only organize event at a future date'
        );
    });

    it('Should NOT create an event if less than 1 ticket', async () => {
        const eventName = "Event 1"
        const date = (await time.latest()).add(time.duration.seconds(1000));
        const price = 100;
        const ticketCount = 0;
        await expectRevert(
            eventContract.createEvent(eventName, date, price, ticketCount),
            'can only organize event with at least 1 ticket'
        );
    });

    it('Should create an event', async () => {
        const eventName = "Event 1"
        const date = (await time.latest()).add(time.duration.seconds(1000));
        const price = 100;
        const ticketCount = 10;
        await eventContract.createEvent(eventName, date, price, ticketCount);

        const event = await eventContract.events(0);
        assert(event.id.toNumber() === 0);
        assert(event.name === eventName);
        assert(event.date.toNumber() === date.toNumber());
    });

    it('Should NOT buy a ticket if event does not exist', async () => {
        const eventId = 4;
        const quantity = 5;
        await expectRevert(
            eventContract.buyTicket(eventId, quantity),
            'this event does not exist'
        );
    });

    context('event created', () => {
        beforeEach(async () => {
            const date = (await time.latest()).add(time.duration.seconds(1000));
            await eventContract.createEvent('event1', date, 5, 2);
        });

        it('Should NOT buy a ticket if wrong amount of ether sent', async () => {
            const eventId = 1;
            const quantity = 5;
            await expectRevert(
                eventContract.buyTicket(eventId, quantity),
                'ether sent must be equal to total ticket cost'
            );
        });

        it('Should NOT buy a ticket if not enough ticket left', async () => {
            const eventId = 1;
            const quantity = 5;
            await expectRevert(
                eventContract.buyTicket(eventId, quantity, {value: 25}),
                'not enough ticket left'
            );
        });

        it('Should buy tickets', async () => {
            const eventId = 1;
            const quantity = 2;
            await eventContract.buyTicket(eventId, quantity, {from: accounts[1], value: 10});
            const ticketCount = await eventContract.tickets.call(accounts[1], 1);
            assert(ticketCount.toNumber() === 2);
        });

        it('Should NOT transfer ticket if not enough tickets', async () => {
            const eventId = 1;
            const quantity = 5;
            const to = accounts[2];
            await expectRevert(
                eventContract.transferTicket(eventId, quantity, to, {from: accounts[1]}),
                'not enough ticket'
            );
        });

        it('Should transfer ticket', async () => {
            const eventId = 1;
            const quantity = 1;
            const to = accounts[2];
            await eventContract.transferTicket(eventId, quantity,to, {from: accounts[1]});
            const ticketCount1 = await eventContract.tickets.call(accounts[1], 1);
            const ticketCount2 = await eventContract.tickets.call(accounts[2], 1);
            assert(ticketCount1.toNumber() === 1);
            assert(ticketCount2.toNumber() === 1);
        });

        it('Should NOT buy a ticket if event has expired', async () => {
            time.increase(1001);
            const eventId = 0;
            const quantity = 2;
            await expectRevert(
                eventContract.buyTicket(eventId, quantity),
                'event has expired'
            );
        });
    });
});
