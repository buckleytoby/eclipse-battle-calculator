import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


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

export function ShipSelect() {
  const [nb_ships, setnbShips] = React.useState('');
  const [nb_shields, setshields] = React.useState('');
  const [nb_computers, setComputers] = React.useState('');
  const [nb_yellow, setnb_yellow] = React.useState('');
  const [nb_orange, setnb_orange] = React.useState('');
  const [nb_red, setnb_red] = React.useState('');
  const [nb_yellow_missiles, setnb_yellow_missiles] = React.useState('');
  const [nb_orange_missiles, setnb_orange_missiles] = React.useState('');
  const [nb_hull, setnb_hull] = React.useState('');
  const [nb_initiative, setnb_initiative] = React.useState('');  

  return (
    <Box>
      <FormControl fullWidth sx={{width:100, p:1}}> {/* Nb Ships */}
        <InputLabel id="nb_ships"># of Ships</InputLabel>
        <Select
          labelId="nb_ships"
          id="ships_select"
          value={nb_ships}
          label="# of Ships"
          onChange={(event) => {setnbShips(event.target.value)}}
        >
          {[...Array(6)].map((e, i) => <MenuItem value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{width:100, p:1}}> {/* Shields */}
        <InputLabel id="shields">Shields</InputLabel>
        <Select
          labelId="shields"
          id="shields_select"
          value={nb_shields}
          label="Shields"
          onChange={(event) => {setshields(event.target.value)}}
        >
          {[...Array(6)].map((e, i) => <MenuItem value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{width:100, p:1}}> {/* Computers */}
        <InputLabel id="Computers">Computers</InputLabel>
        <Select
          labelId="Computers"
          id="Computers_select"
          value={nb_computers}
          label="Computers"
          onChange={(event) => {setComputers(event.target.value)}}
        >
          {[...Array(6)].map((e, i) => <MenuItem value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{width:100, p:1}}> {/* Hulls */}
        <InputLabel id="Hulls">Hulls</InputLabel>
        <Select
          labelId="Hulls"
          id="Hulls_select"
          value={nb_hull}
          label="Hulls"
          onChange={(event) => {setnb_hull(event.target.value)}}
        >
          {[...Array(6)].map((e, i) => <MenuItem value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{width:100, p:1}}> {/* Initiative */}
        <InputLabel id="Initiative">Initiative</InputLabel>
        <Select
          labelId="Initiative"
          id="Initiative_select"
          value={nb_initiative}
          label="Initiative"
          onChange={(event) => {setnb_initiative(event.target.value)}}
        >
          {[...Array(6)].map((e, i) => <MenuItem value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>

      <Box
        sx={{
          bgcolor: 'background.paper',
          boxShadow: 1,
          borderRadius: 2,
          p: 1,
          width: 350,
        }}
      >
        <Box sx={{}}>Cannons</Box>

      <FormControl fullWidth sx={{width:100, p:1}}> {/* Yellow */}
        <InputLabel id="yellow_die"># Yellow</InputLabel>
        <Select
          labelId="yellow_die"
          id="yellow_die_select"
          value={nb_yellow}
          label="# Yellow Die"
          onChange={(event) => {setnb_yellow(event.target.value)}}
        >
          {[...Array(6)].map((e, i) => <MenuItem value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{width:100, p:1}}> {/* Orange Cannons */}
        <InputLabel id="oj_die"># Orange</InputLabel>
        <Select
          labelId="oj_die"
          id="oj_die_select"
          value={nb_orange}
          label="# Orange Die"
          onChange={(event) => {setnb_orange(event.target.value)}}
        >
          {[...Array(6)].map((e, i) => <MenuItem value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{width:100, p:1}}> {/* Red Cannons */}
        <InputLabel id="red_die"># Red</InputLabel>
        <Select
          labelId="red_die"
          id="red_die_select"
          value={nb_red}
          label="# Red Die"
          onChange={(event) => {setnb_red(event.target.value)}}
        >
          {[...Array(6)].map((e, i) => <MenuItem value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>

      </Box>

      <Box
        sx={{
          bgcolor: 'background.paper',
          boxShadow: 1,
          borderRadius: 2,
          p: 1,
          width: 250,
        }}
      >
        <Box sx={{}}>Missiles</Box>

      <FormControl fullWidth sx={{width:100, p:1}}> {/* Yellow Missiles*/}
        <InputLabel id="yellow_missiles"># Yellow</InputLabel>
        <Select
          labelId="yellow_missiles"
          id="yellow_missiles_select"
          value={nb_yellow_missiles}
          label="# Yellow Missiles"
          onChange={(event) => {setnb_yellow_missiles(event.target.value)}}
        >
          {[...Array(6)].map((e, i) => <MenuItem value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{width:100, p:1}}> {/* Orange Missiles */}
        <InputLabel id="oj_missiles"># Orange</InputLabel>
        <Select
          labelId="oj_missiles"
          id="oj_missiles_select"
          value={nb_orange_missiles}
          label="# Orange Missiles"
          onChange={(event) => {setnb_orange_missiles(event.target.value)}}
        >
          {[...Array(6)].map((e, i) => <MenuItem value={i}>{i}</MenuItem>)}
        </Select>
      </FormControl>
      </Box>


    </Box>
  );
}