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
import HitsModal from './hits_modal';

class Ship{
  constructor (shipType, nb_hull, nb_shields){
    this.shipType = shipType
    this.nb_hull = nb_hull
    this.nb_shields = nb_shields
    this.damage_taken = 0
    // bind functions
    this.is_dead = this.is_dead.bind(this);
  }
  is_dead(){
    // if # of hulls + 1 base hp <= amount of damage taken
    return (this.nb_hull + 1) <= this.damage_taken
  }
}

class Ships{
  constructor (shipType) {
    this.shipType = shipType;
    this.b_has_missiles = false;
    this.nb_ships= 0;
    this.nb_shields= 0;
    this.nb_computers= 0;
    this.nb_yellow= 0;
    this.nb_orange= 0;
    this.nb_blue = 0;
    this.nb_red= 0;
    this.nb_yellow_missiles= 0;
    this.nb_orange_missiles= 0;
    this.nb_hull= 0;
    this.nb_initiative= 0;
    this.active_ships = [];

    this.wants_to_retreat = false; // asynch
    this.retreating = false; // triggers on engagement round
    this.RadioAttackRetreatValue = "attack";
    this.retreated = false; // triggers on engagement round after retreating has been triggered
    // bind functions
    this.set_battle_stats = this.set_battle_stats.bind(this);
    this.set_retreat_attack = this.set_retreat_attack.bind(this);
    this.make_active_ships = this.make_active_ships.bind(this);
    this.get_active_ships = this.get_active_ships.bind(this);
  }
  set_battle_stats = (data, playerType) => {
    this.nb_ships = data.nb_ships;
    this.nb_shields = data.nb_shields;
    this.nb_computers = data.nb_computers;
    this.nb_yellow = data.nb_yellow;
    this.nb_orange = data.nb_orange;
    this.nb_blue = data.nb_blue;
    this.nb_red = data.nb_red;
    this.nb_yellow_missiles = data.nb_yellow_missiles;
    this.nb_orange_missiles = data.nb_orange_missiles;
    this.nb_hull = data.nb_hull;
    this.nb_initiative = data.nb_initiative;
    if (playerType == "Defender"){this.nb_initiative += 0.5} // Defender advantage
    if (this.nb_yellow_missiles > 0 | this.nb_orange_missiles > 0){this.b_has_missiles = true}
    this.make_active_ships()
  }
  set_retreat_attack = (event) => {
    this.RadioAttackRetreatValue = event.target.value;
    if (this.RadioAttackRetreatValue == "retreat"){
      this.wants_to_retreat = true
    }
    else if(this.RadioAttackRetreatValue == "attack"){
      this.wants_to_retreat = false
    }
  }
  make_active_ships = () => {
  // make enumeration of all active ships
  var activeShips = [];
  [...Array(this.nb_ships)].forEach((_) => (
    activeShips.push(new Ship(this.shipType, this.nb_hull, this.nb_shields))
  ))
  this.active_ships = activeShips
  }
  get_active_ships = () => {
    return this.active_ships
  }
}

class Player{
  constructor(playerType){
    this.playerType = playerType;
    this.auto_damage_on = false;
    // ships is an object (i.e. key-value pairs)
    this.ships = Object.fromEntries( Globals.shipTypes.map((shipType, idx) => ([shipType, new Ships(shipType)])) )
    this.set_battle_stats = this.set_battle_stats.bind(this);
    this.get_active_ships = this.get_active_ships.bind(this);
    this.is_active = this.is_active.bind(this);
  }
  set_battle_stats = (data) => {
    Object.keys(data).forEach((shipType) => {
      this.ships[shipType].set_battle_stats(data[shipType], this.playerType)
    })}
  get_active_ships = () => {
    var active_ships = []
    Object.keys(this.ships).forEach((ship) =>{
      active_ships = active_ships.concat(this.ships[ship].get_active_ships())
    })
    return active_ships
  }
  is_active = () => {
    // single line if-else
    var out = this.get_active_ships().length > 0 ? true : false
    return out
  }
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
  const [missile_order, setmissile_order] = React.useState([])
  const [missile_id, setmissile_id] = React.useState(0)
  const [b_missile_round, setb_missile_round] = React.useState(true)
  const [attacker_updated, setattacker_updated] = React.useState(false)
  const [defender_updated, setdefender_updated] = React.useState(false)
  const [battle_ready, setbattle_ready] = React.useState(false)
  const [hits_open, sethits_open] = React.useState(false)
  const [hits, sethits] = React.useState([])
  const [b_battle_over, setb_battle_over] = React.useState(false)

