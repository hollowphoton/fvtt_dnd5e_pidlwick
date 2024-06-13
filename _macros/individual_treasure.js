// PREPARE LAST RITES //
  // FEATURES 
    //make token look dead & turn it into an item pile
    //populate token with dynamic treasure and items based on creature type, party level, and dice rolls
    //not every creature will drop something
  // CREDIT
    //created by hollowphoton https://github.com/hollowphoton
    //informed by the individual treasure rules in the Dungeon Master's Guide
    //informed by the random treasure tables made by XP to Level 3 https://www.patreon.com/posts/40857187
    //informed by many youtube videos and reddit threads about making compelling loot experiences

//begin macro
initPrepareLastRites();

// FUNCTIONS //

  //replace current token with appropriate treasure
  async function prepareLastRites(token) {
    //init vars
    let creatureType = token.actor.system.details.type.value;
    let creatureCR = token.actor.system.details.cr;
    let avgPartyLevel = await getAvgPartyLevel(1);

      //see if I can just eat the JSON entry as a single thing that I can reference everywhere else

    let partyModifier = 1;
    let globalModifier = 1;
    let minionModifier = 1;
    let lootModifier = 1;
    let rollDie = '';
    let rollTarget = 0;
    let baseGold = '';
    let treasureRaw = 0;
    //parse info from the creature
      //minion status
      token.actor.effects.forEach(function(effect){
        //check for minion stat
        if (effect === 'Minion') {
          //change liklihood of treasure + loot
          minionModifier = 0.2;
        }
      });
    //parse info from the json
      //parse json
      let treasureData = await foundry.utils.fetchJsonWithTimeout('modules/fvtt_dnd5e_pidlwick/data/treasure.json');
      //loop through and find a valid entry
      treasureData[creatureType].forEach(function(entry){
        //check for row that matches creature
        if (entry.cr_start <= creatureCR && entry.cr_end >= creatureCR) {
          //pull parameters
          rollDie = entry.die;
          rollTarget = entry.target;
          baseGold = entry.base_gp;
          if(entry.party_modifier === 'apl') {
            partyModifier = avgPartyLevel;
          } else {
            partyModifier = 1;
          }
          globalModifier = entry.global_modifier;
        }
      });
    //roll to see if treasure is dropped
    let treasureChance = await new Roll(rollDie).evaluate();
    //exit if failure
    if (treasureChance.total <= rollTarget) {
      //mark token dead
      markTokenDead(token);
      //log what was done
      console.log(`No treasure added. Rolled ${treasureChance.total} with a target of ${rollTarget}.`);
      //return
      return;
    }
    //add bonus dice if certain conditions are met
      //add 1d6 for nat100

      //add 1d6 for every 5th level

    //roll for treasure
    let treasureRoll = await new Roll(baseGold).evaluate();
    //calculate raw treasure in GP
    treasureRaw = Math.floor(treasureRoll.total * partyModifier * globalModifier * minionModifier);
    //adjust final treasure with RNG (between .75 and 1.25)
    treasureRaw = Math.floor(treasureRaw * ((Math.random()*0.5)+0.75));
    //give gold to token
      //determine coin distribution
      treasureFinal = splitCoins(treasureRaw,treasureRoll.total);
      //update token
      await token.actor.update({
          "system.currency.cp": token.actor.system.currency.cp + treasureFinal[1],
          "system.currency.sp": token.actor.system.currency.sp + treasureFinal[2],
          "system.currency.sp": token.actor.system.currency.sp + treasureFinal[3],
          "system.currency.gp": token.actor.system.currency.gp + treasureFinal[4],
          "system.currency.pp": token.actor.system.currency.pp + treasureFinal[5]
      });

    treasureCP = 0;
    treasureSP = 0;
    treasureEP = 0;
    treasureGP = 0;
    treasurePP = 0;


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

  //make token look dead
  async function markTokenDead(token) {
    //write this
  }

  //return distribution of coins from base gold
  async function splitCoins(goldPieces,rollTotal) {
    //write this
    //have some roll that determines whether electrum is used
    //think about having a range for each currency
    return [cp,sp,ep,gp,pp];
  }

  //get the average party level
  async function getAvgPartyLevel(multiplier) {
    //init vars
    let partyLevels = 0;
    let partyMembers = 0;
    let avgPartyLevel = 0;
    //run the function for all members of the party
    game.actors.get('OY1wOXOYmKzMMhEV').system.members.forEach(function(partyMember){
      //increment counters
      partyLevels = partyLevels + partyMember.actor.system.details.level;
      partyMembers = partyMembers + 1;
    });
    //calculate avg party level
    avgPartyLevel = Math.floor((partyLevels/partyMembers)*multiplier);
    //log what was done
    console.log(`The average party level is ${avgPartyLevel}. There were ${partyLevels} total levels across ${partyMembers} characters.`);
    //return avg party level
    return avgPartyLevel;
  }

  //check if token(s) are selected
  async function initPrepareLastRites() {
    //is there a selected character? warn if no
    if (!canvas.tokens.controlled.length) {
      //warn player
      noTokenSelected();
    } else {
      //run the function for all selected tokens
      canvas.tokens.controlled.forEach(function(token){
        prepareLastRites(token);
      });
    }
  }

  //tell user no character is selected
  async function noTokenSelected() {
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