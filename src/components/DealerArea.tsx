import { useGame } from '../context/GameContext';
import { Hand } from './Hand';

export function DealerArea() {
  const { state } = useGame();

  return (
    <div className="dealer-area">
      <Hand hand={state.dealerHand} label="Dealer" />
    </div>
  );
}
