import React from "react";
import {Drizzle} from "@drizzle/store";
import {drizzleReactHooks} from '@drizzle/react-plugin'
import LoadingComponent from "./components/LoadingComponent";
import TokenMetadata from "./components/TokenMetadata";
import TokenWallet from "./components/TokenWallet";

import drizzleOptions from './drizzleOptions.js'

const drizzle = new Drizzle(drizzleOptions)
const {DrizzleProvider} = drizzleReactHooks

function App() {
    return (
        <div className="container">
            <h1>ERC20 Token</h1>
            <DrizzleProvider drizzle={drizzle}>
                <LoadingComponent>
                    <TokenMetadata/>
                    <TokenWallet/>
                </LoadingComponent>
            </DrizzleProvider>
        </div>
    );
}

export default App;
