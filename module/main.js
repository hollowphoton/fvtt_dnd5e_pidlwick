//strict mode
"use strict";

//import functions
import {initDefeatEnemy} from "./token.js";

//hooks
  //register core functions
  Hooks.once('init', () => {
    console.log('My Awesome Module | Initializing');
    game.pidlwick = {
      initDefeatEnemy
    };
  });


  //dice so nice -- test with: /roll 1d100[treasureroll] + 4d6[goldroll] + 1d12[specialroll]
    //add custom treasure roll dice
    Hooks.once('diceSoNiceReady', (dice3d) => {
      dice3d.addColorset(
        {
          name: 'treasureroll',
          description: 'Treasure Roll Dice',
          category: 'D&D',
          background: '#B87333',
          foreground: '#000000',
          outline: 'none',
          texture: 'bronze04',
          material: 'metal',
          colorset: 'custom',
          font: 'Modesto Condensed'
        }
      )
    })
    //add custom gold roll dice
    Hooks.once('diceSoNiceReady', (dice3d) => {
      dice3d.addColorset(
        {
          name: 'goldroll',
          description: 'Gold Roll Dice',
          category: 'D&D',
          background: '#E5B80B',
          foreground: '#000000',
          outline: 'none',
          texture: 'bronze04',
          material: 'metal',
          colorset: 'custom',
          font: 'Modesto Condensed'
        }
      )
    })
    //add custom special roll dice
    Hooks.once('diceSoNiceReady', (dice3d) => {
      dice3d.addColorset(
        {
          name: 'specialroll',
          description: 'Special Roll Dice',
          category: 'D&D',
          background: '#E5E4E2',
          foreground: '#000000',
          outline: 'none',
          texture: 'bronze04',
          material: 'metal',
          colorset: 'custom',
          font: 'Modesto Condensed'
        }
      )
    })