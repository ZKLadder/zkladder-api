// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

/**
  @title Whitelisted ERC721
  @notice NFT contract enabling administrative token minting with a MINTER_ROLE or public token minting with a signed mint voucher
  @author ZKLadder DAO
 */
contract ERC721_Whitelisted is
    ERC721,
    ERC721URIStorage,
    AccessControlEnumerable,
    EIP712
{
    string public baseUri;

    // Recieves proceeds from new mints
    address payable public beneficiaryAddress;

    // Current mint price in WEI
    uint256 public salePrice;

    using Counters for Counters.Counter;
    Counters.Counter private _totalSupply;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct mintVoucher {
        // Minter's allowed balance after mint has occured.
        // Ie. if the voucher is valid for a single token, balance = balanceOf(minter)+1
        uint256 balance;
        address minter;
        bytes signature;
    }

    constructor(
        string memory name,
        string memory symbol,
        string memory _baseUri,
        address payable beneficiary
    ) ERC721(name, symbol) EIP712(name, "1") {
        baseUri = _baseUri;
        beneficiaryAddress = beneficiary;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    // Getters
    function totalSupply() public view returns (uint256) {
        return _totalSupply.current();
    }

    /**
      @notice Public function enabling any account to request to mint with a mintVoucher. Minting is only permitted if the voucher is signed by an account assigned to a MINTER_ROLE
      @param voucher A signed mint voucher
     */
    function mint(mintVoucher calldata voucher, string memory tokenUri)
        public
        payable
    {
        require(
            msg.value >= salePrice,
            "Insufficient ETH sent with transaction"
        );

        address signer = _verify(voucher);
        require(
            hasRole(MINTER_ROLE, signer),
            "Signature invalid or unauthorized"
        );

        uint256 balance = balanceOf(voucher.minter);
        require(
            voucher.balance > balance,
            "You are not authorized to mint any more tokens"
        );

        uint256 tokenId = totalSupply();
        _safeMint(voucher.minter, tokenId);
        _setTokenURI(tokenId, tokenUri);
        _totalSupply.increment();

        (bool success, bytes memory returnData) = beneficiaryAddress.call{
            value: msg.value
        }("");

        require(success, "Failed to transfer funds to beneficiary");
    }

    /**
      @notice Allows any account assigned to a MINTER_ROLE to mint a new token
      @param to Address of new token owner
      @param tokenUri IPFS hash or URI of token metadata
     */
    function mintTo(address to, string memory tokenUri)
        public
        payable
        onlyRole(MINTER_ROLE)
    {
        uint256 tokenId = totalSupply();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);
        _totalSupply.increment();
    }

    /**
      @notice Enables any account assigned as DEFAULT_ADMIN_ROLE to set the NFT sale price
      @param newPrice The price now required to mint new tokens in WEI
     */
    function setSalePrice(uint256 newPrice)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        salePrice = newPrice;
    }

    /**
      @notice Enables any account assigned as DEFAULT_ADMIN_ROLE to set the beneficiaryAddress which recieves proceeds from any new token mint
      @param newBeneficiary The acccount which will now recieve all proceeds from new token mints
     */
    function setBeneficiary(address payable newBeneficiary)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        beneficiaryAddress = newBeneficiary;
    }

    /**
      @notice Enables the account assigned as DEFAULT_ADMIN_ROLE to relinquish the role to a new account
      @param newOwner The new account assigned as DEFAULT_ADMIN_ROLE
     */
    function transferOwnership(address newOwner)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _setupRole(DEFAULT_ADMIN_ROLE, newOwner);
    }

    // Internal functions
    function _hash(mintVoucher calldata voucher)
        internal
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "mintVoucher(uint256 balance,address minter)"
                        ),
                        voucher.balance,
                        voucher.minter
                    )
                )
            );
    }

    function _verify(mintVoucher calldata voucher)
        internal
        view
        returns (address)
    {
        bytes32 digest = _hash(voucher);
        return ECDSA.recover(digest, voucher.signature);
    }

    // Required Overrides
    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControlEnumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
