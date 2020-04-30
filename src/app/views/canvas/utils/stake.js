// call stake(amountOfDai) on SimpleStaking contract
import { contract } from './contractConnect'
import {NotificationManager} from "react-notifications";

export async function stake(amount){
    console.log("contract:", contract)
    // console.log("contractWithSigner:" ,contractWithSigner)
    let dai = amount * 10 ** 18
    dai = dai.toString()
    console.log("dai:", dai)
    let tx = await contract.stake(dai)
    // tx = 
    console.log("tx:",tx.toString())
    // const sendPromise = wallet.sendTransaction(tx)
    // sendPromise.then((tx) => {
    //     console.log("sendPromise.then:", tx);
    // });

    NotificationManager.success(
        "Your Dai has been staked with rDAI and is now generating donations from the interest",
        "Success"
    );

    return true;
}