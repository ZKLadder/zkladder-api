const { ethers } = require('hardhat');
const { expect } = require('chai');
const { BigNumber, utils } = require('ethers');
const { nftWhitelisted } = require('../../src/utils/signTypedData');

describe('ERC721_Whitelisted', () => {
  let ERC721Whitelisted;

  beforeEach(async () => {
    const factory = await ethers.getContractFactory('ERC721_Whitelisted');

    ERC721Whitelisted = await factory.deploy(
      'MockNFT',
      'MNFT',
      'ipfs://mock12345',
      '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    );
  });

  it('Correctly deploys with constructor params', async () => {
    expect(await ERC721Whitelisted.name()).to.equal('MockNFT');
    expect(await ERC721Whitelisted.symbol()).to.equal('MNFT');
    expect(await ERC721Whitelisted.baseUri()).to.equal('ipfs://mock12345');
    expect((await ERC721Whitelisted.beneficiaryAddress())
      .toLowerCase())
      .to.equal('0x70997970c51812dc3a010c7d01b50e0d17dc79c8'.toLowerCase());
    expect(await ERC721Whitelisted.salePrice()).to.deep.equal(BigNumber.from(0));
  });

  it('Correctly sets salePrice', async () => {
    const pow18 = BigNumber.from(10).mul(18);

    const tx = await ERC721Whitelisted.setSalePrice(BigNumber.from(3).mul(pow18));
    await tx.wait();

    expect(await ERC721Whitelisted.salePrice()).to.deep.equal(BigNumber.from(3).mul(pow18));
  });

  it('Throws when a non-admin calls setSalePrice', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    const pow18 = BigNumber.from(10).mul(18);

    try {
      const tx = await nonAdmin.setSalePrice(BigNumber.from(3).mul(pow18));
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });

  it('Correctly sets beneficiary', async () => {
    const signers = await ethers.getSigners();

    const tx = await ERC721Whitelisted.setBeneficiary(signers[1].address);
    await tx.wait();

    expect(await ERC721Whitelisted.beneficiaryAddress())
      .to.deep.equal(signers[1].address);
  });

  it('Throws when a non-admin calls setBeneficiary', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.setBeneficiary(signers[1].address);
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }
  });

  it('Correctly mints a token with mintTo', async () => {
    const signers = await ethers.getSigners();
    const balance = await ERC721Whitelisted.totalSupply();
    expect(balance).to.deep.equal(BigNumber.from(0));

    const tx = await ERC721Whitelisted.mintTo(signers[1].address, 'http://mockURI.com');
    await tx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.balanceOf(signers[1].address)).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.ownerOf(0)).to.equal(signers[1].address);
    expect(await ERC721Whitelisted.tokenURI(0)).to.equal('http://mockURI.com');
  });

  it('Fails when mintTo is called by a non-minter role', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.mintTo(signers[2].address, 'http://mockURI.com');
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6\'');
    }
  });

  it('Correctly grants role and then mints a new token', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.mintTo(signers[2].address, 'http://mockURI.com');
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6\'');
    }

    const minterRole = utils.keccak256(utils.toUtf8Bytes('MINTER_ROLE'));
    const tx = await ERC721Whitelisted.grantRole(minterRole, signers[1].address);
    await tx.wait();

    const mintTx = await nonAdmin.mintTo(signers[2].address, 'http://mockURI.com');
    await mintTx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.balanceOf(signers[2].address)).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.ownerOf(0)).to.equal(signers[2].address);
    expect(await ERC721Whitelisted.tokenURI(0)).to.equal('http://mockURI.com');
  });

  it('Correctly revokes role and then fails a token mint', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.mintTo(signers[2].address, 'http://mockURI.com');
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6\'');
    }

    const minterRole = utils.keccak256(utils.toUtf8Bytes('MINTER_ROLE'));
    const tx = await ERC721Whitelisted.grantRole(minterRole, signers[1].address);
    await tx.wait();

    const mintTx = await nonAdmin.mintTo(signers[2].address, 'http://mockURI.com');
    await mintTx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.balanceOf(signers[2].address)).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.ownerOf(0)).to.equal(signers[2].address);
    expect(await ERC721Whitelisted.tokenURI(0)).to.equal('http://mockURI.com');

    const revokeTx = await ERC721Whitelisted.revokeRole(minterRole, signers[1].address);
    await revokeTx.wait();

    try {
      const secondMintTx = await nonAdmin.mintTo(signers[2].address, 'http://mockURI.com');
      await secondMintTx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6\'');
    }
  });

  it('Correctly transfers ownership and then allows changing salePrice', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    try {
      const tx = await nonAdmin.setBeneficiary(signers[1].address);
      await tx.wait();
      expect(true).to.equal(false);
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'AccessControl: account 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000\'');
    }

    expect(await nonAdmin.beneficiaryAddress()).to.equal(signers[1].address);

    const transferTx = await ERC721Whitelisted.transferOwnership(signers[1].address);
    await transferTx.wait();

    const setBeneficiaryTx = await nonAdmin.setBeneficiary(signers[3].address);
    await setBeneficiaryTx.wait();

    expect(await nonAdmin.beneficiaryAddress()).to.equal(signers[3].address);
  });

  it('Throws when given an invalid mint voucher', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    // Malformed signature
    try {
      const mintMalformedStructTx = await nonAdmin.mint({
        tokenUri: 'https://mockToken.com',
        balance: 1,
        minter: signers[1].address,
        signature: utils.toUtf8Bytes('0xmockSigntatureData'),
      });

      await mintMalformedStructTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'ECDSA: invalid signature length\'');
    }

    // Signed by non-admin
    try {
      const signature = await nftWhitelisted({
        chainId: 31337,
        contractName: 'MockNFT',
        contractAddress: nonAdmin.address,
        wallet: signers[1],
        tokenUri: 'https://mockToken.com',
        balance: 1,
        minter: signers[1].address,
      });
      const invalidSigTx = await nonAdmin.mint(signature);
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'Signature invalid or unauthorized\'');
    }

    // Valid signature but max balance reached
    try {
      const signature = await nftWhitelisted({
        chainId: 31337,
        contractName: 'MockNFT',
        contractAddress: nonAdmin.address,
        wallet: signers[0],
        tokenUri: 'https://mockToken.com',
        balance: 0,
        minter: signers[1].address,
      });
      const invalidSigTx = await nonAdmin.mint(signature);
      await invalidSigTx.wait();
    } catch (error) {
      expect(error.message).to.equal('VM Exception while processing transaction: reverted with reason string \'You are not authorized to mint any more tokens\'');
    }
  });

  it('Correctly allows minting by a non-minter role with a valid mint voucher', async () => {
    const signers = await ethers.getSigners();

    const nonAdmin = ERC721Whitelisted.connect(signers[1]);

    const signature = await nftWhitelisted({
      chainId: 31337,
      contractName: 'MockNFT',
      contractAddress: nonAdmin.address,
      wallet: signers[0],
      tokenUri: 'https://mockToken.com',
      balance: 1,
      minter: signers[1].address,
    });
    const invalidSigTx = await nonAdmin.mint(signature);
    await invalidSigTx.wait();

    expect(await ERC721Whitelisted.totalSupply()).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.balanceOf(signers[1].address)).to.deep.equal(BigNumber.from(1));
    expect(await ERC721Whitelisted.ownerOf(0)).to.equal(signers[1].address);
    expect(await ERC721Whitelisted.tokenURI(0)).to.equal('https://mockToken.com');
  });
});