  const players = React.useRef({'Attacker': new Player('Attacker'), 'Defender': new Player('Defender')})
  const scrollbar_ref = React.useRef()
  
  // Use the same interface as https://s3.amazonaws.com/eclipse-calculator/eclipse-calculator.htm to setup attacker and defender armies

  const add_to_log = (new_log) => {
    log.push(new_log)
    setlog(log)
    // scroll to bottom
    scrollbar_ref.current.scrollIntoView({ behavior: "smooth" })
  }

  const calc_battle_order = () => {
    // determine battle order
    var ls = []
    var ls_missile = []
    // construct list of [playerType, shipType, initiative]
    // TODO: move this to a class method and concat the lists
    Object.keys(players.current).forEach((playerType) => (
      Globals.shipTypes.forEach((shipType) => {
        let ship = players.current[playerType].ships[shipType]
        if(ship.nb_ships > 0){
          ls.push([playerType, shipType, ship.nb_initiative])
        }
        if (ship.nb_ships > 0 & ship.b_has_missiles){
          ls_missile.push([playerType, shipType, ship.nb_initiative])
        }
      })))
    ls.sort((a, b) => {return b[2] - a[2]}) // query the initiative 
    ls_missile.sort((a, b) => {return b[2] - a[2]}) // query the initiative 
    // check for no ships
    if (ls.length == 0 & ls_missile.length == 0){
      add_to_log("There are no ships in this battle.")
      return false;
    } // set order state, reset the order_id, reset player to first
    if (ls.length  > 0) {setorder(ls); setorder_id(0); setplayerType(ls[0][Globals.ORDER_PLAYER])}
    // check if skip missile round
    if (ls_missile.length == 0){
      setb_missile_round(false);
    } else{setmissile_order(ls_missile); setmissile_id(0); setplayerType(ls_missile[0][Globals.ORDER_PLAYER])}
    
    return true;
  }

  const begin_battle = () => {
    // trigger battle
    reset_battle();
    props.begin_battle_trigger_fcn();
  }

  React.useEffect(() => {
    /////////////     BECOME BATTLE READY     /////////////
    if (attacker_updated & defender_updated) {
      // check for each side to have at least 1 ship
      if (!players.current['Attacker'].is_active() & !players.current['Attacker'].is_active()){
        add_to_log("No ships in battle. Redo battle parameters and try again.")
        return
      }
      if (!players.current['Attacker'].is_active()){
        add_to_log("Attacker has no ships. Defender automatically wins")
        return
      }
      if (!players.current['Defender'].is_active()){
        add_to_log("Defender has no ships. Attacker automatically wins")
        return
      }
      // calculate battle order
      var b_battle_ready = calc_battle_order()
      // TODO: grey out divs which aren't active
      if (b_battle_ready){
        add_to_log("Battle Order Calculated.")
        setbattle_ready(true)
      }}
  }, [attacker_updated, defender_updated]);

