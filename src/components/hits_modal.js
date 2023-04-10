import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack'
import { Button, List } from '@mui/material';
import { Modal } from "@mui/material";
import {Typography} from '@mui/material';
import {Divider} from '@mui/material';
import explosion from '../assets/explosion_lowres.png'
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

function active_player(props){
  // List each dice, recall: each die must be distributed entirely to one ship
  return(
    <Box sx={{margin:'10px', width: 400}}> 
    {props.hits.map((hit, idx) => (
      <Stack direction='row' alignItems="center" justifyContent="space-between" spacing={0} sx={{padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
        <Paper>Damage: {hit[2]}</Paper>
        <Paper>Roll #: {hit[0]}</Paper>
        <Paper>Computer-Aided Roll: {hit[1]}</Paper>
        <Droppable droppableId={`droppable_${idx}`}>
          {provided => (
            <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}>
              <Draggable draggableId={`draggable_${idx}`} index={0}>
                {provided => (
                <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps} >
                  <img width={25} height={25} src={explosion} alt="explosion" />
                </div>
                )}</Draggable>
              {provided.placeholder}
            </div>          
        )}</Droppable>
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
      <Droppable droppableId={`droppable_${active_ship.id}`}>
        {provided => (
        <div
                    ref={provided.innerRef}
                    {...provided.droppableProps} >
          <Stack 
          direction='row' alignItems="center" justifyContent="space-between" spacing={0} sx={{padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
            <Paper>{active_ship.shipType}</Paper>
            <Paper># Hulls: {active_ship.nb_hull}</Paper>
            <Paper># Shields: {active_ship.nb_shields}</Paper>
            <Paper>Current Damage: {active_ship.damage_taken}</Paper>
            {provided.placeholder} 
          </Stack>
        </div>
      )}</Droppable>
    ))}
    </Box>
  )
}

export default function HitsModal(props) { 
  // https://github.com/atlassian/react-beautiful-dnd/blob/master/docs/guides/responders.md#ondragend-required 
  function onDragEnd(result, provided) {
    if (!result.destination) {
      return;
    }
    if (result.destination.index === result.source.index) {
      return;
    }
  }
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
  </Modal></DragDropContext>
  )
}