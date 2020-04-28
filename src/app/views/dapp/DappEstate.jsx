import React, {Component, useState, Fragment, useEffect} from "react";
import {Breadcrumb, SimpleCard, CodeViewer} from "@gull";
import {useWallet} from "use-wallet";
import EthereumDapp from "./EthereumDapp";
import {Alert, Badge, Card, Dropdown, OverlayTrigger, Tooltip} from "react-bootstrap";
import {Form, Modal, Button} from "react-bootstrap";
import {ethers} from 'ethers';
import bringOutYourDeadAbi from "../../../abi/bringOutYourDeadAbi";
import erc20Abi from "../../../abi/erc20";
import gnosisModuleManagerAbi from "../../../abi/gnosisModuleManagerAbi";
import LinkEtherscanAddress from './LinkEtherscanAddress';
import localStorageService from "../../services/localStorageService";
import PieChart from "./PieChart";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import bringOutYourDeadFactoryAbi from "../../../abi/bringOutYourDeadFactoryAbi";

const CPK = require('contract-proxy-kit');

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
                        <input type="text" name="executorInput" value={executor}
                               onChange={(event) => setExecutor(event.target.value)} className="form-control"/>
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
function BeneficiaryPieChart({beneficiaries, name = "Beneficiary Shares"}) {
    console.log(beneficiaries);
    let data = [];
    for (let i = 0; i < beneficiaries.length; i++) {
        data.push({name: beneficiaries[i]['address'], value: beneficiaries[i]['shares']})
    }
    return (
        <PieChart data={data} name={name}></PieChart>
    );
}


