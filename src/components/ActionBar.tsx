import { useGame } from '../context/GameContext';
import { canSplit, canDoubleDown, canSurrender } from '../engine/hand';
import './ActionBar.css';

export function ActionBar() {
  const { state, dispatch } = useGame();
  const { phase, playerHands, activeHandIndex, chips, handBets } = state;

  if (phase === 'betting') {
    return <div className="action-bar" />;
  }

  if (phase === 'roundOver') {
    if (chips === 0) {
      // BettingModal handles the buy-more prompt
      return <div className="action-bar" />;
    }
    return (
      <div className="action-bar">
        <button className="btn btn-deal" onClick={() => dispatch({ type: 'NEXT_HAND' })}>
          New Hand
        </button>
      </div>
    );
  }

  if (phase === 'insurance') {
    const insuranceCost = Math.floor(state.currentBet / 2);
    const canAffordInsurance = chips >= insuranceCost;
    return (
      <div className="action-bar">
        <span className="action-label">Insurance? ({insuranceCost} chips)</span>
        {canAffordInsurance && (
          <button className="btn btn-secondary" onClick={() => dispatch({ type: 'INSURANCE_YES' })}>
            Yes
          </button>
        )}
        <button className="btn btn-secondary" onClick={() => dispatch({ type: 'INSURANCE_NO' })}>
          No
        </button>
      </div>
    );
  }

  if (phase !== 'playerTurn') {
    return <div className="action-bar" />;
  }

  const activeHand = playerHands[activeHandIndex];
  const handBet = handBets[activeHandIndex] || 0;
  const showSplit = canSplit(activeHand, playerHands.length, chips, handBet);
  const showDouble = canDoubleDown(activeHand, chips, handBet);
  const showSurrender = canSurrender(activeHand, activeHandIndex, playerHands.length);

  return (
    <div className="action-bar">
      <button className="btn btn-primary" onClick={() => dispatch({ type: 'HIT' })}>
        Hit
      </button>
      <button className="btn btn-primary" onClick={() => dispatch({ type: 'STAND' })}>
        Stand
      </button>
      {showDouble && (
        <button className="btn btn-secondary" onClick={() => dispatch({ type: 'DOUBLE_DOWN' })}>
          Double
        </button>
      )}
      {showSplit && (
        <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SPLIT' })}>
          Split
        </button>
      )}
      {showSurrender && (
        <button className="btn btn-secondary" onClick={() => dispatch({ type: 'SURRENDER' })}>
          Surrender
        </button>
      )}
    </div>
  );
}
