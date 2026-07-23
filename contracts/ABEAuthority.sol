// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.19;

// ABE Authority — constitutional control + deterministic governance
// WAD‑bounded, contamination‑free.

contract ABEAuthority {
    address public owner;
    mapping(address => bool) public delegates;

    event DelegateAdded(address indexed delegate);
    event DelegateRemoved(address indexed delegate);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyAuthority() {
        require(msg.sender == owner || delegates[msg.sender], "not authority");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function addDelegate(address d) external onlyOwner {
        delegates[d] = true;
        emit DelegateAdded(d);
    }

    function removeDelegate(address d) external onlyOwner {
        delegates[d] = false;
        emit DelegateRemoved(d);
    }

    function isAuthority(address a) external view returns (bool) {
        return a == owner || delegates[a];
    }
}
