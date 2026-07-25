import React, { useState } from 'react';
import { MyRoomItem, DailyQuest } from '../../types';
import { getMyRoomItems, saveMyRoomItems, getDailyQuests, saveDailyQuests, addSticker } from '../../services/storage';
import { playSound } from '../../services/audio';
import { InteractiveMascot } from '../common/InteractiveMascot';
import { Sparkles, Home, CheckCircle2, Award, Heart, ShoppingBag, Plus, Move, RotateCw, Box } from 'lucide-react';
import { motion } from 'framer-motion';

export const MyRoomModule: React.FC = () => {
  const [items, setItems] = useState<MyRoomItem[]>(() => getMyRoomItems());
  const [quests, setQuests] = useState<DailyQuest[]>(() => getDailyQuests());
  const [activeTab, setActiveTab] = useState<'room' | 'quests'>('room');
  const [showPraiseToast, setShowPraiseToast] = useState<string | null>(null);

  // Roblox 3D Camera Controls
  const [cameraAngle, setCameraAngle] = useState<number>(15); // perspective rotateY
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

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

    // Unlock special parent crown bed
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
    setShowPraiseToast(`✨ ${item.name} 가구가 3D 로블록스 아지트에 배치되었습니다!`);
    setTimeout(() => setShowPraiseToast(null), 3000);
  };

  const handleMoveItem = (id: string, deltaX: number, deltaY: number) => {
    playSound('click');
    const updated = items.map((it) => {
      if (it.id === id) {
        const curX = it.position?.x ?? 50;
        const curY = it.position?.y ?? 50;
        const newX = Math.max(10, Math.min(85, curX + deltaX));
        const newY = Math.max(15, Math.min(80, curY + deltaY));
        return { ...it, position: { x: newX, y: newY } };
      }
      return it;
    });
    setItems(updated);
    saveMyRoomItems(updated);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {showPraiseToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-purple-600 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-2xl animate-bounce flex items-center gap-2 border-2 border-yellow-300">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span>{showPraiseToast}</span>
        </div>
      )}

      {/* Sub-Tab Navigation */}
      <div className="flex justify-center gap-3">
        <button
          onClick={() => setActiveTab('room')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all border-2 ${
            activeTab === 'room'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-700 shadow-md scale-105'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-purple-50'
          }`}
        >
          <Box className="w-5 h-5" />
          <span>🎮 로블록스 3D 마이룸 아지트</span>
        </button>

        <button
          onClick={() => setActiveTab('quests')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all border-2 ${
            activeTab === 'quests'
              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white border-amber-500 shadow-md scale-105'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>🎯 일일 퀘스트 & 학부모 칭찬 도장</span>
        </button>
      </div>

      {/* 🎮 Roblox Style 3D Isometric MyRoom View */}
      {activeTab === 'room' && (
        <div className="space-y-6">
          <div className="card-pastel bg-gradient-to-b from-indigo-50/90 via-white to-purple-50/90 p-6 rounded-3xl border-3 border-purple-300 relative overflow-hidden shadow-cute">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3 mb-4">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  🎮 3D 로블록스 입체 마이룸 아지트
                  <Sparkles className="w-5 h-5 text-purple-500 fill-purple-300 animate-bounce" />
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  가구를 터치해 위치를 바꾸고 3D 화면 각도를 회전시켜 나만의 세상을 만들어보세요!
                </p>
              </div>

              {/* 3D Camera Angle Control Button */}
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-purple-200 shadow-xs">
                <button
                  onClick={() => {
                    playSound('click');
                    setCameraAngle((prev) => (prev + 15) % 45);
                  }}
                  className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-black text-xs rounded-xl flex items-center gap-1 transition-all"
                  title="3D 화면 각도 전환"
                >
                  <RotateCw className="w-4 h-4 text-purple-700" />
                  <span>3D 각도 {cameraAngle}°</span>
                </button>
              </div>
            </div>

            {/* 3D Isometric World Canvas Container */}
            <div className="relative w-full h-80 sm:h-96 bg-gradient-to-b from-slate-900 via-indigo-950 to-purple-950 rounded-3xl border-4 border-indigo-400 shadow-2xl overflow-hidden flex items-center justify-center p-4">
              {/* Roblox 3D Isometric Grid Floor Plane */}
              <motion.div
                animate={{ rotateX: 55, rotateZ: -25 + cameraAngle }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative w-72 h-72 sm:w-96 sm:h-96 bg-indigo-900/90 rounded-3xl border-8 border-indigo-300 shadow-[0_20px_50px_rgba(0,0,0,0.6)] grid grid-cols-6 grid-rows-6 gap-1 p-2"
              >
                {/* 3D Grid Floor Tiles */}
                {Array.from({ length: 36 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-indigo-500/40 to-purple-600/40 rounded-xl border border-indigo-300/30 backdrop-blur-xs"
                  />
                ))}

                {/* 3D Placed Room Items */}
                {items
                  .filter((it) => it.unlocked)
                  .map((it) => {
                    const isSelected = selectedItemId === it.id;
                    return (
                      <motion.div
                        key={it.id}
                        onClick={() => {
                          playSound('click');
                          setSelectedItemId(it.id);
                        }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.25, z: 25 }}
                        className={`absolute cursor-pointer flex flex-col items-center select-none ${
                          isSelected ? 'ring-4 ring-yellow-400 rounded-2xl bg-white/30 p-2 z-40' : 'z-20'
                        }`}
                        style={{
                          left: `${it.position?.x ?? 50}%`,
                          top: `${it.position?.y ?? 50}%`,
                          transform: 'translate(-50%, -50%) translateZ(30px) rotateX(-55deg) rotateZ(25deg)',
                        }}
                      >
                        <span className="text-5xl sm:text-6xl filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                          {it.icon}
                        </span>
                        <span className="text-[10px] font-black text-slate-900 bg-white/95 px-2 py-0.5 rounded-full border border-purple-300 shadow-md whitespace-nowrap">
                          {it.name}
                        </span>
                      </motion.div>
                    );
                  })}
              </motion.div>

              {/* Mascot Overlay */}
              <div className="absolute bottom-3 right-3 z-30 scale-85">
                <InteractiveMascot avatar="🐰" name="3D 빌더 토끼" />
              </div>
            </div>

            {/* Selected Item 3D Position Controller */}
            {selectedItemId && (
              <div className="mt-4 p-4 bg-purple-100/90 rounded-2xl border-2 border-purple-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Move className="w-5 h-5 text-purple-700 animate-pulse" />
                  <span className="text-xs font-black text-purple-900">
                    선택된 가구: {items.find((it) => it.id === selectedItemId)?.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMoveItem(selectedItemId, -5, 0)}
                    className="px-3 py-1.5 bg-white hover:bg-purple-200 font-black text-xs rounded-xl border border-purple-300"
                  >
                    ⬅️ 왼쪽
                  </button>
                  <button
                    onClick={() => handleMoveItem(selectedItemId, 5, 0)}
                    className="px-3 py-1.5 bg-white hover:bg-purple-200 font-black text-xs rounded-xl border border-purple-300"
                  >
                    ➡️ 오른쪽
                  </button>
                  <button
                    onClick={() => handleMoveItem(selectedItemId, 0, -5)}
                    className="px-3 py-1.5 bg-white hover:bg-purple-200 font-black text-xs rounded-xl border border-purple-300"
                  >
                    ⬆️ 위
                  </button>
                  <button
                    onClick={() => handleMoveItem(selectedItemId, 0, 5)}
                    className="px-3 py-1.5 bg-white hover:bg-purple-200 font-black text-xs rounded-xl border border-purple-300"
                  >
                    ⬇️ 아래
                  </button>
                </div>
              </div>
            )}

            {/* Item Shop Grid */}
            <div className="pt-4 border-t border-purple-100 space-y-3 mt-4">
              <h4 className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-purple-500" />
                <span>3D 가구 & 소품 상점</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between ${
                      it.unlocked
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-white border-slate-200 opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{it.icon}</span>
                      <div>
                        <p className="text-xs font-black text-slate-800">{it.name}</p>
                        <p className="text-[10px] font-bold text-slate-500">
                          {it.unlocked ? '✅ 3D 보유중' : `스티커 ${it.costStickers}개`}
                        </p>
                      </div>
                    </div>

                    {!it.unlocked && (
                      <button
                        onClick={() => handleBuyItem(it)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1"
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

                {/* Parent Approval Stamp Button */}
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
