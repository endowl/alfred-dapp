import React, { Component } from "react";
import { SimpleCard } from "@gull";
import {ethers} from "ethers";
const moment = require('moment');

class TxHistory extends React.Component {

    state = {
        history: [],
        startBlock: undefined,
        endBlock: undefined,
    };

    componentDidMount() {
        this.updateTxHistory();
        /*
        window.ethereum.on('accountsChanged', function(accounts) {
            console.log("Accounts changed: ");
            console.log(accounts);
        });
        window.ethereum.on('networkChanged', function(network) {
            console.log("Network changed: ");
            console.log(network);
        });
         */
    }

    async updateTxHistory() {
        console.log('Updating TX history through Etherscan');
        let etherscanProvider = new ethers.providers.EtherscanProvider();
        let provider = undefined;
        console.log('FOO');
        if(window.ethereum) {
            try {
                provider = new ethers.providers.Web3Provider(window.ethereum);
            } catch (error) {
            }
        } else {
        }

        console.log(this.props.account);
        if(provider !== undefined && this.props.account !== undefined) {
            // TODO: Load this in (less arbitrary) blocks! Don't load an entire account TX history at once!
            let blockNumber = await provider.getBlockNumber();
            let startBlock = blockNumber - 250000;
            etherscanProvider.getHistory(this.props.account, startBlock, blockNumber).then((history) => {
                // History is returned from the beginning, reverse it by default to start from the end
                this.setState({
                    history: history.reverse(),
                    startBlock: startBlock,
                    endBlock: blockNumber
                });
            });
        }
    }

    render() {
        // let {
        //     history = undefined,
        //     startBlock = undefined,
        //     endBlock = undefined,
        // } = this.state;

        return (
            <SimpleCard title="">
                <h5 className="card-title">
                    Transaction History&nbsp;
                    {this.state.startBlock === undefined &&
                        <span>(Loading...)</span>
                    }
                    {this.state.startBlock !== undefined &&
                        <span>
                            | Blocks {this.state.startBlock} - {this.state.endBlock}
                        </span>
                    }
                </h5>
                {this.state.history !== undefined &&
                    <div className="table-responsive">
                        <table id="tx_history_table" className="table table-sm text-center">
                            <thead>
                            <tr>
                                <th scope="col">Date</th>
                                <th scope="col">Block</th>
                                <th scope="col">From</th>
                                <th scope="col">To</th>
                                <th scope="col">ETH Sent</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state.history.map((tx, index) => (
                                <tr key={index}>
                                    <th scope="row" title={moment.unix(tx.timestamp).format()}>
                                        <a href={"https://etherscan.io/tx/"}>
                                            {moment.unix(tx.timestamp).fromNow()}
                                        </a>
                                    </th>
                                    <td>{tx.blockNumber}</td>
                                    <td>{tx.from}</td>
                                    <td>{tx.to}</td>
                                    <td>{ethers.utils.formatEther(tx.value)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                }
            </SimpleCard>
        );
    }
}

export default TxHistory;

