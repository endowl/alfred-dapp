// call stake(amountOfDai) on SimpleStaking contract
import { contract } from './contractConnect'
import {NotificationManager} from "react-notifications";
import {Contract, ethers} from "ethers";
import contractAddress from "../abi/address";
import abi from "../abi/simpleStakingABI";
import erc20abi from "../abi/erc20abi";

export async function stake(amount){

    console.log("contract:", contract)
    // console.log("contractWithSigner:" ,contractWithSigner)
    let dai = amount * 10 ** 18
    dai = dai.toString()
    console.log("dai:", dai)


    // Approve contract to spend Dai on users behalf if necessary:
    const DAI_ADDRESS = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa";
    let provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
    console.log("provider", provider);
    const signer = provider.getSigner();
    // const contract = new Contract(contractAddress, abi, signer);
    // console.log("contract", contract);
    // console.log("signer", await signer.getAddress());
    const account = await signer.getAddress();
    const daiContract = new Contract(DAI_ADDRESS, erc20abi, signer);
    let allowance = await daiContract.allowance(account, contractAddress);
    if(allowance.lt(ethers.utils.bigNumberify(dai))) {
        // Allowance is too low, request approval
        let approveTx = await daiContract.approve(contractAddress, ethers.constants.MaxUint256);
        await approveTx.wait();
    }


    let tx = await contract.stake(dai, {gasLimit: 1000000});

    console.log("tx:",tx.toString())
    try {
        await tx.wait();
        NotificationManager.success(
            "Your approval transaction was successful. You will be prompted to complete one more transaction to finish the deposit",
            "Success"
        );
    } catch (e) {
        NotificationManager.warning(
            "There was a problem with your transaction",
            "Error"
        );
        return false;
    }
    // const sendPromise = wallet.sendTransaction(tx)
    // sendPromise.then((tx) => {
    //     console.log("sendPromise.then:", tx);
    // });

    NotificationManager.success(
        "Your Dai has been staked with rDAI and is now generating donations from the interest",
        "Success"
    );

    // TODO: Gracefully refresh the state
    setTimeout(function () {
        window.location.reload();
    }, 2000);

    return true;
}