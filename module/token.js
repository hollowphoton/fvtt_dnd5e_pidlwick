//import functions
import {getAvgPartyLevel} from "./party.js";
import {rollGold, rollLoot, rollSpecial} from "./treasure.js";

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
export async function initTreasurePouch() {
  //is there a selected character? warn if no
  if (!canvas.tokens.controlled.length) {
    //warn player
    noTokenSelected();
  } else {
    //run the function for all selected tokens
    canvas.tokens.controlled.forEach(function(token){
      treasurePouch(token);
    });
  }
}

//replace current token with appropriate treasure
export async function treasurePouch(token) {
  //log token
  console.log(`Running treasurePouch on ${token}.`);
  //get JSON data
  let treasureData = await foundry.utils.fetchJsonWithTimeout('modules/fvtt_dnd5e_pidlwick/data/treasure.json');
  let d100Data = await foundry.utils.fetchJsonWithTimeout('modules/fvtt_dnd5e_pidlwick/data/d100.json');
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
    //update subtype if blank
    if (creatureSubType === '') {creatureSubType = 'none';}
    //log what was done
    console.log(`Preparing treasure for ${creatureType}, subtype: ${creatureSubType}, cr: ${creatureCR}, minion: ${isMinion}.`);
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
    console.log(`Party APL: ${avgPartyLevel}, gemstone levels: ${gemstoneLevels}.`);
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
      console.log(`No treasure added. Rolled ${treasureRoll.total} with a target of at least ${minTreasureChance}.`);
      //return
      return;
    }
    //roll for gold if initial roll was above threshold
    let awardGold = await rollGold(treasureRoll.total,creatureType,isMinion,individualTreasure[0],avgPartyLevel,0.25);
    //roll for loot if initial roll was above threshold
    let awardLoot = await rollLoot(treasureRoll.total,isMinion,individualTreasure[0],creatureLoot);
    //roll for a special item if initial roll was above threshold
    let awardSpecial = await rollSpecial(treasureRoll.total,isMinion,individualTreasure[0],specialTable,gemstoneLevels,gemstones,book_library,book_interesting,book_evil);
    //log what was done
    console.log(`awardGold:`,awardGold);
    console.log(`awardLoot:`,awardLoot);
    console.log(`awardSpecial:`,awardSpecial);
  //post prompt to accept/change the results
    //-------------------------------------------------------------------------------------------------------------------------------------------------------------write later---
  //add everything to the token
    //turn token into item pile
    await game.itempiles.API.turnTokensIntoItemPiles(token);
    //adjust item pile settings
    await token.actor.update({
      "flags.item-piles.data.shareCurrenciesEnabled": false,
      "flags.item-piles.data.takeAllEnabled": true,
      "flags.item-piles.data.overrideSingleItemScale": false,
      "flags.item-piles.data.displayOne": false,
      "flags.item-piles.data.showItemName": false
    });
    //remove existing  items
      //make list of items to remove
      let removeList = token.actor.items.filter(i => ["weapon","equipment","consumable"].includes(i.type)).map(i => i.id);
      //remove all in list
      await token.actor.deleteEmbeddedDocuments('Item', removeList);
    //update currency
    await token.actor.update({
      "system.currency.cp": token.actor.system.currency.cp + awardGold[0],
      "system.currency.sp": token.actor.system.currency.sp + awardGold[1],
      "system.currency.ep": token.actor.system.currency.ep + awardGold[2],
      "system.currency.gp": token.actor.system.currency.gp + awardGold[3],
      "system.currency.pp": token.actor.system.currency.pp + awardGold[4]
    });
    //log what was done
    console.log(`Added ${awardGold[0]}cp, ${awardGold[1]}sp, ${awardGold[2]}ep, ${awardGold[3]}gp, and ${awardGold[4]}pp.`);
    //add loot
    for (let i = 0; i < awardLoot.length; i++) {
      //if item is null, exit loop
      if (awardLoot[i].item) {
        //if this is a pack item, drop item directly
        if (awardLoot[i].pack) {await giveItemFromPack(token,awardLoot[i].type,awardLoot[i].pack,awardLoot[i].item);}
        //if this is a generic item, create from scratch
        if (!awardLoot[i].pack) {await giveItemFromScratch(token,awardLoot[i].type,awardLoot[i].item);}
      }
    }
    //log what was done
    console.log(`Added ${awardLoot.length} loot items to the character.`);
    //add special
    for (let i = 0; i < awardSpecial.length; i++) {
      //if item is null, exit loop
      if (awardSpecial[i].item) {
        //if this is a pack item, drop item directly
        if (awardSpecial[i].pack) {await giveItemFromPack(token,awardSpecial[i].type,awardSpecial[i].pack,awardSpecial[i].item);}
        //if this is a generic item, create from scratch
        if (!awardSpecial[i].pack) {await giveItemFromScratch(token,awardSpecial[i].type,awardSpecial[i].item);}
      }
    }
    //log what was done
    console.log(`Added ${awardSpecial.length} special items to the character.`);
  //turn the token dead
    //-------------------------------------------------------------------------------------------------------------------------------------------------------------write later---
  //post chat message
