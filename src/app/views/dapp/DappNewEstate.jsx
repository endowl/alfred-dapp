import React, {Component, useState, Fragment} from "react";
import { Breadcrumb, SimpleCard, CodeViewer } from "@gull";
import { useWallet } from "use-wallet";
import EthereumDapp from "./EthereumDapp";
import {Alert} from "react-bootstrap";
import { ethers } from 'ethers';
import bringOutYourDeadFactoryAbi from "../../../abi/bringOutYourDeadFactoryAbi";

function LinkEtherscanTx(props) {
    let txHashUrl = "https://etherscan.io/tx/" + props.txHash;
    if (props.chainId === "3") {
        txHashUrl = "https://ropsten.etherscan.io/tx/" + props.txHash;
    }
    // TODO Add other networks
    return (
        <a href={txHashUrl} target="_blank" title={props.txHash}><Fragment>{props.children}</Fragment></a>
    )
}

function LinkEtherscanAddress(props) {
    let url = "https://etherscan.io/address/" + props.address;
    if (props.chainId === "3") {
        url = "https://ropsten.etherscan.io/address/" + props.address;
    }
    // TODO Add other networks
    return (
        <a href={url} target="_blank" title={props.address}><Fragment>{props.children}</Fragment></a>
    )
}


function NewEstateForm() {
    const wallet = useWallet();
    const [status, setStatus] = useState();
    const [txHash, setTxHash] = useState('');
    const [estateAddress, setEstateAddress] = useState('');
    const [oracle, setOracle] = useState('');
    const [executor, setExecutor] = useState('');

    // TODO: Move this to a config file
    // const boydFactoryAddress = "0xDEAD78Ed0A13909CB8F6919E32308515373e6d2d";
    const boydFactoryAddress = "0x0bBc6D455611718aFA0Db939d1C41ABe283ECc8F";

    const statuses = {
        PROMPTING: 'prompting',
        PROCESSING: 'processing',
        SUCCESS: 'success',
        ERROR: 'error'
    };

    async function handleSubmit(event) {
        event.preventDefault();
        console.log(wallet);

        const oracleParam = oracle !== '' ? oracle : ethers.constants.AddressZero;
        const executorParam = oracle !== '' ? oracle : ethers.constants.AddressZero;

        let provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);
        let boydFactory = new ethers.Contract(boydFactoryAddress, bringOutYourDeadFactoryAbi, signer);

        // TODO: Sanity check oracle and executor addresses

        setStatus(statuses.PROMPTING);

        let tx;
        try {
            // Prompt user's wallet to send transaction to factory contract
            tx = await boydFactory.newEstate(oracleParam, executorParam);
        } catch(e) {
            console.log(e);
            setStatus(statuses.ERROR);
            return;
        }

        // User approved the transaction
        console.log(tx);
        setTxHash(tx.hash);
        setStatus(statuses.PROCESSING);

        // Wait for transaction to complete
        let receipt = await tx.wait(1);

        // Get new estate contract address from transaction events
        let address = receipt.events[1].args['estate'].substr(-40);
        address = ethers.utils.getAddress(address);
        console.log(address);
        setEstateAddress(address);

        // console.log(receipt.events);
        // console.log(receipt);

        // Transaction is complete
        setStatus(statuses.SUCCESS);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-md-6 form-group mb-3">
                    <label htmlFor="oracleAddress">Oracle Address - leave blank if unknown</label>
                    <input
                        type="text"
                        className="form-control"
                        name="oracle"
                        placeholder="0x.... Oracle contract's Ethereum address"
                        value={oracle}
                        onChange={(event) => setOracle(event.target.value)}
                    />
                </div>
                <div className="col-md-6 form-group mb-3">
                    <label htmlFor="executorAddress">Executor Address - leave blank if unknown</label>
                    <input
                        type="text"
                        className="form-control"
                        name="executor"
                        placeholder="0x.... Executor's Ethereum address"
                        value={executor}
                        onChange={(event) => setExecutor(event.target.value)}
                    />
                </div>

                <div className="col-md-12 mb-3">
                    <button className="btn btn-primary" type="submit" disabled={status}>Submit</button>
                </div>
            </div>
            <Alert variant="primary" show={status === statuses.PROMPTING}>
                <Alert.Heading>
                    Approve Transaction
                </Alert.Heading>
                <p>
                    To finish you must be approve the transaction through your wallet.
                </p>
            </Alert>
            <Alert variant="secondary" show={status === statuses.PROCESSING}>
                <Alert.Heading>
                    Transaction submitted
                </Alert.Heading>
                <p>
                    Your transaction has been sent and is pending inclusion in the blockchain. You may <LinkEtherscanTx txHash={txHash} chainId="3">follow the transaction on Etherscan.</LinkEtherscanTx>
                </p>
            </Alert>
            <Alert variant="success" show={status === statuses.SUCCESS}>
                <Alert.Heading>
                    Your digital estate has been established on the blockchain!
                </Alert.Heading>
                <p>
                    The smart contract's address is <strong><LinkEtherscanAddress address={estateAddress} chainId="3">{estateAddress}</LinkEtherscanAddress></strong>
                </p>
            </Alert>
            <Alert variant="danger" show={status === statuses.ERROR}>
                <Alert.Heading>
                    There was a problem creating the smart contract.
                </Alert.Heading>
                <p>
                    You may be able to find out more information by <LinkEtherscanTx txHash={txHash} chainId="3">investigating the transaction on Etherscan.</LinkEtherscanTx>
                </p>
            </Alert>

        </form>
    );

}


class DappNewEstate extends Component {

    render() {
        return (
            <EthereumDapp>
                <div>
                    <Breadcrumb
                        routeSegments={[
                            {name: "Home", path: "/"},
                            {name: "dApp", path: "/dapp"},
                            {name: "New Estate"}
                        ]}
                    ></Breadcrumb>
                    <SimpleCard title="Create New Estate" className="mb-4">
                        <p>
                            Submit this form to create a new estate on the Ethereum blockchain, for managing your digital assets while planning ahead.
                        </p>
                        <NewEstateForm/>
                    </SimpleCard>
                </div>
            </EthereumDapp>
        );
    }
}

export default DappNewEstate;
