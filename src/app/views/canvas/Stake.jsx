import React, {Component, useState, Fragment} from "react";
import { Breadcrumb, SimpleCard, CodeViewer } from "@gull";
import { useWallet } from "use-wallet";
import EthereumDapp from "../dapp/EthereumDapp";
import {Alert} from "react-bootstrap";
import { Modal, Button } from "react-bootstrap";
import { ethers } from 'ethers';
import bringOutYourDeadAbi from "../../../abi/bringOutYourDeadAbi";
import LinkEtherscanAddress from '../dapp/LinkEtherscanAddress';


function EditExecutor(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => {
        setShow(false);
    };

    // TODO: Handle form submission, submit transaction, monitor and display tx status

    return (
        <Fragment>
            <Button className="text-capitalize" onClick={() => setShow(true)}>
                Edit
            </Button>
        <Modal show={show} onHide={() => handleClose()} {...props}>
            <Modal.Header closeButton>
                <Modal.Title>Change Executor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Address of the executor for the estate
                </p>
                <input type="text" name="executorInput" value="" class="form-control"/>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => handleClose()}>
                    Close
                </Button>
                <Button variant="primary" onClick={() => alert("todo")}>
                    Save Changes
                </Button>
            </Modal.Footer>

        </Modal>
        </Fragment>
    );
}


function Stake(props) {
    const wallet = useWallet();
    const [estateAddress, setEstateAddress] = useState('');
    const [owner, setOwner] = useState('');
    const [executor, setExecutor] = useState('');
    let estateContract;

    async function update() {
        try {
            setOwner(await estateContract.owner());
            setExecutor(await estateContract.executor());
        } catch (e) {
            console.log("Failed to read 'owner' property, probably a bad address/ENS name");
            return;
        }
    }

    async function handleChangeExecutor() {
        // TODO
    }

    if(wallet.connected) {
        const provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);

        try {
            estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);
            console.log(estateContract);
            update();
        } catch (e) {
            console.log(e);
        }


    }

    return (
            <EthereumDapp>
                <div>
                    <Breadcrumb
                        routeSegments={[
                            {name: "Home", path: "/"},
                            {name: "dApp", path: "/dapp"},
                            {name: "Estate"}
                        ]}
                    ></Breadcrumb>
                    <SimpleCard title="Select Estate" className="mb-4">
                        <p>
                            Enter the address of the estate you wish to manage
                            <input
                                type="text"
                                className="form-control"
                                name="estateAddress"
                                placeholder="0x.... Estate contract's Ethereum address"
                                value={estateAddress}
                                onChange={(event) => setEstateAddress(event.target.value)}
                            />
                        </p>
                    </SimpleCard>
                    {owner && (
                        <SimpleCard title="Estate Details" className="mb-4">
                            <div>
                                Owner: <LinkEtherscanAddress address={owner}>{owner}</LinkEtherscanAddress>
                            </div>
                            <div>
                                Executor:
                                <span>
                                    <LinkEtherscanAddress address={executor}>{executor}</LinkEtherscanAddress>
                                    <EditExecutor executor={executor}/>
                                </span>
                            </div>
                        </SimpleCard>
                    )}
                </div>
            </EthereumDapp>
    );
}

export default  Stake;
