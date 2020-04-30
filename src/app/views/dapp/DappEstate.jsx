import React, {useState, Fragment, useEffect} from "react";
import {Breadcrumb, SimpleCard, CodeViewer} from "@gull";
import {useWallet} from "use-wallet";
import EthereumDapp from "./EthereumDapp";
import {Badge, Card} from "react-bootstrap";
import {Form, Modal, Button} from "react-bootstrap";
import {ethers} from 'ethers';
import bringOutYourDeadAbi from "../../../abi/bringOutYourDeadAbi";
import erc20Abi from "../../../abi/erc20";
import gnosisModuleManagerAbi from "../../../abi/gnosisModuleManagerAbi";
import gnosisOwnerManagerAbi from "../../../abi/gnosisOwnerManagerAbi";
import EthereumAddress from './EthereumAddress';
import localStorageService from "../../services/localStorageService";
import PieChart from "./PieChart";
// import bringOutYourDeadFactoryAbi from "../../../abi/bringOutYourDeadFactoryAbi";
import {NotificationManager} from "react-notifications";
import moment from "moment";

// Gnosis Proxy Kit
const CPK = require('contract-proxy-kit');

// Sentinal address is used on ends of Gnosis Safe linked lists
const SENTINAL_ADDRESS = "0x0000000000000000000000000000000000000001";

function BeneficiaryPieChart({beneficiaries, name = "Beneficiary Shares"}) {
    console.log(beneficiaries);
    let data = [];
    for (let i = 0; i < beneficiaries.length; i++) {
        data.push({name: beneficiaries[i]['address'], value: beneficiaries[i]['shares']})
    }
    return (
        <PieChart data={data} name={name} />
    );
}


