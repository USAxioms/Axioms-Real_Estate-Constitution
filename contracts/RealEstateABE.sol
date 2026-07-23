// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.19;

// Parent Orchestrator — RealEstateABE
// Deterministic, WAD‑bounded, constitutional engine.

interface Child {
    function lawIndex() external pure returns (uint8);
    function lawHash() external pure returns (bytes32);
    function evaluate(uint256[12] calldata p)
        external
        pure
        returns (uint256 score, bool valid, bool hv, string memory msg);
}

contract RealEstateABE {
    uint256 internal constant ONE = 1e18;

    event TransactionFiled(address indexed user, uint256 indexed txId);
    event REDecision(uint256 indexed txId, uint256 score, uint8 verdict);
    event ChildRegistered(uint8 indexed idx, address child, bool verified);

    struct ChildInfo {
        address child;
        bool verified;
    }

    mapping(uint8 => ChildInfo) public children;
    uint8 public childCount;

    uint256 public txCounter;
    mapping(address => uint256[]) public userTx;
    mapping(uint256 => uint256) public txScore;
    mapping(uint256 => uint8) public txVerdict;

    uint256 public hardViolationCount;

    function registerChild(address child) external {
        uint8 idx = Child(child).lawIndex();
        children[idx] = ChildInfo(child, true);
        childCount++;

        emit ChildRegistered(idx, child, true);
    }

    function fileAndEvaluate(
        uint256[12][] calldata params
    ) external returns (uint256 txId, uint256 score, uint8 verdict) {
        txCounter++;
        txId = txCounter;

        uint256[] memory scores = new uint256[](childCount);
        uint8 hvCount = 0;

        for (uint8 i = 1; i <= childCount; i++) {
            ChildInfo memory info = children[i];
            require(info.verified, "child not verified");

            (uint256 s, bool valid, bool hv, ) = Child(info.child).evaluate(params[i - 1]);
            require(valid, "child invalid");

            if (hv) hvCount++;
            scores[i - 1] = s;
        }

        uint256 composite = 0;
        for (uint8 i = 0; i < childCount; i++) {
            composite += scores[i];
        }
        composite /= childCount;

        if (hvCount >= 2) {
            composite = composite > 2e17 ? 2e17 : composite;
        } else if (hvCount == 1) {
            composite = composite > 4e17 ? 4e17 : composite;
        }

        uint8 v = 0;
        if (composite >= 85e16) v = 3;
        else if (composite >= 60e16) v = 2;
        else if (composite >= 35e16) v = 1;

        txScore[txId] = composite;
        txVerdict[txId] = v;
        userTx[msg.sender].push(txId);

        if (hvCount > 0) hardViolationCount++;

        emit TransactionFiled(msg.sender, txId);
        emit REDecision(txId, composite, v);

        return (txId, composite, v);
    }

    function userTransactions(address u) external view returns (uint256[] memory) {
        return userTx[u];
    }

    function totalTransactions() external view returns (uint256) {
        return txCounter;
    }
}