function DappEstate(props) {
    const wallet = useWallet();
    const [estateAddress, setEstateAddress] = useState(() => {
        if (props.match.params.address !== undefined) {
            localStorageService.setItem('estate', props.match.params.address);
            return props.match.params.address;
        }
        let storedEstate = localStorageService.getItem('estate');
        if (storedEstate !== null) {
            return storedEstate;
        }
        return '';
    });
    const [owner, setOwner] = useState('');
    const [executor, setExecutor] = useState('');
    const [gnosisSafe, setGnosisSafe] = useState('');
    const [liveliness, setLiveliness] = useState(0);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [trackedTokens, setTrackedTokens] = useState([]);
    const [assets, setAssets] = useState([]);
    const [isOwner, setIsOwner] = useState(false);
    const [showTodo, setShowTodo] = useState(false);
    const [showEditBeneficiary, setShowEditBeneficiary] = useState(false);
    const [chainId, setChainId] = useState(1);
    const [editBeneficiaryAddress, setEditBeneficiaryAddress] = useState('');
    const [editBeneficiaryShares, setEditBeneficiaryShares] = useState('');
    const [isGnosisSafeRecoveryEnabled, setIsGnosisSafeRecoveryEnabled] = useState(false);
    const [isGnosisSafeRecoveryExecutor, setIsGnosisSafeRecoveryExecutor] = useState(0);
    const [gnosisSafeRecoveryMinimumBeneficiaries, setGnosisSafeRecoveryMinimumBeneficiaries] = useState(0);
    const [gnosisRecoveryFormEnabled, setGnosisRecoveryFormEnabled] = useState(false);
    const [gnosisRecoveryFormExecutor, setGnosisRecoveryFormExecutor] = useState(false);
    const [gnosisRecoveryFormMinBeneficiaries, setGnosisRecoveryFormMinBeneficiaries] = useState('');

    async function handleUpdateGnosisSafeRecovery(event) {
        event.preventDefault();
        let provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);
        const cpk = await CPK.create({ethers, signer: signer});
        // Prepare calldata for multi-transaction call to Gnosis Safe by way of Contract Proxy Kit
        const boydInterface = new ethers.utils.Interface(bringOutYourDeadAbi);
        const moduleManagerInterface = new ethers.utils.Interface(gnosisModuleManagerAbi);

        // TODO: Check if recovery module is to be enabled or disabled - isGnosisSafeRecoveryEnabled, act accordingly

        let txs = [];
        if(gnosisRecoveryFormEnabled && !isGnosisSafeRecoveryEnabled) {
            // Enable estate to serve as a recovery module for gnosis safe
            let enableModuleData = moduleManagerInterface.functions.enableModule.encode([estateAddress]);
            // TODO: include transaction data to set recovery config on estate contract
            txs.push({
                operation: CPK.CALL,
                to: gnosisSafe,
                value: 0,
                data: enableModuleData
            });
        } else if(!gnosisRecoveryFormEnabled && isGnosisSafeRecoveryEnabled) {
            // Disable estate from serving as a recovery module for gnosis safe
            // NOTE: Currently making the unsafe assumption that no other recovery modules are present on the gnosis safe
            // TODO: Use moduleManagerInterface.functions.getModules() or .getModulesPaginated(address,uint256) to determine the correct linked list target
            let disableModuleData = moduleManagerInterface.functions.disableModule.encode(["0x0000000000000000000000000000000000000001", estateAddress]);
            txs.push({
                operation: CPK.CALL,
                to: gnosisSafe,
                value: 0,
                data: disableModuleData
            });
        }

        const executorSettingsData = boydInterface.functions.setIsExecutorRequiredForSafeRecovery.encode([gnosisRecoveryFormExecutor]);
        const beneficiarySettingsData = boydInterface.functions.setBeneficiariesRequiredForSafeRecovery.encode([gnosisRecoveryFormMinBeneficiaries]);

        txs.push({
            operation: CPK.CALL,
            to: estateAddress,
            value: 0,
            data: executorSettingsData
        });

        txs.push({
            operation: CPK.CALL,
            to: estateAddress,
            value: 0,
            data: beneficiarySettingsData
        });

        // TODO: Listen for events and update state accordingly

        // Send multi-TX through Gnosis Safe, causing Safe to be deployed if it hasn't yet
        try {
            // let cpkHash = await cpk.execTransactions(txs, {gasLimit: 5000000});
            let cpkHash = await cpk.execTransactions(txs);
            // setTxHash(cpkHash.hash);
            console.log(cpkHash);
            // setStatus(statuses.PROCESSING);
        } catch (e) {
            console.log(e);
            // setStatus(statuses.ERROR);
        }


    }


    async function handleAddBeneficiary(event) {
        event.preventDefault();
        // TODO: Form validation
        let provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);
        let estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);
        try {
            await estateContract.addBeneficiary(editBeneficiaryAddress, editBeneficiaryShares);
            setShowEditBeneficiary(false);
            setEditBeneficiaryShares('');
            setEditBeneficiaryAddress('');
            // Listen for beneficiary added event and then refresh
            estateContract.on("AddedBeneficiary", async (event) => {
                // TODO: Alert user that beneficiary was successfully added
                console.log('Beneficiary added');
                refreshBeneficiaries();
            });


        } catch (e) {
            console.log("ERROR while waiting for transaction to complete");
            console.log(e);
        }
    }


    async function refreshBeneficiaries() {
            const provider = new ethers.providers.Web3Provider(wallet.ethereum);
            const signer = provider.getSigner(0);
            let estateContract;
            try {
                estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);
            } catch (e) {
                console.log("ERROR while refreshing beneficiaries");
                console.log(e);
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
                    b = {address: bAddress, shares: bShares.toString()};
                    bs.push(b);
                } catch (e) {
                    b = null;
                }
            } while (b !== null);
            setBeneficiaries(bs);
            console.log(bs);

    }

    // async function estateChanged() {
    useEffect(() => {
        async function fetchData() {

            const provider = new ethers.providers.Web3Provider(wallet.ethereum);
            const signer = provider.getSigner(0);
            provider.getNetwork().then((network) => {
                setChainId(network.chainId)
            });
            console.log('provider');
            // console.log(provider);
            console.log(provider.getNetwork().then((network) => {
                console.log(network.chainId)
            }));

            // NOTE: This creates a Gnosis Contracty Proxy Kit object
            // NOTE: it is associated with browser wallet address automatically, not the Alfred contract
            const cpk = await CPK.create({ethers, signer: signer});
            setGnosisSafe(cpk.address);

            let estateContract;
            try {
                estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);
                console.log(estateContract);
                setOwner(await estateContract.owner());
                setIsOwner(owner === wallet.account);
                setExecutor(await estateContract.executor());
                setLiveliness(await estateContract.liveliness());

                let executorRequired = await estateContract.isExecutorRequiredForSafeRecovery();
                setIsGnosisSafeRecoveryExecutor(executorRequired);
                setGnosisRecoveryFormExecutor(executorRequired);
                console.log("Executor required: ", executorRequired);

                let minBeneficiaries = await estateContract.beneficiariesRequiredForSafeRecovery();
                setGnosisSafeRecoveryMinimumBeneficiaries(minBeneficiaries);
                setGnosisRecoveryFormMinBeneficiaries(minBeneficiaries);
                console.log("Minimum beneficiaries: ", minBeneficiaries);
            } catch (e) {
                console.log("Failed while fetching estate details");
                return;
            }

            // Determine if Gnosis Safe Estate Recovery Module is enabled in Gnosis Safe
            const safe = new ethers.Contract(cpk.address, gnosisModuleManagerAbi, signer);
            const modules = await safe.getModules();
            console.log("Modules", modules);
            let enabled = false;
            if(modules.length > 0) {
                if(modules.length === 10) {
                    // TODO: Handle situation where there may be more than 10 modules (getModules() only returns first 10)
                    //       Will have to use ModuleManager.getModulesPaginated(...)
                    console.log("Modules list has 10 entries, possibility of this contract being past end of list")
                }
                for (let i = 0; i < modules.length; i++) {
                    if(ethers.utils.getAddress(modules[i]) === ethers.utils.getAddress(estateAddress)) {
                        enabled = true;
                        break;
                    }
                }
                if (enabled) {
                    setIsGnosisSafeRecoveryEnabled(true);
                    setGnosisRecoveryFormEnabled(true);
                } else {
                    setIsGnosisSafeRecoveryEnabled(false);
                    setGnosisRecoveryFormEnabled(false);
                }
            }

            // TODO: Use moduleManagerInterface.functions.getModules() or .getModulesPaginated(address,uint256)
            //       on gnosis safe to determine if recovery module is enabled and get it's linked list neighbor

            // TODO: Load Dead Man's Switch settings from estate

            refreshBeneficiaries();

            // // Load beneficiary details. NOTE: estateContract.getBeneficiaryDetails() is broken currently, so doing this
            // let bs = [];
            // let b = null;
            // let bAddress;
            // let bShares;
            // do {
            //     try {
            //         console.log("Try b: " + bs.length);
            //         bAddress = await estateContract.beneficiaries(bs.length);
            //         bShares = await estateContract.beneficiaryShares(bAddress);
            //         b = {address: bAddress, shares: bShares.toString()};
            //         bs.push(b);
            //     } catch (e) {
            //         b = null;
            //     }
            // } while (b !== null);
            // setBeneficiaries(bs);
            // console.log(bs);

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

            // Get balances of all tracked ERC20 tokens
            let erc20Contract;
            for (let i = 0; i < _trackedTokens.length; i++) {
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
        }

        if (wallet.connected) {
            fetchData();
        }
        // }
    }, [wallet.connected, wallet.account, estateAddress]);

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
                <Modal centered={true} show={showTodo} onHide={() => setShowTodo(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Under Construction</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <img src="/assets/images/under-construction.png"/>
                        <h3>Coming soon!</h3>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowTodo(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={showEditBeneficiary} centered={true} onHide={() => setShowEditBeneficiary(false)}>
                    <form onSubmit={handleAddBeneficiary}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add Beneficiary</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="form-group">
                                <label htmlFor="beneficiaryAddressInput" className="ul-form__label">
                                    Ethereum address
                                </label>
                                <input type="text" name="beneficiaryAddressInput" className="form-control"
                                       value={editBeneficiaryAddress}
                                       onChange={(event) => setEditBeneficiaryAddress(event.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="beneficiarySharesInput" className="ul-form__label">
                                    Shares:
                                </label>
                                <input type="number" step="1" min="0" name="beneficiarySharesInput"
                                       className="form-control"
                                       value={editBeneficiaryShares}
                                       onChange={(event) => setEditBeneficiaryShares(event.target.value)}
                                />
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowEditBeneficiary(false)}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit">
                                Save Changes
                            </Button>
                        </Modal.Footer>
                    </form>
                </Modal>

                {/*{!owner && (*/}
                {/*<SimpleCard title="Select Estate" className="mb-4">*/}
                {/*    <p>*/}
                {/*        Enter the address of the estate you wish to manage*/}
                {/*        <input*/}
                {/*            type="text"*/}
                {/*            className="form-control"*/}
                {/*            name="estateAddress"*/}
                {/*            placeholder="0x.... Estate contract's Ethereum address"*/}
                {/*            value={estateAddress}*/}
                {/*            onChange={(event) => setEstateAddress(event.target.value)}*/}
                {/*        />*/}
                {/*    </p>*/}
                {/*</SimpleCard>*/}
                {/*)}*/}
                {/*{owner && (*/}
                <Fragment>
                    <SimpleCard title="Estate Details" className="mb-4">
                        <div>
                            Estate: <LinkEtherscanAddress address={estateAddress} chainId={chainId}>{estateAddress}</LinkEtherscanAddress>
                        </div>
                        <div>
                            Gnosis Safe:
                            {/*<LinkEtherscanAddress address={gnosisSafe} chainId={chainId}>{gnosisSafe}</LinkEtherscanAddress>*/}
                            <a href={'https://gnosis-safe.io/app/#/safes/' + gnosisSafe} target="_blank">{gnosisSafe}</a>
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
                                            <LinkEtherscanAddress address={executor}
                                                                  chainId={chainId}>{executor}</LinkEtherscanAddress>
                                        </span>
                            )}
                            <span className="cursor-pointer text-success mr-2">
                                        <i className="nav-icon i-Pen-2 font-weight-bold"
                                           onClick={() => setShowTodo(true)}></i>
                                    </span>
                            <span className="cursor-pointer text-danger mr-2">
                                        <i className="nav-icon i-Close-Window font-weight-bold"
                                           onClick={() => setShowTodo(true)}></i>
                                    </span>

                            {isOwner && (
                                <EditExecutor executor={executor}/>
                            )}
                        </div>
                    </SimpleCard>

                    <div className="row">
                        <div className="col-lg-6">
                            <SimpleCard title="Dead Man's Switch" className="mb-4">
                                <Form>
                                    <Form.Check type="switch" id="deadManEnabled" label="Enabled"/>
                                    <div className="form-group mb-3">
                                        <label htmlFor="deadManCheckInDays">Maximum number of days between Check-ins</label>
                                        <input
                                            className="form-control"
                                            id="deadManCheckInDays"
                                            placeholder="Check-in period in days"
                                        />
                                    </div>
                                </Form>
                                <div className="row">
                                    <div className="col-lg-6 col-md-12 col-sm-12">
                                        <Button
                                            key="primary"
                                            variant="primary"
                                            size="lg"
                                            className="m-1 mb-4 text-capitalize d-block w-100 my-2"
                                            // className="d-block w-100 my-2 text-capitalize"
                                            onClick={() => setShowTodo(true)}
                                        >
                                            I'm Alive - Check-in Now!
                                        </Button>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-6 col-md-12 col-sm-12">
                                        <div className="card card-icon-bg card-icon-bg-primary o-hidden mb-4">
                                            <div className="card-body text-center">
                                                <i className="i-Stopwatch"/>
                                                <div className="content">
                                                    <p className="text-muted mt-2 mb-0 text-capitalize">
                                                        Last Check-In
                                                    </p>
                                                    <p className="lead text-primary text-24 mb-2 text-capitalize">
                                                        ...&nbsp;days
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SimpleCard>
                        </div>
                        <div className="col-lg-6">

                            <SimpleCard title="Gnosis Safe Estate Recovery Module" className="mb-4">
                                <Form onSubmit={handleUpdateGnosisSafeRecovery}>
                                    <div className="mb-3">
                                        <Form.Check
                                            type="switch"
                                            id="gnosisSafeRecoveryEnabled"
                                            label="Enabled"
                                            checked={gnosisRecoveryFormEnabled}
                                            onChange={(event) => setGnosisRecoveryFormEnabled(event.target.checked)}
                                        />
                                    </div>
                                    <div className="form-group mb-1">
                                        <label>Parties required to recover gnosis safe:</label>
                                        <Form.Check
                                            type="switch"
                                            id="gnosisSafeRecoveryExecutor"
                                            label="Executor"
                                            checked={gnosisRecoveryFormExecutor}
                                            onChange={(event) => setGnosisRecoveryFormExecutor(event.target.checked)}
                                        />
                                    </div>

                                    <div className="form-group mb-3">
                                        <label htmlFor="gnosisSafeRecoveryMinBeneficiaries">Beneficiaries, minimum number:</label>
                                        <input
                                            className="form-control"
                                            id="gnosisSafeRecoveryMinBeneficiaries"
                                            placeholder=""
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={gnosisRecoveryFormMinBeneficiaries}
                                            onChange={(event) => setGnosisRecoveryFormMinBeneficiaries(event.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        // onClick={(event) => {event.preventDefault(); setShowTodo(true)}}
                                        className="btn btn-primary"
                                        >
                                        Update
                                    </button>

                                </Form>
                            </SimpleCard>
                        </div>
                    </div>

                    <Card className="mb-4">
                        <Card.Body>
                            <div className="card-title d-flex align-items-center">
                                <h3 className="mb-0">Beneficiaries</h3>
                                <span className="flex-grow-1" />
                                <span className="cursor-pointer text-success mr-2">
                                    <i className="nav-icon i-Add font-weight-bold" title="Add New Beneficiary"
                                       onClick={() => setShowEditBeneficiary(true)} />
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
                                                            {index + 1}
                                                        </th>
                                                        <td>
                                                            <LinkEtherscanAddress address={beneficiary.address}
                                                                                  chainId={chainId}>
                                                                {beneficiary.address}
                                                            </LinkEtherscanAddress>
                                                        </td>
                                                        <td>
                                                            {beneficiary.shares}
                                                        </td>
                                                        <td>
                                                                    <span className="cursor-pointer text-success mr-2">
                                                                        <i className="nav-icon i-Pen-2 font-weight-bold"
                                                                           title="Edit beneficiary"
                                                                           onClick={() => setShowTodo(true)}></i>
                                                                    </span>
                                                            <span className="cursor-pointer text-danger mr-2">
                                                                        <i className="nav-icon i-Close-Window font-weight-bold"
                                                                           title="Remove beneficiary"
                                                                           onClick={() => setShowTodo(true)}></i>
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
                                            <i className="nav-icon i-Add font-weight-bold" title="Track New Asset"
                                               onClick={() => setShowTodo(true)}></i>
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
                                                            <span
                                                                className={"i- icon icon-" + asset.symbol.toLowerCase()}></span>
                                                            <div className="content">
                                                                <p className="text-muted mt-2 mb-0 text-capitalize">
                                                                    {asset.name}
                                                                </p>
                                                                <p className="lead text-primary text-24 mb-2 text-capitalize">
                                                                    {asset.balance}&nbsp;{asset.symbol}
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
                                                            <LinkEtherscanAddress address={asset.address}
                                                                                  chainId={chainId}>
                                                                {asset.name}
                                                            </LinkEtherscanAddress>
                                                        </th>
                                                        <td>
                                                            {asset.balance} {asset.symbol}
                                                        </td>
                                                        <td>
                                                                    <span className="cursor-pointer text-success mr-2">
                                                                        <i className="nav-icon i-Arrow-Forward-2 font-weight-bold"
                                                                           title="Send"
                                                                           onClick={() => setShowTodo(true)}></i>
                                                                    </span>
                                                            {asset.address != ethers.constants.AddressZero && (
                                                                <Fragment>
                                                                        <span
                                                                            className="cursor-pointer text-danger mr-2">
                                                                            <i className="nav-icon i-Close-Window font-weight-bold"
                                                                               title="Stop tracking asset"
                                                                               onClick={() => setShowTodo(true)}></i>
                                                                        </span>
                                                                </Fragment>
                                                            )}
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
                {/*)}*/}
            </div>
        </EthereumDapp>
    );
}

export default DappEstate;
