// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.10;

interface ISDAI {
    function deposit(uint256 assets, address receiver) external returns (uint256 shares) ;
}
