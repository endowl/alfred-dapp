import { ethers, Contract, Wallet, getDefaultProvider } from 'ethers'
import assert from 'assert'
import abi from '../abi/simpleStakingABI'
import contractAddress from '../abi/address'

let address = "0x555dEAd8f09643eA77488566d665775891C8bcAb"; //test address

let provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
// let provider = getDefaultProvider()
console.log("provider", provider);

// @DEV: contract error: t.forEach is not a function
try {
    const contract = new Contract(contractAddress, abi, provider)
    console.log("contract", contract);
} catch(err) {
    console.log("error in Contract:", err)
}

export /* async */ function getStakedAmount(){
    // const tx = await contract.balances(address)

    // return tx;
    return "testing";
}
