//roll for gold
export async function rollGold(rollTotal,creatureType,treasureMap,apl,rng) {
  //calculate bonus dice
    //add bonus dice if certain conditions are met
    let bonus = 0;
    //add 1d6 for 95 or higher (nat 20)
    if (rollTotal >= 95) {bonus++;}
    //add 1d6 for every 5th level
    if (apl >= 5) {bonus++;}
    if (apl >= 10) {bonus++;}
    if (apl >= 15) {bonus++;}
  //format final dice string and add DSN theme
  let rollStringFinal = treasureMap.gp_base + `[goldroll] + ` + bonus.toString() + `d6[goldRoll]`;
  //roll for gold
  let goldRoll = await new Roll(rollStringFinal).evaluate();
  //calculate party modifier
    //set default
    let gp_party_modifier = 1;
    //override with treasure map data
    if (treasureMap.gp_party_modifier === 'apl') {gp_party_modifier = apl;}
    if (treasureMap.gp_party_modifier === 'hapl') {gp_party_modifier = Math.floor(apl/2);}
  //calculate raw treasure in GP
  let goldRaw = Math.floor((goldRoll.total * treasureMap.gp_global_modifier * gp_party_modifier) * Math.floor(treasureRaw * ((Math.random()*(rng*2))+(1-rng))));
  //determine chance for electrum
    //set default
    electrumChance = 0.0;
    //override with treasure map data
    if (creatureType === 'undead') {electrumChance = 0.6}
  //determine coin distribution
  treasureFinal = splitCoins(rollTotal,goldRaw,electrumChance);
  //log what was done
  console.log(`Rolled ${goldRoll.total} from a ${treasureMap.gp_base} with a ${gp_party_modifier} party modifier and ${treasureMap.gp_global_modifier} global modifier. RNG of ${rng} applied.`);
  //return final treasure
  return treasureFinal;
}

//roll for creature loot--------------------------------------------------------------
export async function rollLoot(rollTotal,creatureType,treasureMap,creatureLoot) {

}

//roll for special item--------------------------------------------------------------
export async function rollSpecial(rollTotal,treasureMap,gemstones) {

}

//return distribution of coins from base gold--------------------------------------------------------------
export async function splitCoins(rollTotal,goldRaw,electrumChance) {
  //need to rethink how to split, i mean for rolltotal from the overall chance
  //write this
  //have some roll that determines whether electrum is used
  //think about having a range for each currency
  return [cp,sp,ep,gp,pp];
}
