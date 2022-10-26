// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CrowdFund is Ownable, Pausable, ReentrancyGuard {
    using SafeMath for uint256;
    IERC20 public usd;
    mapping (address => uint256) public depositedUSDT;
    mapping (address => bool) public isBlackList;


    event Deposit(uint256 amount, address receiver);
    event Withdraw(uint256 amount, address receiver);
    event UpdateUSD(address usdNewAddress);
    event AddBlackList(address user);
    event RemoveBlackList(address user);


    constructor(IERC20 _usd) {
        usd = _usd;
    }

    modifier whenNotBlackList() {
        require(!isBlackList[msg.sender], 'You are in blacklists');
        _;
    }

    modifier whenBlackList() {
        require(isBlackList[msg.sender], 'You are in blacklists');
        _;
    }

    function deposit(uint256 _amount, address _receiver) external nonReentrant whenNotBlackList whenNotPaused returns(bool) {
        usd.transferFrom(msg.sender, address(this), _amount);
        depositedUSDT[_receiver] = depositedUSDT[_receiver].add(_amount);
        
        emit Deposit(_amount, _receiver);
        return true;
    }

    function withdraw() external nonReentrant whenNotPaused whenNotBlackList returns(bool) {
        require(depositedUSDT[msg.sender] > 0);
        uint256 amount = depositedUSDT[msg.sender];
        depositedUSDT[msg.sender] = 0;
        usd.transfer(msg.sender, amount);
        
        emit Withdraw(amount, msg.sender);
        return true;
    }

    function updateUSD(address _usd) public whenPaused onlyOwner {
        usd = IERC20(_usd);
        emit UpdateUSD(_usd);
    }

    function addBlackList(address user) public whenNotBlackList onlyOwner {
        isBlackList[user] = true;
        emit AddBlackList(user);
    }

    function removeBlackList(address user) public whenBlackList onlyOwner {
        isBlackList[user] = false;
        emit RemoveBlackList(user);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

}