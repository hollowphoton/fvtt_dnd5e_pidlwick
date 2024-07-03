//roll for gold
export async function rollGold(rollTotal,creatureType,isMinion,treasureMap,apl,rng) {
  //exit if failure
  if (rollTotal < treasureMap.gp_target) {
    //log what was done
    console.log(`No gold added. Rolled ${rollTotal} with a gold target of at least ${treasureMap.gp_target}.`);
    //return
    return [0,0,0,0,0];
  }
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
  //calculate minion modifier
    //set default
    let minionModifier = 1;
    //override based on status
    if (isMinion) {minionModifier = 0.2;}
  //calculate RNG modifier
    //set base
    let rngBase = Math.random();
    //set value
    let rngModifier = (Math.random()*(rng*2))+(1-rng);
    //log what was done
    console.log(`Final RNG modifier: ${rngModifier}. Calculated from: (${rngBase} * (${rng}*2)) + (1-${rng}).`);
  //calculate raw treasure in GP
  let goldRaw = Math.floor((goldRoll.total * treasureMap.gp_global_modifier * gp_party_modifier * minionModifier) * rngModifier);
  //determine chance for electrum
    //set default
    let electrumChance = 0.0;
    //override with treasure map data
    if (creatureType === 'undead') {electrumChance = 0.6}
  //determine coin distribution
  let treasureFinal = splitCoins(goldRaw,apl,electrumChance,rngModifier);
  //log what was done
  console.log(`Rolled ${goldRaw} from ${rollStringFinal}. Calculated from ${goldRoll.total} base gold times a ${gp_party_modifier} party modifier and a ${treasureMap.gp_global_modifier} global modifier. Then an RNG of ${rngModifier} applied.`);
  //return final treasure
  return treasureFinal;
}

//roll for creature loot
export async function rollLoot(rollTotal,isMinion,treasureMap,creatureLoot) {
  //exit if failure
  if (rollTotal < treasureMap.loot_target || (isMinion && Math.random() < 0.80)) {
    //log what was done
    console.log(`No creature loot added. Rolled ${rollTotal} with a creature loot target of at least ${treasureMap.gp_target}.`);
    //return
    return [{'type':null,'pack':null,'item':null}];
  }
  //init loot
  let loot = [];
  //determine number of items
    //set baseline
    let lootMax = Math.floor(Math.random() * treasureMap.loot_max) + 1;
    //alter for minions
    if(isMinion) {lootMax = 1;}
  //loop through and make item list
  for (let i = 1; i <= lootMax; i++) {
    //roll for item
    let itemRoll = Math.floor(Math.random() * 100)+1;
    //add item
    loot.push({'type':'generic','pack':null,'item':creatureLoot.results[itemRoll]});
  }
  //log what was done
  console.log(`Prepared ${loot.length} loot items to the character.`);
  //return final loot
  return loot;
}

