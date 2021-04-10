// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Task 1 - Add a name and symbol properties
    // The ECI721 base contract already has a name and symbol
    // To complete task 1, I've exposed these as params through my own constructor 
    constructor (string memory name_, string memory symbol_) 
    ERC721( name_, symbol_ ) {
    }

    // Star data
    struct Star {
        string name;
    } 

    function getStarInfo(Star memory star) private pure returns (string memory)
    {
        return star.name;
    }   

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string memory _name, uint256 _tokenId) public { 
        // Require all valid stars to have a name
        require(bytes(_name).length > 0, "The star must have a name");
        Star memory newStar = Star(_name);      
        tokenIdToStarInfo[_tokenId] = newStar; 
        _mint(msg.sender, _tokenId);
    }

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }

    function _make_payable(address x) internal pure returns (address payable) {
        return payable(x);
    }

    function buyStar(uint256 _tokenId) public  payable {
        // Confirm the star is actually for sale
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");

        // Confirm enough ETH has been supplied to purchase
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");

        // Execute the transfer of the token
        transferFrom(ownerAddress, msg.sender, _tokenId); 

        // Pay the original owner
        address payable ownerAddressPayable = _make_payable(ownerAddress); 
        ownerAddressPayable.transfer(starCost);

        // Return any change to the purchaser
        if(msg.value > starCost) {
            address payable payableSender = _make_payable(msg.sender);
            payableSender.transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        Star memory existingStar = tokenIdToStarInfo[_tokenId];
        
        // As a result of the requirement for a star to have a non-0 length name on creation, 
        // we can use the name length here to detect whether we've found a star in our map
        require(bytes(existingStar.name).length > 0, "Unknown star");

        return getStarInfo(existingStar);
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        address token1Owner = ownerOf(_tokenId1);
        address token2Owner = ownerOf(_tokenId2);
        require( (token1Owner == msg.sender || token2Owner == msg.sender), "The sender must own one of the stars");
        _transfer(token1Owner, token2Owner, _tokenId1);
        _transfer(token2Owner, token1Owner, _tokenId2);
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        require( ownerOf(_tokenId) == msg.sender, "The sender must own the star");
        transferFrom(msg.sender, _to1, _tokenId);
    }

}