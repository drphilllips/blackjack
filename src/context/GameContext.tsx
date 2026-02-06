import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, GameAction } from '../engine/types';
import { gameReducer, initialState } from '../engine/reducer';
import { handValue, isSoft } from '../engine/hand';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Dealer turn automation
  useEffect(() => {
    if (state.phase !== 'dealerTurn') return;

    const dealerVal = handValue(state.dealerHand.cards);
    const soft17 = dealerVal === 17 && isSoft(state.dealerHand.cards);

    if (dealerVal < 17 || soft17) {
      const timer = setTimeout(() => dispatch({ type: 'DEALER_DRAW' }), 600);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => dispatch({ type: 'RESOLVE_ROUND' }), 400);
      return () => clearTimeout(timer);
    }
  }, [state.phase, state.dealerHand.cards]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
