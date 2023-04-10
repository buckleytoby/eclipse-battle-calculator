import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack'
import { Button, List } from '@mui/material';
import { Modal } from "@mui/material";
import {Typography} from '@mui/material';
import {Divider} from '@mui/material';

function active_player(props){
  // List each dice, recall: each die must be distributed entirely to one ship
  return(
    <Box sx={{margin:'10px', width: 400}}> 
    {props.hits.map((hit) => (
      <Stack direction='row' alignItems="center" justifyContent="space-between" spacing={0} sx={{padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
        <Paper>Damage: {hit[2]}</Paper>
        <Paper>Roll #: {hit[0]}</Paper>
        <Paper>Roll & Computers #: {hit[1]}</Paper>
      </Stack>
    ))}
    </Box>
  )
}

function inactive_player(props){
  // list of active ships, current damage, and computer
  return(
    <Box sx={{margin:'10px', width: 400}}> 
    {props.active_ships.map((active_ship) => (
      <Stack direction='row' alignItems="center" justifyContent="space-between" spacing={0} sx={{padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
        <Paper>{active_ship.shipType}</Paper>
        <Paper># Hulls: {active_ship.nb_hull}</Paper>
        <Paper># Shields: {active_ship.nb_shields}</Paper>
        <Paper>Current Damage: {active_ship.damage_taken}</Paper>
      </Stack>
    ))}
    </Box>
  )
}

export default function HitsModal(props) {
return(
  <Modal
    open={props.open}
    onClose={props.onClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
    sx={{display:'flex',alignItems:'center',justifyContent:'center', width:'auto', height:'auto', outline:0}}>

    <Stack direction='column' alignItems="center" spacing={0} sx={{width:'auto', height:'auto', padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
      {/* Title */}
      <Typography id="modal-modal-title" variant="h5" component="h2">Hits Attribution</Typography>

      <Divider flexItem='true' />

      <Stack direction='row'>

      {/* Attacker Side */}
      <Typography id="modal-modal-title" variant="h5" component="h2">Attacker</Typography>
      {props.active_player == "Attacker" ? active_player(props) : inactive_player(props)}
      {/******** Controls *********/}
      
      <Divider flexItem='true' orientation='vertical'/>


      {/* Defender Side */}
      {props.active_player == "Defender" ? active_player(props) : inactive_player(props)}
      <Typography id="modal-modal-title" variant="h5" component="h2">Defender</Typography>

      </Stack>
    </Stack>
  </Modal>
  )
}