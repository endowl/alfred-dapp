import contract from './contractConnect'

let address = window.ethereum.selectedAddress;

export async function getStakedAmount(){
    const tx = await contract.balances(address)
    console.log("tx:",tx.toString())

    return (Number(tx.toString())/10**16).toFixed(4);
    // return "testing";
}
