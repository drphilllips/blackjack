import type { Hand as HandType } from '../engine/types';
import { handValue } from '../engine/hand';
import { Card } from './Card';
import './Hand.css';

interface HandProps {
  hand: HandType;
  isActive?: boolean;
  label?: string;
}

export function Hand({ hand, isActive, label }: HandProps) {
  const { cards } = hand;

  let displayValue = '';
  if (cards.length > 0) {
    const faceUpCards = cards.filter(c => c.faceUp);
    if (faceUpCards.length > 0) {
      displayValue = String(handValue(faceUpCards));
    }
  }

  return (
    <div className={`hand ${isActive ? 'hand-active' : ''}`}>
      {label && <div className="hand-label">{label}</div>}
      <div className="hand-cards">
        {cards.map((card, i) => (
          <Card
            key={`${card.suit}-${card.rank}-${i}`}
            card={card}
            index={i}
          />
        ))}
      </div>
      {cards.length > 0 && (
        <div className="hand-value">{displayValue}</div>
      )}
    </div>
  );
}
