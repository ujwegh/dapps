const Crud = artifacts.require('Crud');

contract('Crud', () => {
    let crud = null;
    before(async () => {
        crud = await Crud.deployed();
    });

    it('Should create a new user', async () => {
        await crud.create('Joe');
        const user = await crud.read(1);
        assert(user[0].toNumber() === 1);
        assert(user[1] === 'Joe');
    });

    it('Should update a user', async () => {
        await crud.update(1, 'Alice');
        const user = await crud.read(1);
        assert(user[0].toNumber() === 1);
        assert(user[1] === 'Alice');
    });

    it('Should not update a non existing user', async () => {
        try{
            await crud.update(2, 'Alice');
        } catch (e) {
            assert(e.message.includes('User does not exist!'));
            return;
        }
        assert(false);
    });

    it('Should destroy a user', async () => {
        await crud.destroy(1);
        try{
            await crud.read(1);
        } catch (e) {
            assert(e.message.includes('User does not exist!'));
            return;
        }
        assert(false);
    });

    it('Should not destroy a non existing user', async () => {
        try{
            await crud.destroy(5);
        } catch (e) {
            assert(e.message.includes('User does not exist!'));
            return;
        }
        assert(false);
    });


});


