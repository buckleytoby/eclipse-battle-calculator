import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack'
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import hand from '../assets/pointing-to-right.png';
import { Button, List } from '@mui/material';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import RadioAttackRetreat from './radio';
import Confirm_modal from './confirm_modal';
import * as Globals from '../globals';


class Ship{
  constructor (shipType) {
    this.shipType = shipType;
    this.b_has_missiles = true;
    this.nb_ships= 0;
    this.nb_shields= 0;
    this.nb_computers= 0;
    this.nb_yellow= 0;
    this.nb_orange= 0;
    this.nb_red= 0;
    this.nb_yellow_missiles= 0;
    this.nb_orange_missiles= 0;
    this.nb_hull= 0;
    this.nb_initiative= 0;

    this.retreating = false;
    this.retreated = false;
  }
  set_battle_stats(data, playerType){
    this.nb_ships = data.nb_ships;
    this.nb_shields = data.nb_shields;
    this.nb_computers = data.nb_computers;
    this.nb_yellow = data.nb_yellow;
    this.nb_orange = data.nb_orange;
    this.nb_red = data.nb_red;
    this.nb_yellow_missiles = data.nb_yellow_missiles;
    this.nb_orange_missiles = data.nb_orange_missiles;
    this.nb_hull = data.nb_hull;
    this.nb_initiative = data.nb_initiative;
    if (playerType == "Defender"){this.nb_initiative += 0.5} // Defender advantage
  }
}

class Player{
  constructor(playerType){
    this.playerType = playerType;
    this.auto_damage_on = false;
    this.ships = Object.fromEntries( Globals.shipTypes.map((shipType, idx) => ([shipType, new Ship(shipType)])) ) // make object
  }
  set_battle_stats(data){
    console.log(data)
    console.log(this.ships)
    Object.keys(data).forEach((shipType) => {
      console.log(this.ships);
      console.log(shipType);
      this.ships[shipType].set_battle_stats(data[shipType], this.playerType)
    })}
}

var dice = {
  sides: 6,
  roll: function () {
    var randomNumber = Math.floor(Math.random() * this.sides) + 1;
    return randomNumber;
  }
}

