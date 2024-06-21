//strict mode
"use strict";

//import functions
import {whisper} from "./whisper.js";




//add custom gold roll dice
Hooks.once('diceSoNiceReady', (dice3d) => {
  dice3d.addColorset(
    {
      name: 'goldroll',
      description: 'Gold Roll Dice',
      category: 'D&D',
      labelColor: '#000000',
      diceColor: '#E5B80B',
      outlineColor: '#E5B80B',
      edgeColor: '#E5B80B',
      foreground: '#FFFFFF',
      background: '#262626',
      outline: 'none',
      texture: 'bronze04',
      material: 'metal',
      colorset: 'custom',
      font: 'Modesto Condensed'
    }
  )
})

//add custom treasure roll dice
Hooks.once('diceSoNiceReady', (dice3d) => {
  dice3d.addColorset(
    {
      name: 'treasureroll',
      description: 'Treasure Roll Dice',
      category: 'D&D',
      labelColor: '#000000',
      diceColor: '#B87333',
      outlineColor: '#B87333',
      edgeColor: '#B87333',
      foreground: '#FFFFFF',
      background: '#262626',
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
      labelColor: '#000000',
      diceColor: '#E5E4E2',
      outlineColor: '#E5E4E2',
      edgeColor: '#E5E4E2',
      foreground: '#FFFFFF',
      background: '#262626',
      outline: 'none',
      texture: 'bronze04',
      material: 'metal',
      colorset: 'custom',
      font: 'Modesto Condensed'
    }
  )
})
