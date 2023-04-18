import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack'
import { Modal } from "@mui/material";
import {Typography} from '@mui/material';
import {Divider} from '@mui/material';
import explosion from '../assets/explosion_lowres.png'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AreYouSure from './alert';
import * as Icons from './icons'
import * as Globals from '../globals'


function active_player(props){
  // List each dice, recall: each die must be distributed entirely to one ship
  return(
    <Box sx={{margin:'10px', width: 400}}> 
    {props.hits.map((hit, idx) => (
      <Droppable droppableId={`active_droppable_${idx}`}>
        {provided => (
          <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}>
            <Draggable draggableId={`${idx}`} dmg={hit[2]} index={0}>
              {provided => (
              <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps} >
                          
                <Stack direction='row' alignItems="center" justifyContent="" spacing={0} sx={{padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
                  <Icons.DamageGiven content={hit[2]} />
                  <Icons.Dice content={hit[1]} />
                  <Icons.Icon content='Drag Me!' />
                </Stack>
              </div>
              )}</Draggable>
            {provided.placeholder}
          </div>          
      )}</Droppable>
    ))}
    </Box>
  )
}

function inactive_player(props){

  // list of active ships, current damage, and computer
  return(
    <Box sx={{margin:'10px', width: 'auto'}}> 
    {props.inactive_ships.map((inactive_ship) => {
      let ShipIcon = Icons.ShipIcons[inactive_ship.shipType]
      return (
      <Droppable droppableId={`${inactive_ship.id}`}>
        {provided => (
        <div
                    ref={provided.innerRef}
                    {...provided.droppableProps} >
          <Stack 
          direction='row' alignItems="center" justifyContent="space-between" spacing={0} sx={{padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
            <ShipIcon content='' />
            <Icons.Shields content={inactive_ship.nb_shields} />
            <Icons.Hulls content={inactive_ship.nb_hull} />
            <Icons.Damage content={inactive_ship.damage_taken} />
            {provided.placeholder} 
          </Stack>
        </div>
      )}</Droppable>
    )})}
    </Box>
  )
}

export default function HitsModal(props) { 
  const [open_alert, setopen_alert] = React.useState(false);
  var b_areyousure = false;

  // https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/responders.md#ondragend-required 
  function onDragEnd(result, provided) {
    if (!result.destination) {
      return;
    }
    if (result.destination.droppableId.includes('active')){
      // dropping on the active side, do nothing
      return;
    }
    // extract the ship elem
    var inactive_ship_id = parseInt(result.destination.droppableId)
    var hit_idx = parseInt(result.draggableId)
    if (props.hits[hit_idx] != undefined) { // checks for existance
      var dmg = props.hits[hit_idx][2]
      var aided_roll = props.hits[hit_idx][1]

      // ensure Computer-Aided roll beats shields
      if (!(inactive_ship_id in props.ship_dct)){
        console.log("something went wrong...")
        console.log(props.ship_dct, inactive_ship_id)
      }

      if (aided_roll - props.ship_dct[inactive_ship_id].nb_shields >= 6){
        props.dmg_ship(inactive_ship_id, dmg)
        // update the hits list
        props.hits.splice(hit_idx, 1)
        console.log("New Hits: ", props.hits)
        props.sethits([...props.hits]) // must be a new array otherwise won't rerender
      } else {
        // modal to ensure player wants to waste the shot
        setopen_alert(true)
      }
    } else {
      console.log("something went wrong...")
      console.log(props.hits, hit_idx)
    }
  }

  // effect to auto-close modal when all hits have been attributed
  var hits_length = props.hits.length
  var inactive_ships_length = props.inactive_ships.length
  var open = props.open
  React.useEffect(() => {
    if (open & (hits_length === 0 | inactive_ships_length === 0)){
      // close modal
      props.onClose(false)
    }
  }, [open, hits_length, inactive_ships_length])

return(
  <DragDropContext onDragEnd={onDragEnd}>
  <Modal
    open={props.open}
    onClose={props.onClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
    sx={{display:'flex',alignItems:'center',justifyContent:'center', width:'auto', height:'auto', outline:0}}>

    <Stack direction='column' alignItems="center" spacing={0} sx={{width:'auto', height:'auto', padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
      {/* Title */}
      <Typography id="modal-modal-title" variant="h5" component="h2">Hits Attribution</Typography>

      <Divider flexItem={true} />

      <Stack direction='row'>

      {/* Attacker Side */}
      <Typography id="modal-modal-title" variant="h5" component="h2">Attacker</Typography>
      {props.active_player === "Attacker" ? active_player(props) : inactive_player(props)}
      {/******** Controls *********/}
      
      <Divider flexItem={true} orientation='vertical'/>


      {/* Defender Side */}
      {props.active_player === "Defender" ? active_player(props) : inactive_player(props)}
      <Typography id="modal-modal-title" variant="h5" component="h2">Defender</Typography>

      </Stack>
    </Stack>
  </Modal>
  <AreYouSure open={open_alert} setOpen={setopen_alert} b_areyousure={b_areyousure} dialog={"Due to the opponent's shields, you're about to waste this roll. Are you sure?"}/>
  </DragDropContext>
  )
}