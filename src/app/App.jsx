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

import { UseWalletProvider } from "use-wallet";

// function App() {
class App extends React.Component {

    render() {
        return (

            <AppContext.Provider value={{routes}}>
                <Provider store={Store}>
                    <UseWalletProvider chainId={42} connectors={{portis: { dAppId: 'b84b9829-51b0-480b-a1d2-1cfc112db3d3' }}}>
                        {/*<Auth>*/}
                            <Suspense fallback={<Loading></Loading>}>
                                <Router history={history}>{renderRoutes(RootRoutes)}</Router>
                            </Suspense>
                        {/*</Auth>*/}
                    </UseWalletProvider>
                </Provider>
            </AppContext.Provider>

        );
    }
}

export default App;
