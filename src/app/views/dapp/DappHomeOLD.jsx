import React, { Component } from "react";
import { Breadcrumb, SimpleCard, CodeViewer } from "@gull";
// import { useWeb3React } from '@web3-react/core'
import { useWallet } from "use-wallet";
import EthereumDapp from "./EthereumDapp";

function AccountComponent() {
    const wallet = useWallet();
    // const web3React = useWeb3React();
    // console.log(web3React);
    return (
        <span>
            TESTING:
            {/*{ web3React.account }*/}
            { wallet.account }
        </span>
    )
}

class DappHome extends Component {

    render() {
        return (
            <EthereumDapp>
                <div>
                    <Breadcrumb
                        routeSegments={[
                            {name: "Home", path: "/"},
                            {name: "dApp", path: "/dapp"}
                        ]}
                    ></Breadcrumb>
                    <SimpleCard title="Welcome" className="mb-4">
                        <h1>Coming Soon!</h1>
                    </SimpleCard>
                    <AccountComponent/>
                </div>
            </EthereumDapp>
        );
    }
}

export default DappHome;
