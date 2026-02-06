import type { GameState, GameAction, Hand, HandResult } from './types';
import { STARTING_CHIPS, MIN_BET, MAX_BET } from './types';
import { createShoe, shouldReshuffle, drawCard } from './shoe';
import { handValue, isSoft, isBlackjack, isBusted, emptyHand } from './hand';

export const initialState: GameState = {
  shoe: createShoe(),
  dealerHand: emptyHand(),
  playerHands: [emptyHand()],
  activeHandIndex: 0,
  phase: 'betting',
  results: null,
  insuranceTaken: false,
  insuranceBet: 0,
  insuranceResult: null,
  stats: { wins: 0, losses: 0, pushes: 0, blackjacks: 0 },
  chips: STARTING_CHIPS,
  currentBet: 0,
  handBets: [],
};

function advanceToNextHandOrDealer(state: GameState): GameState {
  const nextIndex = state.activeHandIndex + 1;
  if (nextIndex < state.playerHands.length) {
    const nextHand = state.playerHands[nextIndex];
    if (nextHand.stood || nextHand.busted) {
      return advanceToNextHandOrDealer({ ...state, activeHandIndex: nextIndex });
    }
    return { ...state, activeHandIndex: nextIndex, phase: 'playerTurn' };
  }
  // All hands done — check if all busted/surrendered
  const allSettled = state.playerHands.every(h => h.busted || h.surrendered);
  if (allSettled) {
    return resolveRound({ ...state, phase: 'roundOver' });
  }
  // Flip dealer hole card
  const dealerHand = {
    ...state.dealerHand,
    cards: state.dealerHand.cards.map(c => ({ ...c, faceUp: true })),
  };
  return { ...state, dealerHand, phase: 'dealerTurn' };
}

function resolveRound(state: GameState): GameState {
  const dealerVal = handValue(state.dealerHand.cards);
  const dealerBJ = isBlackjack(state.dealerHand.cards);
  const dealerBust = dealerVal > 21;

  const results: HandResult[] = [];
  const newStats = { ...state.stats };
  let chipsPayout = 0;

  for (let i = 0; i < state.playerHands.length; i++) {
    const hand = state.playerHands[i];
    const handBet = state.handBets[i] || 0;

    if (hand.surrendered) {
      results.push('surrender');
      newStats.losses++;
      // Return half the bet
      chipsPayout += Math.floor(handBet / 2);
      continue;
    }
    if (hand.busted) {
      results.push('lose');
      newStats.losses++;
      // Already deducted, no payout
      continue;
    }

    const playerVal = handValue(hand.cards);
    const playerBJ = hand.isBlackjack;

    if (playerBJ && dealerBJ) {
      results.push('push');
      newStats.pushes++;
      chipsPayout += handBet; // Return bet
    } else if (playerBJ) {
      results.push('blackjack');
      newStats.blackjacks++;
      newStats.wins++;
      chipsPayout += handBet + Math.floor(handBet * 1.5); // 3:2 payout
    } else if (dealerBJ) {
      results.push('lose');
      newStats.losses++;
    } else if (dealerBust) {
      results.push('win');
      newStats.wins++;
      chipsPayout += handBet * 2; // 1:1 payout
    } else if (playerVal > dealerVal) {
      results.push('win');
      newStats.wins++;
      chipsPayout += handBet * 2;
    } else if (playerVal < dealerVal) {
      results.push('lose');
      newStats.losses++;
    } else {
      results.push('push');
      newStats.pushes++;
      chipsPayout += handBet; // Return bet
    }
  }

  // Insurance result
  let insuranceResult = state.insuranceResult;
  if (state.insuranceTaken) {
    if (dealerBJ) {
      insuranceResult = 'won';
      chipsPayout += state.insuranceBet * 3; // Original + 2:1
    } else {
      insuranceResult = 'lost';
    }
  }

  return {
    ...state,
    results,
    stats: newStats,
    insuranceResult,
    chips: state.chips + chipsPayout,
    phase: 'roundOver',
  };
}

