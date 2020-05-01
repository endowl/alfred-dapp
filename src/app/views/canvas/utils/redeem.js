// call redeem() on SimpleStaking contract
import { contract } from './contractConnect'

export async function redeem(){
    console.log("contract:", contract)
    // console.log("contractWithSigner:" ,contractWithSigner)
    // let dai = amount * 10 ** 18
    // dai = dai.toString()
    // console.log("dai:", dai)
    let tx = await contract.redeem()
    // tx = 
    console.log("tx:",tx.toString())
    // const sendPromise = wallet.sendTransaction(tx)
    // sendPromise.then((tx) => {
    //     console.log("sendPromise.then:", tx);
    // });

    return true;
}