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

const OtherPlayer = (playerType) => {
  return playerType === Globals.playerType[0] ? Globals.playerType[1] : Globals.playerType[0]
}

var ship_id = 0
var ship_dct = {}

class Ship{
  constructor (shipType, nb_hull, nb_shields){
    this.shipType = shipType
    this.nb_hull = nb_hull
    this.nb_shields = nb_shields
    this.damage_taken = 0
    this.id = ship_id; ship_id += 1
    // bind functions
    this.is_dead = this.is_dead.bind(this);
    this.receive_damage = this.receive_damage.bind(this);
    ship_dct[this.id] = this;
  }
  is_dead = () => {
    // if # of hulls + 1 base hp <= amount of damage taken
    return (this.nb_hull + 1) <= this.damage_taken
  }
  receive_damage = (dmg) => {
    this.damage_taken += dmg
    // cleanup
    if (this.is_dead()) {
      // delete ship_dct[this.id]
    }
  }
}

class ShipBlueprint{ // blueprint of one ship type (i.e. Interceptor, Cruiser, etc.) TODO: rename to ShipBlueprint
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
    this.get_nb_active_ships = this.get_nb_active_ships.bind(this);
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
    if (playerType === "Defender"){this.nb_initiative += 0.5} // Defender advantage
    if (this.nb_yellow_missiles > 0 | this.nb_orange_missiles > 0){this.b_has_missiles = true}
    this.make_active_ships()
  }
  set_retreat_attack = (event) => {
    this.RadioAttackRetreatValue = event.target.value;
    if (this.RadioAttackRetreatValue === "retreat"){
      this.wants_to_retreat = true
    }
    else if(this.RadioAttackRetreatValue === "attack"){
      this.wants_to_retreat = false
    }
  }
  make_active_ships = () => {
  // make enumeration of all active ships
  console.log("Making active Ships")
  var activeShips = [];
  [...Array(this.nb_ships)].forEach((_) => (
    activeShips.push(new Ship(this.shipType, this.nb_hull, this.nb_shields))
  ))
  this.active_ships = activeShips
  }
  update_active_ships = () => {
    // dead ships aren't active ships
    Object.keys(this.active_ships).forEach ((key) => {
      if (this.active_ships[key].is_dead()){
        console.log("Deleting ship: ", key)
        this.active_ships.splice(key, 1)
      }
    })
    console.log(this.active_ships)
  }
  get_active_ships = () => {
    return this.active_ships
  }
  get_nb_active_ships = () => {
    return Object.keys(this.active_ships).length
  }
}

