import { DealerArea } from './DealerArea';
import { PlayerArea } from './PlayerArea';
import { ActionBar } from './ActionBar';
import { GameStatus } from './GameStatus';
import { BettingModal } from './BettingModal';
import './Table.css';

export function Table() {
  return (
    <div className="table">
      <DealerArea />
      <GameStatus />
      <PlayerArea />
      <ActionBar />
      <BettingModal />
    </div>
  );
}
