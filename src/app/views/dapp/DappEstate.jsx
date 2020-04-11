import React, {Component, useState, Fragment} from "react";
import { Breadcrumb, SimpleCard, CodeViewer } from "@gull";
import { useWallet } from "use-wallet";
import EthereumDapp from "./EthereumDapp";
import {Alert} from "react-bootstrap";
import { ethers } from 'ethers';
import bringOutYourDeadAbi from "../../../abi/bringOutYourDeadAbi";
import LinkEtherscanAddress from './LinkEtherscanAddress';

function DappEstate(props) {
    const wallet = useWallet();
    const [estateAddress, setEstateAddress] = useState('');
    const [owner, setOwner] = useState('');
    const [executor, setExecutor] = useState('');
    let estateContract;

    async function update() {
        try {
            // let owner = await estateContract.owner();
            setOwner(await estateContract.owner());
        } catch (e) {
            console.log("Failed to read 'owner' property, probably a bad address/ENS name");
            return;
        }
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
                            <p>
                                Owner: <LinkEtherscanAddress address={owner}>{owner}</LinkEtherscanAddress>
                            </p>
                            <p>
                                Executor: <LinkEtherscanAddress address={executor}>{executor}</LinkEtherscanAddress>
                                <a onClick=""><i className="i-Edit"></i></a>
                            </p>
                        </SimpleCard>
                    )}
                </div>
            </EthereumDapp>
    );
}

export default  DappEstate;
