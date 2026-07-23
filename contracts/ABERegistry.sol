// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.19;

// ABE Registry — deterministic child module registry
// WAD‑bounded, constitutional, contamination‑free.

interface Child {
    function lawIndex() external pure returns (uint8);
    function lawHash() external pure returns (bytes32);
}

contract ABERegistry {
    event ChildRegistered(uint8 indexed idx, address child, bytes32 lawHash);
    event ChildRemoved(uint8 indexed idx, address child);

    struct ChildInfo {
        address child;
        bytes32 lawHash;
        bool active;
    }

    mapping(uint8 => ChildInfo) public children;
    uint8 public childCount;

    function registerChild(address child) external {
        uint8 idx = Child(child).lawIndex();
        bytes32 h = Child(child).lawHash();

        children[idx] = ChildInfo({
            child: child,
            lawHash: h,
            active: true
        });

        childCount++;

        emit ChildRegistered(idx, child, h);
    }

    function removeChild(uint8 idx) external {
        ChildInfo memory info = children[idx];
        require(info.active, "not active");

        children[idx].active = false;

        emit ChildRemoved(idx, info.child);
    }

    function getChild(uint8 idx) external view returns (address child, bytes32 lawHash, bool active) {
        ChildInfo memory info = children[idx];
        return (info.child, info.lawHash, info.active);
    }

    function totalChildren() external view returns (uint8) {
        return childCount;
    }
}