export default function BattleSim(props) {
  const [log, setlog] = React.useState(['log empty'])
  const [playerType, setplayerType] = React.useState('Attacker')
  const [order, setorder] = React.useState([])
  const [order_id, setorder_id] = React.useState(0)
  const [attacker_updated, setattacker_updated] = React.useState(false)
  const [defender_updated, setdefender_updated] = React.useState(false)
  const [battle_ready, setbattle_ready] = React.useState(false)

  const players = React.useRef({'Attacker': new Player('Attacker'), 'Defender': new Player('Defender')})
  
  // Use the same interface as https://s3.amazonaws.com/eclipse-calculator/eclipse-calculator.htm to setup attacker and defender armies

  const add_to_log = (new_log) => {
    log.push(new_log)
    setlog(log)
  }

  const calc_battle_order = () => {
    // determine battle order
    var ls = []
    // construct list of [playerType, shipType, initiative]
    Object.keys(players.current).forEach((playerType) => (
      Globals.shipTypes.forEach((shipType) => (
        ls.push([playerType, shipType, players.current[playerType].ships[shipType].nb_initiative])
      ))
    ))
    ls.sort((a, b) => {
        return b[2] - a[2]; // query the initiative
    });
    // set order state, reset the order_id, reset player to first
    setorder(ls);
    setorder_id(0);
    setplayerType(ls[0][Globals.ORDER_PLAYER])
    console.log(ls)
  }

  const begin_battle = () => {
    // trigger battle
    props.begin_battle_trigger_fcn();
  }

  React.useEffect(() => {
    if (attacker_updated & defender_updated) {
      calc_battle_order()
      console.log("Battle Order ")
      add_to_log("Battle Order Calculated.")
      setbattle_ready(true)
      }
  }, [attacker_updated, defender_updated]);

  React.useEffect(() => {
    if (props.defender_setup) {
      // Load Attacker
      players.current['Defender'].set_battle_stats(props.data_defender.current)
      console.log(props.data_defender.current)
      add_to_log("Defender Stats Successfully loaded.")
      setdefender_updated(true);
      }
  }, [props.defender_setup]);

  React.useEffect(() => {
    if (props.attacker_setup) {
      // Load Attacker
      players.current['Attacker'].set_battle_stats(props.data_attacker.current)
      add_to_log("Attacker Stats Successfully loaded.")
      setattacker_updated(true);
      }
  }, [props.attacker_setup]);

  // reset battle
  const reset_battle = () => {
    setattacker_updated(false)
    setdefender_updated(false)
    setbattle_ready(false)
  }

  // hit determiner
  const calc_hit_roll = (ship) => {
    var result = dice.roll()
    // auto miss if one
    if (result == 1){return 0}
    // auto hit if 6
    if (result == 6){return 99}
    // else, add computer
    return result + ship.nb_computers;
  }

  //
  const increment_order = () => {
    do {
    var new_order_id = order_id + 1 % order.length
    setorder_id(new_order_id);
    setplayerType(order[order_id][Globals.ORDER_PLAYER])
    // extract the ship
    var player = players.current[playerType]
    var ship = player.ships[order[new_order_id][Globals.ORDER_SHIP]]
    var retreated = ship.retreated
    console.log(order[new_order_id])
    console.log(`Retreated: ${retreated}`)
     } while (retreated);
  }
  
  // Battle code
  const step_engagement_round = () => {
    if (! battle_ready){
      console.log("Wait for setup to complete")
      add_to_log("Wait for setup to complete")
      return;
    }
    let shipType = order[order_id][1]
    let player = players.current[playerType]
    let ship = player.ships[shipType]
    let hits = []
    let result = 0;
    // Missiles
    if (ship.b_has_missiles) {
      // roll for missiles
      Array(ship.nb_yellow_missiles).forEach(() => {
        result = calc_hit_roll(ship)
        if (result >= 6){
          hits.push([result, Globals.damages['yellow_missiles']])
        }
      })
      Array(ship.nb_orange_missiles).forEach(() => {
        result = calc_hit_roll(ship)
        if (result >= 6){
          hits.push([result, Globals.damages['orange_missiles']])
        }
      })
      ship.b_has_missiles = false;
    }
    else{ // Loop engagement rounds
      if (ship.retreating){ // Retreat
        // succesfully retreated
        ship.retreated = true;
        add_to_log(`${ship.nb_ships} ${ship.shipType}'s have succesfully escaped`)
      }
      else{ // Roll cannons
        Array(ship.nb_yellow).forEach(() => {
          result = calc_hit_roll(ship)
          if (result >= 6){
            hits.push([result, Globals.damages['yellow_cannon']])
          }
        })
        Array(ship.nb_orange).forEach(() => {
          result = calc_hit_roll(ship)
          if (result >= 6){
            hits.push([result, Globals.damages['orange_cannon']])
          }
        })
        Array(ship.nb_red).forEach(() => {
          result = calc_hit_roll(ship)
          if (result >= 6){
            hits.push([result, Globals.damages['red_cannon']])
          }
        })
        Array(ship.nb_blue).forEach(() => {
          result = calc_hit_roll(ship)
          if (result >= 6){
            hits.push([result, Globals.damages['blue_cannon']])
          }
        })
      }
    }
    // Distribute Damage like the AI
    if (player.auto_damage_on){
      // Kill ships biggest to smallest
  
      // Place rest of remaining damage on largest ship

    }
    else{
      // Maybe a modal asking user to distribute dices of damage?
    }


    // Increment the order #
    increment_order()
    
    // Check if battle over

  }


  return(
  <Box sx={{width:1500, height:500}}>
    <Stack direction='row' justifyContent="space-between" sx={{width:1500}}>
      {/* Attacker Side */}
      <Box sx={{margin:'10px', width: 400}}> 
        {Globals.shipTypes.map((ship) => (
          <Stack direction='row' alignItems="center" justifyContent="space-between" spacing={0} sx={{margin:'10px'}}>
            <Paper>{ship}</Paper>
            <Paper>Count</Paper>
            <RadioAttackRetreat ></RadioAttackRetreat>
            <Box sx={{ visibility: 'hidden' }}><img width={25} height={25} src={hand} alt="hand" /></Box>
          </Stack>
        ))}
      </Box>

      {/******** Controls *********/}
      <Stack justifyContent="space-evenly" sx={{margin:'10px', height: 500, width: 400}}> 
          <Button variant="contained" size="large" onClick={begin_battle}>Begin Battle</Button>
          <Button variant="contained" size="large" onClick={step_engagement_round}>Roll</Button>
          <Confirm_modal></Confirm_modal>
          <Paper>
            <List sx={{height:300}}>
            {log.map((entry) => (
              <Box>
              <ListItem>
                <ListItemText primary={entry} />
              </ListItem>
              <Divider />
              </Box>
            ))}
            </List>
          </Paper>
      </Stack>


      {/* Defender Side */}
      <Box sx={{margin:'10px', width: 400}}> 
        {Globals.shipTypes.map((ship) => (
          <Stack direction='row' alignItems="center" spacing={0} justifyContent="space-between" sx={{margin:'10px'}}>
            <Box sx={{ visibility: 'hidden' }} ><img width={25} height={25} src={hand} alt="hand" /></Box>
            <Paper>{ship}</Paper>
            <Paper>Count</Paper>
            <FormControlLabel control={<Switch />} label="Retreat" />
            <FormControlLabel control={<Switch defaultChecked />} label="Attack" />
          </Stack>
        ))}
      </Box>
    </Stack>
  </Box>
  )
}