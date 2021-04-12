const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed();
    assert.equal(await instance.name(), "StellaSaccus");
    assert.equal(await instance.symbol(), "STS");
});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    let starId1 = 11;
    let star1Owner = accounts[1];
    let starId2 = 12;
    let star2Owner = accounts[2];
    await instance.createStar('Star11', starId1, {from: star1Owner});
    await instance.createStar('Star12', starId2, {from: star2Owner});

    // First, test that star1Owner can trigger the exchange
    await instance.exchangeStars(starId1, starId2, {from: star1Owner});
    assert.equal( await instance.ownerOf(starId1), star2Owner);
    assert.equal( await instance.ownerOf(starId2), star1Owner); 

    // Second, test that star2Owner can trigger the exchange, now 
    // that owners have been swapped (confirming this can be done by 
    // multiple owners)
    await instance.exchangeStars(starId1, starId2, {from: star2Owner});
    assert.equal( await instance.ownerOf(starId1), star1Owner);
    assert.equal( await instance.ownerOf(starId2), star2Owner); 

    // Thirdly, test that star2Owner can trigger the exchange, being the owner
    // of the second star in the exchangeStars call 
    // This is to confirm that the exchange can happen, so long as the owner
    // owns one of the stars
    await instance.exchangeStars(starId1, starId2, {from: star2Owner});
    assert.equal( await instance.ownerOf(starId1), star2Owner);
    assert.equal( await instance.ownerOf(starId2), star1Owner); 

    // Lastly, test that star1Owner can exchange a star with him/her self
    // which is odd, but no reason to block it
    let starId3 = 13;
    await instance.createStar('Star13', starId3, {from: star1Owner});
    await instance.exchangeStars(starId2, starId3, {from: star1Owner});
    assert.equal( await instance.ownerOf(starId2), star1Owner);
    assert.equal( await instance.ownerOf(starId3), star1Owner); 
});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    let starId = 50;
    let originalOwner = accounts[1];
    let newOwner = accounts[2];
    await instance.createStar('Star50', starId, {from: originalOwner});
    await instance.transferStar(newOwner, starId, {from: originalOwner});
    assert.equal(await instance.ownerOf(starId),newOwner );
});

it('does not let non owners exchange stars', async() => {
    let instance = await StarNotary.deployed();
    let starOwner = accounts[1];
    let starId1 = 55;
    let starId2 = 56;
    await instance.createStar('Star55', starId1, {from: starOwner});
    await instance.createStar('Star56', starId2, {from: starOwner});

    // First, test that star1Owner can trigger the exchange
    try
    {
        await instance.exchangeStars(starId1, starId2, {from: accounts[2]});
        assert.false("An exception should be thrown when attempting to call exchangeStars as a non-owner");
    }
    catch(e)
    {
    }
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let instance = await StarNotary.deployed();
    let starId = 100;
    let owner = accounts[1];
    await instance.createStar('Star100', starId, {from: owner});
    assert.equal(await instance.lookUptokenIdToStarInfo(starId), "Star100" );
});

it('lookUptokenIdToStarInfo throws an exception for unknown starIds', async() => {
    let instance = await StarNotary.deployed();
    let owner = accounts[1];
    try
    {
        await instance.lookUptokenIdToStarInfo(928423);
        assert.false("An exception should be thrown for unknown starId values");
    }
    catch (e)
    {
    }
});
