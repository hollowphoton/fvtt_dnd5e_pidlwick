//get the average party level
export async function getAvgPartyLevel(multiplier) {
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