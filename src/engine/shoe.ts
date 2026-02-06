import type { Card, Suit, Rank } from './types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createShoe(deckCount: number = 6): Card[] {
  const cards: Card[] = [];
  for (let d = 0; d < deckCount; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cards.push({ suit, rank, faceUp: true });
      }
    }
  }
  return shuffle(cards);
}

export function shouldReshuffle(shoe: Card[], deckCount: number = 6): boolean {
  return shoe.length < deckCount * 52 * 0.25;
}

export function drawCard(shoe: Card[], faceUp: boolean = true): { card: Card; shoe: Card[] } {
  const [card, ...rest] = shoe;
  return { card: { ...card, faceUp }, shoe: rest };
}
