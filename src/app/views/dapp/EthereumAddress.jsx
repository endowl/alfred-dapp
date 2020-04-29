import React, {Fragment} from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';

function EthereumAddress(props) {
    let etherscanUrl = "https://etherscan.io/address/" + props.address;
    if (props.chainId === "3" || props.chainId === 3) {
        etherscanUrl = "https://ropsten.etherscan.io/address/" + props.address;
    } else if (props.chainId === "42" || props.chainId === 42) {
        etherscanUrl = "https://kovan.etherscan.io/address/" + props.address;
    }
    // TODO Add other networks
    return (
        <Fragment>
            {props.url ? (
                <a href={props.url} target="_blank"><Fragment>{props.children}</Fragment></a>
            ) : (
                <Fragment>
                    {props.children}
                </Fragment>
            )}
            <CopyToClipboard text={props.address}>
                <i className="i-File-Clipboard-File--Text cursor-pointer nav-icon" title="Copy to clipboard" />
            </CopyToClipboard> <a href={etherscanUrl} target="_blank" title="Open on Etherscan">
                <i className="i-Two-Windows nav-icon" />
            </a>
        </Fragment>
    )
}

export default EthereumAddress;
