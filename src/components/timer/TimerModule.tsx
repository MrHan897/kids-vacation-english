import React, { useState, useEffect } from 'react';
import { playSound } from '../../services/audio';
import { addSticker } from '../../services/storage';
import { CharacterAnimation, MascotId } from './CharacterAnimation';
import { MascotSelector } from './MascotSelector';
import { Play, Pause, RotateCcw, Timer as TimerIcon, Sparkles, Award, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TimerModule: React.FC = () => {
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [seconds, setSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mascot, setMascot] = useState<MascotId>('rabbit');
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [showRewardModal, setShowRewardModal] = useState<boolean>(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isRunning && seconds > 0) {
      interval = window.setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isRunning) {
      setIsRunning(false);
      playSound('timer_alarm');

      if (mode === 'work') {
        const newCompleted = completedSessions + 1;
        setCompletedSessions(newCompleted);

        // Award sticker on study session completion!
        addSticker({
          id: 'stk-pomodoro-1',
          name: '집중왕 스티커',
          icon: '⏱️',
          description: '25분 포모도로 공부를 성공적으로 마쳤어요!',
        });

        setShowRewardModal(true);
        setMode('break');
        setSeconds(5 * 60);
      } else {
        playSound('success');
        setMode('work');
        setSeconds(25 * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, seconds, mode, completedSessions]);

  const handleStart = () => {
    playSound('click');
    setIsRunning(true);
  };

  const handlePause = () => {
    playSound('click');
    setIsRunning(false);
  };

  const handleReset = () => {
    playSound('click');
    setIsRunning(false);
    setSeconds(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const handleSwitchMode = (targetMode: 'work' | 'break') => {
    playSound('click');
    setMode(targetMode);
    setIsRunning(false);
    setSeconds(targetMode === 'work' ? 25 * 60 : 5 * 60);
  };

  const handleClaimSticker = () => {
    playSound('reward');
    addSticker({
      id: `stk-pomodoro-${Date.now()}`,
      name: '열공 어린이',
      icon: '🌟',
      description: '포모도로 타이머 학습 칭찬 스티커를 모았어요!',
    });
    setShowRewardModal(false);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      data-testid="pomodoro-timer"
      className="card-pastel text-center max-w-xl mx-auto bg-gradient-to-b from-pastel-blue-light via-white to-white border-2 border-sky-100 p-6 sm:p-8"
    >
      {/* Timer Module Header */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="p-2.5 bg-pastel-blue rounded-2xl text-sky-800 shadow-sm">
          <TimerIcon className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          어린이 캐릭터 포모도로 타이머 ⏱️
        </h2>
      </div>
      <p className="text-xs text-slate-500 font-semibold mb-4">
        25분 동안 캐릭터 친구와 신나게 공부하고, 5분 동안 단잠 휴식을 취해요!
      </p>

      {/* Mode Selector Buttons */}
      <div data-testid="timer-mode-toggle" className="flex items-center justify-center gap-2 my-3">
        <button
          type="button"
          onClick={() => handleSwitchMode('work')}
          className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-1.5 ${
            mode === 'work'
              ? 'bg-pastel-blue text-sky-900 border-2 border-sky-300 shadow-sm scale-105'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <span>📖 공부 시간 (25분)</span>
        </button>

        <button
          type="button"
          data-testid="timer-mode-break"
          onClick={() => handleSwitchMode('break')}
          className={`px-4 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-1.5 ${
            mode === 'break'
              ? 'bg-pastel-mint text-emerald-900 border-2 border-emerald-300 shadow-sm scale-105'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <span>🍡 쉬는 시간 (5분)</span>
        </button>
      </div>

      {/* Mascot Selector */}
      <MascotSelector selectedMascot={mascot} onSelectMascot={setMascot} />

      {/* Character Mascot Animation Container */}
      <CharacterAnimation mascot={mascot} mode={mode} isRunning={isRunning} />

      {/* Timer Digital Display */}
      <div className="my-5">
        <div
          data-testid="timer-display"
          className="text-5xl sm:text-6xl font-black text-slate-800 tracking-wider font-mono my-1 drop-shadow-sm select-none"
        >
          {formatTime(seconds)}
        </div>

        {/* Mode Label Contract element */}
        <div data-testid="timer-mode-label" className="text-xs font-black text-slate-500 mt-1">
          {mode === 'work' ? '📖 공부 시간 (Work Mode)' : '🍡 쉬는 시간 (Break Mode)'}
        </div>
      </div>

      {/* Timer Control Buttons */}
      <div className="flex items-center justify-center gap-3 mt-6">
        {!isRunning ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            data-testid="timer-start-btn"
            onClick={handleStart}
            className="btn-cute px-8 py-3.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>시작하기</span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            data-testid="timer-pause-btn"
            onClick={handlePause}
            className="btn-cute px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center gap-2"
          >
            <Pause className="w-5 h-5 fill-white" />
            <span>일시정지</span>
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          data-testid="timer-reset-btn"
          onClick={handleReset}
          className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all shadow-sm"
          title="타이머 초기화"
        >
          <RotateCcw className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Sticker Award Claim Action Banner */}
      <div className="mt-6 pt-4 border-t border-sky-100 flex items-center justify-between text-xs font-bold text-slate-500">
        <span className="flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" />
          오늘 포모도로 달성: {completedSessions}회
        </span>
        <button
          type="button"
          onClick={handleClaimSticker}
          className="px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-800 font-extrabold rounded-full transition-all flex items-center gap-1"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-600" />
          <span>칭찬 스티커 받기</span>
        </button>
      </div>

      {/* Reward Celebration Modal on Session Finish */}
      <AnimatePresence>
        {showRewardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-center border-4 border-amber-300 shadow-2xl"
            >
              <div className="text-6xl mb-3 animate-bounce">⏱️ ⭐ 🐰</div>
              <h3 className="text-xl font-black text-slate-800">대단해요! 공부 세션 완료!</h3>
              <p className="text-xs text-slate-500 font-bold mt-1">
                25분 동안 집중해서 공부를 끝마쳤어요! 집중왕 칭찬 스티커를 드립니다!
              </p>
              <button
                type="button"
                onClick={() => setShowRewardModal(false)}
                className="mt-5 w-full py-3 bg-gradient-to-r from-amber-400 to-pink-400 hover:from-amber-500 hover:to-pink-500 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>스티커 받고 5분 쉬기!</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
