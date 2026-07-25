import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playSound } from '../../services/audio';

interface PraiseAnimationProps {
  active?: boolean;
  onComplete?: () => void;
}

export const PraiseAnimation: React.FC<PraiseAnimationProps> = ({ active = false, onComplete }) => {
  useEffect(() => {
    if (active) {
      playSound('reward');

      try {
        // Multi-burst confetti animation for rich celebratory feel
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
          colors: ['#FFB6C1', '#D8B4F8', '#7DD3FC', '#FDE047', '#6EE7B7', '#F472B6'],
        };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        };

        fire(0.25, {
          spread: 26,
          startVelocity: 55,
        });

        fire(0.2, {
          spread: 60,
        });

        fire(0.35, {
          spread: 100,
          decay: 0.91,
          scalar: 0.8,
        });

        fire(0.1, {
          spread: 120,
          startVelocity: 25,
          decay: 0.92,
          scalar: 1.2,
        });

        fire(0.1, {
          spread: 120,
          startVelocity: 45,
        });
      } catch (err) {
        console.warn('[PraiseAnimation] Canvas confetti error:', err);
      }

      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return null;
};

export const StarDustFX: React.FC<{ x?: number; y?: number }> = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30) * (Math.PI / 180);
        const distance = 80 + (i % 3) * 30;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        const colors = ['#FDE047', '#FFB6C1', '#7DD3FC', '#A7F3D0', '#C084FC'];
        const color = colors[i % colors.length];

        return (
          <div
            key={i}
            className="absolute animate-ping opacity-95"
            style={{
              transform: `translate(${tx}px, ${ty}px) scale(${0.8 + (i % 3) * 0.4})`,
              transition: 'transform 0.8s ease-out, opacity 0.8s ease-out',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        );
      })}
    </div>
  );
};

export const triggerConfettiCelebration = () => {
  playSound('reward');
  try {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFB6C1', '#D8B4F8', '#7DD3FC', '#FDE047', '#6EE7B7'],
    });
  } catch (err) {
    // fallback
  }
};
