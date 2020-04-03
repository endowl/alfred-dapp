import "../fake-db";
import React, { Suspense } from "react";
import "../styles/app/app.scss";

import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import AppContext from "./appContext";
import history from "@history";

import routes from "./RootRoutes";
import { Store } from "./redux/Store";
import { renderRoutes } from "react-router-config";
import Auth from "./auth/Auth";
import RootRoutes from "./RootRoutes";
import { Loading } from "@gull";

import { ethers } from 'ethers';

// function App() {
class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { account: '' };
    }

    componentDidMount() {
        this.loadBlockchainData();
    }

    async loadBlockchainData() {

        if(window.ethereum) {
            console.log("MetaMask detected, attempting to unlock");
            // window.web3 = new Web3(ethereum);
            try {
                await window.ethereum.enable();
                console.log("MetaMask unlocked");
                this.provider = new ethers.providers.Web3Provider(window.ethereum);
                console.log(this.provider);
                console.log(this.provider.getSigner());
                console.log(this.provider.getSigner().getAddress());
                this.accountAddress = await this.provider.getSigner().getAddress();
                this.blockNumber = await this.provider.getBlockNumber();
                this.setState({ account: this.accountAddress, blockNumber: this.blockNumber })

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



        /*
        // this.provider = ethers.getDefaultProvider('ropsten');
        // this.provider = new ethers.providers.Web3Provider(window.web3.currentProvider);
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log(this.provider);
        //this.setState({ account: this.provider.getSigner().getAddress().toString() });

        // this.provider.getSigner().getAddress().then((address) => {
        //     this.setState( {account: "FOO..." + address} );
        // })

        this.setState({
            account: 'foobar',
            blockNumber: 'baz'
        });

        console.log(this.provider.getSigner());
        console.log(this.provider.getSigner().getAddress());

         */
    }

    render() {
        return (
            <AppContext.Provider value={{routes}}>
                <Provider store={Store}>
                    <h1>(TODO: DELETE THIS) Account: {this.state.account} Block: {this.state.blockNumber}</h1>
                    <Auth>
                        <Suspense fallback={<Loading></Loading>}>
                            <Router history={history}>{renderRoutes(RootRoutes)}</Router>
                        </Suspense>
                    </Auth>
                </Provider>
            </AppContext.Provider>
        );
    }
}

export default App;
