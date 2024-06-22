//roll for gold
export async function rollGold(treasureChance,rollString,modifier,rng) {
  //add DSN dice theme
  let rollStringFinal = rollString + `[goldroll]`;
  //roll for treasure
  let treasureRoll = await new Roll(rollStringFinal).evaluate();
  //calculate raw treasure in GP
  treasureRaw = Math.floor((treasureRoll.total * modifier) * rng);
  //determine coin distribution
  treasureFinal = splitCoins(treasureRaw,treasureChance);
  //log what was done
  console.log(`Rolled ${treasureChance.total} from a ${rollString} with a ${modifier} modifier. RNG of ${rng} applied.`);
  //return final treasure
  return treasureFinal;
}

//roll for creature loot--------------------------------------------------------------
export async function rollLoot(rollString,) {

}

//roll for special item--------------------------------------------------------------
export async function rollSpecial(rollString,) {

}

//return distribution of coins from base gold--------------------------------------------------------------
export async function splitCoins(goldPieces,treasureChance,electrum) {
  //need to rethink how to split, i mean for rolltotal from the overall chance
  //write this
  //have some roll that determines whether electrum is used
  //think about having a range for each currency
  return [cp,sp,ep,gp,pp];
}
