import React, { useState, useEffect } from 'react';
import { MyRoomItem, DailyQuest } from '../../types';
import { getMyRoomItems, saveMyRoomItems, getDailyQuests, saveDailyQuests, addSticker } from '../../services/storage';
import { playSound } from '../../services/audio';
import { InteractiveMascot } from '../common/InteractiveMascot';
import { Sparkles, Home, CheckCircle2, Award, Heart, ShoppingBag, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MyRoomModule: React.FC = () => {
  const [items, setItems] = useState<MyRoomItem[]>(() => getMyRoomItems());
  const [quests, setQuests] = useState<DailyQuest[]>(() => getDailyQuests());
  const [activeTab, setActiveTab] = useState<'room' | 'quests'>('room');
  const [showPraiseToast, setShowPraiseToast] = useState<string | null>(null);

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

    setShowRewardModal(true);
  };

  const [showRewardModal, setShowRewardModal] = useState(false);

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
    setShowPraiseToast(`✨ ${item.name} 가구가 마이룸에 설치되었습니다!`);
    setTimeout(() => setShowPraiseToast(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Notification */}
      {showPraiseToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-full shadow-2xl animate-bounce flex items-center gap-2">
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
              ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white border-pink-500 shadow-md scale-105'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-pink-50'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>🏰 나만의 마이룸 아지트</span>
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

      {/* 🏰 MyRoom View */}
      {activeTab === 'room' && (
        <div className="space-y-6">
          <div className="card-pastel bg-gradient-to-b from-amber-50/70 via-white to-pink-50/50 p-6 rounded-3xl border-3 border-pink-200 relative overflow-hidden min-h-[380px] shadow-cute">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3 mb-4">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  🏰 지우의 방학 아지트 마이룸
                  <Sparkles className="w-5 h-5 text-amber-500 fill-amber-300 animate-pulse" />
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  스티커를 모아 나만의 예쁜 가구와 펫 친구들로 방을 꾸며보세요!
                </p>
              </div>
              <InteractiveMascot avatar="🐰" name="마법 토끼" />
            </div>

            {/* Room Canvas Area */}
            <div className="relative w-full h-72 bg-gradient-to-b from-sky-100/60 via-amber-50/40 to-pink-100/60 rounded-2xl border-2 border-pink-200 shadow-inner overflow-hidden">
              {/* Wallpaper pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FFB6C1_1px,transparent_1px)] [background-size:16px_16px]" />

              {/* Unlocked Room Items */}
              {items
                .filter((it) => it.unlocked)
                .map((it) => (
                  <motion.div
                    key={it.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="absolute cursor-pointer flex flex-col items-center select-none"
                    style={{ left: `${it.position?.x}%`, top: `${it.position?.y}%` }}
                    title={it.name}
                  >
                    <span className="text-5xl drop-shadow-md">{it.icon}</span>
                    <span className="text-[10px] font-black text-purple-900 bg-white/90 px-2 py-0.5 rounded-full border border-purple-200 shadow-xs">
                      {it.name}
                    </span>
                  </motion.div>
                ))}
            </div>

            {/* Item Shop Grid */}
            <div className="pt-4 border-t border-pink-100 space-y-3">
              <h4 className="text-sm font-black text-slate-700 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-pink-500" />
                <span>가구 & 소품 상점</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between ${
                      it.unlocked
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white border-slate-200 opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{it.icon}</span>
                      <div>
                        <p className="text-xs font-black text-slate-800">{it.name}</p>
                        <p className="text-[10px] font-bold text-slate-500">
                          {it.unlocked ? '✅ 보유중' : `스티커 ${it.costStickers}개`}
                        </p>
                      </div>
                    </div>

                    {!it.unlocked && (
                      <button
                        onClick={() => handleBuyItem(it)}
                        className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>설치</span>
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
