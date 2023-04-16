import * as Globals from '../globals'
var util = require('util');


const ORDER_PLAYER = 0
const ORDER_SHIP = 1
const ORDER_INITIATIVE = 2
const shipTypes = ['Interceptor', 'Cruiser', 'Dreadnought', 'Starbase']
const ATTACK_PRIORITIES = {'Interceptor': 1, 'Cruiser': 2, 'Dreadnought': 3, 'Starbase': 4}
const PLAYERTYPES = ['Attacker', 'Defender']
const damages = {'yellow_missiles': 2,
                 'orange_missiles': 4,
                 'yellow_cannon': 1,
                 'orange_cannon': 2,
                 'blue_cannon': 3,
                 'red_cannon': 4,
}
const TEST = true;
var ship_dct_id = 0
var ship_dct = {"virtual": true}

const OtherPlayer = (playerType) => {
  return playerType === PLAYERTYPES[0] ? PLAYERTYPES[1] : PLAYERTYPES[0]
}

var dice = {
  sides: 6,
  roll: function () {
    var randomNumber = Math.floor(Math.random() * this.sides) + 1;
    return randomNumber;
  }
}

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
      hits.push( [result, result + nb_computers, damages[dmgType]] )
    }
  })
}

export function GetAllHits(b_missile_round, ship_blueprint) {
  let hits = []
  let nb_active_ships = ship_blueprint.get_nb_active_ships()

  if (b_missile_round) { // Missiles
    // roll for missiles
    get_hits(hits, ship_blueprint.nb_computers, nb_active_ships * ship_blueprint.nb_yellow_missiles, "yellow_missiles")
    get_hits(hits, ship_blueprint, ship_blueprint.nb_orange_missiles, "orange_missiles")
    // set missile status to none
    ship_blueprint.b_has_missiles = false
  } else{ // cannons
    if (ship_blueprint.wants_to_retreat){ // Begin retreating
      ship_blueprint.retreating = true;
    }
    else if (ship_blueprint.retreating){ // Retreat
      // succesfully retreated
      ship_blueprint.set_retreated(true)
    }
    else{ // Roll cannons
      get_hits(hits, ship_blueprint.nb_computers, nb_active_ships * ship_blueprint.nb_yellow, "yellow_cannon")
      get_hits(hits, ship_blueprint.nb_computers, nb_active_ships * ship_blueprint.nb_orange, "orange_cannon")
      get_hits(hits, ship_blueprint.nb_computers, nb_active_ships * ship_blueprint.nb_blue, "blue_cannon")
      get_hits(hits, ship_blueprint.nb_computers, nb_active_ships * ship_blueprint.nb_red, "red_cannon")
    }
  }
  return hits
}

export function AttributeHitsAI(inactive_ships, hits, dmg_fcn){
  // each hit in hits is [result, result + nb_computers, damages[dmgType]]
  // get stuff

  // order hits by damage ... hmm whether to go small-to-large or reverse
  hits.sort((a, b) => {return a[2] - b[2]}) // sorts in place
  // iterate over hits
  hits.forEach(hit => {
    // filter via non-dead ships
    var alive_ships = inactive_ships.filter(ship => !ship.is_dead())
    if (alive_ships.length === 0){
      // no more alive ships
      return
    }
    // filter via which ships this hit can hit
    var can_hit = alive_ships.filter(ship => (hit[1] - ship.nb_shields) >= 6)
    if (can_hit.length === 0){
      // can't hit any ships with this hit
      return
    }
    var can_kill = can_hit.filter(ship => (ship.nb_hull + 1) <= (ship.damage_taken + hit[2]))
    if (can_kill.length > 0){
      // Kill ships biggest to smallest
      can_kill.sort((a, b) => (ATTACK_PRIORITIES[b.shipType] - ATTACK_PRIORITIES[a.shipType]))
      var ship_dct_id = can_kill[0].id
      dmg_fcn(ship_dct_id, hit[2])
    } else {
      // Place rest of remaining damage on largest ship 
      can_hit.sort((a, b) => (ATTACK_PRIORITIES[b.shipType] - ATTACK_PRIORITIES[a.shipType]))
      var ship_dct_id = can_hit[0].id
      dmg_fcn(ship_dct_id, hit[2])
    }
  });
}

