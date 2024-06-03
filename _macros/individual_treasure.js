// PREPARE LAST RITES //
  // FEATURES 
    //make token look dead & turn it into an item pile
    //populate token with dynamic treasure based on creature type, party level, and dice rolls
    //monsters have a chance to not drop any loot
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
    let avgPartyLevel = await getAvgPartyLevel();
    let partyMultiplier = 0;
    let fantasyMultiplier = 0;
    let baseGold = 0;
    let treasureCP = 0;
    let treasureSP = 0;
    let treasureEP = 0;
    let treasureGP = 0;
    let treasurePP = 0;
    //let treasureData = await parseJSONdata('modules/fvtt_dnd5e_pidlwick/data/individualTreasure.json');
    //parse important info from the JSON
    partyMultiplier = 0; //make this pull from the json
    fantasyMultiplier = 0; //make this pull from the json
    baseGold = 0; //make this pull from the json
    //roll to see if treasure is dropped
    



      //decide what treasure to put 

        //roll percentage die for whether they get anything

        //create item pile where selected token is otherwise skip the rest

        //roll die for what amount of gold

        //split gold value into various chunks

      //turn token into item pile

      //populate token with treasure

    //make token dead





    //log what was done
    console.log(`Replaced CR ${creatureCR} ${creatureType} with Level ${avgPartyLevel} treasure totalling ${baseGold} gold. The gold was split into: ${treasureCP}CP, ${treasureSP}SP, ${treasureEP}EP, ${treasureGP}GP, ${treasurePP}PP`);
  }

  //get the average party level
  async function getAvgPartyLevel() {
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
    avgPartyLevel = Math.floor(partyLevels/partyMembers);
    //log what was done
    console.log(`The average party level is ${avgPartyLevel}. There were ${partyLevels} total levels across ${partyMembers} characters.`);
    //return avg party level
    return avgPartyLevel;
  }

  //parse JSON into an object
  async function parseJSONdata(jsonFilePath) {
    //wrap the whole thing in a promise, so that it waits for the file
    return new Promise(async (resolve) => {
      //get the file
      async function fetchJSONFile(filePath) {
        try {
          const response = await fetch(filePath);
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error fetching JSON file:', error);
        }
      }
      // Fetch JSON data and set it as a variable
      fetchJSONFile(jsonFilePath)
        .then(jsonData => {
          //log the json
          console.log(jsonData);
          // Now jsonData contains the parsed JSON data
          
        });
    });

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