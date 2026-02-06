export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export interface Hand {
  cards: Card[];
  doubled: boolean;
  stood: boolean;
  busted: boolean;
  surrendered: boolean;
  isBlackjack: boolean;
}

export type GamePhase = 'betting' | 'dealing' | 'insurance' | 'playerTurn' | 'dealerTurn' | 'roundOver';

export type HandResult = 'win' | 'lose' | 'push' | 'blackjack' | 'surrender';

export interface GameState {
  shoe: Card[];
  dealerHand: Hand;
  playerHands: Hand[];
  activeHandIndex: number;
  phase: GamePhase;
  results: HandResult[] | null;
  insuranceTaken: boolean;
  insuranceBet: number;
  insuranceResult: 'won' | 'lost' | null;
  stats: { wins: number; losses: number; pushes: number; blackjacks: number };
  chips: number;
  currentBet: number;
  handBets: number[];
}

export type GameAction =
  | { type: 'PLACE_BET'; amount: number }
  | { type: 'BUY_MORE' }
  | { type: 'NEXT_HAND' }
  | { type: 'HIT' }
  | { type: 'STAND' }
  | { type: 'DOUBLE_DOWN' }
  | { type: 'SPLIT' }
  | { type: 'SURRENDER' }
  | { type: 'INSURANCE_YES' }
  | { type: 'INSURANCE_NO' }
  | { type: 'DEALER_DRAW' }
  | { type: 'RESOLVE_ROUND' };

export const STARTING_CHIPS = 1000;
export const MIN_BET = 10;
export const MAX_BET = 500;