const calc_battle_order = (players, is_missile_round = true) => {
  // determine battle order
  var ls = []
  // construct list of [playerType, shipType, initiative]
  Object.keys(players).forEach((playerType) => ( shipTypes.forEach((shipType) => {
      let ship = players[playerType].ships[shipType]
      if (is_missile_round & ship.nb_ships > 0 & ship.b_has_missiles){
        ls.push([playerType, shipType, ship.nb_initiative])
      } else if(ship.nb_ships > 0){
        ls.push([playerType, shipType, ship.nb_initiative])
      }})))
  ls.sort((a, b) => {return b[2] - a[2]}) // query the initiative  // sorts in place
  // check for no ships cannons ... Attacker automatically loses
  if (!is_missile_round & ls.length === 0){ return []; } 
  // check if skip missile round
  if (is_missile_round & ls.length === 0){
    // rerun itself
    return calc_battle_order(players, false)
  }
  return ls
}

const get_next_ship_blueprint = (state) => {
  var ship_blueprint = undefined
  var new_order_id = state.order_id // initial value of state.order_id should be -1 .... but what about after 'roll'?
  // if missile round
  if (state.b_missile_round){
    new_order_id += 1
    if (new_order_id >= state.order.length){ // end of missile round
      state.b_missile_round = false
      // rerun calc battle order
      state.b_missile_round = false
      state.order = calc_battle_order(state.players, state.b_missile_round)
      new_order_id = 0 // first cannon round
      if (state.order.length > 0){
        let p = state.order[new_order_id][ORDER_PLAYER];
        let s = state.order[new_order_id][ORDER_SHIP]
        ship_blueprint = state.players[p].ships[s]
      }
    }
    else{
      // console.log("order: ", state.order)
      let p = state.order[new_order_id][ORDER_PLAYER];
      let s = state.order[new_order_id][ORDER_SHIP]
      ship_blueprint = state.players[p].ships[s]
    }
  }
  else{
    let count = 0
    var player = undefined
    var retreated = false
    do {
      new_order_id = (new_order_id + 1) % state.order.length
      let p = state.order[new_order_id][ORDER_PLAYER];
      let s = state.order[new_order_id][ORDER_SHIP]
      ship_blueprint = state.players[p].ships[s]
      retreated = ship_blueprint.retreated
      count += 1
    } while (count <= state.order.length & (retreated | ship_blueprint.get_nb_active_ships() === 0)); // skip to next ship if this one has retreated, protection against infinite loops
  }
  state.order_id = new_order_id
  state.playerType = state.order[new_order_id][ORDER_PLAYER]
  return ship_blueprint
}

function RunOneSim(state){
  var b_over = false;

  const dmg_ship = (ship_dct_id, dmg) => {
    if (ship_dct_id in ship_dct){
      ship_dct[ship_dct_id].receive_damage(dmg)
      // update ships
      state.players[OtherPlayer(state.playerType)].ships[ship_dct[ship_dct_id].shipType].update_active_ships()
    }
  }
  // console.log("Ship dct", ship_dct)

  var count = 0
  while (!b_over & count < 999){
    count += 1
    // Increment Order to get active ships
    var ship_blueprint = get_next_ship_blueprint(state)
    // with undefined, attacker loses
    if (ship_blueprint === undefined){
      return "Defender"
    }
    // console.log("player", state.playerType, "ship_blueprint", ship_blueprint, "order id", state.order_id)

    // update inactive ships
    var inactive_ships = state.players[OtherPlayer(state.playerType)].get_active_ships()
    // console.log("Other", OtherPlayer(state.playerType), inactive_ships)
    // // console.log("inactive ships: ", inactive_ships)

    // Roll Die
    var hits = GetAllHits(state.b_missile_round, ship_blueprint)
    // console.log("hits" , hits)

    // Attribute Die
    AttributeHitsAI(inactive_ships, hits, dmg_ship)

    // Check for battle Over
    var alive_ships = inactive_ships.filter(ship => !ship.is_dead())
    if (alive_ships.length === 0){b_over = true}
  }
  let b_a = state.players["Attacker"].get_nb_active_ships() === 0
  let b_d = state.players["Defender"].get_nb_active_ships() === 0
  if (b_a & b_d){return ""}
  else if (!b_a){return "Attacker"}
  else if (!b_d){return "Defender"}
  return ""
}

