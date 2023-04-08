import * as React from 'react';
import './App.css';
import Button from '@mui/material/Button';
import { Grid, Box } from '@mui/material';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import ResponsiveAppBar from './components/responsiveappbar';
import {ShipSelect} from './components/selector';
import Stack from '@mui/material/Stack';
import BattleSim from './components/battle_sim';



function App() {
  const [reset_trigger, setreset_trigger] = React.useState(0);
  const [begin_battle_trigger, setbegin_battle_trigger] = React.useState(0);
  const [data_attacker, setdata_attacker] = React.useState({});
  const [data_defender, setdata_defender] = React.useState({});

  const reset_default = () => {
    console.log("App: Reset Default")
    setreset_trigger(reset_trigger + 1);
  }
  const begin_battle_trigger_fcn = () => {
    console.log("App: Begin Battle Trigger")
    setbegin_battle_trigger(begin_battle_trigger + 1);
  }

  return (
    <div className="App">
      <Grid container direction="column">
        <Grid item> {/* Battle setup */}
          <ResponsiveAppBar reset_default={reset_default}></ResponsiveAppBar>
          <Stack direction="row" spacing={2}>
            <Box sx={{width: 900}}> {/* Attacker setup */}
              <h1>Attacker Setup</h1>
              <h2>Interceptors</h2> <ShipSelect shipType='interceptor' reset_trigger={reset_trigger} data={data_attacker} setdata={setdata_attacker} begin_battle_trigger={begin_battle_trigger}></ShipSelect>
              <h2>Cruisers</h2> <ShipSelect shipType='cruiser' reset_trigger={reset_trigger}></ShipSelect>
              <h2>Dreadnoughts</h2> <ShipSelect shipType='dreadnought' reset_trigger={reset_trigger}></ShipSelect>
              <h2>Starbases</h2> <ShipSelect shipType='starbase' reset_trigger={reset_trigger}></ShipSelect>
            </Box>
            <Box sx={{width: 900}}> {/* Defender setup */}
              <h1>Defender Setup</h1>
              <h2>Interceptors</h2> <ShipSelect shipType='interceptor' reset_trigger={reset_trigger}></ShipSelect>
              <h2>Cruisers</h2> <ShipSelect shipType='cruiser' reset_trigger={reset_trigger}></ShipSelect>
              <h2>Dreadnoughts</h2> <ShipSelect shipType='dreadnought' reset_trigger={reset_trigger}></ShipSelect>
              <h2>Starbases</h2> <ShipSelect shipType='starbase' reset_trigger={reset_trigger}></ShipSelect>
            </Box>
          </Stack>
        </Grid>
        <Grid item> {/* Run Battle */}
          <ResponsiveAppBar>Run Battle</ResponsiveAppBar>
          <BattleSim data_attacker={data_attacker} data_defender={data_defender} begin_battle_trigger_fcn={begin_battle_trigger_fcn}></BattleSim>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