function EditExecutor(props) {
    const [show, setShow] = useState(false);
    const [executor, setExecutor] = useState(props.executor);

    const handleClose = () => {
        setShow(false);
    };

    // TODO: Finish handling executor updates
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
    const [beneficiaries, setBeneficiaries] = useState(null);
    const [beneficiarySelfShares, setBeneficiarySelfShares] = useState(0);
    const [beneficiaryTotalShares, setBeneficiaryTotalShares] = useState(0);
    const [trackedTokens, setTrackedTokens] = useState([]);
    const [assets, setAssets] = useState([]);
    const [inheritance, setInheritance] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isGnosisSafeOwner, setIsGnosisSafeOwner] = useState(false);
    const [showTodo, setShowTodo] = useState(false);
    const [showEditBeneficiary, setShowEditBeneficiary] = useState(false);
    const [chainId, setChainId] = useState(1);
    const [editBeneficiaryAddress, setEditBeneficiaryAddress] = useState('');
    const [editBeneficiaryShares, setEditBeneficiaryShares] = useState('');
    const [isGnosisSafeRecoveryEnabled, setIsGnosisSafeRecoveryEnabled] = useState(false);
    const [isGnosisSafeRecoveryExecutor, setIsGnosisSafeRecoveryExecutor] = useState(false);
    const [gnosisSafeRecoveryMinimumBeneficiaries, setGnosisSafeRecoveryMinimumBeneficiaries] = useState(ethers.utils.bigNumberify(0));
    const [gnosisRecoveryFormEnabled, setGnosisRecoveryFormEnabled] = useState(false);
    const [gnosisRecoveryFormExecutor, setGnosisRecoveryFormExecutor] = useState(false);
    const [gnosisRecoveryFormMinBeneficiaries, setGnosisRecoveryFormMinBeneficiaries] = useState('');
    const [gnosisRecoveryFormNewOwner, setGnosisRecoveryFormNewOwner] = useState('');
    const [isDeadMansSwitchEnabled, setIsDeadMansSwitchEnabled] = useState(false);
    const [deadMansSwitchCheckinSeconds, setDeadMansSwitchCheckinSeconds] = useState(0);
    const [deadMansSwitchLastCheckin, setDeadMansSwitchLastCheckin] = useState(ethers.utils.bigNumberify(0));
    const [isDeadMansSwitchFormEnabled, setIsDeadMansSwitchFormEnabled] = useState(false);
    // const [deadMansSwitchFormCheckinSeconds, setDeadMansSwitchFormCheckinSeconds] = useState(0);
    const [deadMansSwitchFormCheckinMinutes, setDeadMansSwitchFormCheckinMinutes] = useState(0);
    const [blockchainTimestamp, setBlockchainTimestamp] = useState(ethers.utils.bigNumberify(0));

    async function handleUpdateGnosisSafeRecovery(event) {
        event.preventDefault();
        let provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);
        const cpk = await CPK.create({ethers, signer: signer});

        // Prepare calldata for multi-transaction call to Gnosis Safe by way of Contract Proxy Kit
        const boydInterface = new ethers.utils.Interface(bringOutYourDeadAbi);
        const moduleManagerInterface = new ethers.utils.Interface(gnosisModuleManagerAbi);

        let txs = [];
        if(gnosisRecoveryFormEnabled && !isGnosisSafeRecoveryEnabled) {
            // Enable estate to serve as a recovery module for gnosis safe
            let enableModuleData = moduleManagerInterface.functions.enableModule.encode([estateAddress]);
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
            let disableModuleData = moduleManagerInterface.functions.disableModule.encode([SENTINAL_ADDRESS, estateAddress]);
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

        // Listen for events and update accordingly
        const safe = new ethers.Contract(gnosisSafe, gnosisModuleManagerAbi, signer);
        safe.on("EnabledModule", async (event) => {
            setIsGnosisSafeRecoveryEnabled(true);
            console.log("Module enabled");
            NotificationManager.success(
                "The Estate Recovery Module has been enabled on your Gnosis Safe",
                "Module Enabled"
            );
        });
        safe.on("DisabledModule", async (event) => {
            setIsGnosisSafeRecoveryEnabled(false);
            console.log("Module disabled");
            NotificationManager.success(
                "The Estate Recovery Module has been disabled on your Gnosis Safe",
                "Module Disabled"
            );
        });

        let estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);
        estateContract.on("BeneficiariesRequiredForSafeRecoveryChanged", async (newValue, event) => {
            setGnosisSafeRecoveryMinimumBeneficiaries(newValue);
            console.log("Beneficiaries required updated: ", newValue);
            NotificationManager.success(
                "The number of beneficiaries required to recovery your Gnosis Safe has been updated.",
                "Settings Updated"
            );
        });
        estateContract.on("IsExecutorRequiredForSafeRecoveryChanged", async (newValue, event) => {
            setIsGnosisSafeRecoveryExecutor(newValue);
            console.log("Is executor required updated: ", newValue);
            NotificationManager.success(
                "The executor requirement for recovering your Gnosis Safe has been updated.",
                "Settings Updated"
            );
        });

        // Send multi-TX through Gnosis Safe
        try {
            let cpkHash = await cpk.execTransactions(txs);
            console.log(cpkHash);
        } catch (e) {
            console.log("Error sending multi-TX through Gnosis Safe", e);
            NotificationManager.error(
                "There was a problem transacting through Gnosis Safe.",
                "Error sending transaction"
            );
        }
    }

    async function handleUpdateDeadMansSwitch(event) {
        event.preventDefault();
        let provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);
        // NOTE: The CPK makes incorrect assumptions about the address of the Gnosis Safe if the owner has changed
        const cpk = await CPK.create({ethers, signer: signer});

        // Prepare calldata for multi-transaction call to Gnosis Safe by way of Contract Proxy Kit
        const boydInterface = new ethers.utils.Interface(bringOutYourDeadAbi);
        let txs = [];
        const checkinSeconds = deadMansSwitchFormCheckinMinutes > 0 ? deadMansSwitchFormCheckinMinutes * 60 : 0;
        const enabledData = boydInterface.functions.setIsDeadMansSwitchEnabled.encode([isDeadMansSwitchFormEnabled]);
        const periodData = boydInterface.functions.setDeadMansSwitchCheckinSeconds.encode([checkinSeconds]);

        txs.push({
            operation: CPK.CALL,
            to: estateAddress,
            value: 0,
            data: enabledData
        });

        txs.push({
            operation: CPK.CALL,
            to: estateAddress,
            value: 0,
            data: periodData
        });

        // Listen for events and update accordingly
        let estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);
        estateContract.on("DeadMansSwitchCheckinSecondsChanged", async (newValue, event) => {
            setDeadMansSwitchCheckinSeconds(newValue);
            console.log("DeadMansSwitchCheckinSecondsChanged: ", newValue);
            NotificationManager.success(
                "The dead man's switch check-in period has been updated.",
                "Settings Updated"
            );
        });
        estateContract.on("IsDeadMansSwitchEnabledChanged", async (newValue, event) => {
            setIsDeadMansSwitchEnabled(newValue);
            console.log("IsDeadMansSwitchEnabledChanged: ", newValue);
            const status = newValue ? 'enabled' : 'disabled';
            NotificationManager.success(
                "The dead man's switch has been " + status + ".",
                "Settings Updated"
            );
        });

        // Send multi-TX through Gnosis Safe
        try {
            let cpkHash = await cpk.execTransactions(txs);
            console.log(cpkHash);
        } catch (e) {
            console.log("Error updating dead man's switch settings with multi-TX through Gnosis Safe", e);
            NotificationManager.error(
                "There was a problem transacting through Gnosis Safe.",
                "Error sending transaction"
            );
        }

    }


    async function handleDistributeAsset(event, address, asEther) {
        event.preventDefault();
        let provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);
        let estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);
        try {
            console.log(event);
            if(address === ethers.constants.AddressZero) {
                await estateContract.distributeEthShares();
            } else {
                if(asEther) {
                    await estateContract.distributeTokenSharesAsEth(address);
                } else {
                    await estateContract.distributeTokenShares(address);
                }
            }
            estateContract.on("BeneficiaryWithdrawal", async (beneficiary, token, share, event) => {
                console.log("Distribution to a beneficiary detected");
                // TODO: More verbose message?
                NotificationManager.success(
                    "Distributed asset to beneficiary",
                    "Asset distributed"
                );
                refreshAssets()
            })
        } catch (e) {
            console.log("ERROR while waiting for asset distribution transaction to complete", e);
            NotificationManager.error(
                "There was a problem distributing asset to beneficiaries.",
                "Error sending transaction"
            );
        }

    }


    async function handleClaimAsset(event, address, asEther) {
        event.preventDefault();

        let provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);
        let estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);
        try {
            console.log(event);
            if(address === ethers.constants.AddressZero) {
                await estateContract.claimEthShares();
            } else {
                if(asEther) {
                    await estateContract.claimTokenSharesAsEth(address);
                } else {
                    await estateContract.claimTokenShares(address);
                }
            }
            estateContract.on("BeneficiaryWithdrawal", async (beneficiary, token, share, event) => {
                console.log("Distribution to a beneficiary detected");
                // TODO: More verbose message?
                if(ethers.utils.getAddress(beneficiary) === wallet.account) {
                    NotificationManager.success(
                        "Successfully claimed share of asset.",
                        "Asset Claimed"
                    );
                }
                refreshAssets();
            })
        } catch (e) {
            console.log("ERROR while waiting for inheritance claim transaction to complete", e);
            NotificationManager.error(
                "There was a problem claiming share of inheritance.",
                "Error sending transaction"
            );
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
                console.log('Beneficiary added');
                NotificationManager.success(
                    "Beneficiary added to estate.",
                    "Success"
                );
                refreshBeneficiaries();
            });
        } catch (e) {
            console.log("ERROR while waiting for addBeneficiary transaction to complete", e);
            NotificationManager.error(
                "There was a problem addint the beneficiary.",
                "Error sending transaction"
            );
        }
    }


    async function handleRecoverGnosisSafe(event) {
        event.preventDefault();
        const provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);
        const estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);

        // Get calldata for OwnerManager.swapOwner(address prevOwner, address oldOwner, address newOwner)
        // Naively assuming there is currently only own owner of the Gnosis Safe
        // TODO: Support Gnosis Safe with multiple owners
        const ownerModuleInterface = new ethers.utils.Interface(gnosisOwnerManagerAbi);
        const prevOwner = SENTINAL_ADDRESS;
        const oldOwner = owner;
        // const newOwner = owner;  // TODO: pull newOwner from recovery form state
        const newOwner = gnosisRecoveryFormNewOwner;
        const swapOwnerData = ownerModuleInterface.functions.swapOwner.encode([prevOwner, oldOwner, newOwner]);
        console.log("swapOwnerData: ", swapOwnerData);
        const dataHash = await estateContract.getDataHash(swapOwnerData);
        console.log("dataHash: ", dataHash);

        // Check if the recovery conditions have been met already
        let isConfirmedByAll = await estateContract.isConfirmedByRequiredParties(dataHash);
        console.log("isConfirmedByAll: ", isConfirmedByAll);

        if(!isConfirmedByAll) {
            // Call estateContract.confirmTransaction(dataHash) with the hash of the swapOwner calldata
            try {
                let tx = await estateContract.confirmTransaction(dataHash);
                await tx.wait(1);
                NotificationManager.success(
                    "Recovery confirmation successfully submitted.",
                    "Confirmation Received"
                );

            } catch (e) {
                console.log("ERROR while waiting for transaction to complete", e);
                NotificationManager.error(
                    "There was a problem confirming recovery operation.",
                    "Error sending transaction"
                );
                return;
            }

            // Check if the recovery conditions have been met now
            isConfirmedByAll = await estateContract.isConfirmedByRequiredParties(dataHash);
            console.log("isConfirmedByAll: ", isConfirmedByAll);
        }

        // Call estateContract.recoverAccess(address prevOwner, address oldOwner, address newOwner) to finalize the account recovery
        if(isConfirmedByAll) {
            // Listen for ownerModuleInterface.AddedOwner(newOwner) event from Gnosis Safe, alert user on success
            const safe = new ethers.Contract(gnosisSafe, gnosisOwnerManagerAbi, signer);
            safe.on("AddedOwner", async (event) => {
                console.log("Gnosis Safe owner added");
                NotificationManager.success(
                    "Estate and Gnosis Safe have been successfully recovered to new wallet",
                    "Recovery Successful"
                );
                // TODO: Refresh estate owner? No, that's premature, gnosis safe has chagned ownership, but not estate yet
            });

            try {
                await estateContract.recoverAccess(prevOwner, oldOwner, newOwner);
            } catch (e) {
                console.log("ERROR while waiting for transaction to complete", e);
                NotificationManager.error(
                    "There was a problem finalizing the recovery operation.",
                    "Error sending transaction"
                );
            }
        }
    }


    async function handleRecoverEstate(event) {
        event.preventDefault();
        const provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);
        const estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);

        // NOTE: This might only the first time the Estate is recovered. Subsequent recoveries will use a different
        //       old owner address and incorrectly calculate the Gnosis Safe address.  The Gnosis Safe address is
        //       saved on the Estate contract, but unclear how to force CPK to use it without knowing original owner
        // NOTE: One solution would simply be to interact directly with Gnosis Safe and not use the CPK for this TX
        // TODO: Explore risk this technique will only work for first recovery
        // Initialize Gnosis Contract Proxy Kit using old owner address, to correctly generate Gnosis Safe address
        const cpk = await CPK.create({ethers, signer: signer, ownerAccount: owner});
        // console.log("cpk", cpk);
        // Set current wallet address in Gnosis Contract Proxy Kit so it can interact with the Gnosis Safe correctly
        cpk.setOwnerAccount(wallet.account);
        // console.log("cpk", cpk);

        // Prepare calldata for multi-transaction call to Gnosis Safe through Contract Proxy Kit
        const boydInterface = new ethers.utils.Interface(bringOutYourDeadAbi);
        // Transfer ownership to self
        const transferOwnershipData = boydInterface.functions.transferOwnership.encode([wallet.account]);
        // Check-in as alive
        const checkinData = boydInterface.functions.imNotDeadYet.encode([]);

        let txs = [
            {
                operation: CPK.CALL,
                to: estateAddress,
                value: 0,
                data: transferOwnershipData
            },
            {
                operation: CPK.CALL,
                to: estateAddress,
                value: 0,
                data: checkinData
            },
        ];

        // Send multi-TX through Gnosis Safe
        try {
            let cpkHash = await cpk.execTransactions(txs, {gasLimit: 5000000});
            console.log("cpkHash: ", cpkHash);
            NotificationManager.success(
                "Estate and Gnosis Safe have been successfully recovered to new wallet",
                "Recovery Successful"
            );

            // Refresh owner from estateContract
            let _owner = await estateContract.owner();
            setOwner(_owner);
            setIsOwner(_owner === wallet.account);
        } catch (e) {
            console.log("Error sending multi-tx through Gnosis Safe: ", e);
                NotificationManager.error(
                    "There was a problem finalizing the recovery operation.",
                    "Error sending transaction"
                );
        }

    }


    async function handleBringOutYourDead(event) {
        event.preventDefault();
        const provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);
        const estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);

        try {
            await estateContract.bringOutYourDead();
            // Listen for event and then refresh
            estateContract.on("ConfirmationOfDeath", async (event) => {
                console.log('ConfirmationOfDeath');
                NotificationManager.success(
                    "We are sorry for your loss.",
                    "Condolences"
                );
                // Update liveliness
                setLiveliness(await estateContract.liveliness());
            });
        } catch (e) {
            console.log("ERROR while calling bringOutYourDead", e);
            NotificationManager.error(
                "There was a problem submitting confirmation of death.",
                "Error sending transaction"
            );
        }
    }


    async function handleImNotDeadYet(event) {
        event.preventDefault();
        const provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);
        const estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);

        try {
            await estateContract.imNotDeadYet();
            // Listen for event and then refresh
            estateContract.on("ConfirmationOfLife", async (event) => {
                console.log('ConfirmationOfLife');
                NotificationManager.success(
                    "Check-in successful, dead man's switch countdown restarted.",
                    "Success"
                );
                // Update time since last check-in
                setDeadMansSwitchLastCheckin(await estateContract.deadMansSwitchLastCheckin());
            });
        } catch (e) {
            console.log("ERROR while checking in", e);
            NotificationManager.error(
                "There was a problem checking-in with the dead man's switch.",
                "Error sending transaction"
            );
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
        // Load beneficiary details. NOTE: estateContract.getBeneficiaryDetails() is misbehaving currently(?), so doing this
        let bs = [];
        let b = null;
        let bAddress;
        let bShares;
        // let _totalBeneficiaryShares = 0;
        do {
            try {
                console.log("Try b: " + bs.length);
                bAddress = await estateContract.beneficiaries(bs.length);
                bShares = await estateContract.beneficiaryShares(bAddress);
                b = {address: bAddress, shares: bShares.toString()};
                bs.push(b);
                // _totalBeneficiaryShares += bShares.toNumber();
            } catch (e) {
                b = null;
            }
        } while (b !== null);
        setBeneficiaries(bs);
        // setBeneficiaryTotalShares(_totalBeneficiaryShares);
        console.log(bs);
    }

    async function refreshAssets(_beneficiarySelfShares) {
        const provider = new ethers.providers.Web3Provider(wallet.ethereum);
        const signer = provider.getSigner(0);
        let estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);
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

        // Track some tokens automatically
        let defaultTokens = [
            "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa",  // KOVAN Dai
            "0x6B175474E89094C44Da98b954EedeAC495271d0F",  // Mainnet Dai
            "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643",  // Mainnet Compound Dai
            "0x61eB5a373c4Ec78523602583c049d8563d2C7BCD",  // KOKAN Chainlink
        ];

        for (let i = 0; i < defaultTokens.length; i++) {
            if (!_trackedTokens.includes(defaultTokens[i])) {
                _trackedTokens.push(defaultTokens[i]);
            }

        }
        setTrackedTokens(_trackedTokens);

        // Load assets
        let _assets = [];
        let _inheritance = [];

        // Get ETH balance
        try {
            let wei = await provider.getBalance(estateAddress);
            let asset = {
                symbol: 'ETH',
                name: 'Ether',
                address: ethers.constants.AddressZero,
                decimals: 18,
                balance: ethers.utils.formatEther(wei),
            };
            _assets.push(asset);
            // Track personal shares if a beneficiary
            if (_beneficiarySelfShares.toNumber() > 0) {
                let beneficiaryBalance = await estateContract.getBeneficiaryBalance(wallet.account, ethers.constants.AddressZero);
                let inheritAsset = {
                    symbol: asset['symbol'],
                    name: asset['name'],
                    address: asset['address'],
                    decimals: asset['decimals'],
                    // balance: (asset['balance'] * shareRatio).toFixed(4),
                    balance: ethers.utils.formatEther(beneficiaryBalance),
                };
                _inheritance.push(inheritAsset);
            }
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
                console.log("Asset: ", asset);
                console.log("Wei: ", wei);
                // Track personal shares if a beneficiary
                if (_beneficiarySelfShares.toNumber() > 0) {
                    let beneficiaryBalance = await estateContract.getBeneficiaryBalance(wallet.account, asset['address']);
                    let inheritAsset = {
                        symbol: asset['symbol'],
                        name: asset['name'],
                        address: asset['address'],
                        decimals: asset['decimals'],
                        // balance: (asset['balance'] * shareRatio).toFixed(4),
                        balance: ethers.utils.formatUnits(beneficiaryBalance, decimals),
                    };
                    console.log("InheritAsset: ", inheritAsset);
                    _inheritance.push(inheritAsset);
                }
            } catch (e) {
                console.log("Failed loading asset #" + i);
            }
        }
        setAssets(_assets);
        setInheritance(_inheritance);
    }


    useEffect(() => {
        async function fetchData() {

            const provider = new ethers.providers.Web3Provider(wallet.ethereum);
            const signer = provider.getSigner(0);

            provider.getNetwork().then((network) => {
                setChainId(network.chainId)
            });

            let estateContract;
            let _gnosisSafe = null;
            try {
                estateContract = new ethers.Contract(estateAddress, bringOutYourDeadAbi, signer);
                console.log(estateContract);
                let _owner = await estateContract.owner();
                setOwner(_owner);
                setIsOwner(_owner === wallet.account);
                setExecutor(await estateContract.executor());
                setLiveliness(await estateContract.liveliness());
                _gnosisSafe = await estateContract.gnosisSafe();
                setGnosisSafe(_gnosisSafe);

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

            if(_gnosisSafe !== null && _gnosisSafe !== ethers.constants.AddressZero) {
                const safe = new ethers.Contract(_gnosisSafe, gnosisModuleManagerAbi, signer);
                // Check if current user is an owner of the Gnosis Safe
                const safeOwnerManager = new ethers.Contract(_gnosisSafe, gnosisOwnerManagerAbi, signer);
                setIsGnosisSafeOwner(await safeOwnerManager.isOwner(wallet.account));
                // Determine if Gnosis Safe Estate Recovery Module is enabled in Gnosis Safe
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
            }

            // Load Dead Man's Switch settings from estate
            const dmsEnabed = await estateContract.isDeadMansSwitchEnabled();
            setIsDeadMansSwitchEnabled(dmsEnabed);
            setIsDeadMansSwitchFormEnabled(dmsEnabed);

            const dmsCheckinSeconds = await estateContract.deadMansSwitchCheckinSeconds();
            setDeadMansSwitchCheckinSeconds(dmsCheckinSeconds);
            setDeadMansSwitchFormCheckinMinutes(dmsCheckinSeconds.div(60));

            const dmsLastCheckin = await estateContract.deadMansSwitchLastCheckin();
            setDeadMansSwitchLastCheckin(dmsLastCheckin);

            // Determine current on-chain timestamp for comparing to dead man's switch
            const block = await provider.getBlock();
            const blockTimestamp = ethers.utils.bigNumberify(block.timestamp);

            setBlockchainTimestamp(blockTimestamp);

            // if(dmsLastCheckin.gt(0)) {
            //     let timePassed = moment.unix(dmsLastCheckin.toNumber()).from(moment.unix(blockTimestamp.toNumber()));
            //     console.log("timePassed: ", timePassed);
            //     console.log("blockTimestamp: ", blockTimestamp);
            //     console.log("dmsLastCheckin: ", dmsLastCheckin.toNumber());
            //     console.log("moment(blockTimestamp): ", moment.unix(blockTimestamp.toNumber()));
            //     console.log("moment(dmsLastCheckin): ", moment.unix(dmsLastCheckin.toNumber()));
            //     // TODO: Update timePassed
            // }

            // Load beneficiary details
            refreshBeneficiaries();

            let _beneficiarySelfShares;
            _beneficiarySelfShares = await estateContract.beneficiaryShares(wallet.account);
            setBeneficiarySelfShares(_beneficiarySelfShares.toNumber());
            console.log("BeneficiarySelfShares: ", _beneficiarySelfShares);

            let _beneficiaryTotalShares;
            _beneficiaryTotalShares = await estateContract.totalShares();
            setBeneficiaryTotalShares(_beneficiaryTotalShares.toNumber());
            console.log("BeneficiaryTotalShares: ", _beneficiaryTotalShares);

            let shareRatio = 0;
            if(_beneficiaryTotalShares !== 0) {
                shareRatio = _beneficiarySelfShares / _beneficiaryTotalShares;
            }
            console.log("ShareRatio: ", shareRatio);
            
            refreshAssets(_beneficiarySelfShares);
        }

        if (wallet.connected) {
            fetchData();
        }

    }, [wallet.connected, wallet.account, estateAddress]);

    return (
        <EthereumDapp>
            <div>
                <Breadcrumb
                    routeSegments={[
                        {name: "Home", path: "/"},
                        {name: "dApp", path: "/dapp/new-estate"},
                        {name: "Estate"}
                    ]}
                />
                <Modal centered={true} show={showTodo} onHide={() => setShowTodo(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Under Construction</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center">
                        <img src="/assets/images/under-construction.png" alt="Under Construction" />
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

                <Fragment>
                    <SimpleCard title="Estate Details" className="mb-4">
                        <div>
                            Estate: <EthereumAddress address={estateAddress} chainId={chainId}>{estateAddress}</EthereumAddress>
                        </div>
                        <div>
                            Gnosis Safe:
                            <EthereumAddress address={gnosisSafe} url={'https://gnosis-safe.io/app/#/safes/' + gnosisSafe} chainId={chainId}>{gnosisSafe}</EthereumAddress>
                            {/*<a href={'https://gnosis-safe.io/app/#/safes/' + gnosisSafe} target="_blank">{gnosisSafe}</a>*/}
                        </div>
                        <div>
                            Owner: <EthereumAddress address={owner} chainId={chainId}>{owner}</EthereumAddress>
                        </div>
                        <div>
                            Life Signs:
                            {(liveliness === 0 && deadMansSwitchLastCheckin.add(deadMansSwitchCheckinSeconds).gt(blockchainTimestamp)) && (
                                <Badge pill variant="success" className="badge-outline-success p-2 m-1">
                                    Alive
                                </Badge>
                            )}
                            {(liveliness === 2 || (liveliness === 0 && deadMansSwitchLastCheckin.add(deadMansSwitchCheckinSeconds).lte(blockchainTimestamp)) ) && (
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
                                    <EthereumAddress address={executor} chainId={chainId}>{executor}</EthereumAddress>
                                </span>
                            )}
                            {isOwner && (
                                <Fragment>
                                    <span className="cursor-pointer text-success mr-2"> <i className="nav-icon i-Pen-2 font-weight-bold" onClick={() => setShowTodo(true)} /></span>
                                    {executor !== ethers.constants.AddressZero && (
                                        <span className="cursor-pointer text-danger mr-2">
                                            <i className="nav-icon i-Close-Window font-weight-bold" onClick={() => setShowTodo(true)} />
                                        </span>
                                    )}
                                </Fragment>
                            )}
                        </div>
                    </SimpleCard>

                    {/* TODO: Display dead man's switch status but not controls to non-owners */}
                    {(isOwner || isDeadMansSwitchEnabled) && (
                        <div className="row">
                            <div className="col-lg-6">
                                <SimpleCard title="Dead Man's Switch" className="mb-4">
                                    {isOwner && (
                                        <Form onSubmit={handleUpdateDeadMansSwitch}>
                                            <Form.Check
                                                type="switch"
                                                id="deadManEnabled"
                                                label="Enabled"
                                                checked={isDeadMansSwitchFormEnabled}
                                                onChange={(event) => setIsDeadMansSwitchFormEnabled(event.target.checked)}
                                            />
                                            <div className="form-group mb-3">
                                                <label htmlFor="deadManCheckInDays">
                                                    Maximum number of <em title="Check-in period step size will be changed from 'minutes' to 'days' in the dApp after alpha">minutes</em> between Check-ins:
                                                </label>
                                                {/* TODO: Change check-in period step size from minutes to days after alpha*/}
                                                <input
                                                    className="form-control"
                                                    id="deadManCheckInDays"
                                                    placeholder="Check-in period in minutes"
                                                    value={deadMansSwitchFormCheckinMinutes}
                                                    onChange={(event) => setDeadMansSwitchFormCheckinMinutes(event.target.value)}
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Button type="submit" variant="primary">
                                                    Update
                                                </Button>
                                            </div>
                                        </Form>
                                    )}
                                    <div className="row">
                                        <div className="col-lg-12 col-md-12 col-sm-12">
                                            <div className="card card-icon-bg card-icon-bg-primary o-hidden mb-4">
                                                <div className="card-body text-center">
                                                    <i className="i-Stopwatch"/>
                                                    <div className="content">
                                                        <p className="text-muted mt-2 mb-0 text-capitalize">
                                                            Last Check-In
                                                        </p>
                                                        <p className="lead text-primary text-24 mb-2 text-capitalize">
                                                            {deadMansSwitchLastCheckin.eq(0) ? (
                                                                <span>Never</span>
                                                            ) : (
                                                                <span>
                                                                    {moment.unix(deadMansSwitchLastCheckin.toNumber()).from(moment.unix(blockchainTimestamp.toNumber()))}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isOwner && (
                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 col-sm-12">
                                                <Button
                                                    key="primary"
                                                    // variant="primary"
                                                    variant="success"
                                                    size="lg"
                                                    className="m-1 mb-4 text-capitalize d-block w-100 my-2"
                                                    onClick={handleImNotDeadYet}
                                                >
                                                    I'm Alive - Check-in Now!
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {/* Display when owner is alive but past due to check in to dead man switch and user is executor or beneficiary */}
                                    {(liveliness === 0 && deadMansSwitchLastCheckin.add(deadMansSwitchCheckinSeconds).lte(blockchainTimestamp) && (executor === wallet.account || beneficiarySelfShares > 0)) && (
                                        <div className="row">
                                            <div className="col-lg-12 col-md-12 col-sm-12">
                                                <Button
                                                    key="primary"
                                                    variant="danger"
                                                    size="lg"
                                                    className="m-1 mb-4 text-capitalize d-block w-100 my-2"
                                                    onClick={handleBringOutYourDead}
                                                >
                                                    Report Owner as Deceased
                                                </Button>
                                            </div>
                                        </div>

                                    )}
                                </SimpleCard>
                            </div>
                            {isOwner && (
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
                                            <button type="submit" className="btn btn-primary">
                                                Update
                                            </button>
                                        </Form>
                                    </SimpleCard>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Only display this to Executors and Beneficiaries while Owner is still alive and Recovery Module is enabled */}
                    {((executor === wallet.account || beneficiarySelfShares > 0) && liveliness === 0 && isGnosisSafeRecoveryEnabled) && (
                        <SimpleCard title="Recover Access to Estate and Gnosis Safe" className="mb-4">
                            <div>
                                If the owner of this estate has lost access to their Ethereum wallet, you can assist them with recovering control of their Gnosis Safe and their Estate.
                            </div>
                            <div>
                                To approve the recovery this step must be completed by:
                            </div>
                            <ul>
                                {isGnosisSafeRecoveryExecutor && (
                                    <li>The Executor</li>
                                )}
                                {(gnosisSafeRecoveryMinimumBeneficiaries.gt(0)) && (
                                    <li>{gnosisSafeRecoveryMinimumBeneficiaries.toString()} Beneficiaries</li>
                                )}
                            </ul>
                            <Form onSubmit={handleRecoverGnosisSafe}>
                                <div className="form-group mb-3">
                                    <label htmlFor="recoveryNewAddress">Address of estate owner's new wallet:</label>
                                    <input
                                        className="form-control"
                                        id="recoveryNewAddress"
                                        placeholder="Owners new Ethereum address"
                                        value={gnosisRecoveryFormNewOwner}
                                        onChange={(event) => setGnosisRecoveryFormNewOwner(event.target.value)}
                                    />
                                </div>
                                <Button type="submit" variant="danger">Confirm</Button>
                            </Form>
                        </SimpleCard>
                    )}

                    {/* Only display this to GnosisSafe owner when they differ from estate Owner and the owner is still alive */}
                    { (isGnosisSafeOwner && !isOwner && liveliness === 0) && (
                        <SimpleCard title="Finish Estate Recovery In Progress" className="mb-4">
                            <div>
                                Your Estate recovery is almost complete.  You have successfully regained control of your Gnosis Safe.
                            </div>
                            <div className="mb-4">
                                Click below to finish transferring ownership of your Estate to your new wallet:
                            </div>
                            <Form onSubmit={handleRecoverEstate}>
                                <Button type="submit" variant="danger">Finish Recovery</Button>
                            </Form>
                        </SimpleCard>
                    )}

                    {/* Only display this to Executors after Death has been established */}
                    { (executor === wallet.account && liveliness === 2) && (
                        <SimpleCard title="Distribute Inheritance to Beneficiaries" className="mb-4">
                            {assets.length === 0 ? (
                                <div className="loader-bubble loader-bubble-primary m-5" />
                            ) : (
                                <Fragment>
                                    <div className="row">
                                        {assets.map((asset, index) => (
                                            <div className="col-lg-3 col-md-6 col-sm-6" key={asset.address}>
                                                <div className="card card-icon-bg card-icon-bg-primary o-hidden mb-4">
                                                    <div className="card-body text-center">
                                                        <span className={"i- icon icon-" + asset.symbol.toLowerCase()} />
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
                                                {asset.balance > 0 && (
                                                    <Fragment>
                                                        <div>
                                                            <Button
                                                                key="primary"
                                                                variant="primary"
                                                                size="lg"
                                                                className="m-1 mb-4 text-capitalize d-block w-100 my-2"
                                                                onClick={(event) => handleDistributeAsset(event, asset.address, false)}
                                                            >
                                                                Distribute {asset.name}
                                                            </Button>
                                                        </div>
                                                        {asset.address !== ethers.constants.AddressZero && (
                                                            <div>
                                                                <Button
                                                                    key="primary"
                                                                    variant="primary"
                                                                    size="lg"
                                                                    className="m-1 mb-4 text-capitalize d-block w-100 my-2"
                                                                    onClick={(event) => handleDistributeAsset(event, asset.address, true)}
                                                                >
                                                                    Distribute {asset.symbol} as Ether
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </Fragment>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Fragment>
                            )}
                        </SimpleCard>
                    )}

                    {/* Only display this to Beneficiaries after Death has been established */}
                    {(beneficiarySelfShares > 0 && liveliness === 2) && (
                        <SimpleCard title="Claim My Share of Inheritance" className="mb-4">
                            {inheritance === null ? (
                                <div className="loader-bubble loader-bubble-primary m-5" />
                            ) : (
                                <Fragment>
                                    <div>
                                        My Shares:
                                        <strong>{beneficiaryTotalShares > 0 ? (beneficiarySelfShares / beneficiaryTotalShares * 100).toFixed(2) + '%' : ''}</strong> ({beneficiarySelfShares} out of {beneficiaryTotalShares})
                                    </div>
                                    {inheritance.length === 0 ? (
                                        <span />
                                    ) : (
                                        <Fragment>
                                            <div className="row">
                                                {inheritance.map((asset, index) => (
                                                    <div className="col-lg-3 col-md-6 col-sm-6" key={asset.address}>
                                                        <div className="card card-icon-bg card-icon-bg-primary o-hidden mb-4">
                                                            <div className="card-body text-center">
                                                                <span className={"i- icon icon-" + asset.symbol.toLowerCase()} />
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
                                                        {asset.balance > 0 && (
                                                            <Fragment>
                                                                <div>
                                                                    <Button
                                                                        key="primary"
                                                                        variant="primary"
                                                                        size="lg"
                                                                        className="m-1 mb-4 text-capitalize d-block w-100 my-2"
                                                                        onClick={(event) => handleClaimAsset(event, asset.address, false)}
                                                                    >
                                                                        Claim {asset.name}
                                                                    </Button>
                                                                </div>
                                                                {asset.address !== ethers.constants.AddressZero && (
                                                                    <div>
                                                                        <Button
                                                                            key="primary"
                                                                            variant="primary"
                                                                            size="lg"
                                                                            className="m-1 mb-4 text-capitalize d-block w-100 my-2"
                                                                            onClick={(event) => handleClaimAsset(event, asset.address, true)}
                                                                        >
                                                                            Claim {asset.symbol} as Ether
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </Fragment>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </Fragment>
                                    )}
                                </Fragment>
                            )}
                        </SimpleCard>
                    )}

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
                                {beneficiaries === null ? (
                                    <div className="loader-bubble loader-bubble-primary m-5" />
                                ) : (
                                    <Fragment>
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
                                                            {(isOwner || (wallet.address === executor && liveliness === 2)) && (
                                                                <th>Action</th>
                                                            )}
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {beneficiaries.map((beneficiary, index) => (
                                                            <tr key={beneficiary.address}>
                                                                <th scope="row">
                                                                    {index + 1}
                                                                </th>
                                                                <td>
                                                                    <EthereumAddress address={beneficiary.address}
                                                                                     chainId={chainId}>
                                                                        {beneficiary.address}
                                                                    </EthereumAddress>
                                                                </td>
                                                                <td>
                                                                    {beneficiary.shares}
                                                                </td>
                                                                {(isOwner || (wallet.address === executor && liveliness === 2)) && (
                                                                    <td>
                                                                                <span className="cursor-pointer text-success mr-2">
                                                                                    <i className="nav-icon i-Pen-2 font-weight-bold"
                                                                                       title="Edit beneficiary"
                                                                                       onClick={() => setShowTodo(true)} />
                                                                                </span>
                                                                        <span className="cursor-pointer text-danger mr-2">
                                                                                    <i className="nav-icon i-Close-Window font-weight-bold"
                                                                                       title="Remove beneficiary"
                                                                                       onClick={() => setShowTodo(true)} />
                                                                                </span>
                                                                    </td>
                                                                )}
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <BeneficiaryPieChart beneficiaries={beneficiaries} />
                                            </Fragment>
                                        )}
                                    </Fragment>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Body>
                            <div className="card-title d-flex align-items-center">
                                <h3 className="mb-0">Asset Holdings</h3>
                                <span className="flex-grow-1" />
                                <span className="cursor-pointer text-success mr-2">
                                            <i className="nav-icon i-Add font-weight-bold" title="Track New Asset"
                                               onClick={() => setShowTodo(true)} />
                                        </span>
                            </div>
                            <div>
                                {assets.length === 0 ? (
                                    <div className="loader-bubble loader-bubble-primary m-5" />
                                ) : (
                                    <Fragment>

                                        <div className="row">
                                            {assets.map((asset, index) => (
                                                <div className="col-lg-3 col-md-6 col-sm-6" key={asset.address}>
                                                    <div
                                                        className="card card-icon-bg card-icon-bg-primary o-hidden mb-4">
                                                        <div className="card-body text-center">
                                                            <span className={"i- icon icon-" + asset.symbol.toLowerCase()} />
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
                                                            {asset.address === ethers.constants.AddressZero ? (
                                                                <Fragment>
                                                                    {asset.name}
                                                                </Fragment>
                                                            ) : (
                                                                <EthereumAddress address={asset.address} chainId={chainId}>
                                                                    {asset.name}
                                                                </EthereumAddress>
                                                            )}
                                                        </th>
                                                        <td>
                                                            {asset.balance} {asset.symbol}
                                                        </td>
                                                        <td>
                                                            <span className="cursor-pointer text-success mr-2">
                                                                <i className="nav-icon i-Arrow-Forward-2 font-weight-bold"
                                                                   title="Send"
                                                                   onClick={() => setShowTodo(true)} />
                                                            </span>
                                                            {asset.address != ethers.constants.AddressZero && (
                                                                <Fragment>
                                                                    <span
                                                                        className="cursor-pointer text-danger mr-2">
                                                                        <i className="nav-icon i-Close-Window font-weight-bold"
                                                                           title="Stop tracking asset"
                                                                           onClick={() => setShowTodo(true)} />
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
