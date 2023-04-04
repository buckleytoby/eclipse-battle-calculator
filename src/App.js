import * as React from 'react';
import './App.css';
import Button from '@mui/material/Button';
import { Grid, Box } from '@mui/material';
import ResponsiveAppBar from './components/responsiveappbar';
import {ShipSelect} from './components/selector';

// Use the same interface as https://s3.amazonaws.com/eclipse-calculator/eclipse-calculator.htm to setup attacker and defender armies

// Battle code

// Missiles

// Loop engagement rounds
  // Attacker Retreat?

  // Defender Retreat?

  // For each ship, ordered by initiative, trade cannon blows

  // Distribute Damage like the AI
    // Kill ships biggest to smallest

    // Place rest of remaining damage on largest ship

  // Check if battle over



function App() {
  return (
    <div className="App">
      <Grid container direction={"column"} spacing={5}>
        <Grid item> {/* Battle setup */}
          <ResponsiveAppBar></ResponsiveAppBar>
          <Grid container direction={"row"} columns={2} spacing={5}>
            <Grid item sx={{width: 900}}> {/* Attacker setup */}
              <h1>Attacker Setup</h1>
              <h2>Interceptors</h2> <ShipSelect></ShipSelect>
              <h2>Cruisers</h2> <ShipSelect></ShipSelect>
              <h2>Dreadnoughts</h2> <ShipSelect></ShipSelect>
              <h2>Starbases</h2> <ShipSelect></ShipSelect>
            </Grid>
            <Grid item xs="auto"> {/* Defender setup */}
              <h1>Defender Setup</h1>
            </Grid>
          </Grid>
        </Grid>
        <Grid item> {/* Run Battle */}
          <ResponsiveAppBar>Run Battle</ResponsiveAppBar>
          <Button variant="contained">Testing</Button>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
