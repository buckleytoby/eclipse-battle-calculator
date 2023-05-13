import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack'
import hand from '../assets/pointing-to-right.png';
import { Button, List } from '@mui/material';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import RadioAttackRetreat from './radio';
import Confirm_modal from './confirm_modal';
import * as Globals from '../globals';
import HitsModal from './hits_modal';
import AreYouSure from './alert';
import { AttributeHitsAI, GetAllHits, RunMonteCarloSim, calc_battle_order, get_next_ship_blueprint} from './ai';
////////////// framer library for animation
import { motion } from 'framer-motion';
import * as Icons from './icons'
var util = require('util');

const OtherPlayer = (playerType) => {
  return playerType === Globals.playerType[0] ? Globals.playerType[1] : Globals.playerType[0]
}

var ship_id = 0
var virtual_ship_id = 0
var ship_dct = {}

class Ship{
  constructor (shipType, nb_hull, nb_shields, ship_dct){
    this.shipType = shipType
    this.nb_hull = nb_hull
    this.nb_shields = nb_shields
    this.ship_dct = ship_dct
    this.damage_taken = 0
    // bind functions
    this.is_dead = this.is_dead.bind(this);
    this.receive_damage = this.receive_damage.bind(this);
    this.add_to_ship_dct = this.add_to_ship_dct.bind(this);
    this.set_dmg = this.set_dmg.bind(this)
    this.copy = this.copy.bind(this)
    // call some fcns
    this.add_to_ship_dct()
  }
  copy = (other) => {
    other.set_dmg(this.damage_taken)
  }
  set_dmg = (val) => {
    this.damage_taken = val
  }
  add_to_ship_dct = () => {
    if (false){ // "virtual" in this.ship_dct){
      this.id = virtual_ship_id; virtual_ship_id += 1
      this.ship_dct[this.id] = this;
    } else{
      this.id = ship_id; ship_id += 1
      this.ship_dct[this.id] = this;
    }
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
  constructor (shipType, ship_dct) {
    this.shipType = shipType;
    this.ship_dct = ship_dct
    this.b_has_missiles = false;
    this.b_has_cannons = false;
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

    // must be reset
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
    this.setup_battle = this.setup_battle.bind(this);
    this.get_battle_stats = this.get_battle_stats.bind(this);
    this.copy = this.copy.bind(this)
    this.reset = this.reset.bind(this)
  }
  copy = (other, playerType) => {
    other.set_battle_stats(this.get_battle_stats(), playerType)
    // must wrap in a setter?
    other.b_has_missiles = this.b_has_missiles
    other.b_has_cannons = this.b_has_cannons
    other.wants_to_retreat = this.wants_to_retreat
    other.retreating = this.retreating
    other.RadioAttackRetreatValue = this.RadioAttackRetreatValue
    other.retreated = this.retreated
    // other.make_active_ships() // can't do this, need to base it off this's active ships
    // copy my Ships data into Other
    var ships_new = []
    this.active_ships.forEach((ship, idx) => {
      var ship_new = new Ship(other.shipType, other.nb_hull, other.nb_shields, other.ship_dct)
      ship.copy(ship_new)
      ships_new.push(ship_new)
  })
    other.active_ships = ships_new
    other.update_active_ships() // now this might not be necessary
  }
  reset = () => {
    this.wants_to_retreat = false
    this.retreating = false
    this.RadioAttackRetreatValue = "attack"
    this.retreated = false
  }
  set_retreated = (value) => {
    if ((typeof value) == 'boolean'){
      this.retreated = value
    }
    return `${this.get_nb_active_ships()} ${this.shipType}(s) have succesfully escaped`
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
  }
  setup_battle = (data, playerType) => {
    this.set_battle_stats(data, playerType)
    if (playerType === "Defender"){this.nb_initiative += 0.5} // Defender advantage
    if (this.nb_yellow_missiles > 0 | this.nb_orange_missiles > 0){this.b_has_missiles = true}
    if (this.nb_yellow > 0 | this.nb_orange > 0 | this.nb_blue > 0 | this.nb_red > 0){this.b_has_cannons = true}
    this.make_active_ships()
  }
  get_battle_stats = () => {
    return {
      'nb_ships': this.nb_ships,
      'nb_shields': this.nb_shields,
      'nb_computers': this.nb_computers,
      'nb_yellow': this.nb_yellow,
      'nb_orange': this.nb_orange,
      'nb_blue': this.nb_blue,
      'nb_red': this.nb_red,
      'nb_yellow_missiles': this.nb_yellow_missiles,
      'nb_orange_missiles': this.nb_orange_missiles,
      'nb_hull': this.nb_hull,
      'nb_initiative': this.nb_initiative,
    }
  }
  set_retreat_attack = (event) => {
    this.RadioAttackRetreatValue = event.target.value;
    if (this.RadioAttackRetreatValue === "retreat"){
      this.wants_to_retreat = true
    }
    else if(this.RadioAttackRetreatValue === "attack"){
      this.wants_to_retreat = false
    }
    console.log("wants to retreat", this.wants_to_retreat)
  }
  make_active_ships = () => {
  // make enumeration of all active ships
  var activeShips = [];
  [...Array(this.nb_ships)].forEach((_) => {
    var ship = new Ship(this.shipType, this.nb_hull, this.nb_shields, this.ship_dct)
    activeShips.push(ship)
      })
  this.active_ships = activeShips
  }
  update_active_ships = () => {
    // retreated ships aren't active
    if (this.retreated){
      this.active_ships = []
    }
    // dead ships aren't active ships
    var activeShips = [];
    this.active_ships.forEach((ship, idx) => {
      if (!ship.is_dead()){
        activeShips.push(ship)
      }})
    this.active_ships = activeShips
  }
  get_active_ships = () => {
    return this.active_ships
  }
  get_nb_active_ships = () => {
    return Object.keys(this.active_ships).length
  }
}

class Player{
  constructor(playerType, ship_dct){
    this.playerType = playerType;
    this.ship_dct = ship_dct;
    this.auto_damage_on = false;
    // ships is an object (i.e. key-value pairs)
    this.ships = Object.fromEntries( Globals.shipTypes.map((shipType, idx) => ([shipType, new ShipBlueprint(shipType, this.ship_dct)])) )
    this.setup_battle = this.setup_battle.bind(this);
    this.get_active_ships = this.get_active_ships.bind(this);
    this.is_active = this.is_active.bind(this);
    this.print_active_ships = this.print_active_ships.bind(this);
    this.update_active_ships = this.update_active_ships.bind(this);
    this.copy = this.copy.bind(this);
    this.reset = this.reset.bind(this);
  }
  copy = (ship_dct) => {
    // if ("virtual" in ship_dct){virtual_ship_id = 0}
    var p = new Player(this.playerType, ship_dct)
    Object.keys(this.ships).forEach((shipType) => {
      this.ships[shipType].copy(p.ships[shipType], shipType)
    })
    return p
  }
  reset = () => {
    // reset itself and its children
    for (var key of Object.keys(this.ships)){ // of gets the element, not the index
      this.ships[key].reset()
    }
  }
  setup_battle = (data) => {
    Object.keys(data).forEach((shipType) => {
      this.ships[shipType].setup_battle(data[shipType], this.playerType)
    })}
  update_active_ships = () => {
    for (var key of Object.keys(this.ships)){ // of gets the element, not the index
      this.ships[key].update_active_ships()
    }
  }
  get_active_ships = () => {
    var active_ships = []
    Object.keys(this.ships).forEach((ship) =>{
      active_ships = active_ships.concat(this.ships[ship].get_active_ships())
    })
    return active_ships
  }
  get_nb_active_ships = () => {
    return this.get_active_ships().length
    // var nb_active_ships = 0
    // nb_active_ships = Object.keys(this.ships).reduce((accumulator, key) => (
    //   accumulator + this.ships[key].get_nb_active_ships()
    // ), nb_active_ships)
    // return nb_active_ships

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

const make_ship_dct = (players) => {
  for (var player of Object.entries(players)){
    for (var ship in player.get_active_ships()){
      ship.add_to_ship_dct(ship_dct)
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////////
export default function BattleSim(props) {
  const [log, setlog] = React.useState(['log empty'])
  const [playerType, setplayerType] = React.useState('Attacker')
  const [order, setorder] = React.useState([])
  const [order_id, setorder_id] = React.useState(-1)
  const [b_missile_round, setb_missile_round] = React.useState(true)
  const [attacker_updated, setattacker_updated] = React.useState(false)
  const [defender_updated, setdefender_updated] = React.useState(false)
  const [battle_ready, setbattle_ready] = React.useState(false)
  const [hits_open, sethits_open] = React.useState(false)
  const [hits, sethits] = React.useState([])
  const [b_battle_over, setb_battle_over] = React.useState(false)
  const [increment_order_trigger, setincrement_order_trigger] = React.useState(0)
  const [run_sim_trigger, setrun_sim_trigger] = React.useState(0)
  const [open_alert, setopen_alert] = React.useState(false);
  const [attacker_prob_win, setattacker_prob_win] = React.useState(50);
  const [defender_prob_win, setdefender_prob_win] = React.useState(50);
  // indicator hand stuff
  const [hand_box, sethand_box] = React.useState({top: 0, left: 0});
  var hand_flipped = {"Attacker": -1, "Defender": 1}
  // retreating stuff
  const [retreat_colors, setretreat_colors] = React.useState({});
  const retreat_color_array = ['hsl(0, 0, 100)', 'hsl(60, 100, 64.7)', 'hsl(0, 0, 100)']

  // refs for DOM references
  const HandRefs = React.useRef({})
  const BattleSimRef = React.useRef(null)

  const players = React.useRef({'Attacker': new Player('Attacker', ship_dct), 'Defender': new Player('Defender', ship_dct)})
  const scrollbar_ref = React.useRef()

  const did_inactive_player_lose = () => {
    console.log("Inactive # Ships: ", players.current[OtherPlayer(playerType)].get_nb_active_ships())
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

  const begin_battle = () => {
    if (battle_ready){
      // warn user that they will reset the ongoing battle
      setopen_alert(true)
    }
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
      var b_battle_ready = false
      var state = {'b_missile_round': b_missile_round,
             'order_id': order_id,
             'order': order,
             'players': players.current,
             'add_to_log': [],
             }
      var ls = calc_battle_order(state)
      if (ls.length  > 0) {
        setorder(ls)
        setorder_id(-1)
        b_battle_ready = true
      }
      else {
        add_to_log("No ships have cannons. Attacker is forced to retreat. Battle over.")
      }

      if (b_battle_ready){
        setincrement_order_trigger(increment_order_trigger + 1)
        setrun_sim_trigger(run_sim_trigger + 1)
        add_to_log("Battle Order Calculated.")
        setbattle_ready(true)
        console.log(ship_dct)
      }}
  }, [attacker_updated, defender_updated]);

  React.useEffect(() => {
    if (props.defender_setup) {
      // Load Attacker
      players.current['Defender'].setup_battle(props.data_defender.current)
      add_to_log("Defender Stats Successfully loaded.")
      setdefender_updated(true);
      }
  }, [props.defender_setup]);

  React.useEffect(() => {
    if (props.attacker_setup) {
      // Load Attacker
      players.current['Attacker'].setup_battle(props.data_attacker.current)
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
    // this means the turn is done, so do all end-of-turn stuff here, including updating active ships
    if (increment_order_trigger > 0) {
      // update ships for all players 
      for (var player_key of Object.keys(players.current)){players.current[player_key].update_active_ships()}
      // Increment the order #
      increment_order_2()
    }}, [increment_order_trigger]);

    
  React.useEffect(() => {
    if (run_sim_trigger > 0) {
      // recalculate likelihoods
      let results = RunMonteCarloSim(players, b_missile_round, order_id, order, playerType, ship_id);
      setattacker_prob_win(Math.round(results[0]));
      setdefender_prob_win(Math.round(results[1]));
    }}, [run_sim_trigger]);

  // reset battle
  const reset_battle = () => {
    setattacker_updated(false)
    setdefender_updated(false)
    setbattle_ready(false)
    sethits_open(false)
    setb_missile_round(true)
    setb_battle_over(false)
    setincrement_order_trigger(0)
    setorder_id(-1)
    setretreat_colors({})
    for (let player_key of Object.keys(players.current)){
      players.current[player_key].reset()
    }
    // reset globals
    for (var key in ship_dct){
      delete ship_dct[key]
    }
    ship_id = 0
  }

  React.useEffect(() => {
    if (b_battle_over & battle_ready){
      add_to_log(`Battle Over! ${playerType} won with these ships remaining: `)
      players.current[playerType].print_active_ships().forEach((str1) => {add_to_log(str1)})
      // print out the ships that successfully retreated
      // TODO
      reset_battle()
    }
  }, [b_battle_over])

  const increment_order_2 = () => {
    // triggered when setincrement_order_trigger is called
    var state = {'b_missile_round': b_missile_round,
             'order_id': order_id,
             'order': order,
             'players': players.current,
             'add_to_log': [],
             }
    var ship_blueprint = undefined
    var [state, ship_blueprint] = get_next_ship_blueprint(state)
    state.add_to_log.forEach((elem) => {add_to_log(elem)})
    setb_missile_round(state.b_missile_round)
    setorder_id(state.order_id)
    setorder(state.order)
    setplayerType(state.playerType)
  }

  React.useEffect(()=>{
    if (0 <= order_id & order_id < order.length){
      // update hand indicator location
      let ref = order[order_id][Globals.ORDER_PLAYER]+"_"+order[order_id][Globals.ORDER_SHIP]
      let elem = HandRefs.current[ref]
      // console.log('elem', elem)
      if (elem !== null){
        let new_box = {top: elem.offsetTop, left: elem.offsetLeft}
        sethand_box(new_box)
      }
    }
  }, [order_id, order])

  const set_retreat_color = (playerType, ship_blueprint) => {
    retreat_colors[playerType+"_"+ship_blueprint.shipType] = 'yellow'
    console.log(retreat_colors)
    setretreat_colors(retreat_colors)
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
    //
    if (nb_active_ships === 0){
      console.log("something went wrong...")
      add_to_log(`${playerType} has no ships of type ${shipType}... skipping`)
      setincrement_order_trigger(increment_order_trigger + 1)
      return
    }
    
    let state = {'b_missile_round': b_missile_round, 'add_to_log': []}
    let hits = GetAllHits(state, ship_blueprint)
    state.add_to_log.forEach((elem) => {add_to_log(elem)})
    
    if (hits.length >0){
      console.log("Hits rolled: ", hits)
      add_to_log(`${playerType}'s ${shipType}'s hit with ${hits.length} roll(s)`)
        
      // Distribute Damage like the AI
      if (player.auto_damage_on){
        sethits(hits)
        var inactive_ships = players.current[OtherPlayer(playerType)].get_active_ships() // list
        AttributeHitsAI(inactive_ships, hits, dmg_ship)
        check_battle_over()
      }
      else{
        // Maybe a modal asking user to distribute dices of damage?
        sethits(hits)
        sethits_open(true)
      }
    } else{ 
      if (!ship_blueprint.retreating){add_to_log("Miss!")}
      else if (!ship_blueprint.retreated) {set_retreat_color(playerType, ship_blueprint); add_to_log(`${playerType}'s ${ship_blueprint.shipType}'s have begun to retreat`)}
      setincrement_order_trigger(increment_order_trigger + 1)
      setrun_sim_trigger(run_sim_trigger + 1) // probabilities change depending on the turn order, which changes here
    }
  }
  var check_battle_over = () =>{
    if (battle_ready & did_inactive_player_lose()){setb_battle_over(true); return}
    if (battle_ready){ setincrement_order_trigger(increment_order_trigger + 1)}
  }

  var hits_onClose_cb = () => {
    sethits_open(false)
    setrun_sim_trigger(run_sim_trigger + 1) // only do after hits are registered
    check_battle_over()
  }

  return(
  <Box marginLeft='50px' marginBottom='50px' position='relative' ref={BattleSimRef} sx={{width:1500, height:500}}>
    <Stack position='static' direction='row' justifyContent="space-between" sx={{width:1500}}>
      {/* Attacker Side */}
      <Box position='static' sx={{margin:'10px', width: 400}}> 
        <Stack direction='row' alignItems="center" justifyContent="space-between" spacing={0} sx={{padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
          <h2>Attacker</h2>
          <Paper sx={{fontSize: 25}}>Win Chance: {attacker_prob_win}%</Paper>
        </Stack>
        {Globals.shipTypes.map((shipType) => {
          {let nb_active = players.current['Attacker'].ships[shipType].get_nb_active_ships()
          let ShipIcon = Icons.ShipIcons[shipType]
          // 
          if (nb_active > 0){
            return (
            ////////////////////////////// Ship Card //////////////////////////////
            <motion.div style={{borderRadius: '10px', backgroundColor: '#fff'}} animate={{ backgroundColor: ["Attacker"+"_"+shipType] in retreat_colors ? retreat_color_array : '#fff'}} transition={{ repeat: Infinity, duration: 3.0 }}>
            <Stack position='static' direction='row' alignItems="center" justifyContent="space-between" spacing={0} sx={{padding: 1, boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
              <ShipIcon content='' />
              <Icons.Ships content={nb_active} />
              <RadioAttackRetreat onChange={players.current['Attacker'].ships[shipType].set_retreat_attack}></RadioAttackRetreat>
              <Box position='static' ref={el => (HandRefs.current["Attacker"+"_"+shipType] = el)} sx={{width: 5, height:20, visibility: 'invisible' }}></Box>
              <Box position='static' sx={{width: 30, height:20, visibility: 'invisible' }}></Box>
            </Stack>
            </motion.div>
          )}}
          })}
      </Box>

      {/******** Controls *********/}
      <Stack justifyContent="space-evenly" sx={{margin:'10px', height: 500, width: 400}}> 
          <Button variant="contained" size="large" onClick={begin_battle}>Begin Battle</Button>
          <Button variant="contained" size="large" onClick={step_engagement_round}>Engage!</Button>
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

      <HitsModal ship_dct={ship_dct} dmg_ship={dmg_ship} did_inactive_player_lose={did_inactive_player_lose}
      inactive_ships={players.current[OtherPlayer(playerType)].get_active_ships()} 
      open={hits_open} setopen={sethits_open} onClose={hits_onClose_cb} active_player={playerType} hits={hits} sethits={sethits}/>


      {/* Defender Side */}
      <Box position='static' sx={{margin:'10px', width: 400}}> 
        <Stack direction='row' alignItems="center" justifyContent="space-between" spacing={0} sx={{padding: 1, bgcolor: 'background.paper', boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
          <Paper sx={{fontSize: 25}}>Win Chance: {defender_prob_win}%</Paper>
          <h2>Defender</h2>
        </Stack>
        {Globals.shipTypes.map((shipType) => {
          {let nb_active = players.current['Defender'].ships[shipType].get_nb_active_ships()
          let ShipIcon = Icons.ShipIcons[shipType]
          if (nb_active > 0){
            return (
            ////////////////////////////// Ship Card //////////////////////////////
            <motion.div style={{borderRadius: '10px', backgroundColor: '#fff'}} animate={{ backgroundColor: (["Defender"+"_"+shipType] in retreat_colors) ? retreat_color_array : '#fff'}} transition={{ repeat: Infinity, duration: 3.0 }}>
            <Stack position='static' direction='row' alignItems="center" justifyContent="space-between" spacing={0} sx={{padding: 1, boxShadow: 1, borderRadius: 2, marginY:'10px'}}>
              <Box ref={el => (HandRefs.current["Defender"+"_"+shipType] = el)} sx={{width: 20, height:20, visibility: 'invisible' }} ></Box>
              <ShipIcon content='' />
              <Icons.Ships content={nb_active} />
              <RadioAttackRetreat onChange={players.current['Defender'].ships[shipType].set_retreat_attack}></RadioAttackRetreat>
            </Stack></motion.div>
          )}}
          })}
      </Box>
    </Stack>

    {/* extras */} 
    <AreYouSure open={open_alert} setOpen={setopen_alert} dialog={"Since the battle is ongoing, you're about to reset. Are you sure?"}/>
    <motion.div initial={{visibility: 'invisible'}} style={{position: 'absolute'}} animate={{top: hand_box.top, left: hand_box.left, scaleX:hand_flipped[playerType], transition: {duration: 0.4}}}>
      <Box sx={{ visibility: 'visible'}} ><img  width={50} height={50} src={hand} alt="hand" /></Box>
    </motion.div>
  </Box>
  )
}