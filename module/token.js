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
  //get treasure metadata
  let treasureData = await foundry.utils.fetchJsonWithTimeout('modules/fvtt_dnd5e_pidlwick/data/treasure.json');
  //parse info from the creature
    //core stats
    let creatureType = token.actor.system.details.type.value;
    let creatureSubType = token.actor.system.details.type.subtype;      
    let creatureCR = token.actor.system.details.cr;
    let isMinion = false;
    let minionModifier = 1;
    //update modifier if minion
    token.actor.effects.forEach(function(effect){
      //check for minion stat
      if (effect === 'Minion') {
        //change liklihood of treasure + loot
        isMinion = true;
        minionModifier = 0.2;
      }
    });
    //log what was done
    console.log(`Preparing treasure for ${creatureType}, subtype: ${creatureSubType}, cr: ${creatureCR}, minion: ${isMinion}, minionMod: ${minionModifier}.`);
  //parse info from PCs
    //calculate APL
    let avgPartyLevel = await getAvgPartyLevel(1);
    //calculate gemstone level
      //base is 10
      let gemstoneLevel = [10,50,100];
      //upgrade level based on APL
      if (avgPartyLevel >= 6 && avgPartyLevel <= 10) {gemstoneLevel = [50,100,500]};
      if (avgPartyLevel >= 11 && avgPartyLevel <= 15) {gemstoneLevel = [100,500,1000]};
      if (avgPartyLevel >= 16 && avgPartyLevel <= 10) {gemstoneLevel = [500,1000,5000]};
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
    let creatureLoot = treasureData.creature_loot[creatureType];
    //gemstones
    let gemstones = treasureData.gemstones[gemstoneLevel];
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
    let awardGold = await rollGold(treasureRoll.total,creatureType,individualTreasure[0],0.25);
    //roll for loot if initial roll was above threshold
    let awardLoot = await rollLoot(treasureRoll.total,creatureType,individualTreasure[0],creatureLoot);
    //roll for a special item if initial roll was above threshold
    let awardSpecial = await rollSpecial(treasureRoll.total,individualTreasure[0],gemstones);






  
  //pop up form to confirm everything

  //add everything to the token
        //update token
        await token.actor.update({
          "system.currency.cp": token.actor.system.currency.cp + treasureFinal[1],
          "system.currency.sp": token.actor.system.currency.sp + treasureFinal[2],
          "system.currency.sp": token.actor.system.currency.sp + treasureFinal[3],
          "system.currency.gp": token.actor.system.currency.gp + treasureFinal[4],
          "system.currency.pp": token.actor.system.currency.pp + treasureFinal[5]
      });
  //turn the token dead

  //post chat message













  //turn token into item pile
  game.itempiles.API.turnTokensIntoItemPiles(token);
  //populate token with treasure

                  //get table data
                  let itemData = await game.packs.get(itemLocation).getDocument(itemId);
                  //add or increase the count of the item, depending on type, if the actor has it
                  if (this.items.getName(itemData.name)) {
                    //if this is an item, increase the count
                    if (itemData.type === 'item') {
                      //get current quantity
                      oldValue = this.items.getName(itemData.name).system.quantity;
                      newValue = oldValue + addAmount;
                      //increase severity of the condition
                      this.items.getName(itemData.name).update({'system.quantity': newValue});
                      //create message text
                      flavorText = `Quantity has increased from <strong>` + oldValue + `</strong> to <strong>` + newValue + `</strong>.`;
                    //if this is a condition, increase the severity
                    } else if (itemData.type === 'condition') {
                      //get current severity
                      oldValue = this.items.getName(itemData.name).system.severity;
                      newValue = oldValue + addAmount;
                      //increase severity of the condition
                      this.items.getName(itemData.name).update({'system.severity': newValue});
                      //create message text
                      flavorText = this.getFlavorText('item','condition','increase') + `Severity has increased from <strong>` + oldValue + `</strong> to <strong>` + newValue + `</strong>.`;
                    //if this is a weapon or armor, add another one
                    } else if (itemData.type === 'weapon' || itemData.type === 'armor') {
                      //add item to the players inventory
                      await this.createEmbeddedDocuments('Item', [itemData]);
                      //create message text
                      flavorText = `You add another one of these to your inventory.`;
                    }
                  } else {
                    //if this is an item, add it
                    if (itemData.type === 'item') {
                      //give the character the item
                      await this.createEmbeddedDocuments('Item', [itemData]);
                      //increase severity of the condition
                      this.items.getName(itemData.name).update({'system.quantity': addAmount});
                      //create message text
                      flavorText = `You add <strong>` + addAmount + `</strong> of these to your inventory..`;
                    //if this is a condition, add it
                    } else if (itemData.type === 'condition') {
                      //give the character the item
                      await this.createEmbeddedDocuments('Item', [itemData]);
                      //increase severity of the condition
                      this.items.getName(itemData.name).update({'system.severity': addAmount});
                      //create message text
                      flavorText = this.getFlavorText('item','condition','add') + `, with a severity of <strong>` + addAmount + `</strong>.`;
                    //if this is a weapon or armor, add it
                    } else if (itemData.type === 'weapon' || itemData.type === 'armor') {
                      //add item to the players inventory
                      await this.createEmbeddedDocuments('Item', [itemData]);
                      //create message text
                      flavorText = `You add this to your inventory.`;
                    }
                  }
  //make token dead


                  ///ADD LOOT

                  //have a book randomly be in there sometimes? or should that be left to the d100 macro? probably.
                  //maybe redo the creature loot tables to contain books where appropriate. nah seems fine.


                  //need a user form to pop up first?


  //generate chat message
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
  console.log(`Treasure added. Rolled ${treasureChance.total} with a target of ${rollTarget}. Raw treasure set to ${treasureRaw}: ${treasureRoll.total} * ${partyModifier} * ${globalModifier} * ${minionModifier}. Replaced CR ${creatureCR} ${creatureType} with Level ${avgPartyLevel} treasure totalling ${treasureRaw} gold. The gold was split into: ${treasureCP}CP, ${treasureSP}SP, ${treasureEP}EP, ${treasureGP}GP, ${treasurePP}PP`);
}

//make token look dead--------------------------------------------------------------
export async function markTokenDead(token) {
  //write this
}