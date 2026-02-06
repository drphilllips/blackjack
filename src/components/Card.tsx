import { useEffect, useState, useRef } from 'react';
import type { Card as CardType } from '../engine/types';
import { getCardComponent, CardBack } from '../utils/cardMap';
import './Card.css';

interface CardProps {
  card: CardType;
  index: number;
}

export function Card({ card, index }: CardProps) {
  const [dealt, setDealt] = useState(false);
  const prevFaceUp = useRef(card.faceUp);
  const [showFront, setShowFront] = useState(card.faceUp);

  // Get the actual face card component (always face-up version for rendering)
  const FaceComponent = getCardComponent({ ...card, faceUp: true });

  useEffect(() => {
    const timer = requestAnimationFrame(() => setDealt(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  useEffect(() => {
    // Detect when card flips from face-down to face-up
    if (card.faceUp && !prevFaceUp.current) {
      setShowFront(true);
    }
    prevFaceUp.current = card.faceUp;
  }, [card.faceUp]);

  return (
    <div
      className={`card-wrapper ${dealt ? 'dealt' : ''} ${!showFront ? 'flipped' : ''}`}
      style={{ transitionDelay: `${index * 150}ms`, zIndex: index }}
    >
      <div className="card-inner">
        <div className="card-face card-front">
          <FaceComponent />
        </div>
        <div className="card-face card-back">
          <CardBack />
        </div>
      </div>
    </div>
  );
}
