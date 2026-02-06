import { type ComponentType } from 'react';
import * as Cards from '@letele/playing-cards';
import type { Card } from '../engine/types';

const suitPrefix: Record<Card['suit'], string> = {
  hearts: 'H',
  diamonds: 'D',
  clubs: 'C',
  spades: 'S',
};

const rankSuffix: Record<Card['rank'], string> = {
  'A': 'a',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  'J': 'j',
  'Q': 'q',
  'K': 'k',
};

const cardComponents = Cards as Record<string, ComponentType>;

export function getCardComponent(card: Card): ComponentType {
  if (!card.faceUp) return cardComponents['B1'];
  const key = `${suitPrefix[card.suit]}${rankSuffix[card.rank]}`;
  return cardComponents[key];
}

export const CardBack = cardComponents['B1'];
