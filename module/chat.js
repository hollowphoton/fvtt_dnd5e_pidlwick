//token health - feeling good
export async function whisper() {
  // WHIPSER TO PLAYERS //
    // FEATURES 
      // opens dialog window to chat with online/offline players
      // 

    // CREDIT
      // created by hollowphoton https://github.com/hollowphoton
      // based on a whisper macro created by Nelson#3570 https://www.reddit.com/r/FoundryVTT/comments/lzbra1/are_there_any_modules_for_making_whispers_a/

  //init vars
  let applyChanges = false;

  //set vars
  let users = game.users.filter(user => user.active);
  let checkOptions = ""
  let playerTokenIds = users.map(u => u.character?.id).filter(id => id !== undefined);
  let selectedPlayerIds = canvas.tokens.controlled.map(token => {
    if (playerTokenIds.includes(token.actor.id)) return token.actor.id;
  });

  // build checkbox list for all active players
  users.forEach(user => {
    let checked = !!user.character && selectedPlayerIds.includes(user.character.id) && 'checked';
    checkOptions+=`
      <br>
      <input type="checkbox" name="${user.id}" id="${user.id}" value="${user.name}" ${checked}>\n
      <label for="${user.id}">${user.name}</label>
    `
  });

  // create dialog
  new Dialog({
    title:"Whisper",
    content:`Whisper To: ${checkOptions} <br>
      <label for="message">Message:</label>
      <textarea id="message" name="message" rows="4" cols="50"></textarea><br>`,
    buttons:{
      whisper:{   
        label:"Whisper",
        callback: (html) => createMessage(html)
      }
    }
  }).render(true);

  // output the message to chat
  function createMessage(html) {
    var targets = [];
    // build list of selected players ids for whispers target
    for ( let user of users ) {
      if (html.find('[name="'+user.id+'"]')[0].checked){
        applyChanges=true;
        targets.push(user.id);
      }
      var messageText = html.find('[name="message"]')[0].value
    }
  if(!applyChanges)return;
    ChatMessage.create({
      content: messageText,
      whisper: targets
    });
  }
}



