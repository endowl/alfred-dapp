import {useWallet} from "use-wallet";
import React, {Fragment} from "react";
import { SimpleCard } from "@gull";

// Use this component around parts of the app which require an Ethereum wallet to force a connection prompt when wallet is not active.

// TODO: Require connection to specific networks, eg. Mainnet, Ropsten, etc

function EthereumDapp(props) {
    const { children } = props;
    const wallet = useWallet();

    return !wallet.connected ? (
        <div>
            <SimpleCard title="Connect to Ethereum Wallet" className="mb-4">
                Using this dApp requires connecting to an Ethereum browser wallet.  During development use the <strong>Kovan testnet</strong>.  Please select your wallet to activate the dApp:
                <div>
                    <button className="btn-rounded m-1 btn btn-warning" onClick={() => wallet.activate()}>MetaMask</button>
                    <button className="btn-rounded m-1 btn btn-warning" onClick={() => wallet.activate('frame')}>Frame</button>
                    <button className="btn-rounded m-1 btn btn-warning" onClick={() => wallet.activate('portis')}>Portis</button>
                </div>
            </SimpleCard>
        </div>
    ) : (
        <Fragment>{children}</Fragment>
    );

}

export default EthereumDapp;
