// call redeem() on SimpleStaking contract
import { contract } from './contractConnect'
import {NotificationManager} from "react-notifications";

export async function redeem(){
    console.log("contract:", contract)
    // console.log("contractWithSigner:" ,contractWithSigner)
    // let dai = amount * 10 ** 18
    // dai = dai.toString()
    // console.log("dai:", dai)
    let tx = await contract.redeem({gasLimit: 1000000})
    // tx = 
    console.log("tx:",tx.toString())
    // const sendPromise = wallet.sendTransaction(tx)
    // sendPromise.then((tx) => {
    //     console.log("sendPromise.then:", tx);
    // });

    try {
        await tx.wait();
    } catch (e) {
        NotificationManager.warning(
            "There was a problem with your transaction",
            "Error"
        );
        return false;
    }

    NotificationManager.success(
        "Your Dai has been redeemed from rDAI and is no longer generating interest",
        "Success"
    );

    // TODO: Gracefully refresh the state
    setTimeout(function () {
        window.location.reload();
    }, 2000);


    return true;
}