import type { Card, Hand } from './types';

export function cardValue(rank: Card['rank']): number {
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

export function handValue(cards: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    total += cardValue(card.rank);
    if (card.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

export function isSoft(cards: Card[]): boolean {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    total += cardValue(card.rank);
    if (card.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return aces > 0 && total <= 21;
}

export function isBusted(cards: Card[]): boolean {
  return handValue(cards) > 21;
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards) === 21;
}

export function canSplit(hand: Hand, totalHands: number, chips: number = Infinity, handBet: number = 0): boolean {
  if (hand.cards.length !== 2) return false;
  if (totalHands >= 4) return false;
  if (chips < handBet) return false;
  return cardValue(hand.cards[0].rank) === cardValue(hand.cards[1].rank);
}

export function canDoubleDown(hand: Hand, chips: number = Infinity, handBet: number = 0): boolean {
  return hand.cards.length === 2 && !hand.doubled && chips >= handBet;
}

export function canSurrender(hand: Hand, activeHandIndex: number, totalHands: number): boolean {
  return hand.cards.length === 2 && activeHandIndex === 0 && totalHands === 1;
}

export function canTakeInsurance(dealerCards: Card[]): boolean {
  return dealerCards.length === 2 && dealerCards[0].faceUp && dealerCards[0].rank === 'A';
}

export function emptyHand(): Hand {
  return {
    cards: [],
    doubled: false,
    stood: false,
    busted: false,
    surrendered: false,
    isBlackjack: false,
  };
}