function make_clone(orig){
  // trying this method: https://stackoverflow.com/questions/41474986/how-to-clone-a-javascript-es6-class-instance 
  let clone = Object.assign(Object.create(Object.getPrototypeOf(orig)), orig)
  return clone
}

// https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript/8511350#8511350
const is_object = (yourVariable) => {
  if ( typeof yourVariable === 'object' &&
    !Array.isArray(yourVariable) &&
    yourVariable !== null ) {
      return true
    } else {return false}
}

function make_clone_recursive(orig){
  let clone = make_clone(orig)
  Object.keys(clone).forEach((key)=>{
    let prop = clone[key]
    if (is_object(prop)){
      // recursively call itself
      // console.log("prop is object: ", prop)
      clone[key] = make_clone_recursive(prop)
    }
  })
  return clone
}

function make_ship_dct(players){
  for (let player_key of Object.keys(players)){
    let player = players[player_key]
    for (let ship of player.get_active_ships()){ // OF OF OF OF
      ship.id = ship_dct_id; ship_dct_id += 1
      ship_dct[ship.id] = ship;
    }
  }
}


function make_players(players){
  var p = {}
  for (let player_key of Object.keys(players)){
    p[player_key] = players[player_key].copy(ship_dct)
  }
  return p
}

function make_state_copy(players, b_missile_round, order_id, order, playerType, _ship_dct_id){
  // need to make deep copy of players
  var state = {}
  ship_dct_id = _ship_dct_id
  ship_dct = {"virtual": true}
  // need to add on state info
  state.players = make_players(players.current) // this also makes the ship_dct
  // if (!(active_ships in state.players)) {state.players.}
  // make_ship_dct(state.players)
  // console.log("ship_dct", util.inspect(ship_dct))
  state.b_missile_round = b_missile_round
  state.order = [...order] // is a list of lists
  // console.log("state order",state.order)
  state.order_id = order_id
  state.playerType = playerType
  return state
}

export function RunMonteCarloSim(players, b_missile_round, order_id, order, playerType, _ship_dct_id){
  // runs out the rest of the battle X times and collate the results
  var nb_iterations = 200
  var wins_A = 0
  var wins_D = 0
  var count = 0

  console.log(players, b_missile_round, order_id, order, playerType, _ship_dct_id)

  // make some copies so we don't modify original data from the game state
  // var players = current_state

  // CORE
  // for X iterations ...
  for (let index = 0; index < nb_iterations; index++) {
    // console.log("players", players)
    // construct state
    let state = make_state_copy(players, b_missile_round, order_id, order, playerType, _ship_dct_id)
    // run the sim
    let who_won = RunOneSim(state)
    // console.log("Who won: ", who_won)
    // collate the results
    if (!(who_won ==='')){count += 1}
    wins_A += who_won === "Attacker" ? 1 : 0
    wins_D += who_won === "Defender" ? 1 : 0
  }

  console.log(wins_A, wins_D, count)

  // calculate probability
  if (count > 0){
    var prob_A = wins_A / count * 100.0
    var prob_D = wins_D / count * 100.0
    return [prob_A, prob_D]
  } else{
    return [0.0, 0.0]
  }
}