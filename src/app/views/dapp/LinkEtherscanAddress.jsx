import React, {Fragment} from "react";

function LinkEtherscanAddress(props) {
    let url = "https://etherscan.io/address/" + props.address;
    if (props.chainId === "3") {
        url = "https://ropsten.etherscan.io/address/" + props.address;
    }
    // TODO Add other networks
    return (
        <a href={url} target="_blank" title={props.address}><Fragment>{props.children}</Fragment></a>
    )
}

export default LinkEtherscanAddress;
