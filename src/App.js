import * as React from 'react';
import './App.css';
import { Grid, Box } from '@mui/material';
import ResponsiveAppBar from './components/responsiveappbar';
import {ShipSelect} from './components/selector';
import Stack from '@mui/material/Stack';
import BattleSim from './components/battle_sim';
import * as Globals from './globals';


function App() {
  const data_attacker = React.useRef({});
  const data_defender = React.useRef({});
  const [reset_trigger, setreset_trigger] = React.useState(0);
  const [begin_battle_trigger, setbegin_battle_trigger] = React.useState(0);
  const [attacker_setup, setattacker_setup] = React.useState(0);
  const [defender_setup, setdefender_setup] = React.useState(0);

  const reset_default = () => {
    console.log("App: Reset Default")
    setreset_trigger(reset_trigger + 1);
  }
  const begin_battle_trigger_fcn = () => {
    console.log("App: Begin Battle Trigger")
    setattacker_setup(0)
    setdefender_setup(0)
    setbegin_battle_trigger(begin_battle_trigger + 1);
  }

  return (
    <div className="App">
      <Grid container direction="column">
        <Grid item> {/* Battle setup */}
          <ResponsiveAppBar reset_default={reset_default}></ResponsiveAppBar>
          <Stack direction="row" spacing={2}>
            <Box sx={{marginX: "50px", width: 650}}> {/* Attacker setup */}
              <h1>Attacker Setup</h1>
            {Globals.shipTypes.map((shipType) => (
              <h2>{shipType} <ShipSelect shipType={shipType} reset_trigger={reset_trigger} data={data_attacker} setup_trigger={setattacker_setup} begin_battle_trigger={begin_battle_trigger}></ShipSelect> </h2>
            ))}
            </Box>
            <Box sx={{marginX: "50px", width: 650}}> {/* Defender setup */}
              <h1>Defender Setup</h1>
            {Globals.shipTypes.map((shipType) => (
              <h2>{shipType} <ShipSelect shipType={shipType} reset_trigger={reset_trigger} data={data_defender} setup_trigger={setdefender_setup} begin_battle_trigger={begin_battle_trigger}></ShipSelect> </h2>
            ))}
            </Box>
          </Stack>
        </Grid>
        <Grid item> {/* Run Battle */}
          <ResponsiveAppBar reset_default={reset_default}></ResponsiveAppBar>
          <BattleSim attacker_setup={attacker_setup} defender_setup={defender_setup} 
          data_attacker={data_attacker}
          data_defender={data_defender}
          begin_battle_trigger_fcn={begin_battle_trigger_fcn}></BattleSim>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
