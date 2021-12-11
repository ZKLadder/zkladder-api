// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract ERC721_Enumerable is ERC721, ERC721Enumerable {
    string private baseUri;

    constructor(string memory name, string memory symbol, string memory _baseUri) ERC721(name, symbol) {
        baseUri=_baseUri;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _baseURI()
        internal
        view
        override(ERC721)
        returns (string memory)
    {
        return baseUri;  
    }

    function mint() public {
        uint256 tokenId = totalSupply();
        _safeMint(msg.sender, tokenId);
    }
}