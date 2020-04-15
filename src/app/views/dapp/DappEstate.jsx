import React, {Component, useState, Fragment} from "react";
import { Breadcrumb, SimpleCard, CodeViewer } from "@gull";
import { useWallet } from "use-wallet";
import EthereumDapp from "./EthereumDapp";
import {Alert, Badge} from "react-bootstrap";
import { Modal, Button } from "react-bootstrap";
import { ethers } from 'ethers';
import bringOutYourDeadAbi from "../../../abi/bringOutYourDeadAbi";
import LinkEtherscanAddress from './LinkEtherscanAddress';
import localStorageService from "../../services/localStorageService";
import PieChart from "./PieChart";

function EditExecutor(props) {
    const [show, setShow] = useState(false);
    const [executor, setExecutor] = useState(props.executor);

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
                <form>
                    <Modal.Header closeButton>
                        <Modal.Title>Change Executor</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                            <p>
                                Address of the executor for the estate ({executor})
                            </p>
                            <input type="text" name="executorInput" value={executor} onChange={(event)=>setExecutor(event.target.value)} className="form-control"/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => handleClose()}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={() => alert(executor)}>
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>
        </Fragment>
    );
}

// function BeneficiaryPieChart(props) {
function BeneficiaryPieChart({beneficiaries, name="Beneficiary Shares"}) {
    console.log(beneficiaries);
    let data = [];
    for(let i = 0; i < beneficiaries.length; i++) {
        data.push({name: beneficiaries[i]['address'], value: beneficiaries[i]['shares']})
    }
    return (
        <PieChart data={data} name={name}></PieChart>
    );
}

function DappEstate(props) {
    const wallet = useWallet();
    const [estateAddress, setEstateAddress] = useState(() => {
        if(props.match.params.address !== undefined) {
            return props.match.params.address;
        }
        let storedEstate = localStorageService.getItem('estate');
        if(storedEstate !== null) {
            return storedEstate;
        }
        return '';
    });
    const [owner, setOwner] = useState('');
    const [executor, setExecutor] = useState('');
    const [liveliness, setLiveliness] = useState(0);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    let estateContract;

    const [runInit, setRunInit] = useState(true);

    /*
    async function getEstateDetails() {
        let estateDetails = {};
        try {
            estateDetails['owner'] = await estateContract.owner();
            estateDetails['executor'] = await estateContract.executor();
            estateDetails['liveliness'] = await estateContract.liveliness();
            estateDetails['beneficiaries'] = await estateContract.getBeneficiaryDetails();
        } catch (e) {
            console.log('Failed getting estate details');
        }
    }
    */

    async function update() {
        const provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);

        try {
            estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);
            console.log(estateContract);
            setOwner(await estateContract.owner());
            setExecutor(await estateContract.executor());
            setLiveliness(await estateContract.liveliness());
            setIsOwner(owner === wallet.account);
        } catch (e) {
            console.log("Failed while updating estate details, possibly a bad address/ENS name");
            return;
        }
        // Load beneficiary details. NOTE: estateContract.getBeneficiaryDetails() is broken currently, so doing this
        let bs = [];
        let b = null;
        let bAddress;
        let bShares;
        do {
            try {
                console.log("Try b: " + bs.length);
                bAddress = await estateContract.beneficiaries(bs.length);
                bShares = await estateContract.beneficiaryShares(bAddress);
                b = { address: bAddress, shares: bShares.toString() };
                bs.push(b);
            } catch (e) {
                b = null;
            }
        } while (b !== null);
        setBeneficiaries(bs);
        console.log(bs);
    }

    async function handleChangeExecutor() {
        // TODO
    }

    // Initialize estate data one time after wallet connects
    if(wallet.connected && runInit) {
        setRunInit(false);
        update()
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
                        <Fragment>
                            <SimpleCard title="Estate Details" className="mb-4">
                                <div>
                                    <div>
                                        Owner: <LinkEtherscanAddress address={owner}>{owner}</LinkEtherscanAddress>
                                    </div>
                                    <div>
                                        Life Signs:
                                        {liveliness === 0 && (
                                            <Badge pill variant="success" className="badge-outline-success p-2 m-1">
                                                Alive
                                            </Badge>
                                        )}
                                        {liveliness === 2 && (
                                            <Badge pill variant="warning" className="badge-outline-warning p-2 m-1">
                                                Uncertain
                                            </Badge>
                                        )}
                                        {liveliness === 1 && (
                                            <Badge pill variant="danger" className="badge-outline-danger p-2 m-1">
                                                Dead
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    Executor:
                                    {executor === ethers.constants.AddressZero ? (
                                        <span> (None) </span>
                                    ) : (
                                        <span>
                                            <LinkEtherscanAddress address={executor}>{executor}</LinkEtherscanAddress>
                                        </span>
                                    )}
                                    {isOwner && (
                                        <EditExecutor executor={executor}/>
                                    )}
                                </div>
                            </SimpleCard>
                            <SimpleCard title="Beneficiaries" className="mb-4">
                                <div>
                                    {beneficiaries.length === 0 ? (
                                        <span> </span>
                                    ) : (
                                        <Fragment>
                                            <div className="table-responsive">
                                                <table className="table table-bordered table-sm text-center">
                                                    <thead>
                                                        <tr>
                                                            <th>Address</th>
                                                            <th>Shares</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                    {beneficiaries.map(beneficiary => (
                                                        <tr key={beneficiary.address}>
                                                            <th scope="row">
                                                                <LinkEtherscanAddress address={beneficiary.address}>
                                                                    {beneficiary.address}
                                                                </LinkEtherscanAddress>
                                                            </th>
                                                            <td>
                                                                {beneficiary.shares}
                                                            </td>
                                                            <td>
                                                                <span className="cursor-pointer text-success mr-2">
                                                                    <i className="nav-icon i-Pen-2 font-weight-bold"></i>
                                                                </span>
                                                                <span className="cursor-pointer text-danger mr-2">
                                                                    <i className="nav-icon i-Close-Window font-weight-bold"></i>
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <BeneficiaryPieChart beneficiaries={beneficiaries}></BeneficiaryPieChart>
                                        </Fragment>
                                    )}
                                </div>
                            </SimpleCard>
                        </Fragment>
                    )}
                </div>
            </EthereumDapp>
    );
}

export default  DappEstate;
