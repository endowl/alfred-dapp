import React, {Component, useState, Fragment} from "react";
import { Breadcrumb, SimpleCard, CodeViewer } from "@gull";
import { useWallet } from "use-wallet";
import EthereumDapp from "./EthereumDapp";
import {Alert, Badge, Card, Dropdown} from "react-bootstrap";
import { Modal, Button } from "react-bootstrap";
import { ethers } from 'ethers';
import bringOutYourDeadAbi from "../../../abi/bringOutYourDeadAbi";
import erc20Abi from "../../../abi/erc20";
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
    const [trackedTokens, setTrackedTokens] = useState([]);
    const [assets, setAssets] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    const [showTodo, setShowTodo] = useState(false);
    let estateContract;

    const [runInit, setRunInit] = useState(true);
    const [chainId, setChainId] = useState(1);

    async function estateChanged() {
        const provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);
        provider.getNetwork().then((network) => {setChainId(network.chainId)});
        console.log('provider');
        // console.log(provider);
        console.log(provider.getNetwork().then((network) => {console.log(network.chainId)}));

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

        // Determine tracked assets
        let _trackedTokens = [];
        let assetAddress = null;
        do {
            try {
                assetAddress = await estateContract.trackedTokens(_trackedTokens.length);
                _trackedTokens.push(assetAddress);
            } catch (e) {
                assetAddress = null
            }
        } while (assetAddress !== null);
        setTrackedTokens(_trackedTokens);

        // Load assets
        let _assets = [];

        // Get ETH balance
        try {
            let wei = await provider.getBalance(estateAddress);
            _assets = [
                {
                    symbol: 'ETH',
                    name: 'Ether',
                    address: ethers.constants.AddressZero,
                    decimals: 18,
                    balance: ethers.utils.formatEther(wei),
                }
            ];
        } catch (e) {
            console.log("Failed retrieving asset balances");
        }

        // Get ERC20 token balances
        let erc20Contract;
        for(let i=0; i < _trackedTokens.length; i++) {
            console.log("Attempting to load details for asset #" + i + ": " + _trackedTokens[i]);
            try {
                erc20Contract = new ethers.Contract(_trackedTokens[i], erc20Abi, signer);
                let decimals = await erc20Contract.decimals();
                let wei = await erc20Contract.balanceOf(estateAddress);
                let asset = {
                    symbol: await erc20Contract.symbol(),
                    name: await erc20Contract.name(),
                    address: _trackedTokens[i],
                    decimals: decimals,
                    balance: ethers.utils.formatUnits(wei, decimals),
                };
                _assets.push(asset);
            } catch (e) {
                console.log("Failed loading asset #" + i);
            }
        }

        setAssets(_assets);

        // TODO: Load balances of assets from trackedTokens
    }

    async function handleChangeExecutor() {
        // TODO
    }

    // Initialize estate data one time after wallet connects
    if(wallet.connected && runInit) {
        setRunInit(false);
        estateChanged()
    }

    // TODO: Run estateChanged if estate changes

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
                    <Modal centered={true} show={showTodo} onHide={()=>setShowTodo(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Under Construction</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="text-center">
                            <img src="/assets/images/under-construction.png"/>
                            <h3>Coming soon!</h3>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={()=>setShowTodo(false)}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    {!owner && (
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
                    )}
                    {owner && (
                        <Fragment>
                            <SimpleCard title="Estate Details" className="mb-4">
                                <div>
                                    Contract Address: <LinkEtherscanAddress address={estateAddress} chainId={chainId}>{estateAddress}</LinkEtherscanAddress>
                                    <span className="cursor-pointer text-success mr-2">
                                        <i className="nav-icon i-Pen-2 font-weight-bold" onClick={() => setShowTodo(true)}></i>
                                    </span>
                                </div>
                                <div>
                                    Owner: <LinkEtherscanAddress address={owner} chainId={chainId}>{owner}</LinkEtherscanAddress>
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
                                <div>
                                    Executor:
                                    {executor === ethers.constants.AddressZero ? (
                                        <span> (None) </span>
                                    ) : (
                                        <span>
                                            <LinkEtherscanAddress address={executor} chainId={chainId}>{executor}</LinkEtherscanAddress>
                                        </span>
                                    )}
                                    <span className="cursor-pointer text-success mr-2">
                                        <i className="nav-icon i-Pen-2 font-weight-bold" onClick={() => setShowTodo(true)}></i>
                                    </span>
                                    <span className="cursor-pointer text-danger mr-2">
                                        <i className="nav-icon i-Close-Window font-weight-bold" onClick={() => setShowTodo(true)}></i>
                                    </span>

                                    {isOwner && (
                                        <EditExecutor executor={executor}/>
                                    )}
                                </div>
                            </SimpleCard>

                            <Card className="mb-4">
                                <Card.Body>
                                    <div className="card-title d-flex align-items-center">
                                        <h3 className="mb-0">Beneficiaries</h3>
                                        <span className="flex-grow-1"></span>
                                        <span className="cursor-pointer text-success mr-2">
                                            <i className="nav-icon i-Add font-weight-bold" title="Add New Beneficiary" onClick={()=>setShowTodo(true)}></i>
                                        </span>
                                    </div>
                                    <div>
                                        {beneficiaries.length === 0 ? (
                                            <span> </span>
                                        ) : (
                                            <Fragment>
                                                <div className="table-responsive">
                                                    <table className="table table-bordered table-sm text-center">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Address</th>
                                                                <th>Shares</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                        {beneficiaries.map((beneficiary, index) => (
                                                            <tr key={beneficiary.address}>
                                                                <th scope="row">
                                                                    {index+1}
                                                                </th>
                                                                <td>
                                                                    <LinkEtherscanAddress address={beneficiary.address} chainId={chainId}>
                                                                        {beneficiary.address}
                                                                    </LinkEtherscanAddress>
                                                                </td>
                                                                <td>
                                                                    {beneficiary.shares}
                                                                </td>
                                                                <td>
                                                                    <span className="cursor-pointer text-success mr-2">
                                                                        <i className="nav-icon i-Pen-2 font-weight-bold" onClick={()=>setShowTodo(true)}></i>
                                                                    </span>
                                                                    <span className="cursor-pointer text-danger mr-2">
                                                                        <i className="nav-icon i-Close-Window font-weight-bold" onClick={()=>setShowTodo(true)}></i>
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
                                </Card.Body>
                            </Card>

                            <Card className="mb-4">
                                <Card.Body>
                                    <div className="card-title d-flex align-items-center">
                                        <h3 className="mb-0">Asset Holdings</h3>
                                        <span className="flex-grow-1"></span>
                                        <span className="cursor-pointer text-success mr-2">
                                            <i className="nav-icon i-Add font-weight-bold" title="Track New Asset" onClick={()=>setShowTodo(true)}></i>
                                        </span>
                                    </div>
                                    <div>
                                        {assets.length === 0 ? (
                                            <span> </span>
                                        ) : (
                                            <Fragment>

                                                <div className="row">
                                                    {assets.map((asset, index) => (
                                                        <div className="col-lg-3 col-md-6 col-sm-6" key={asset.address}>
                                                            <div
                                                                className="card card-icon-bg card-icon-bg-primary o-hidden mb-4">
                                                                <div className="card-body text-center">
                                                                    <span className={"i- icon icon-" + asset.symbol.toLowerCase()}></span>

                                                                    <div className="content">
                                                                        <p className="text-muted mt-2 mb-0 text-capitalize">
                                                                            {asset.name}
                                                                        </p>
                                                                        <p className="lead text-primary text-24 mb-2 text-capitalize">
                                                                            {asset.balance} {asset.symbol}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="table-responsive">
                                                    <table className="table table-bordered table-sm text-center">
                                                        <thead>
                                                            <tr>
                                                                <th>Asset</th>
                                                                <th>Balance</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                        {assets.map((asset, index) => (
                                                            <tr key={asset.address}>
                                                                <th scope="row">
                                                                    <LinkEtherscanAddress address={asset.address} chainId={chainId}>
                                                                        {asset.name}
                                                                    </LinkEtherscanAddress>
                                                                </th>
                                                                <td>
                                                                    {asset.balance} {asset.symbol}
                                                                </td>
                                                                <td>
                                                                    <span className="cursor-pointer text-success mr-2">
                                                                        <i className="nav-icon i-Pen-2 font-weight-bold" onClick={()=>setShowTodo(true)}></i>
                                                                    </span>
                                                                    <span className="cursor-pointer text-danger mr-2">
                                                                        <i className="nav-icon i-Close-Window font-weight-bold" onClick={()=>setShowTodo(true)}></i>
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                            </Fragment>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>


                        </Fragment>
                    )}
                </div>
            </EthereumDapp>
    );
}

export default  DappEstate;
