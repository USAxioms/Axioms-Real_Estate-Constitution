// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.19;

// ABECourt — constitutional review + deterministic appeals
// WAD‑bounded, contamination‑free.

interface ABECore {
    function txScore(uint256 txId) external view returns (uint256);
    function txVerdict(uint256 txId) external view returns (uint8);
}

contract ABECourt {
    address public chiefJustice;
    mapping(address => bool) public justices;

    event JusticeAdded(address indexed j);
    event JusticeRemoved(address indexed j);
    event AppealFiled(uint256 indexed txId, address indexed appellant);
    event AppealDecision(uint256 indexed txId, uint8 oldVerdict, uint8 newVerdict);

    modifier onlyCourt() {
        require(msg.sender == chiefJustice || justices[msg.sender], "not court");
        _;
    }

    constructor() {
        chiefJustice = msg.sender;
    }

    function addJustice(address j) external onlyCourt {
        justices[j] = true;
        emit JusticeAdded(j);
    }

    function removeJustice(address j) external onlyCourt {
        justices[j] = false;
        emit JusticeRemoved(j);
    }

    function appeal(
        address core,
        uint256 txId,
        uint8 requestedVerdict
    ) external onlyCourt returns (uint8 newVerdict) {
        emit AppealFiled(txId, msg.sender);

        uint8 oldVerdict = ABECore(core).txVerdict(txId);

        if (requestedVerdict > oldVerdict) {
            newVerdict = requestedVerdict;
        } else {
            newVerdict = oldVerdict;
        }

        emit AppealDecision(txId, oldVerdict, newVerdict);
    }
}
