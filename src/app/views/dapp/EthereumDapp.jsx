import {useWallet} from "use-wallet";
import React, {Fragment, useState} from "react";
import { SimpleCard } from "@gull";
import localStorageService from "../../services/localStorageService";

// Use this component around parts of the app which require an Ethereum wallet to force a connection prompt when wallet is not active.

// TODO: Require connection to specific networks, eg. Mainnet, Ropsten, etc

function EthereumDapp(props) {
    const { children } = props;
    const wallet = useWallet();

    const [firstRun, setFirstRun] = useState(true);

    // NOTE: This can cause a console warning about being unable to update a component while another is rendering
    // TODO: Maybe a race condition can be avoided???
    // TODO: Maybe display a loader to indicate connection in progress

    // If user previously activated connection, re-activate it on page reload
    if(firstRun) {
        setFirstRun(false);
        if(!wallet.connected && localStorageService.getItem('connectWallet')) {
            let providerType = localStorageService.getItem('walletProvider');
            if(providerType === null || providerType === '') {
                wallet.activate()
            } else {
                wallet.activate(providerType)
            }
        }
    }

    return !wallet.connected ? (
        <div>
            <SimpleCard title="Connect to Ethereum Wallet" className="mb-4">
                Using this dApp requires connecting to an Ethereum browser wallet.  During development use the <strong>Kovan testnet</strong>.  Please select your wallet to activate the dApp:
                <div>
                    <button className="btn-rounded m-1 btn btn-warning" onClick={() => {
                        wallet.activate();
                        localStorageService.setItem('connectWallet', true);
                        localStorageService.setItem('walletProvider', null);
                    }}>MetaMask</button>
                    <button className="btn-rounded m-1 btn btn-warning" onClick={() => {
                        wallet.activate('frame');
                        localStorageService.setItem('connectWallet', true);
                        localStorageService.setItem('walletProvider', 'frame');
                    }}>Frame</button>
                    <button className="btn-rounded m-1 btn btn-warning" onClick={() => {
                        wallet.activate('portis');
                        localStorageService.setItem('connectWallet', true);
                        localStorageService.setItem('walletProvider', 'portis');
                    }}>Portis</button>
                </div>
            </SimpleCard>
        </div>
    ) : (
        <Fragment>{children}</Fragment>
    );

}

export default EthereumDapp;
