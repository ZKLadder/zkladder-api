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
    // Resolves to JSON blob of collection level metadata
    string public collectionDataUri;

    // Recieves proceeds from new mints
    address payable public beneficiaryAddress;

    // Can NFT's be transferred
    bool public isTransferrable = true;

    // Royalty in basis points ie. 500 = 5%
    uint256 public royaltyBasis;

    using Counters for Counters.Counter;
    Counters.Counter private _totalSupply;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct mintVoucher {
        // Minter's allowed balance after mint has occured.
        // Ie. if the voucher is valid for a single token, balance = balanceOf(minter)+1
        uint256 balance;
        uint256 salePrice; //In WEI
        address minter;
        bytes signature;
    }

    constructor(
        string memory name,
        string memory symbol,
        string memory _collectionDataUri,
        address payable beneficiary
    ) ERC721(name, symbol) EIP712(name, "1") {
        collectionDataUri = _collectionDataUri;
        beneficiaryAddress = beneficiary;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    // Getters
    function totalSupply() public view returns (uint256) {
        return _totalSupply.current();
    }

    /**
     * EIP-2981 compliant royalty info
     */
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        external
        view
        returns (address receiver, uint256 royaltyAmount)
    {
        return (
            beneficiaryAddress,
            uint256((_salePrice * royaltyBasis) / 10000)
        );
    }

    /**
     * Override transferFrom to enforce isTransferrable check
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override {
        require(
            (isTransferrable ||
                hasRole(DEFAULT_ADMIN_ROLE, from) ||
                hasRole(DEFAULT_ADMIN_ROLE, to)),
            "This NFT is non transferrable"
        );
        super.transferFrom(from, to, tokenId);
    }

    /**
     * Override safeTransferFrom to enforce isTransferrable check
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        require(
            (isTransferrable ||
                hasRole(DEFAULT_ADMIN_ROLE, from) ||
                hasRole(DEFAULT_ADMIN_ROLE, to)),
            "This NFT is non transferrable"
        );
        super.safeTransferFrom(from, to, tokenId, _data);
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
            msg.value >= voucher.salePrice,
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
      @notice Enables any account assigned as DEFAULT_ADMIN_ROLE to set the NFT collection's metadata uri
      @param newCollectionDataUri New collectionDataUri string
     */
    function setCollectionDataUri(string memory newCollectionDataUri)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        collectionDataUri = newCollectionDataUri;
    }

    /**
      @notice Enables any account assigned as DEFAULT_ADMIN_ROLE to set the beneficiaryAddress which recieves proceeds from any new token mint
      @param newBeneficiary The account which will now recieve all proceeds from new token mints
     */
    function setBeneficiary(address payable newBeneficiary)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        beneficiaryAddress = newBeneficiary;
    }

    /**
      @notice Enables any account assigned as DEFAULT_ADMIN_ROLE to set the transferrability of the collection's NFT's
      @param _isTransferrable boolean indiciating if NFT's can be transffered
     */
    function setIsTransferrable(bool _isTransferrable)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        isTransferrable = _isTransferrable;
    }

    /**
      @notice Enables any account assigned as DEFAULT_ADMIN_ROLE to set the royalty on NFT sales
      @param _royaltyBasis new royalty in basis points - ie. 250 = 2.5%
     */
    function setRoyalty(uint256 _royaltyBasis)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        royaltyBasis = _royaltyBasis;
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
                            "mintVoucher(uint256 balance,uint256 salePrice,address minter)"
                        ),
                        voucher.balance,
                        voucher.salePrice,
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
