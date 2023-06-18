const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("CPAMM", function () {
  let CPAMM;
  let cpamm;
  let token0;
  let token1;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const Token0 = await ethers.getContractFactory("Token0");
    token0 = await Token0.deploy();

    const Token1 = await ethers.getContractFactory("Token1");
    token1 = await Token1.deploy();

    CPAMM = await ethers.getContractFactory("CPAMM");
    cpamm = await CPAMM.deploy(token0.address, token1.address);
  });

  it("should swap tokens successfully", async function () {
    const initialBalance0 = 1000;
    const initialBalance1 = 2000;
    const swapAmount = 500;

    await token0.transfer(cpamm.address, initialBalance0);
    await token1.transfer(cpamm.address, initialBalance1);

    const balance0Before = await token0.balanceOf(owner.address);
    const balance1Before = await token1.balanceOf(owner.address);

    await cpamm.swap(token0.address, swapAmount);

    const balance0After = await token0.balanceOf(owner.address);
    const balance1After = await token1.balanceOf(owner.address);

    expect(balance0Before).to.equal(balance0After.sub(swapAmount));
    expect(balance1After).to.equal(balance1Before.add(swapAmount));
  });

  it("should add liquidity successfully", async function () {
    const token0Amount = 1000;
    const token1Amount = 2000;

    await token0.transfer(owner.address, token0Amount);
    await token1.transfer(owner.address, token1Amount);

    await token0.approve(cpamm.address, token0Amount);
    await token1.approve(cpamm.address, token1Amount);

    const balance0Before = await token0.balanceOf(owner.address);
    const balance1Before = await token1.balanceOf(owner.address);

    await cpamm.addLiquidity(token0Amount, token1Amount);

    const balance0After = await token0.balanceOf(owner.address);
    const balance1After = await token1.balanceOf(owner.address);

    expect(balance0Before).to.equal(balance0After.add(token0Amount));
    expect(balance1Before).to.equal(balance1After.add(token1Amount));
  });

  it("should remove liquidity successfully", async function () {
    const token0Amount = 1000;
    const token1Amount = 2000;
    const shares = 500;

    await token0.transfer(owner.address, token0Amount);
    await token1.transfer(owner.address, token1Amount);

    await token0.approve(cpamm.address, token0Amount);
    await token1.approve(cpamm.address, token1Amount);

    await cpamm.addLiquidity(token0Amount, token1Amount);

    const balance0Before = await token0.balanceOf(owner.address);
    const balance1Before = await token1.balanceOf(owner.address);

    await cpamm.removeLiquidity(shares);

    const balance0After = await token0.balanceOf(owner.address);
    const balance1After = await token1.balanceOf(owner.address);

    expect(balance0After).to.equal(balance0Before.add(token0Amount));
    expect(balance1After).to.equal(balance1Before.add(token1Amount));
  });
});
