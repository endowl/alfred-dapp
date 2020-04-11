import React, {Fragment} from "react";
import LinkEtherscanAddress from "./LinkEtherscanAddress";

function LinkEtherscanTx(props) {
    let txHashUrl = "https://etherscan.io/tx/" + props.txHash;
    if (props.chainId === "3" || props.chainId === "ropsten") {
        txHashUrl = "https://ropsten.etherscan.io/tx/" + props.txHash;
    } else if (props.chainId === "42" || props.chainId === "kovan") {
        txHashUrl = "https://kovan.etherscan.io/tx/" + props.txHash;
    }
    // TODO Add other networks
    return (
        <a href={txHashUrl} target="_blank" title={props.txHash}><Fragment>{props.children}</Fragment></a>
    )
}

export default LinkEtherscanTx;