/*     //prepare data
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
    } */
  //log what was done
  console.log(`The treasurePouch function has completed.`);
}

//make token look dead--------------------------------------------------------------
export async function markTokenDead(token) {
  //write this
}

//give token an item from a pack--------------------------------------------------------------
export async function giveItemFromPack(token,type,packName,itemName) {
  //load related pack
  let entry = game.packs.get(packName).index.getName(itemName);
  //get item from pack
  let item = await game.packs.get(packName).getDocument(entry._id);
  //make a copy
  let special = item.toObject();
  //make any modifications
    //gemstones
    if(type === 'gemstone') {
      //add weight
      special.system.weight.value = Math.round(((Math.random() * 2.5) + 0.02) * 100) / 100;
    }
  //give item to character
  await token.actor.createEmbeddedDocuments('Item', [special]);
  //await game.itempiles.API.addItems(token.actor, [{"item": special, "quantity": 1}]);
  //log what was done
  console.log(`Item added.`);
}

//give token an item from scratch--------------------------------------------------------------
export async function giveItemFromScratch(token,type,itemName) {
  //book
  if(type === 'book') {
    //get base book item
      //load related pack
      let entry = game.packs.get('world.ddb-dark-forces-ddb-items').index.getName('Book');
      //get item from pack
      let item = await game.packs.get('world.ddb-dark-forces-ddb-items').getDocument(entry._id);
      //make a copy
      let book = item.toObject();
    //modify to be this book
      //get book split character
      let bookSplit = itemName.search(`': `);
      //make new ID
        //generate
        let bookId = await generateANID(16);
        //assign
		    book._id = bookId;
		    book.id = bookId;
      //book title
      book.name = itemName.substring(1,bookSplit);
      //book description
      book.system.description.value = '</p>' + itemName.substring(bookSplit + 3) + '</p>';
      //book source
      book.system.source.book = `Chris's Answer for Everything`;
      //book page
      book.system.source.page = (Math.floor(Math.random() * 969) + 1).toString();
      //book weight
      book.system.weight.value = Math.round(((Math.random() * 2.5) + 0.5) * 100) / 100;
      //book rarity
        //calculate rarity
        let bookRarity = Math.random();
        //assign rarity
        if(bookRarity > 0.95) {
          book.system.rarity = 'veryRare';
          book.system.price.value = Math.floor(Math.random() * 250) + 500;
        } else if(bookRarity > 0.8) {
          book.system.rarity = 'rare';
          book.system.price.value = Math.floor(Math.random() * 100) + 100;
        } else if(bookRarity > 0.5) {
          book.system.rarity = 'uncommon';
          book.system.price.value = Math.floor(Math.random() * 25) + 10;
        } else {
          book.system.rarity = 'common';
          book.system.price.value = Math.floor(Math.random() * 5) + 1;
        }
      //item type
      book.system.type.value = 'treasure';
    //give item to character
    await token.actor.createEmbeddedDocuments('Item', [book]);
    //await game.itempiles.API.addItems(token.actor, [{"item": book, "quantity": 1}]);
    //log what was done
    console.log(`Book added with an ID of ${bookId}.`);
  }
  //creature loot
  if(type === 'generic') {
    //get base junk item
      //load related pack
      let entry = game.packs.get('world.ddb-dark-forces-ddb-items').index.getName('String');
      //get item from pack
      let item = await game.packs.get('world.ddb-dark-forces-ddb-items').getDocument(entry._id);
      //make a copy
      let loot = item.toObject();
    //modify to be this junk
      //make new ID
        //generate
        let lootId = await generateANID(16);
        //assign
		    loot._id = lootId;
		    loot.id = lootId;
      //junk name
      loot.name = itemName;
      //junk image
      loot.img = 'icons/containers/bags/sack-twisted-leather-red.webp';
      //junk image
      loot.system.description.value = '';
      //junk source
      loot.system.source.book = `Chris's Answer for Everything`;
      //junk page
      loot.system.source.page = (Math.floor(Math.random() * 969) + 1).toString();
      //junk weight
      loot.system.weight.value = Math.round(((Math.random() * 2.5) + 0.1) * 100) / 100;
      //junk rarity
        //calculate rarity
        let lootRarity = Math.random();
        //assign rarity
        if(lootRarity > 0.5) {
          loot.system.rarity = 'uncommon';
          loot.system.price.denomination = 'sp';
          loot.system.price.value = Math.floor(Math.random() * 5) + 1;
        } else {
          loot.system.rarity = 'common';
          loot.system.price.denomination = 'cp';
          loot.system.price.value = Math.floor(Math.random() * 25) + 1;
        }
      //item type
      loot.system.type.value = 'junk';
    //give item to character
    await token.actor.createEmbeddedDocuments('Item', [loot]);
    //await game.itempiles.API.addItems(token.actor, [{"item": loot, "quantity": 1}]);
    //log what was done
    console.log(`Loot added with an ID of ${lootId}.`);
  }
}

