import { ethers, Contract, Wallet, getDefaultProvider } from 'ethers'
import assert from 'assert'
import abi from '../abi/simpleStakingABI'
import contractAddress from '../abi/address'

let address = "0xe8bF424E047372d249d0826c5567655ba3B72f18"; //test address

let provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
// let provider = getDefaultProvider()
console.log("provider", provider);

// @DEV: contract error: t.forEach is not a function

const contract = new Contract(contractAddress, abi, provider)
console.log("contract", contract);


export async function getStakedAmount(){
    const tx = await contract.balances(address)
    console.log("tx:",tx.toString())

    return (Number(tx.toString())/10**16).toFixed(4);
    // return "testing";
}
