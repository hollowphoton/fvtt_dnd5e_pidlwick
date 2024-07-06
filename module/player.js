//token health - feeling good
export async function characterHealthGreen() {
  //set character values for dynamic ring
  game.user.character.update({'prototypeToken.flags.dnd5e.tokenRing.colors.ring': ``});
  game.user.character.update({'prototypeToken.flags.dnd5e.tokenRing.colors.background': ``});
  game.user.character.update({'prototypeToken.flags.dnd5e.tokenRing.effects': 1});
  //get tokens
  let tokens = game.user.character.getActiveTokens();
  //update tokens
  let updates = tokens.map(t => {
    t.document.update({'flags.dnd5e.tokenRing.colors.ring': ``});
    t.document.update({'flags.dnd5e.tokenRing.colors.background': ``});
    t.document.update({'flags.dnd5e.tokenRing.effects': 1});
  });
  //refresh token display
  if (updates.length) canvas.scene.updateEmbeddedDocuments("Token", updates);
}

//token health - beat up
export async function characterHealthOrange() {
  //set character values for dynamic ring
  game.user.character.update({'prototypeToken.flags.dnd5e.tokenRing.colors.ring': `#ffea00`});
  game.user.character.update({'prototypeToken.flags.dnd5e.tokenRing.colors.background': `#f28202`});
  game.user.character.update({'prototypeToken.flags.dnd5e.tokenRing.effects': 5});
  //get tokens
  let tokens = game.user.character.getActiveTokens();
  //update tokens
  let updates = tokens.map(t => {
    t.document.update({'flags.dnd5e.tokenRing.colors.ring': `#ffea00`});
    t.document.update({'flags.dnd5e.tokenRing.colors.background': `#f28202`});
    t.document.update({'flags.dnd5e.tokenRing.effects': 5});
  });
  //refresh token display
  if (updates.length) canvas.scene.updateEmbeddedDocuments("Token", updates);
}

//token health - nearly dead
export async function characterHealthRed() {
  //set character values for dynamic ring
  game.user.character.update({'prototypeToken.flags.dnd5e.tokenRing.colors.ring': `#ff0000`});
  game.user.character.update({'prototypeToken.flags.dnd5e.tokenRing.colors.background': `#9d0101`});
  game.user.character.update({'prototypeToken.flags.dnd5e.tokenRing.effects': 15});
  //get tokens
  let tokens = game.user.character.getActiveTokens();
  //update tokens
  let updates = tokens.map(t => {
    t.document.update({'flags.dnd5e.tokenRing.colors.ring': `#ff0000`});
    t.document.update({'flags.dnd5e.tokenRing.colors.background': `#9d0101`});
    t.document.update({'flags.dnd5e.tokenRing.effects': 15});
  });
  //refresh token display
  if (updates.length) canvas.scene.updateEmbeddedDocuments("Token", updates);
}
