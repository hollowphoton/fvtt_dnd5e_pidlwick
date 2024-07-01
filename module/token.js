//import functions
import {getAvgPartyLevel} from "./party.js";
import {rollGold, rollLoot, rollSpecial, splitCoins} from "./treasure.js";

//tell user no character is selected
export async function noTokenSelected() {
  //wrap the whole thing in a promise, so that it waits for the form to be interacted with
  return new Promise(async (resolve) => {
    //init vars
    let errorMessage = ``;
    //create error text based on current settings
    errorMessage = `<h3>No Token Selected</h3>This macro runs for the currently selected token(s) in the scene. To select token(s), click or draw a box around token(s) in the current scene.<br><br>`;
    //create final dialog data
    const dialogData = {
      title: `Macro Issue`,
      content: errorMessage,
      buttons: {}
    };
    //add buttons
      //Ok
      dialogData.buttons.cancel = {
        label: `Ok`,
        callback: () => { },
        icon: '<i class="fas fa-check"></i>'
      };
    //render dialog
    const dialog = new Dialog(dialogData).render(true);
    //log what was done
    console.log(`Told the user that no character was selected.`);
  });
}

//check if token(s) are selected
export async function initDefeatEnemy() {
  //is there a selected character? warn if no
  if (!canvas.tokens.controlled.length) {
    //warn player
    noTokenSelected();
  } else {
    //run the function for all selected tokens
    canvas.tokens.controlled.forEach(function(token){
      defeatEnemy(token);
    });
  }
}

//replace current token with appropriate treasure
export async function defeatEnemy(token) {
  //get JSON data
  let treasureData = await foundry.utils.fetchJsonWithTimeout('modules/fvtt_dnd5e_pidlwick/data/treasure.json');
  let d100Data = await foundry.utils.fetchJsonWithTimeout('modules/fvtt_dnd5e_pidlwick/data/treasure.json');
  //parse info from the creature
    //core stats
    let creatureType = token.actor.system.details.type.value;
    let creatureSubType = token.actor.system.details.type.subtype;      
    let creatureCR = token.actor.system.details.cr;
    let isMinion = false;
    //update modifier if minion
    token.actor.effects.forEach(function(effect){
      //check for minion stat
      if (effect === 'Minion') {
        //change liklihood of treasure + loot
        isMinion = true;
      }
    });
    //log what was done
    console.log(`Preparing treasure for ${creatureType}, subtype: ${creatureSubType}, cr: ${creatureCR}, minion: ${isMinion}, minionMod: ${minionModifier}.`);
  //parse info from PCs
    //calculate APL
    let avgPartyLevel = await getAvgPartyLevel(1);
    //calculate gemstone level
      //base is 10
      let gemstoneLevels = [10,50,100];
      //upgrade level based on APL
      if (avgPartyLevel >= 6 && avgPartyLevel <= 10) {gemstoneLevels = [50,100,500]};
      if (avgPartyLevel >= 11 && avgPartyLevel <= 15) {gemstoneLevels = [100,500,1000]};
      if (avgPartyLevel >= 16 && avgPartyLevel <= 10) {gemstoneLevels = [500,1000,5000]};
    //log what was done
    console.log(`Party APL: ${avgPartyLevel}, gemstone level: ${gemstoneLevel}.`);
  //parse needed data from JSON
    //individual treasure
      //get base entry
      let individualTreasure = treasureData.individual_treasure[creatureType];
      //filter out entries that don't match this creature
      for (let i = 0; i < individualTreasure.length; i++) {
        if (individualTreasure[i].cr_start > creatureCR || individualTreasure[i].cr_end < creatureCR) {
            individualTreasure.splice(i, 1);
        }
      }
      //calculate min treasure chance
      let minTreasureChance = Math.min(individualTreasure[0].gp_target,individualTreasure[0].loot_target,individualTreasure[0].special_target);
    //creature loot
    let creatureLoot = treasureData.creature_loot[creatureType][creatureSubType];
    //special table
    let specialTable = treasureData.special_roll;
    //books
    let book_library = d100Data.items['Library Books'];
    let book_interesting = d100Data.items['Interesting Books'];
    let book_evil = d100Data.items['Banned & Evil Books'];
    //gemstones
    let gemstones = treasureData.gemstones;
  //roll some dice
    //roll for chance of treasure
    let treasureRoll = await new Roll(individualTreasure[0].die).evaluate();
    //exit if failure
    if (treasureRoll.total < minTreasureChance) {
      //mark token dead
      markTokenDead(token);
      //log what was done
      console.log(`No treasure added. Rolled ${treasureChance.total} with a target of at least ${minChance}.`);
      //return
      return;
    }
    //roll for gold if initial roll was above threshold
    let awardGold = await rollGold(treasureRoll.total,creatureType,isMinion,individualTreasure[0],0.25);
    //roll for loot if initial roll was above threshold
    let awardLoot = await rollLoot(treasureRoll.total,isMinion,individualTreasure[0],creatureLoot);
    //roll for a special item if initial roll was above threshold
    let awardSpecial = await rollSpecial(treasureRoll.total,isMinion,individualTreasure[0],specialTable,gemstoneLevels,gemstones,book_library,book_interesting,book_evil);
  //post prompt to accept/change the results
    //-------------------------------------------------------------------------------------------------------------------------------------------------------------write later---
  //add everything to the token
    //turn token into item pile
    game.itempiles.API.turnTokensIntoItemPiles(token);
    //currency
    await token.actor.update({
      "system.currency.cp": token.actor.system.currency.cp + awardGold[1],
      "system.currency.sp": token.actor.system.currency.sp + awardGold[2],
      "system.currency.sp": token.actor.system.currency.sp + awardGold[3],
      "system.currency.gp": token.actor.system.currency.gp + awardGold[4],
      "system.currency.pp": token.actor.system.currency.pp + awardGold[5]
    });
    //loot
    awardLoot.forEach(function(loot) {
      giveTokenItem(token,loot.type,loot.item);
    });
    //special
    awardSpecial.forEach(function(special) {
      giveTokenItem(token,special.type,special.item);
    });
  //turn the token dead
    //-------------------------------------------------------------------------------------------------------------------------------------------------------------write later---
  //post chat message
    //prepare data
    let messageData = {
      token: this,
      summary_img: summary_img,
      summary_name: summary_name,
      summary_subtitle: summary_subtitle,
      summary_desc: summary_desc
    };
    //prepare template
    messageTemplate = 'modules/fvtt_dnd5e_pidlwick/templates/chat/individualTreasure.html';
    //render template
    messageContent = await renderTemplate(messageTemplate, messageData);
    //make message
    let macroMsg = await rollResult.toMessage({
      id: chatId,
      user: game.user.id,
      speaker: {actor: this.id, token: this.token, alias: this.name},
      content: messageContent
    },{keepId:true});
    if(game.modules.get("dice-so-nice").active){
      //wait for dice
      await game.dice3d.waitFor3DAnimationByMessageID(chatId);
    }
  //log what was done
  console.log(`The defeatEnemy function has completed.`);
}

//make token look dead--------------------------------------------------------------
export async function markTokenDead(token) {
  //write this
}

//give token an item--------------------------------------------------------------
export async function giveTokenItem(token,type,item) {
  //write this
  //----------------------------------------------------------------------------------------------------------------------------------------------WHERE I LEFT OFF---------------------
  //set some kind of standardized weight to creature loot
}