function dealCards(state: GameState, betAmount: number): GameState {
  let shoe = state.shoe;
  if (shouldReshuffle(shoe)) {
    shoe = createShoe();
  }

  // Deal: player card, dealer card (face up), player card, dealer card (face down)
  const d1 = drawCard(shoe, true);
  const d2 = drawCard(d1.shoe, true);
  const d3 = drawCard(d2.shoe, true);
  const d4 = drawCard(d3.shoe, false);

  const playerCards = [d1.card, d3.card];
  const dealerCards = [d2.card, d4.card];

  const playerHand: Hand = {
    ...emptyHand(),
    cards: playerCards,
    isBlackjack: isBlackjack(playerCards),
  };

  const dealerHand: Hand = {
    ...emptyHand(),
    cards: dealerCards,
    isBlackjack: isBlackjack(dealerCards),
  };

  const newState: GameState = {
    ...state,
    shoe: d4.shoe,
    dealerHand,
    playerHands: [playerHand],
    activeHandIndex: 0,
    results: null,
    insuranceTaken: false,
    insuranceBet: 0,
    insuranceResult: null,
    phase: 'playerTurn',
    currentBet: betAmount,
    handBets: [betAmount],
    chips: state.chips - betAmount,
  };

  // Check if dealer shows Ace — offer insurance
  if (dealerCards[0].rank === 'A') {
    return { ...newState, phase: 'insurance' };
  }

  // Check for player blackjack
  if (playerHand.isBlackjack) {
    const flippedDealer = {
      ...dealerHand,
      cards: dealerCards.map(c => ({ ...c, faceUp: true })),
    };
    return resolveRound({ ...newState, dealerHand: flippedDealer });
  }

  return newState;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'PLACE_BET': {
      if (state.phase !== 'betting' && state.phase !== 'roundOver') return state;
      const amount = action.amount;
      if (amount < MIN_BET || amount > MAX_BET || amount > state.chips) return state;
      return dealCards(state, amount);
    }

    case 'BUY_MORE': {
      return {
        ...state,
        chips: STARTING_CHIPS,
        phase: 'betting',
      };
    }

    case 'NEXT_HAND': {
      if (state.phase !== 'roundOver') return state;
      return { ...state, phase: 'betting' };
    }

    case 'INSURANCE_YES': {
      const insuranceBet = Math.floor(state.currentBet / 2);
      const newState: GameState = {
        ...state,
        insuranceTaken: true,
        insuranceBet,
        chips: state.chips - insuranceBet,
        phase: 'playerTurn',
      };
      if (state.playerHands[0].isBlackjack) {
        const flippedDealer = {
          ...state.dealerHand,
          cards: state.dealerHand.cards.map(c => ({ ...c, faceUp: true })),
        };
        return resolveRound({ ...newState, dealerHand: flippedDealer });
      }
      if (state.dealerHand.isBlackjack) {
        const flippedDealer = {
          ...state.dealerHand,
          cards: state.dealerHand.cards.map(c => ({ ...c, faceUp: true })),
        };
        return resolveRound({ ...newState, dealerHand: flippedDealer });
      }
      return newState;
    }

    case 'INSURANCE_NO': {
      const newState: GameState = { ...state, insuranceTaken: false, phase: 'playerTurn' };
      if (state.playerHands[0].isBlackjack) {
        const flippedDealer = {
          ...state.dealerHand,
          cards: state.dealerHand.cards.map(c => ({ ...c, faceUp: true })),
        };
        return resolveRound({ ...newState, dealerHand: flippedDealer });
      }
      if (state.dealerHand.isBlackjack) {
        const flippedDealer = {
          ...state.dealerHand,
          cards: state.dealerHand.cards.map(c => ({ ...c, faceUp: true })),
        };
        return resolveRound({ ...newState, dealerHand: flippedDealer });
      }
      return newState;
    }

    case 'HIT': {
      if (state.phase !== 'playerTurn') return state;
      const hand = state.playerHands[state.activeHandIndex];
      const { card, shoe } = drawCard(state.shoe, true);
      const newCards = [...hand.cards, card];
      const busted = isBusted(newCards);

      const newHand: Hand = {
        ...hand,
        cards: newCards,
        busted,
      };

      const newHands = [...state.playerHands];
      newHands[state.activeHandIndex] = newHand;

      const newState = { ...state, shoe, playerHands: newHands };

      if (busted) {
        return advanceToNextHandOrDealer(newState);
      }

      if (handValue(newCards) === 21) {
        newHands[state.activeHandIndex] = { ...newHand, stood: true };
        return advanceToNextHandOrDealer({ ...newState, playerHands: newHands });
      }

      return newState;
    }

    case 'STAND': {
      if (state.phase !== 'playerTurn') return state;
      const newHands = [...state.playerHands];
      newHands[state.activeHandIndex] = {
        ...newHands[state.activeHandIndex],
        stood: true,
      };
      return advanceToNextHandOrDealer({ ...state, playerHands: newHands });
    }

    case 'DOUBLE_DOWN': {
      if (state.phase !== 'playerTurn') return state;
      const hand = state.playerHands[state.activeHandIndex];
      const handBet = state.handBets[state.activeHandIndex];

      // Deduct additional bet for double
      const newChips = state.chips - handBet;
      const newHandBets = [...state.handBets];
      newHandBets[state.activeHandIndex] = handBet * 2;

      const { card, shoe } = drawCard(state.shoe, true);
      const newCards = [...hand.cards, card];
      const busted = isBusted(newCards);

      const newHand: Hand = {
        ...hand,
        cards: newCards,
        doubled: true,
        stood: !busted,
        busted,
      };

      const newHands = [...state.playerHands];
      newHands[state.activeHandIndex] = newHand;

      return advanceToNextHandOrDealer({
        ...state,
        shoe,
        playerHands: newHands,
        chips: newChips,
        handBets: newHandBets,
      });
    }

    case 'SPLIT': {
      if (state.phase !== 'playerTurn') return state;
      const hand = state.playerHands[state.activeHandIndex];
      if (hand.cards.length !== 2) return state;

      const handBet = state.handBets[state.activeHandIndex];
      const isAces = hand.cards[0].rank === 'A';

      // Deduct matching bet for the new hand
      const newChips = state.chips - handBet;

      const d1 = drawCard(state.shoe, true);
      const d2 = drawCard(d1.shoe, true);

      const hand1: Hand = {
        ...emptyHand(),
        cards: [hand.cards[0], d1.card],
        stood: isAces,
      };

      const hand2: Hand = {
        ...emptyHand(),
        cards: [hand.cards[1], d2.card],
        stood: isAces,
      };

      if (isBusted(hand1.cards)) hand1.busted = true;
      if (isBusted(hand2.cards)) hand2.busted = true;

      const newHands = [...state.playerHands];
      newHands.splice(state.activeHandIndex, 1, hand1, hand2);

      // Splice matching bet into handBets
      const newHandBets = [...state.handBets];
      newHandBets.splice(state.activeHandIndex, 1, handBet, handBet);

      const newState = {
        ...state,
        shoe: d2.shoe,
        playerHands: newHands,
        chips: newChips,
        handBets: newHandBets,
      };

      if (isAces) {
        return advanceToNextHandOrDealer(newState);
      }

      if (handValue(hand1.cards) === 21) {
        newHands[state.activeHandIndex] = { ...hand1, stood: true };
        return advanceToNextHandOrDealer({ ...newState, playerHands: newHands });
      }

      return { ...newState, phase: 'playerTurn' };
    }

    case 'SURRENDER': {
      if (state.phase !== 'playerTurn') return state;
      const newHands = [...state.playerHands];
      newHands[state.activeHandIndex] = {
        ...newHands[state.activeHandIndex],
        surrendered: true,
      };
      return advanceToNextHandOrDealer({ ...state, playerHands: newHands });
    }

    case 'DEALER_DRAW': {
      if (state.phase !== 'dealerTurn') return state;
      const dealerVal = handValue(state.dealerHand.cards);
      const soft17 = dealerVal === 17 && isSoft(state.dealerHand.cards);

      if (dealerVal < 17 || soft17) {
        const { card, shoe } = drawCard(state.shoe, true);
        const newCards = [...state.dealerHand.cards, card];
        return {
          ...state,
          shoe,
          dealerHand: { ...state.dealerHand, cards: newCards },
        };
      }
      return state;
    }

    case 'RESOLVE_ROUND': {
      return resolveRound(state);
    }

    default:
      return state;
  }
}
