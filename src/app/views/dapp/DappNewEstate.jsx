import React, {useState, useEffect} from "react";
import { Breadcrumb, SimpleCard} from "@gull";
import { useWallet } from "use-wallet";
import EthereumDapp from "./EthereumDapp";
import {Alert, Button} from "react-bootstrap";
import { ethers } from 'ethers';
import bringOutYourDeadFactoryAbi from "../../../abi/bringOutYourDeadFactoryAbi";
import bringOutYourDeadAbi from "../../../abi/bringOutYourDeadAbi";
import LinkEtherscanTx from './LinkEtherscanTx';
import { Link } from 'react-router-dom';
import localStorageService from "../../services/localStorageService";
const CPK = require('contract-proxy-kit');

// TODO: Move this to a config file and support multiple networks automatically
// const boydFactoryAddress = "0xDEAD78Ed0A13909CB8F6919E32308515373e6d2d";
// const boydFactoryAddress = "0x0bBc6D455611718aFA0Db939d1C41ABe283ECc8F";  // Ropsten
// const boydFactoryAddress = "0x5Ca258619d7Ea8A81c2f78C25B8AD85151F33CBD";  // Kovan v0.2
const boydFactoryAddress = "0xDEAD120FB5Aad12a3D3cAd140C66dad2A6739422";  // v0.3.1 Kovan

function NewEstateForm(props) {
    const wallet = useWallet();
    const [status, setStatus] = useState();
    const [txHash, setTxHash] = useState('');
    const [estateAddress, setEstateAddress] = useState('');
    const [oracle, setOracle] = useState('');
    const [executor, setExecutor] = useState('');

    const statuses = {
        PROMPTING: 'prompting',
        PROCESSING: 'processing',
        SUCCESS: 'success',
        ERROR: 'error'
    };

    async function handleSubmit(event) {
        event.preventDefault();
        console.log(wallet);

        // Use Gnosis Contract Proxy Kit (CPK) to create a Gnosis Safe
        // Use TX batching to make a single call to Gnosis Safe which:
        //       - Creates the Gnosis Safe (automatic on first TX)
        //       - Creates Alfred BOYD Estate contract
        //       - Set's wallet address as owner of Estate contract

        // TODO: Set estate as recovery option for Gnosis Safe

        const oracleParam = oracle !== '' ? oracle : ethers.constants.AddressZero;
        const executorParam = executor !== '' ? executor : ethers.constants.AddressZero;

        // TODO: Sanity check oracle and executor addresses
        console.log("Oracle", oracleParam);
        console.log("Executor", executorParam);

        let provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);

        // Bring Out Your Dead (Alfred Estate) Factory
        let boydFactory = new ethers.Contract(boydFactoryAddress, bringOutYourDeadFactoryAbi, signer);

        // Gnosis Contract Proxy Kit
        const cpk = await CPK.create( { ethers, signer: signer } );

        const expectedEstateAddress = await boydFactory.getEstateAddress(cpk.address, props.salt);
        console.log("Expected estate address: ", expectedEstateAddress);

        // Prepare calldata for multi-transaction call to Gnosis Safe by way of Contract Proxy Kit
        const boydFactoryInterface = new ethers.utils.Interface(bringOutYourDeadFactoryAbi);
        const boydInterface = new ethers.utils.Interface(bringOutYourDeadAbi);


        let newEstateData = boydFactoryInterface.functions.newEstate.encode([oracleParam, executorParam, props.salt]);
        // TODO: Add call to boydInterface.functions.setupGnosisSafe.encode(.....)
        let gnosisSetupData = boydInterface.functions.gnosisSafeSetup.encode([]);
        let transferOwnershipData = boydInterface.functions.transferOwnership.encode([wallet.account]);

        const txs = [
            {
                operation: CPK.CALL,
                to: boydFactoryAddress,
                value: 0,
                data: newEstateData
            },
            {
                operation: CPK.CALL,
                to: expectedEstateAddress,
                value: 0,
                data: gnosisSetupData
            },
            {
                operation: CPK.CALL,
                to: expectedEstateAddress,
                value: 0,
                data: transferOwnershipData
            }
        ];

        // Listen for estate creation event
        let filter = boydFactory.filters.estateCreated(null, cpk.address);
        boydFactory.on(filter, async (fromAddress, toAddress, value, event) => {
            console.log('Estate created!');
            let address = await boydFactory.getEstateAddress(cpk.address, props.salt);
            console.log('Estate address', address);
            // TODO: Sanity check address matches expected address
            setEstateAddress(address);
            localStorageService.setItem('estate', address);
            setStatus(statuses.SUCCESS);
        });

        setStatus(statuses.PROMPTING);

        // Send multi-TX through Gnosis Safe, causing Safe to be deployed if it hasn't yet
        try {
            let cpkHash = await cpk.execTransactions(txs, {gasLimit: 5000000});
            setTxHash(cpkHash.hash);
            console.log(cpkHash);
            setStatus(statuses.PROCESSING);
        } catch (e) {
            console.log(e);
            setStatus(statuses.ERROR);
        }

        
        // Direct factory interaction without Gnosis CPK:
        /*
        let tx;
        try {
            // Prompt user's wallet to send transaction to factory contract
            // tx = await boydFactory.newEstate(oracleParam, executorParam);
            tx = await boydFactory.newEstate(oracleParam, executorParam, salt, {gasLimit: 5000000});


        } catch(e) {
            console.log(e);
            setStatus(statuses.ERROR);
            return;
        }

        // User approved the transaction
        setTxHash(tx.hash);
        setStatus(statuses.PROCESSING);

        // Wait for transaction to complete
        let receipt;
        try {
            receipt = await tx.wait(1);

            // Get new estate contract address from transaction events
            let address = receipt.events[1].args['estate'].substr(-40);
            address = ethers.utils.getAddress(address);
            console.log(address);
            setEstateAddress(address);

            localStorageService.setItem('estate', address);

            // console.log(receipt.events);
            // console.log(receipt);

            // Transaction is complete
            setStatus(statuses.SUCCESS);

        } catch (e) {
            console.log("ERROR while waiting for transaction to complete");
            console.log(e);
            setStatus(statuses.ERROR);
            // return;
        }
        */

    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                {/*<div className="col-md-6 form-group mb-3">*/}
                {/*    <label htmlFor="oracleAddress">Oracle Address - leave blank if unknown</label>*/}
                {/*    <input*/}
                {/*        type="text"*/}
                {/*        className="form-control"*/}
                {/*        name="oracle"*/}
                {/*        placeholder="0x.... Oracle contract's Ethereum address"*/}
                {/*        value={oracle}*/}
                {/*        onChange={(event) => setOracle(event.target.value)}*/}
                {/*    />*/}
                {/*</div>*/}
                <div className="col-md-6 form-group mb-3">
                    <label htmlFor="executorAddress">Executor Address - may be left blank and configured later</label>
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
                    <input type="hidden" name="salt" value={props.salt} />
                    <button className="btn btn-primary" type="submit" disabled={status}>Create</button>
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
                    Your transaction has been sent and is pending inclusion in the blockchain. You may <LinkEtherscanTx txHash={txHash} chainId="42">follow the transaction on Etherscan.</LinkEtherscanTx>
                </p>
            </Alert>
            <Alert variant="success" show={status === statuses.SUCCESS}>
                <Alert.Heading>
                    Your digital estate has been established on the blockchain!
                </Alert.Heading>
                <p>
                    The smart contract's address is <strong>{estateAddress}</strong>
                </p>
                <p>
                    <Link to={'/dapp/estate/' + estateAddress} address={estateAddress}>
                        <Button variant="success" className="btn-raised btn-raised-success m-1 text-capitalize btn-lg">
                            Access Your New Estate
                        </Button>
                    </Link>
                </p>
            </Alert>
            <Alert variant="danger" show={status === statuses.ERROR}>
                <Alert.Heading>
                    There was a problem creating the smart contract.
                </Alert.Heading>
                {txHash ? (
                    <p>
                        You may be able to find out more information by <LinkEtherscanTx txHash={txHash} chainId="42">investigating the transaction on Etherscan.</LinkEtherscanTx>
                    </p>
                ) : (
                    <p>
                        Transaction does not appear to have been submitted to the blockchain.
                    </p>
                )}
            </Alert>

        </form>
    );

}