//roll for special item
export async function rollSpecial(rollTotal,isMinion,treasureMap,specialTable,gemstoneLevels,gemstones,book_library,book_interesting,book_evil) {
  //exit if failure
  if (rollTotal < treasureMap.special_target || (isMinion && Math.random() < 0.80)) {
    //log what was done
    console.log(`No special item added. Rolled ${rollTotal} with a special item target of at least ${treasureMap.special_target}.`);
    //return
    return [{'type':null,'pack':null,'item':null}];
  }
  //init special
  let special = [];
  //determine number of items
    //set baseline
    let specialMax = Math.floor(Math.random() * treasureMap.special_max) + 1;
    //alter for minions
    if(isMinion) {specialMax = 1;}
  //loop through and make item list
  for (let i = 1; i <= specialMax; i++) {
    //roll for special item
    let specialRoll = await new Roll('1d12').evaluate();
    //pick appropriate item
    let specialRollItem = specialTable[specialRoll.total];
      //books
        //library
        if(specialRollItem === 'book_library') {
          //roll for resulting item
          let itemRoll = Math.floor(Math.random() * 100)+1;
          //add item
          special.push({'type':'book','pack':null,'item':book_library.results[itemRoll]});
        }
        //interesting
        if(specialRollItem === 'book_interesting') {
          //roll for resulting item
          let itemRoll = Math.floor(Math.random() * 100)+1;
          //add item
          special.push({'type':'book','pack':null,'item':book_interesting.results[itemRoll]});
        }
        //evil
        if(specialRollItem === 'book_evil') {
          //roll for resulting item
          let itemRoll = Math.floor(Math.random() * 100)+1;
          //add item
          special.push({'type':'book','pack':null,'item':book_evil.results[itemRoll]});
        }
      //gemstones
        //low
        if(specialRollItem === 'gem_low') {
          //roll for resulting item
          let itemRoll = Math.floor(Math.random() * gemstones[gemstoneLevels[1]].die.substring(1))+1
          //add item
          special.push({'type':'gemstone','pack':'world.ddb-dark-forces-ddb-items','item':gemstones[gemstoneLevels[1]].results[itemRoll]});
        }
        //medium
        if(specialRollItem === 'gem_med') {
          //roll for resulting item
          let itemRoll = Math.floor(Math.random() * gemstones[gemstoneLevels[2]].die.substring(1))+1
          //add item
          special.push({'type':'gemstone','pack':'world.ddb-dark-forces-ddb-items','item':gemstones[gemstoneLevels[2]].results[itemRoll]});
        }
        //high
        if(specialRollItem === 'gem_high') {
          //roll for resulting item
          let itemRoll = Math.floor(Math.random() * gemstones[gemstoneLevels[3]].die.substring(1))+1
          //add item
          special.push({'type':'gemstone','pack':'world.ddb-dark-forces-ddb-items','item':gemstones[gemstoneLevels[3]].results[itemRoll]});
        }
  }
  //log what was done
  console.log(`Prepared ${special.length} special items to the character.`);
  //return final loot
  return special;
}

//return distribution of coins from base gold
export async function splitCoins(goldRaw,apl,electrumChance,rngModifier) {
  //init coin values
  let goldLeft = goldRaw;
  let cp = 0;
  let sp = 0;
  let ep = 0;
  let gp = 0;
  let pp = 0;
  //define coin conversion from gold
  let cpER = 100;
  let spER = 10;
  let epER = 2;
  let gpER = 1;
  let ppER = 0.1;
  //define range for each coin type
  let cpRange = new Set([1,2,3,4,5,6,7,8,9]);;
  let spRange = new Set([1,2,3,4,5,6,7,8,9,10,11,12,13,14]);
  let gpRange = new Set([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);
  let ppRange = new Set([5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);
  //determine whether electrum is returned
  if(Math.random() <= electrumChance) {
    //convert everything to electrum
    cp = goldLeft * epER;
    //apply rng
    cp = cp * rngModifier;
    //log what was done
    console.log(`Split ${goldRaw} into ${cp}cp, ${sp}sp, ${ep}ep, ${gp}gp, and ${pp}pp. ${goldLeft}gp was left unsplit.`);
    //return currency
    return [cp,sp,ep,gp,pp];
  }
  //split out coins based on APL, skipping electrum
    //platinum
    if(ppRange.has(apl)) {
      //determine split
      pp = Math.floor((goldLeft * 0.75) * ppER);
      //reduce goldLeft by split amount
      goldLeft = goldLeft - (pp / ppER);
    }
    //gold
    if(gpRange.has(apl)) {
      //determine split
      gp = Math.floor((goldLeft * 0.90) * gpER);
      //reduce goldLeft by split amount
      goldLeft = goldLeft - (gp / gpER);
    }
    //silver
    if(spRange.has(apl)) {
      //determine split
      sp = Math.floor((goldLeft * 0.95) * spER);
      //reduce goldLeft by split amount
      goldLeft = goldLeft - (sp / spER);
    }
    //copper
    if(cpRange.has(apl)) {
      //determine split
      cp = Math.floor((goldLeft * 1.0) * cpER);
      //reduce goldLeft by split amount
      goldLeft = goldLeft - (cp / cpER);
    }
  //log what was done
  console.log(`Split ${goldRaw} into ${cp}cp, ${sp}sp, ${ep}ep, ${gp}gp, and ${pp}pp. ${goldLeft}gp was left unsplit.`);
  //return currency
  return [cp,sp,ep,gp,pp];
}
