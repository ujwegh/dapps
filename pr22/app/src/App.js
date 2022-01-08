import React from "react";
import { Drizzle } from '@drizzle/store';
import { drizzleReactHooks } from "@drizzle/react-plugin";

import drizzleOptions from "./drizzleOptions";
import LoadingContainer from './components/LoadingContainer.js';
import ICOInfo from "./components/ICOInfo";
import Investor from "./components/Investor";
import Admin from "./components/Admin";

const drizzle = new Drizzle(drizzleOptions);
const { DrizzleProvider } = drizzleReactHooks;

function App() {
  return (
    <div className="container">
      <h1>ICO</h1>
      <DrizzleProvider drizzle={drizzle}>
        <LoadingContainer>
            <ICOInfo/>
            <Investor/>
            <Admin/>
        </LoadingContainer>
      </DrizzleProvider>
    </div>
  );
}

export default App;
