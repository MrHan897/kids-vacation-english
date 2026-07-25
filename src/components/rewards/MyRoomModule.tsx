import React, { useState } from 'react';
import { MyRoomItem, DailyQuest, UserProfile } from '../../types';
import { getMyRoomItems, saveMyRoomItems, getDailyQuests, saveDailyQuests, addSticker } from '../../services/storage';
import { playSound } from '../../services/audio';
import { InteractiveMascot } from '../common/InteractiveMascot';
import { Sparkles, CheckCircle2, Award, Heart, ShoppingBag, Plus, RotateCw, Box, Hand } from 'lucide-react';
import { motion } from 'framer-motion';

interface MyRoomModuleProps {
  userProfile?: UserProfile;
  activeCharacter?: { name: string; avatar: string };
}

export const MyRoomModule: React.FC<MyRoomModuleProps> = ({ userProfile, activeCharacter }) => {
  const [items, setItems] = useState<MyRoomItem[]>(() => getMyRoomItems());
  const [quests, setQuests] = useState<DailyQuest[]>(() => getDailyQuests());
  const [activeTab, setActiveTab] = useState<'room' | 'quests'>('room');
  const [showPraiseToast, setShowPraiseToast] = useState<string | null>(null);

  // Roblox 3D Perspective Controls
  const [cameraAngle, setCameraAngle] = useState<number>(20);

  const handleToggleQuest = (questId: string) => {
    playSound('click');
    const updated = quests.map((q) => {
      if (q.id === questId) {
        const nextCompleted = !q.completed;
        if (nextCompleted) {
          playSound('success');
          addSticker({
            id: `stk-quest-${Date.now()}`,
            name: '일일 퀘스트 완료',
            icon: '🎯',
            description: q.title,
          });
          setShowPraiseToast(`🎉 "${q.title}" 완료! 칭찬 스티커를 받았습니다!`);
          setTimeout(() => setShowPraiseToast(null), 3000);
        }
        return { ...q, completed: nextCompleted };
      }
      return q;
    });
    setQuests(updated);
    saveDailyQuests(updated);
  };

  const handleParentApprove = (questId: string) => {
    playSound('reward');
    const updated = quests.map((q) => {
      if (q.id === questId) {
        return { ...q, parentApproved: true };
      }
      return q;
    });
    setQuests(updated);
    saveDailyQuests(updated);

    const updatedItems = items.map((it) => {
      if (it.id === 'room-gold-crown-bed') {
        return { ...it, unlocked: true };
      }
      return it;
    });
    setItems(updatedItems);
    saveMyRoomItems(updatedItems);

    setShowPraiseToast('💮 학부모 칭찬 도장 완료! 전설의 황금 왕관 침대가 3D 마이룸에 해금되었습니다!');
    setTimeout(() => setShowPraiseToast(null), 3500);
  };

  const handleBuyItem = (item: MyRoomItem) => {
    playSound('reward');
    const updated = items.map((it) => {
      if (it.id === item.id) {
        return { ...it, unlocked: true };
      }
      return it;
    });
    setItems(updated);
    saveMyRoomItems(updated);
    setShowPraiseToast(`✨ ${item.name} 가구가 3D 로블록스 아지트에 설치되었습니다!`);
    setTimeout(() => setShowPraiseToast(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {showPraiseToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-2xl animate-bounce flex items-center gap-2 border-2 border-yellow-300">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span>{showPraiseToast}</span>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setActiveTab('room')}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm transition-all border-2 ${
            activeTab === 'room'
              ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 text-white border-purple-700 shadow-lg scale-105 ring-2 ring-purple-300'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-purple-50'
          }`}
        >
          <Box className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span>🎮 스마트폰 직접 터치 3D 마이룸</span>
        </button>

        <button
          onClick={() => setActiveTab('quests')}
          className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm transition-all border-2 ${
            activeTab === 'quests'
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white border-amber-500 shadow-md scale-105'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>🎯 일일 퀘스트 & 학부모 칭찬 도장</span>
        </button>
      </div>

      {/* 🎮 Roblox 3D Isometric View */}
      {activeTab === 'room' && (
        <div className="space-y-6">
          <div className="card-pastel bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900 p-6 rounded-3xl border-4 border-indigo-400 relative overflow-hidden shadow-2xl">
            {/* Header with User Profile Character Info */}
            <div className="flex items-center justify-between border-b border-indigo-700/60 pb-3 mb-4 text-white">
              <div>
                <h3 className="text-xl font-black text-yellow-300 flex items-center gap-2 drop-shadow-md">
                  🎮 {userProfile?.name || '지우'}의 3D 로블록스 마이룸
                  <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-300 animate-bounce" />
                </h3>
                <p className="text-xs text-indigo-200 font-bold mt-0.5 flex items-center gap-1">
                  <Hand className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span>스마트폰 화면에서 가구를 손가락으로 직접 끌어서 이동시키세요!</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    playSound('click');
                    setCameraAngle((prev) => (prev + 15) % 45);
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all border border-yellow-200 active:scale-95"
                >
                  <RotateCw className="w-4 h-4 text-slate-950" />
                  <span>3D 각도 {cameraAngle}°</span>
                </button>
              </div>
            </div>

            {/* 3D Isometric Room Canvas */}
            <div className="relative w-full h-80 sm:h-96 bg-slate-950 rounded-3xl border-4 border-indigo-500 shadow-inner overflow-hidden flex items-center justify-center p-4">
              {/* Grid Floor */}
              <motion.div
                animate={{ rotateX: 60, rotateZ: -30 + cameraAngle }}
                transition={{ type: 'spring', stiffness: 100, damping: 18 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-indigo-800 to-purple-900 rounded-3xl border-8 border-indigo-400 shadow-[0_30px_60px_rgba(0,0,0,0.8)] grid grid-cols-6 grid-rows-6 gap-1 p-3"
              >
                {/* 3D Tiles */}
                {Array.from({ length: 36 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-indigo-400/20 rounded-xl border border-indigo-300/30 backdrop-blur-xs"
                  />
                ))}

                {/* Direct Touch Drag-and-Drop 3D Placed Items */}
                {items
                  .filter((it) => it.unlocked)
                  .map((it) => (
                    <motion.div
                      key={it.id}
                      drag
                      dragConstraints={{ left: -120, right: 120, top: -120, bottom: 120 }}
                      dragElastic={0.1}
                      onDragStart={() => playSound('click')}
                      onDragEnd={() => playSound('reward')}
                      whileDrag={{ scale: 1.4, z: 50 }}
                      whileHover={{ scale: 1.3, z: 30 }}
                      className="absolute cursor-grab active:cursor-grabbing flex flex-col items-center select-none z-20"
                      style={{
                        left: `${it.position?.x ?? 50}%`,
                        top: `${it.position?.y ?? 50}%`,
                        transform: 'translate(-50%, -50%) translateZ(40px) rotateX(-60deg) rotateZ(30deg)',
                      }}
                    >
                      <span className="text-5xl sm:text-6xl filter drop-shadow-[0_12px_12px_rgba(0,0,0,0.7)] pointer-events-none">
                        {it.icon}
                      </span>
                      <span className="text-[10px] font-black text-slate-900 bg-white/95 px-2 py-0.5 rounded-full border border-purple-300 shadow-md whitespace-nowrap pointer-events-none">
                        {it.name} ✋ (터치 드래그)
                      </span>
                    </motion.div>
                  ))}
                {/* Pure 3D Avatar Character Standing Directly on 3D Grid Floor */}
                <motion.div
                  className="absolute z-30 cursor-pointer flex flex-col items-center select-none"
                  style={{
                    left: '50%',
                    top: '40%',
                    transform: 'translate(-50%, -50%) translateZ(45px) rotateX(-60deg) rotateZ(30deg)',
                  }}
                >
                  <InteractiveMascot
                    avatar={activeCharacter?.avatar || userProfile?.avatar || '🐰'}
                    name={`${userProfile?.name || '지우'}`}
                    pureAvatar={true}
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Direct Touch Drag Tip */}
            <div className="mt-3 p-3 bg-indigo-950/90 rounded-2xl border border-indigo-400 text-center text-xs font-black text-yellow-300">
              💡 스마트폰 터치 팁: 화면 속 가구를 손가락으로 꾹 눌러 원하는 곳으로 자유롭게 끌어다 놓으세요! 🖐️
            </div>

            {/* Item Shop Grid */}
            <div className="pt-4 border-t border-indigo-800 space-y-3 mt-4">
              <h4 className="text-sm font-black text-yellow-300 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-pink-400" />
                <span>3D 가구 & 소품 상점</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between ${
                      it.unlocked
                        ? 'bg-indigo-950/80 border-indigo-400 text-white'
                        : 'bg-slate-900/80 border-slate-700 text-slate-300 opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{it.icon}</span>
                      <div>
                        <p className="text-xs font-black">{it.name}</p>
                        <p className="text-[10px] font-bold text-indigo-300">
                          {it.unlocked ? '✅ 3D 보유중' : `스티커 ${it.costStickers}개`}
                        </p>
                      </div>
                    </div>

                    {!it.unlocked && (
                      <button
                        onClick={() => handleBuyItem(it)}
                        className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>배치</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 Quests View */}
      {activeTab === 'quests' && (
        <div className="card-pastel bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-6 rounded-3xl border-3 border-amber-200 space-y-6 shadow-cute">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                🎯 방학 일일 퀘스트 & 학부모 칭찬 도장
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300 animate-bounce" />
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                매일 주어진 퀘스트를 달성하고 학부모님의 칭찬 도장을 받아보세요!
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {quests.map((q) => (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-center justify-between gap-3 ${
                  q.completed
                    ? 'bg-amber-100/70 border-amber-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => handleToggleQuest(q.id)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      q.completed
                        ? 'bg-amber-500 border-amber-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {q.completed && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                  <div>
                    <h4 className={`font-black text-sm sm:text-base ${q.completed ? 'line-through text-slate-600' : 'text-slate-800'}`}>
                      {q.title}
                    </h4>
                    <span className="text-[11px] font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-300">
                      보상: 칭찬 스티커 1개 🌟
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-amber-200 pt-2 sm:pt-0">
                  {q.parentApproved ? (
                    <span className="px-3 py-1.5 bg-rose-100 text-rose-800 border border-rose-300 font-black text-xs rounded-full flex items-center gap-1 shadow-xs">
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
                      <span>부모님 참잘했어요! 💮</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleParentApprove(q.id)}
                      className="px-4 py-2 bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-black text-xs rounded-2xl shadow-sm flex items-center gap-1.5"
                    >
                      <Award className="w-4 h-4" />
                      <span>학부모 칭찬 도장 찍기 💮</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRoomModule;
