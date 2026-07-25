import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MascotProps {
  avatar?: string;
  name?: string;
  onSuccess?: boolean;
}

export const InteractiveMascot: React.FC<MascotProps> = ({ avatar = '🐰', name = '마법 토끼', onSuccess }) => {
  const [isTouched, setIsTouched] = useState(false);
  const [sparks, setSparks] = useState<{ id: number; char: string; x: number }[]>([]);

  const handleTouch = () => {
    setIsTouched(true);
    // 한글 자음 스파크 팝업 생성 (ㅊ, ㅈ, ㅎ, ✨, 💖)
    const koreanChars = ['ㅊ', 'ㅈ', 'ㅎ', '✨', '💖'];
    const newSpark = {
      id: Date.now(),
      char: koreanChars[Math.floor(Math.random() * koreanChars.length)],
      x: (Math.random() - 0.5) * 60,
    };
    setSparks((prev) => [...prev.slice(-4), newSpark]);

    setTimeout(() => setIsTouched(false), 300);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* 한글 스파크 파티클 레이어 */}
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.span
            key={spark.id}
            initial={{ opacity: 1, y: 0, scale: 0.5, x: spark.x }}
            animate={{ opacity: 0, y: -60, scale: 1.4, rotate: spark.x }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute top-0 text-2xl font-black text-pink-500 pointer-events-none select-none drop-shadow-md z-30"
          >
            {spark.char}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* 3D 클레이모피즘 파스텔 인터랙티브 캐릭터 */}
      <motion.div
        onClick={handleTouch}
        animate={
          onSuccess
            ? { rotateY: [0, 360], scale: [1, 1.2, 1], y: [0, -15, 0] }
            : isTouched
            ? { scaleY: 0.85, scaleX: 1.15 }
            : { y: [0, -6, 0] }
        }
        transition={
          onSuccess
            ? { duration: 0.8, ease: 'backOut' }
            : isTouched
            ? { duration: 0.15 }
            : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
        }
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-white via-pink-50 to-purple-100 border-4 border-white shadow-pastel flex items-center justify-center text-4xl sm:text-5xl cursor-pointer select-none relative transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <span className="filter drop-shadow-md transform transition-transform">
          {avatar}
        </span>
        {/* 볼터치 발그레 피드백 */}
        <div className="absolute bottom-5 left-4 w-3 h-2 bg-pink-300/60 rounded-full blur-[1px]" />
        <div className="absolute bottom-5 right-4 w-3 h-2 bg-pink-300/60 rounded-full blur-[1px]" />
      </motion.div>

      <span className="mt-2.5 font-black text-xs text-slate-700 bg-white/90 px-3 py-1 rounded-full border border-pink-200 shadow-xs">
        {name} (터치해봐! ㅊ·ㅈ·ㅎ)
      </span>
    </div>
  );
};

export default InteractiveMascot;