//generate _id
export async function generateANID(size) {
  //make string of acceptable characters
  var p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  //return random value 
  return [...Array(size)].reduce(a=>a+p[~~(Math.random()*p.length)],'');
}

//token health - feeling good
export async function tokenHealthGreen() {
  //update tokens
  canvas.tokens.controlled.forEach(function(t){
    t.document.update({'flags.dnd5e.tokenRing.colors.ring': ``});
    t.document.update({'flags.dnd5e.tokenRing.colors.background': ``});
    t.document.update({'flags.dnd5e.tokenRing.effects': 1});
  });
  //refresh token display
  if (updates.length) canvas.scene.updateEmbeddedDocuments("Token", updates);
}

//token health - beat up
export async function tokenHealthOrange() {
  //update tokens
  canvas.tokens.controlled.forEach(function(t){
    t.document.update({'flags.dnd5e.tokenRing.colors.ring': `#ffea00`});
    t.document.update({'flags.dnd5e.tokenRing.colors.background': `#f28202`});
    t.document.update({'flags.dnd5e.tokenRing.effects': 5});
  });
  //refresh token display
  if (updates.length) canvas.scene.updateEmbeddedDocuments("Token", updates);
}

//token health - nearly dead
export async function tokenHealthRed() {
  //update tokens
  canvas.tokens.controlled.forEach(function(t){
    t.document.update({'flags.dnd5e.tokenRing.colors.ring': `#ff0000`});
    t.document.update({'flags.dnd5e.tokenRing.colors.background': `#9d0101`});
    t.document.update({'flags.dnd5e.tokenRing.effects': 15});
  });
  //refresh token display
  if (updates.length) canvas.scene.updateEmbeddedDocuments("Token", updates);
}