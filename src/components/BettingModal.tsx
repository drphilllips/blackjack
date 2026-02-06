import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { MIN_BET, MAX_BET } from '../engine/types';
import './BettingModal.css';

const CHIP_VALUES = [5, 10, 25, 50, 100] as const;

const CHIP_COLORS: Record<number, string> = {
  5: '#e74c3c',
  10: '#3498db',
  25: '#2ecc71',
  50: '#e67e22',
  100: '#1a1a2e',
};

export function BettingModal() {
  const { state, dispatch } = useGame();
  const [bet, setBet] = useState(0);

  const { phase, chips } = state;
  const isBusted = phase === 'roundOver' && chips === 0;
  const showModal = phase === 'betting' || isBusted;

  if (!showModal) return null;

  if (isBusted) {
    return (
      <div className="betting-overlay">
        <div className="betting-modal">
          <div className="busted-message">Out of chips!</div>
          <button
            className="btn btn-deal"
            onClick={() => {
              dispatch({ type: 'BUY_MORE' });
              setBet(0);
            }}
          >
            Buy More (1,000)
          </button>
        </div>
      </div>
    );
  }

  const maxBet = Math.min(MAX_BET, chips);
  const canDeal = bet >= MIN_BET && bet <= maxBet;

  function addChip(value: number) {
    setBet(prev => Math.min(prev + value, maxBet));
  }

  function clearBet() {
    setBet(0);
  }

  function placeBet() {
    if (canDeal) {
      dispatch({ type: 'PLACE_BET', amount: bet });
      setBet(0);
    }
  }

  return (
    <div className="betting-overlay">
      <div className="betting-modal">
        <div className="betting-balance">
          Balance: <span className="balance-amount">{chips.toLocaleString()}</span>
        </div>

        <div className="betting-amount">
          <span className="bet-label">Bet</span>
          <span className="bet-value">{bet}</span>
        </div>

        <div className="bet-limits">
          Min: {MIN_BET} · Max: {MAX_BET}
        </div>

        <div className="chip-tray">
          {CHIP_VALUES.map(value => (
            <button
              key={value}
              className="chip-btn"
              style={{
                '--chip-color': CHIP_COLORS[value],
              } as React.CSSProperties}
              disabled={bet + value > maxBet && bet + 1 > maxBet}
              onClick={() => addChip(value)}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="betting-actions">
          <button
            className="btn btn-secondary"
            onClick={clearBet}
            disabled={bet === 0}
          >
            Clear
          </button>
          <button
            className="btn btn-deal"
            onClick={placeBet}
            disabled={!canDeal}
          >
            Deal
          </button>
        </div>
      </div>
    </div>
  );
}
