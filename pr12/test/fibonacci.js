const Fibonacci = artifacts.require('Fibonacci');

contract('Fibonacci', (accounts) => {
  let fibonacci = null;
  before(async () => {
    fibonacci = await Fibonacci.deployed();
  });

  it('Should correctly calculate fibonacci seq', async () => {
    const result = await fibonacci.fib(10);
    assert(result.toNumber() === 55);
  })
});
