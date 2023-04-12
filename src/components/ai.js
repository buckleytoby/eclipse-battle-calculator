import * as Globals from '../globals'

const OtherPlayer = (playerType) => {
  return playerType === Globals.playerType[0] ? Globals.playerType[1] : Globals.playerType[0]
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
      hits.push( [result, result + nb_computers, Globals.damages[dmgType]] )
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
  // each hit in hits is [result, result + nb_computers, Globals.damages[dmgType]]
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
      can_kill.sort((a, b) => (Globals.ATTACK_PRIORITIES[b.shipType] - Globals.ATTACK_PRIORITIES[a.shipType]))
      var ship_id = can_kill[0].id
      dmg_fcn(ship_id, hit[2])
    } else {
      // Place rest of remaining damage on largest ship 
      can_hit.sort((a, b) => (Globals.ATTACK_PRIORITIES[b.shipType] - Globals.ATTACK_PRIORITIES[a.shipType]))
      var ship_id = can_kill[0].id
      dmg_fcn(ship_id, hit[2])
    }
  });
}

export function RunMonteCarloSim(current_state){
  // runs out the rest of the battle X times and collate the results
  var nb_iterations = 10
  var wins_A = 0
  var wins_D = 0
  var b_missile_round = true
  var ship_blueprint = undefined
  var inactive_ships = undefined
  var dmg_fcn = undefined

  // make some copies so we don't modify original data from the game state
  var players = current_state

  // CORE
  // for X iterations ...
    // Increment Order

    // Roll Die
    var hits = GetAllHits(b_missile_round, ship_blueprint)

    // Attribute Die
    AttributeHitsAI(inactive_ships, hits, dmg_fcn)

    // Check for battle Over

  // calculate probability
  var prob_A = wins_A / nb_iterations
  var prob_D = wins_D / nb_iterations
  return prob_A, prob_D
}