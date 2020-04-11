import React, { Component } from "react";
import { Breadcrumb, SimpleCard, CodeViewer } from "@gull";
import {Col, Dropdown, ProgressBar, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import {ethers} from "ethers";
import {Provider} from "react-redux";
import erc20 from '../../../abi/erc20';
// import TxHistory from './TxHistory';
import EthereumDapp from "./EthereumDapp";
import {useWallet} from "use-wallet";

// const moment = require('moment');
//import {moment} from "moment";

// Demo data
let assets = [
    {
        name: "Ethereum",
        symbol: "ETH",
        icon: "eth",
        value: "23"
    },
    {
        name: "DAI Stablecoin",
        symbol: "DAI",
        icon: "dai",
        value: "1000"
    },
    {
        name: "Wrapped Bitcoin",
        symbol: "WBTC",
        icon: "btc",
        value: "1.2"
    },
    {
        name: "Uniswap Liquidity: DAI/ETH",
        symbol: "shares",
        iconSet: [
            "dai",
            "eth"
        ],
        value: "6.5"
    }
];

// Demo data
let beneficiariesList = [
    {
        name: "Smith Doe",
        email: "Smith@gmail.com",
        status: "active",
        photoUrl: "/assets/images/faces/1.jpg",
        share: "40",
        ethAddress: "0xF988Adda0418CCc3207594CA8d936458FE7bF70E"
    },
    {
        name: "Jhon Doe",
        email: "Jhon@gmail.com",
        status: "pending",
        photoUrl: "/assets/images/faces/2.jpg",
        share: "20",
        ethAddress: "0xA18561525ca72B7305c173C66E635A784D07F3aa"
    },
    {
        name: "Alex",
        email: "Otttio@gmail.com",
        status: "inactive",
        photoUrl: "/assets/images/faces/3.jpg",
        share: "10",
        ethAddress: "0x71765388bDDE1079Ec83f0448242469D69AE93F2"
    },
    {
        name: "Mathew Doe",
        email: "matheo@gmail.com",
        status: "active",
        photoUrl: "/assets/images/faces/4.jpg",
        share: "30",
        ethAddress: "0x51267FaEf4A8CcfB4baD6ebc0C65C44113f057A6"
    }
];


function Assets(props) {
    const wallet = useWallet();

    return (
        <div>
            Work In Progress...
        </div>
    )
}


class DappEstate extends Component {

    state = {
        // assets: assets,
        assets: [],
        beneficiariesList: beneficiariesList,
        txHistory: []
    };

    componentWillMount() {
        // this.connectToEthereum();
        this.updateAssets();
    }

    /*
    async connectToEthereum() {
        if(window.ethereum) {
            // TODO: Do not automatically try to unlock until user presses some sort of "Enable Ethereum" button
            console.log("MetaMask detected, attempting to unlock");
            try {
                await window.ethereum.enable();
                console.log("MetaMask unlocked");
                let provider = new ethers.providers.Web3Provider(window.ethereum);
                let accountAddress = await provider.getSigner().getAddress();
                let blockNumber = await provider.getBlockNumber();
                this.setState({
                    account: accountAddress,
                    blockNumber: blockNumber,
                    provider: provider
                });

                this.updateAssets();
                // this.updateTxHistory();

                // Load data from BringOutYourDead contract
                let contractAddress = "0xdac3794d1644D7cE73d098C19f33E7e10271b2bC";
                const contract = new ethers.Contract(contractAddress, erc20, provider);


            } catch (error) {
                // User denied account access
                // TODO: Handle this situation!
            }
        } else if (window.web3) {
            console.log("MetaMask detected, running unlocked");
            // window.web3 = new Web3(web3.currentProvider);
            // TODO: Handle ths situation?
        } else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            // TODO: Handle this situation!
        }
    }
    */

    async updateAssets() {
        console.log("Updating Ethereum assets");

        if(window.ethereum) {
            try {
                // await window.ethereum.enable();
                // console.log("MetaMask unlocked");
                let provider = new ethers.providers.Web3Provider(window.ethereum);
                if(provider !== undefined) {
                    let accountAddress = await provider.getSigner().getAddress();
                    let blockNumber = await provider.getBlockNumber();
                    let balance = await provider.getBalance(accountAddress);

                    let assets = [
                        {
                            name: "Ethereum",
                            symbol: "ETH",
                            icon: "eth",
                            value: ethers.utils.formatEther(balance),
                        }
                    ];

                    this.setState({
                        assets: assets,
                    });
                }
            } catch (error) {
            }
        } else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
            // TODO: Handle this situation!
        }

        // TODO:...
    }

    /*
    async updateTxHistory() {
        console.log('Updating T/X history through Etherscan');
        let etherscanProvider = new ethers.providers.EtherscanProvider();

        // TODO: Load this in (less arbitrary) blocks! Don't load an entire account TX history at once!
        let blockNumber = await this.state.provider.getBlockNumber();
        let startBlock = blockNumber - 250000;
        etherscanProvider.getHistory(this.state.account, startBlock, blockNumber).then((history) => {
            // history.forEach((tx) => {
            //     console.log(tx);
            // });

            // History is returned from the beginning, reverse it by default to start from the end
            this.setState({
                txHistory: history.reverse(),
                txHistoryStartBlock: startBlock,
                txHistoryEndBlock: blockNumber
            });
        });
    }
    */

    render() {
            let {
                account = undefined,
                assets = undefined,
                beneficiariesList = [],
                txHistory = [],
                txHistoryStartBlock = undefined,
                txHistoryEndBlock = undefined,
            } = this.state;

        return (
            <EthereumDapp>
                <div>
                    <Breadcrumb
                        routeSegments={[
                        { name: "Home", path: "/" },
                        { name: "dApp", path: "/dapp" },
                        { name: "Estate Details" }
                        ]}
                    ></Breadcrumb>
                    <SimpleCard title="Demonstration" className="mb-4">
                        <h1>This is a demo. Live version coming soon!</h1>
                        <h1>(TODO: DELETE THIS) Account: {this.state.account} Block: {this.state.blockNumber}</h1>
                    </SimpleCard>

                    <div className="row">
                        <div className="col-md-12">
                            <div className="card mb-4">
                                <div
                                    className="card-header card-title mb-0 d-flex align-items-center justify-content-between border-0">
                                    <h3 className="w-50 float-left card-title m-0">
                                        Beneficiaries
                                    </h3>
                                    <Dropdown alignRight>
                                        <Dropdown.Toggle
                                            as="span"
                                            className="toggle-hidden cursor-pointer"
                                        >
                                            <i className="nav-icon i-Gear-2"></i>
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item>Add new beneficiary</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>

                                <div className="">
                                    <div className="table-responsive">
                                        <table id="user_table" className="table  text-center">
                                            <thead>
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">Name</th>
                                                <th scope="col">Avatar</th>
                                                <th scope="col">Email</th>
                                                <th scope="col">Address</th>
                                                <th scope="col">Share</th>
                                                <th scope="col">Action</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {beneficiariesList.map((user, index) => (
                                                <tr key={index}>
                                                    <th scope="row">{index + 1}</th>
                                                    <td>{user.name}</td>
                                                    <td>
                                                        <img
                                                            className="rounded-circle m-0 avatar-sm-table "
                                                            src={user.photoUrl}
                                                            alt=""
                                                        />
                                                    </td>

                                                    <td>{user.email}</td>
                                                    <td><a href={`https://etherscan.io/address/${user.ethAddress}`} target="_blank">{user.ethAddress}</a></td>

                                                    <td>
                                                        <p className="mb-1 font-weight-light">{user.share}%</p>
                                                        <ProgressBar
                                                            variant="success"
                                                            now={user.share}
                                                            style={{height: "4px"}}
                                                        ></ProgressBar>

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
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="row">
                        <Col lg={6} md={6} sm={6} xs={12} className="mb-4">
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="ul-widget__head pb-20 v-margin">
                                        <div className="ul-widget__head-label">
                                            <h3 className="ul-widget__head-title">Assets</h3>
                                        </div>
                                        <Dropdown>
                                            <Dropdown.Toggle>Actions</Dropdown.Toggle>
                                            <Dropdown.Menu>
                                                <Link to="/" className="dropdown-item ul-widget__link--font">
                                                    <i className="i-Data-Save"> </i>
                                                    Export
                                                </Link>
                                                <Link to="/" className="dropdown-item ul-widget__link--font">
                                                    <i className="i-Data-Refresh"> </i>
                                                    Refresh
                                                </Link>
                                                <Link to="/" className="dropdown-item ul-widget__link--font">
                                                    <i className="i-Gears"> </i>
                                                    Customize
                                                </Link>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                    <div className="ul-widget__body">
                                        <div className="ul-widget1">
                                            {assets.map((asset, index) => (
                                                <div className="ul-widget4__item ul-widget4__users" key={asset.symbol}>
                                                    <div className="ul-widget4__pic-icon">
                                                        <span className={`icon icon-${asset.icon}`}></span>
                                                    </div>
                                                    <div className="ul-widget2__info ul-widget4__users-info">
                                                        <Link to="/" className="ul-widget4__title">
                                                            {asset.name}
                                                        </Link>
                                                    </div>
                                                    <span className="ul-widget4__number t-font-boldest text-success">{asset.value} {asset.symbol}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </div>


                    <Assets/>

                </div>
            </EthereumDapp>
        );
    }
}

export default DappEstate;
