import { useGame } from '../context/GameContext';
import type { HandResult } from '../engine/types';
import './GameStatus.css';

const resultLabels: Record<HandResult, string> = {
  blackjack: 'Blackjack!',
  win: 'You win!',
  lose: 'Dealer wins',
  push: 'Push',
  surrender: 'Surrendered',
};

const resultClasses: Record<HandResult, string> = {
  blackjack: 'result-win',
  win: 'result-win',
  lose: 'result-lose',
  push: 'result-push',
  surrender: 'result-lose',
};

export function GameStatus() {
  const { state } = useGame();
  const { results, stats, insuranceTaken, insuranceResult, chips, phase, handBets } = state;

  // Calculate total bet for display during play
  const totalBet = handBets.reduce((sum, b) => sum + b, 0);
  const showBet = phase !== 'betting' && phase !== 'roundOver' && totalBet > 0;

  return (
    <div className="game-status">
      <div className="chips-display">
        <span className="chips-icon">⬤</span>
        <span className="chips-amount">{chips.toLocaleString()}</span>
        {showBet && (
          <span className="current-bet">Bet: {totalBet}</span>
        )}
      </div>
      {results && (
        <div className="results-display">
          {results.map((result, i) => (
            <span key={i} className={`result-text ${resultClasses[result]}`}>
              {results.length > 1 && `Hand ${i + 1}: `}
              {resultLabels[result]}
            </span>
          ))}
          {insuranceTaken && insuranceResult && (
            <span className={`result-text ${insuranceResult === 'won' ? 'result-win' : 'result-lose'}`}>
              Insurance {insuranceResult}
            </span>
          )}
        </div>
      )}
      <div className="stats-bar">
        <span className="stat stat-win">W: {stats.wins}</span>
        <span className="stat stat-lose">L: {stats.losses}</span>
        <span className="stat stat-push">P: {stats.pushes}</span>
      </div>
    </div>
  );
}
