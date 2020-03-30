import React, { Component } from "react";
import { Breadcrumb, SimpleCard, CodeViewer } from "@gull";

class DappHome extends Component {
    render() {
        return (
          <div>
            <Breadcrumb
              routeSegments={[
                { name: "Home", path: "/" },
                { name: "dApp", path: "/dapp" }
              ]}
            ></Breadcrumb>
            <SimpleCard title="Welcome" className="mb-4">
            <h1>Coming Soon!</h1>
            </SimpleCard>

          </div>
        );
    }
}

export default DappHome;
