import { useGame } from '../context/GameContext';
import { Hand } from './Hand';

export function PlayerArea() {
  const { state } = useGame();
  const multipleHands = state.playerHands.length > 1;

  return (
    <div className="player-area">
      {state.playerHands.map((hand, i) => (
        <Hand
          key={i}
          hand={hand}
          isActive={multipleHands && i === state.activeHandIndex && state.phase === 'playerTurn'}
          label={multipleHands ? `Hand ${i + 1}` : 'Player'}
        />
      ))}
    </div>
  );
}