  React.useEffect(() => {
    if (props.defender_setup) {
      // Load Attacker
      players.current['Defender'].set_battle_stats(props.data_defender.current)
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

  React.useEffect(() => {
    if (b_battle_over){
      reset_battle()
    }
  }, [b_battle_over])

  // hit determiner
  const calc_hit_roll = (computers) => {
    var result = dice.roll()
    // auto miss if one
    if (result == 1){return 0}
    // auto hit if 6
    if (result == 6){return 99}
    // else, add computer
    return result;
  }
  // get ship hits
  const get_hits = (hits, ship, nb_die, dmgType) => {
    [...Array(nb_die)].forEach(() => {
      var result = calc_hit_roll(ship.nb_computers)
      if (result + ship.nb_computers >= 6){
        hits.push( [result, result + ship.nb_computers, Globals.damages[dmgType]] )
      }
    })
  }
  //
  const increment_order = () => {
    // if missile round
    if (b_missile_round){
      var new_id = missile_id + 1
      if (new_id >= missile_order.length){
        setb_missile_round(false);
        // special case: some missiles and no cannons: attacker is forced to retreat...
        if (order.length == 0){
          setb_battle_over(true)
          add_to_log("No ships have cannons. Attacker is forced to retreat. Battle over.")
        }
      }
      else{
        setmissile_id(new_id);
        setplayerType(missile_order[new_id][Globals.ORDER_PLAYER])
        // extract the ship
        var retreated = players.current[playerType].ships[order[new_order_id][Globals.ORDER_SHIP]].retreated
      }
    }
    else{
      do {
        var new_order_id = (order_id + 1) % order.length
        setorder_id(new_order_id);
        setplayerType(order[new_order_id][Globals.ORDER_PLAYER])
        // extract the ship
        var player = players.current[playerType]
        var ship = player.ships[order[new_order_id][Globals.ORDER_SHIP]]
        var retreated = players.current[playerType].ships[order[new_order_id][Globals.ORDER_SHIP]].retreated
      } while (retreated); // skip to next ship if this one has retreated
    }
  }
  
  // Battle code
  const step_engagement_round = () => {
    if (Globals.TEST){
      sethits_open(true); // test the modal
    }
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
    // 
    add_to_log(`${playerType} is attacking with ${ship.nb_ships} ${shipType}'s`)
    console.log(ship)
    // Missiles
    if (b_missile_round) {
      // roll for missiles
      get_hits(hits, ship, ship.nb_yellow_missiles, "yellow_missiles")
      get_hits(hits, ship, ship.nb_orange_missiles, "orange_missiles")
      // set missile status to none
      ship.b_has_missiles = false
    }
    else{ // Loop engagement rounds
      if (ship.wants_to_retreat){ // Begin retreating
        ship.retreating = true;
      }
      else if (ship.retreating){ // Retreat
        // succesfully retreated
        ship.retreated = true;
        add_to_log(`${ship.nb_ships} ${ship.shipType}'s have succesfully escaped`)
      }
      else{ // Roll cannons
        get_hits(hits, ship, ship.nb_yellow, "yellow_cannon")
        get_hits(hits, ship, ship.nb_orange, "orange_cannon")
        get_hits(hits, ship, ship.nb_blue, "blue_cannon")
        get_hits(hits, ship, ship.nb_red, "red_cannon")
      }
    }
    if (hits.length >0){
      console.log(hits)
      add_to_log(`Hit! ${playerType}'s ${shipType}'s hit with ${hits.length} roll(s)`)
        
      // Distribute Damage like the AI
      if (player.auto_damage_on){
        // Kill ships biggest to smallest
    
        // Place rest of remaining damage on largest ship

      }
      else{
        // Maybe a modal asking user to distribute dices of damage?
        sethits(hits)
        sethits_open(true)
      }
    }
    // Increment the order #
    increment_order()
    
    // Check if battle over


  }

  var hits_onClose_cb = (event) => {
    // 
    sethits_open(false)
  }


  return(
  <Box sx={{width:1500, height:500}}>
    <Stack direction='row' justifyContent="space-between" sx={{width:1500}}>
      {/* Attacker Side */}
      <Box sx={{margin:'10px', width: 400}}> 
        {Globals.shipTypes.map((shipType) => (
          <Stack direction='row' alignItems="center" justifyContent="space-between" spacing={0} sx={{padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
            <Paper>{shipType}</Paper>
            <Paper>Count</Paper>
            <RadioAttackRetreat onChange={players.current['Attacker'].ships[shipType].set_retreat_attack}></RadioAttackRetreat>
            <Box sx={{ visibility: 'hidden' }}><img width={25} height={25} src={hand} alt="hand" /></Box>
          </Stack>
        ))}
      </Box>

      {/******** Controls *********/}
      <Stack justifyContent="space-evenly" sx={{margin:'10px', height: 500, width: 400}}> 
          <Button variant="contained" size="large" onClick={begin_battle}>Begin Battle</Button>
          <Button variant="contained" size="large" onClick={step_engagement_round}>Roll</Button>
          <Confirm_modal></Confirm_modal>
          <Paper style={{maxHeight: 200, overflow: 'auto'}}>
            <List sx={{height:300}}>
            {log.map((entry) => (
              <Box>
              <ListItem>
                <ListItemText primary={entry} />
              </ListItem>
              <Divider />
              </Box>
            ))}
            {/* dummy div to scroll to bottom of list */}
            <div style={{ float:"left", clear: "both" }}
             ref={(el) => { scrollbar_ref.current = el; }}>
            </div>
            </List>
          </Paper>
      </Stack>

      <HitsModal active_ships={players.current[playerType].get_active_ships()} open={hits_open} onClose={hits_onClose_cb} active_player={playerType} hits={hits}/>


      {/* Defender Side */}
      <Box sx={{margin:'10px', width: 400}}> 
        {Globals.shipTypes.map((shipType) => (
          <Stack direction='row' alignItems="center" justifyContent="space-between" spacing={0} sx={{padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
            <Box sx={{ visibility: 'hidden' }} ><img width={25} height={25} src={hand} alt="hand" /></Box>
            <Paper>{shipType}</Paper>
            <Paper>Count</Paper>
            <RadioAttackRetreat onChange={players.current['Defender'].ships[shipType].set_retreat_attack}></RadioAttackRetreat>
          </Stack>
        ))}
      </Box>
    </Stack>
  </Box>
  )
}