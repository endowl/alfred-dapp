import { ethers, Contract, Wallet } from 'ethers'
import abi from '../abi/simpleStakingABI'
import contractAddress from '../abi/address'

let provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
// let provider = getDefaultProvider()
console.log("provider", provider);

// export let wallet = new Wallet(provider)

export const signer = provider.getSigner();

export const contract = new Contract(contractAddress, abi, signer)
console.log("contract", contract);

// export const contractWithSigner = contract.connect(provider)

