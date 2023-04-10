import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import * as Globals from '../globals';


/*
  Total number of yellow dice the ship rolls because of ion cannons. Ion turret adds two yellow dice. Ion missiles are not counted here.
	Same for orange dice (plasma cannons).
	Same for red dice (antimatter cannons).
	Number of ion missiles the ship has equipped, NOT the number of yellow dice. Example: if you have 3 ion missile modules equipped, enter 3.
	Same for plasma missiles.
	Number of ships of this type participating in the battle.
	Number of computers the ship has.
	Number of shields the ship has.
	Number of hull points (1 from each normal hull or sentient hull, 2 from each improved hull, 3 from shard hull) the ship has equipped. NOT the number of hit points (which is hull points + 1). If the ship has no hull equipped, enter 0.
	Total number of initiative points the ship has.

*/

// defaults
const defaults = {
  Interceptor: {
    nb_ships: 0,
    nb_shields: 0,
    nb_computers: 0,
    nb_yellow: 1,
    nb_orange: 0,
    nb_blue: 0,
    nb_red: 0,
    nb_yellow_missiles: 0,
    nb_orange_missiles: 0,
    nb_hull: 0,
    nb_initiative: 3
  },
  Cruiser: {
    nb_ships: 0,
    nb_shields: 0,
    nb_computers: 1,
    nb_yellow: 1,
    nb_orange: 0,
    nb_blue: 0,
    nb_red: 0,
    nb_yellow_missiles: 0,
    nb_orange_missiles: 0,
    nb_hull: 1,
    nb_initiative: 2
  },
  Dreadnought: {
    nb_ships: 0,
    nb_shields: 0,
    nb_computers: 1,
    nb_yellow: 2,
    nb_orange: 0,
    nb_blue: 0,
    nb_red: 0,
    nb_yellow_missiles: 0,
    nb_orange_missiles: 0,
    nb_hull: 2,
    nb_initiative: 1
  },
  Starbase: {
    nb_ships: 0,
    nb_shields: 0,
    nb_computers: 1,
    nb_yellow: 1,
    nb_orange: 0,
    nb_blue: 0,
    nb_red: 0,
    nb_yellow_missiles: 0,
    nb_orange_missiles: 0,
    nb_hull: 2,
    nb_initiative: 4
  }
}

if (Globals.TEST){
  defaults.Starbase.nb_ships = 3
  defaults.Starbase.nb_yellow = 4
}

function Selector(props){

  return(
  <FormControl fullWidth sx={{width:100, p:1}}>
    <InputLabel id={props.label}>{props.labelname}</InputLabel>
    <Select
      labelId={props.label}
      id={props.label + "_selector"}
      defaultValue={props.value}
      value={props.value}
      label={props.labelname}
      onChange={props.callback}
    >
      {[...Array(6)].map((e, i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
    </Select>
  </FormControl>
)}

export function ShipSelect(props) {
  const [nb_ships, setnb_ships] = React.useState(0);
  const [nb_shields, setnb_shields] = React.useState(0);
  const [nb_computers, setnb_computers] = React.useState(0);
  const [nb_yellow, setnb_yellow] = React.useState(0);
  const [nb_orange, setnb_orange] = React.useState(0);
  const [nb_blue, setnb_blue] = React.useState(0);
  const [nb_red, setnb_red] = React.useState(0);
  const [nb_yellow_missiles, setnb_yellow_missiles] = React.useState(0);
  const [nb_orange_missiles, setnb_orange_missiles] = React.useState(0);
  const [nb_hull, setnb_hull] = React.useState(0);
  const [nb_initiative, setnb_initiative] = React.useState(0);  
  
  // hook for resetting to defaults for parent to use
  React.useEffect(() => {
    console.log('Resetting to Default');
    setnb_ships(defaults[props.shipType].nb_ships);
    setnb_shields(defaults[props.shipType].nb_shields);
    setnb_computers(defaults[props.shipType].nb_computers);
    setnb_yellow(defaults[props.shipType].nb_yellow);
    setnb_orange(defaults[props.shipType].nb_orange);
    setnb_blue(defaults[props.shipType].nb_blue);
    setnb_red(defaults[props.shipType].nb_red);
    setnb_yellow_missiles(defaults[props.shipType].nb_yellow_missiles);
    setnb_orange_missiles(defaults[props.shipType].nb_orange_missiles);
    setnb_hull(defaults[props.shipType].nb_hull);
    setnb_initiative(defaults[props.shipType].nb_initiative);
  }, [props.reset_trigger]);

  React.useEffect(() => {
    if (props.begin_battle_trigger) {
      console.log("Updating data")
      props.data.current[props.shipType] = {
        'nb_ships': nb_ships,
        'nb_shields': nb_shields,
        'nb_computers': nb_computers,
        'nb_yellow': nb_yellow,
        'nb_orange': nb_orange,
        'nb_blue': nb_blue,
        'nb_red': nb_red,
        'nb_yellow_missiles': nb_yellow_missiles,
        'nb_orange_missiles': nb_orange_missiles,
        'nb_hull': nb_hull,
        'nb_initiative': nb_initiative,
      }
      // use the setter
      props.setup_trigger(1)
    }
  }, [props.begin_battle_trigger]);

  return (
    <Box m="auto">
      <Box m="auto" sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems:'center', padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
        <Selector labelname="# of Ships" label="nb_ships" value={nb_ships} callback={(event) => {setnb_ships(event.target.value)}} />
        <Selector labelname="Shields" label="nb_shields" value={nb_shields} callback={(event) => {setnb_shields(event.target.value)}} />
        <Selector labelname="Computers" label="nb_computers" value={nb_computers} callback={(event) => {setnb_computers(event.target.value)}} />
        <Selector labelname="Hulls" label="nb_hull" value={nb_hull} callback={(event) => {setnb_hull(event.target.value)}} />
        <Selector labelname="Iniative" label="nb_initiative" value={nb_initiative} callback={(event) => {setnb_initiative(event.target.value)}} />
      </Box>
      <Box m="auto" sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems:'center', padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
        <h5>Cannons</h5>
        <Selector labelname="Yellow" label="nb_yellow" value={nb_yellow} callback={(event) => {setnb_yellow(event.target.value)}} />
        <Selector labelname="Orange" label="nb_orange" value={nb_orange} callback={(event) => {setnb_orange(event.target.value)}} />
        <Selector labelname="Blue" label="nb_blue" value={nb_blue} callback={(event) => {setnb_blue(event.target.value)}} />
        <Selector labelname="Red" label="nb_red" value={nb_red} callback={(event) => {setnb_red(event.target.value)}} />
      </Box>
      <Box m="auto" sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems:'center', padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
        <h5>Missiles</h5>
        <Selector labelname="Yellow" label="nb_yellow_missiles" value={nb_yellow_missiles} callback={(event) => {setnb_yellow_missiles(event.target.value)}} />
        <Selector labelname="Orange" label="nb_orange_missiles" value={nb_orange_missiles} callback={(event) => {setnb_orange_missiles(event.target.value)}} />
      </Box>
    </Box>
  );
}