class Player{
  constructor(playerType){
    this.playerType = playerType;
    this.auto_damage_on = false;
    // ships is an object (i.e. key-value pairs)
    this.ships = Object.fromEntries( Globals.shipTypes.map((shipType, idx) => ([shipType, new ShipBlueprint(shipType)])) )
    this.set_battle_stats = this.set_battle_stats.bind(this);
    this.get_active_ships = this.get_active_ships.bind(this);
    this.is_active = this.is_active.bind(this);
    this.print_active_ships = this.print_active_ships.bind(this);
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
  get_nb_active_ships = () => {
    var nb_active_ships = 0
    nb_active_ships = Object.keys(this.ships).reduce((accumulator, key) => (
      accumulator + this.ships[key].get_nb_active_ships()
    ), nb_active_ships)
    return nb_active_ships

  }
  is_active = () => {
    // single line if-else
    var out = this.get_active_ships().length > 0 ? true : false
    return out
  }
  print_active_ships = () => {
    var active_ships = this.get_active_ships()
    return active_ships.map((ship) => (`1 ${ship.shipType}`))
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
  const [increment_order_trigger, setincrement_order_trigger] = React.useState(0)

  const players = React.useRef({'Attacker': new Player('Attacker'), 'Defender': new Player('Defender')})
  const scrollbar_ref = React.useRef()

  const did_inactive_player_lose = () => {
    return players.current[OtherPlayer(playerType)].get_nb_active_ships() === 0 ? true : false
  }
  
  // Use the same interface as https://s3.amazonaws.com/eclipse-calculator/eclipse-calculator.htm to setup attacker and defender armies
  const dmg_ship = (ship_id, dmg) => {
    if (ship_id in ship_dct){
      console.log(`Hit ${ship_dct[ship_id].shipType} with ${dmg} damage!`)
      ship_dct[ship_id].receive_damage(dmg)
      // update ships
      players.current[OtherPlayer(playerType)].ships[ship_dct[ship_id].shipType].update_active_ships()
    } else {console.log("something went wrong...", ship_dct)}
  }

  const sethits_cb = (new_hits) => {
    sethits(new_hits)
    // recompute active ships in case any died
  }

  const add_to_log = (new_log) => {
    log.push(new_log)
    setlog(log)
  }
  React.useEffect(() => {
    // scroll to bottom
    scrollbar_ref.current.scrollIntoView({ behavior: "smooth" })
  }, [log.length])

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
    if (ls.length === 0 & ls_missile.length === 0){
      add_to_log("There are no ships in this battle.")
      return false;
    } // set order state, reset the order_id, reset player to first
    if (ls.length  > 0) {setorder(ls); setorder_id(0); setplayerType(ls[0][Globals.ORDER_PLAYER])}
    // check if skip missile round
    if (ls_missile.length === 0){
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
      console.log("ship dct", ship_dct)
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

  React.useEffect(() => {
    // Check if battle over
    if (battle_ready & players.current[OtherPlayer(playerType)].get_nb_active_ships() === 0) {
      // Inactive player has no ships left, battle is over
      setb_battle_over(true)
      }
  }, [hits.length]);

  React.useEffect(() => {
    if (increment_order_trigger > 0) {
      // Increment the order #
      increment_order()
      }
  }, [increment_order_trigger]);

  // reset battle
  const reset_battle = () => {
    setattacker_updated(false)
    setdefender_updated(false)
    setbattle_ready(false)
    sethits_open(false)
    setb_missile_round(true)
    setb_battle_over(false)
    setincrement_order_trigger(0)
    ship_dct = {} // reset globals
    ship_id = 0
  }

  React.useEffect(() => {
    if (b_battle_over & battle_ready){
      add_to_log(`Battle Over! ${playerType} won with these ships remaining: `)
      players.current[playerType].print_active_ships().forEach((str1) => {add_to_log(str1)})
      reset_battle()
    }
  }, [b_battle_over])

  // hit determiner
  const calc_hit_roll = (computers) => {
    var result = dice.roll()
    // auto miss if one
    if (result === 1){return 0}
    // auto hit if 6
    if (result === 6){return 99}
    // else, add computer
    return result;
  }
  // get ship hits
  const get_hits = (hits, nb_computers, nb_die, dmgType) => {
    [...Array(nb_die)].forEach(() => {
      var result = calc_hit_roll(nb_computers)
      if (result + nb_computers >= 6){
        hits.push( [result, result + nb_computers, Globals.damages[dmgType]] )
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
        if (order.length === 0){
          setb_battle_over(true)
          add_to_log("No ships have cannons. Attacker is forced to retreat. Battle over.")
        }
      }
      else{
        setmissile_id(new_id);
        setplayerType(missile_order[new_id][Globals.ORDER_PLAYER])
      }
    }
    else{
      var count = 0
      var player = undefined
      var new_order_id = order_id
      var ship_blueprint = undefined
      var retreated = false
      do {
        new_order_id = (order_id + 1) % order.length
        player = players.current[order[new_order_id][Globals.ORDER_PLAYER]]
        ship_blueprint = player.ships[order[new_order_id][Globals.ORDER_SHIP]]
        retreated = players.current[playerType].ships[order[new_order_id][Globals.ORDER_SHIP]].retreated
        count += 1
      } while (retreated & ship_blueprint.get_nb_active_ships() === 0 & count <= order.length); // skip to next ship if this one has retreated, protection against infinite loops
      if (count > order.length){
        console.log('something went wrong...')
        console.log(player)
      }
      add_to_log(`${order[new_order_id][Globals.ORDER_PLAYER]} is attacking.`)
      setorder_id(new_order_id);
      setplayerType(order[new_order_id][Globals.ORDER_PLAYER])
    }
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
    let ship_blueprint = player.ships[shipType]
    let nb_active_ships = ship_blueprint.get_nb_active_ships()
    let hits = []
    let result = 0;
    //
    if (nb_active_ships === 0){
      console.log("something went wrong...")
      add_to_log(`${playerType} has no ships of type ${shipType}... skipping`)
      setincrement_order_trigger(increment_order_trigger + 1)
      return
    }
    // Missiles
    if (b_missile_round) {
      // roll for missiles
      get_hits(hits, ship_blueprint.nb_computers, nb_active_ships * ship_blueprint.nb_yellow_missiles, "yellow_missiles")
      get_hits(hits, ship_blueprint, ship_blueprint.nb_orange_missiles, "orange_missiles")
      // set missile status to none
      ship_blueprint.b_has_missiles = false
    }
    else{ // Loop engagement rounds
      if (ship_blueprint.wants_to_retreat){ // Begin retreating
        ship_blueprint.retreating = true;
      }
      else if (ship_blueprint.retreating){ // Retreat
        // succesfully retreated
        ship_blueprint.retreated = true;
        add_to_log(`${nb_active_ships} ${ship_blueprint.shipType}'s have succesfully escaped`)
      }
      else{ // Roll cannons
        get_hits(hits, ship_blueprint.nb_computers, nb_active_ships * ship_blueprint.nb_yellow, "yellow_cannon")
        get_hits(hits, ship_blueprint.nb_computers, nb_active_ships * ship_blueprint.nb_orange, "orange_cannon")
        get_hits(hits, ship_blueprint.nb_computers, nb_active_ships * ship_blueprint.nb_blue, "blue_cannon")
        get_hits(hits, ship_blueprint.nb_computers, nb_active_ships * ship_blueprint.nb_red, "red_cannon")
      }
    }
    if (hits.length >0){
      console.log("Hits rolled: ", hits)
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
    } else{ 
      add_to_log("Miss!")
      setincrement_order_trigger(increment_order_trigger + 1)
    }
  }

  var hits_onClose_cb = () => {
    sethits_open(false)
    // check if battle over
    if (battle_ready & did_inactive_player_lose()){setb_battle_over(true); return}
    if (battle_ready){ setincrement_order_trigger(increment_order_trigger + 1)}
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
              <Box >
              <ListItem key={`list_item_${entry}`}>
                <ListItemText primary={entry} />
              </ListItem>
              <Divider />
              </Box>
            ))}
            {/* dummy div to scroll to bottom of list */}
            <div style={{ float:"left", clear: "both" }}
             ref={(el) => { scrollbar_ref.current = el; }} />
            </List>
          </Paper>
      </Stack>

      <HitsModal ship_dct={ship_dct} dmg_ship={dmg_ship} inactive_ships={players.current[OtherPlayer(playerType)].get_active_ships()} open={hits_open} setopen={sethits_open} onClose={hits_onClose_cb} active_player={playerType} hits={hits} sethits={sethits}/>


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