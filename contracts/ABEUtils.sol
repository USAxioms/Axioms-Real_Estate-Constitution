// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.19;

// ABEUtils — deterministic math + WAD helpers
// Contamination‑free, constitutional, bounded.

library ABEUtils {
    uint256 internal constant ONE = 1e18;

    function clamp(uint256 x) internal pure returns (uint256) {
        if (x > ONE) return ONE;
        return x;
    }

    function avg(uint256 a, uint256 b) internal pure returns (uint256) {
        return (a + b) / 2;
    }

    function weighted(
        uint256[] memory scores,
        uint256[] memory weights
    ) internal pure returns (uint256) {
        uint256 sum = 0;
        uint256 wsum = 0;

        for (uint256 i = 0; i < scores.length; i++) {
            uint256 s = scores[i] > ONE ? ONE : scores[i];
            sum += s * weights[i];
            wsum += weights[i];
        }

        if (wsum == 0) return 0;
        return sum / wsum;
    }

    function applyHV(uint256 composite, uint8 hvCount)
        internal
        pure
        returns (uint256)
    {
        if (hvCount >= 2) {
            if (composite > 2e17) composite = 2e17;
        } else if (hvCount == 1) {
            if (composite > 4e17) composite = 4e17;
        }
        return composite;
    }

    function verdict(uint256 composite) internal pure returns (uint8) {
        if (composite >= 85e16) return 3;
        if (composite >= 60e16) return 2;
        if (composite >= 35e16) return 1;
        return 0;
    }
}
