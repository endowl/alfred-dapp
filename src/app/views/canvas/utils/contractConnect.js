import { ethers, Contract } from 'ethers'
import abi from '../abi/simpleStakingABI'
import contractAddress from '../abi/address'

let provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
// let provider = getDefaultProvider()
console.log("provider", provider);

const contract = new Contract(contractAddress, abi, provider)
console.log("contract", contract);


export default contract;
