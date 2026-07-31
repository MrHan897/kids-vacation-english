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

  const [customWorkMinutes, setCustomWorkMinutes] = useState<number>(25);
  const [customBreakMinutes, setCustomBreakMinutes] = useState<number>(5);

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
          description: `${customWorkMinutes}분 포모도로 공부를 성공적으로 마쳤어요!`,
        });

        setShowRewardModal(true);
        setMode('break');
        setSeconds(customBreakMinutes * 60);
      } else {
        playSound('success');
        setMode('work');
        setSeconds(customWorkMinutes * 60);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, seconds, mode, completedSessions, customWorkMinutes, customBreakMinutes]);

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
    setSeconds(mode === 'work' ? customWorkMinutes * 60 : customBreakMinutes * 60);
  };

  const handleSwitchMode = (targetMode: 'work' | 'break') => {
    playSound('click');
    setMode(targetMode);
    setIsRunning(false);
    setSeconds(targetMode === 'work' ? customWorkMinutes * 60 : customBreakMinutes * 60);
  };

  const handleSetCustomMinutes = (mins: number) => {
    playSound('click');
    setIsRunning(false);
    if (mode === 'work') {
      setCustomWorkMinutes(mins);
      setSeconds(mins * 60);
    } else {
      setCustomBreakMinutes(mins);
      setSeconds(mins * 60);
    }
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

  const presetWorkOptions = [5, 10, 15, 20, 25, 30, 45, 60];
  const presetBreakOptions = [3, 5, 10, 15];

  const [totalSeconds, setTotalSeconds] = useState<number>(20 * 60);

  // Time block options: 10m, 20m, 30m, 60m
  const timeBlocks = [
    { mins: 10, label: '🟢 10분', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100', activeColor: 'bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-200' },
    { mins: 20, label: '🟡 20분', color: 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100', activeColor: 'bg-amber-500 text-white border-amber-600 ring-4 ring-amber-200' },
    { mins: 30, label: '🟠 30분', color: 'bg-orange-50 text-orange-800 border-orange-300 hover:bg-orange-100', activeColor: 'bg-orange-500 text-white border-orange-600 ring-4 ring-orange-200' },
    { mins: 60, label: '🔴 60분', color: 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100', activeColor: 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-200' },
  ];

  const handleSelectTimeBlock = (mins: number) => {
    playSound('click');
    setIsRunning(false);
    setCustomWorkMinutes(mins);
    setTotalSeconds(mins * 60);
    setSeconds(mins * 60);
  };

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progressPercent = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      data-testid="pomodoro-timer"
      className="card-pastel text-center max-w-xl mx-auto bg-gradient-to-b from-orange-50/70 via-white to-amber-50/40 border-4 border-orange-200 p-6 sm:p-8"
    >
      {/* 1. 요청 사항 1: 친화적 타이틀 및 대화형 문구 */}
      <div className="flex items-center justify-center gap-2 mb-1">
        <div className="p-2.5 bg-[#ff6f0f] rounded-2xl text-white shadow-xs animate-bounce">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-[#212124] tracking-tight">
          ✨ 토리와 함께하는 집중 타이머 ⏱️
        </h2>
      </div>
      <p className="text-xs sm:text-sm text-[#868b94] font-extrabold mb-5">
        안녕! 시간을 고르고 시작을 누르면 토리가 곁에서 신나게 응원해줄게! 🐰
      </p>

      {/* 2. 요청 사항 2: 아주 크고 둥근 4개 시간 블록 버튼 [🟢 10분], [🟡 20분], [🟠 30분], [🔴 60분] */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        {timeBlocks.map((block) => {
          const isSelected = customWorkMinutes === block.mins;
          return (
            <button
              key={block.mins}
              type="button"
              onClick={() => handleSelectTimeBlock(block.mins)}
              className={`py-3.5 px-4 rounded-3xl font-black text-sm sm:text-base border-2 shadow-2xs transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 ${
                isSelected ? `${block.activeColor} scale-105 shadow-md` : block.color
              }`}
            >
              <span>{block.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. 요청 사항 4: 마스커트 캐릭터 애니메이션 & 둥둥 바운스 응원 */}
      <div className={`my-4 transition-all duration-300 ${isRunning ? 'animate-bounce' : ''}`}>
        <CharacterAnimation mascot={mascot} mode={mode} isRunning={isRunning} />
      </div>

      {/* 4. 요청 사항 3: 대형 원형 SVG 프로그레스 게이지 (Time Timer 스타일) & 디지털 카운트다운 */}
      <div className="relative w-64 h-64 mx-auto my-4 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
          {/* Background Track */}
          <circle cx="100" cy="100" r={radius} className="text-slate-100 stroke-current" strokeWidth="14" fill="none" />
          {/* Active Progress Circle */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            className="text-[#ff6f0f] stroke-current"
            strokeWidth="14"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div
            data-testid="timer-display"
            className="text-4xl sm:text-5xl font-black text-[#212124] tracking-wider font-mono select-none"
          >
            {formatTime(seconds)}
          </div>
          <div data-testid="timer-mode-label" className="text-xs font-black text-[#ff6f0f] mt-1 bg-orange-100 px-3 py-1 rounded-full">
            {isRunning ? '🔥 토리와 열공 중!' : ' 준비 완료!'}
          </div>
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