function DappNewEstate(props) {
    const [estates, setEstates] = useState([]);
    const [nextSalt, setNextSalt] = useState(0);
    const wallet = useWallet();
    useEffect(() => {
        async function fetchData() {
            console.log(wallet);
            if(wallet.connected) {
                let provider = new ethers.providers.Web3Provider(wallet.ethereum);
                const signer = provider.getSigner(0);

                // Bring Out Your Dead (Alfred Estate) Factory
                let boydFactory = new ethers.Contract(boydFactoryAddress, bringOutYourDeadFactoryAbi, signer);

                // Gnosis Contract Proxy Kit
                const cpk = await CPK.create({ethers, signer: signer});

                // Check for pre-existing estate deployments
                let salt = 0;
                let estatesDetected = [];
                while(true) {
                    console.log("Checking for estate with salt nonce: ", salt);
                    const expectedEstateAddress = await boydFactory.getEstateAddress(cpk.address, salt);
                    // Check if the estate exists!
                    let code = await provider.getCode(expectedEstateAddress);
                    if(code !== '0x') {
                        estatesDetected.push(expectedEstateAddress);
                        setEstates(estatesDetected);
                        salt++;
                    } else {
                        break;
                    }
                }
                setNextSalt(salt);
            }
        }
        fetchData();
    }, [wallet.connected, wallet.account]);

    // TODO: Revisit breadcrumbs flow

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
                        Submit this form to create your new digital estate on the Ethereum blockchain.  An estate allows you to manage, spend, and invest your assets while planning for the future.
                    </p>
                    <p>
                        A Gnosis Safe will be generated for you and linked to your estate.  Should anything ever happen to you, your estate will handle inheritance according to your wishes.
                    </p>
                    <NewEstateForm salt={nextSalt}/>
                </SimpleCard>
                {estates.length > 0 && (
                    <SimpleCard title="Open An Existing Estate" className="mb-4">
                        <p>
                            Select an estate below to open and manage it:
                        </p>
                        <ol>
                        {estates.map((estate, index) => (
                            <li key={index}>
                                <Link to={'/dapp/estate/' + estate}>
                                    {estate}
                                </Link>
                            </li>
                        ))}
                        </ol>
                    </SimpleCard>
                )}
            </div>
        </EthereumDapp>
    );
}

export default DappNewEstate;
