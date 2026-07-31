import React, { useState, useEffect } from 'react';
import { MyRoomItem, DailyQuest, UserProfile } from '../../types';
import { getMyRoomItems, saveMyRoomItems, getDailyQuests, saveDailyQuests, addSticker } from '../../services/storage';
import { playSound } from '../../services/audio';
import { Sparkles, CheckCircle2, Award, Heart, ShoppingBag, Plus, RotateCw, Box, Hand, Gift, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MyRoomModuleProps {
  userProfile?: UserProfile;
  activeCharacter?: { name: string; avatar: string };
}

export const MyRoomModule: React.FC<MyRoomModuleProps> = ({ userProfile, activeCharacter }) => {
  const [items, setItems] = useState<MyRoomItem[]>(() => getMyRoomItems());
  const [quests, setQuests] = useState<DailyQuest[]>(() => getDailyQuests());
  const [activeTab, setActiveTab] = useState<'room' | 'quests'>('room');
  const [showPraiseToast, setShowPraiseToast] = useState<string | null>(null);

  // User Coins & Roblox 3D Controls
  const [userCoins, setUserCoins] = useState<number>(60);
  const [cameraAngle, setCameraAngle] = useState<number>(20);

  // [요청 사항 1] 가구 상호작용 State
  const [isLightOn, setIsLightOn] = useState<boolean>(false);
  const [teddyBounce, setTeddyBounce] = useState<boolean>(false);
  const [butterflies, setButterflies] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // [요청 사항 2] 룸 중앙 '마법 토끼' 펫 자율 주행 & 말풍선 State
  const [rabbitPos, setRabbitPos] = useState<{ x: number; y: number }>({ x: 50, y: 70 });
  const [rabbitSpeechBubble, setRabbitSpeechBubble] = useState<string | null>(null);

  // [요청 사항 3] 미스터리 박스 가챠 뽑기 State
  const [showGachaModal, setShowGachaModal] = useState<boolean>(false);
  const [isUnboxing, setIsUnboxing] = useState<boolean>(false);
  const [unboxedItem, setUnboxedItem] = useState<MyRoomItem | null>(null);

  // [요청 사항 2] 토끼 펫 3.5초마다 랜덤 위치 자율 주행 로직
  useEffect(() => {
    const interval = setInterval(() => {
      const randomX = Math.floor(Math.random() * 65) + 15; // 15% ~ 80%
      const randomY = Math.floor(Math.random() * 55) + 25; // 25% ~ 80%
      setRabbitPos({ x: randomX, y: randomY });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // 토끼 터치 시 "지우야 안녕! 하트 뿅뿅 💕" 말풍선 3초간 표시
  const handleRabbitClick = () => {
    playSound('reward');
    const childName = userProfile?.name || '지우';
    setRabbitSpeechBubble(`${childName}야 안녕! 하트 뿅뿅 💕`);
    setTimeout(() => {
      setRabbitSpeechBubble(null);
    }, 3000);
  };

  // [요청 사항 1] 가구 아이콘 클릭 상호작용 이펙트
  const handleItemClick = (it: MyRoomItem) => {
    playSound('click');

    // 💡 별빛 조명: 배경 어두워지고 빛나는 Glow 효과 토글
    if (it.id.includes('lamp') || it.icon === '💡' || it.icon === '⭐' || it.name.includes('조명')) {
      setIsLightOn((prev) => !prev);
      playSound('reward');
      setShowPraiseToast(isLightOn ? '☀️ 조명이 꺼졌습니다.' : '💡 조명이 켜지며 밤하늘 별빛 아우라가 빛납니다!');
      setTimeout(() => setShowPraiseToast(null), 2500);
      return;
    }

    // 🧸 곰인형: 통통 튀어오르는 Bounce 이펙트
    if (it.id.includes('teddy') || it.icon === '🧸' || it.name.includes('곰인형')) {
      setTeddyBounce(true);
      playSound('reward');
      setTimeout(() => setTeddyBounce(false), 1200);
      return;
    }

    // 🦋 채집통: 무작위 나비 이모지가 화면 사방으로 날아가는 이펙트
    if (it.id.includes('insects') || it.icon === '🦋' || it.icon === '🦗' || it.name.includes('채집')) {
      playSound('success');
      const newButterflies = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 60) + 20,
      }));
      setButterflies(newButterflies);
      setTimeout(() => setButterflies([]), 2500);
      return;
    }

    // 기본 가구 터치
    playSound('click');
  };

  // [요청 사항 3] 미스터리 가구 뽑기 (30코인) 언박싱 가챠 로직
  const handleMysteryGacha = () => {
    if (userCoins < 30) {
      alert('코인이 부족해요! 퀴즈를 풀고 30코인을 모아보세요! 🪙');
      return;
    }

    setUserCoins((prev) => prev - 30);
    setShowGachaModal(true);
    setIsUnboxing(true);
    setUnboxedItem(null);
    playSound('click');

    // 1.5초 덜컹거리다 언박싱!
    setTimeout(() => {
      setIsUnboxing(false);
      playSound('reward');

      const gachaPool: Omit<MyRoomItem, 'id' | 'unlocked'>[] = [
        { name: '우주선 책상 🛸', icon: '🛸', category: 'special', costStickers: 0 },
        { name: '무지개 구름 소파 🌈', icon: '🌈', category: 'furniture', costStickers: 0 },
        { name: '마법 성 침대 🏰', icon: '🏰', category: 'furniture', costStickers: 0 },
        { name: '유니콘 별빛 램프 🦄', icon: '🦄', category: 'special', costStickers: 0 },
        { name: '은하수 로켓 탐사선 🚀', icon: '🚀', category: 'special', costStickers: 0 },
        { name: '전설의 황금 왕관 👑', icon: '👑', category: 'special', costStickers: 0 },
      ];

      const picked = gachaPool[Math.floor(Math.random() * gachaPool.length)];
      const newItem: MyRoomItem = {
        id: `gacha-room-${Date.now()}`,
        ...picked,
        unlocked: true,
        position: { x: Math.floor(Math.random() * 50) + 25, y: Math.floor(Math.random() * 50) + 25 },
      };

      setUnboxedItem(newItem);
      const updated = [...items, newItem];
      setItems(updated);
      saveMyRoomItems(updated);
    }, 1600);
  };

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
          <span>🎮 3D 로블록스 마이룸 & 펫 룸</span>
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
            {/* Header with User Profile Character Info & Coins */}
            <div className="flex items-center justify-between border-b border-indigo-700/60 pb-3 mb-4 text-white">
              <div>
                <h3 className="text-xl font-black text-yellow-300 flex items-center gap-2 drop-shadow-md">
                  🎮 {userProfile?.name || '지우'}의 3D 로블록스 마이룸
                  <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-300 animate-bounce" />
                </h3>
                <p className="text-xs text-indigo-200 font-bold mt-0.5 flex items-center gap-1">
                  <Hand className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span>가구를 터치하면 신나는 애니메이션이 발동해요! 펫 토끼를 만져보세요!</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md border border-amber-300 flex items-center gap-1 animate-pulse">
                  <span>🪙 {userCoins}P</span>
                </div>
                <button
                  onClick={() => {
                    playSound('click');
                    setCameraAngle((prev) => (prev + 15) % 45);
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all border border-yellow-200 active:scale-95"
                >
                  <RotateCw className="w-4 h-4 text-slate-950" />
                  <span>3D {cameraAngle}°</span>
                </button>
              </div>
            </div>

            {/* [요청 사항 1] 💡 별빛 조명 토글 시 배경 어두워지고 Glow 효과 발동 */}
            <div
              className={`relative w-full h-[380px] sm:h-[450px] rounded-3xl border-4 shadow-inner overflow-hidden flex items-center justify-center p-4 transition-all duration-700 ${
                isLightOn
                  ? 'bg-gradient-to-b from-slate-950 via-gray-950 to-black border-amber-400/90 shadow-[0_0_60px_rgba(253,224,71,0.3)_inset]'
                  : 'bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 border-indigo-500'
              }`}
            >
              <div className="relative w-full h-full">
                {/* [요청 사항 1] 🦋 채집통 클릭 시 나비 날아가는 애니메이션 */}
                {butterflies.map((b) => (
                  <motion.div
                    key={b.id}
                    initial={{ y: 250, opacity: 1, scale: 0.8 }}
                    animate={{ y: -150, opacity: [1, 1, 0], scale: [0.8, 1.4, 1] }}
                    transition={{ duration: 2.2, ease: 'easeOut' }}
                    className="absolute text-4xl pointer-events-none z-40"
                    style={{ left: `${b.x}%` }}
                  >
                    🦋
                  </motion.div>
                ))}

                {/* [요청 사항 2] 룸 중앙 '🐰 마법 토끼' 펫 자율 주행 & 말풍선 */}
                <motion.div
                  animate={{ left: `${rabbitPos.x}%`, top: `${rabbitPos.y}%` }}
                  transition={{ duration: 2.5, ease: 'easeInOut' }}
                  onClick={handleRabbitClick}
                  className="absolute cursor-pointer flex flex-col items-center select-none z-30 group"
                  style={{ transform: 'translate(-50%, -50%)' }}
                >
                  {/* 터치 시 "지우야 안녕! 하트 뿅뿅 💕" 말풍선 */}
                  <AnimatePresence>
                    {rabbitSpeechBubble && (
                      <motion.div
                        initial={{ y: 10, opacity: 0, scale: 0.8 }}
                        animate={{ y: -45, opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute bg-pink-400 text-white font-black text-xs px-3 py-1.5 rounded-2xl rounded-bl-none shadow-xl border-2 border-white whitespace-nowrap z-50 animate-bounce"
                      >
                        {rabbitSpeechBubble}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border-2 border-pink-300 flex items-center justify-center text-4xl shadow-xl group-hover:scale-125 transition-transform animate-bounce">
                    🐰
                  </div>
                  <span className="text-[10px] font-black text-pink-200 bg-pink-900/80 px-2 py-0.5 rounded-full mt-1 border border-pink-400">
                    마법 토끼 펫 💕
                  </span>
                </motion.div>

                {/* Direct Touch Drag-and-Drop Item Icons */}
                {items
                  .filter((it) => it.unlocked)
                  .map((it) => {
                    const isTeddy = it.id.includes('teddy') || it.icon === '🧸';
                    const isLamp = it.id.includes('lamp') || it.icon === '💡' || it.icon === '⭐';

                    return (
                      <motion.div
                        key={it.id}
                        drag
                        dragConstraints={{ left: -160, right: 160, top: -140, bottom: 140 }}
                        dragElastic={0.1}
                        onClick={() => handleItemClick(it)}
                        onDragStart={() => playSound('click')}
                        onDragEnd={() => playSound('reward')}
                        animate={
                          isTeddy && teddyBounce
                            ? { y: [0, -40, 0, -20, 0], scale: [1, 1.4, 0.9, 1.2, 1] }
                            : { y: 0 }
                        }
                        whileDrag={{ scale: 1.4, zIndex: 50 }}
                        whileHover={{ scale: 1.3, zIndex: 40 }}
                        className={`absolute cursor-grab active:cursor-grabbing flex flex-col items-center select-none z-20 group ${
                          isLamp && isLightOn ? 'drop-shadow-[0_0_35px_rgba(253,224,71,0.9)] ring-4 ring-yellow-300/80 rounded-full animate-pulse' : ''
                        }`}
                        style={{
                          left: `${it.position?.x ?? 50}%`,
                          top: `${it.position?.y ?? 50}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <span className="text-6xl sm:text-7xl filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)] pointer-events-none transition-transform group-hover:scale-110">
                          {it.icon}
                        </span>
                      </motion.div>
                    );
                  })}
              </div>
            </div>

            {/* Direct Touch Drag Tip */}
            <div className="mt-3 p-3 bg-indigo-950/90 rounded-2xl border border-indigo-400 text-center text-xs font-black text-yellow-300">
              💡 가구 상호작용 팁: 조명(💡)을 누르면 밤하늘 조명이 빛나고, 곰인형(🧸)은 통통 튀고, 펫 토끼(🐰)를 터치하면 인사를 해요! 🖐️
            </div>

            {/* [요청 사항 3] 🎁 미스터리 가구 뽑기 (30코인) 언박싱 상점 버튼 */}
            <div className="pt-4 border-t border-indigo-800 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-yellow-300 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-pink-400" />
                  <span>3D 가구 & 미스터리 뽑기 상점</span>
                </h4>
              </div>

              {/* Grid with 1st Item dedicated to Mystery Gacha Box */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* 1st Card: [🎁 미스터리 가구 뽑기 (30코인)] Button */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleMysteryGacha}
                  className="p-3.5 rounded-2xl border-3 border-amber-300 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 text-slate-950 flex flex-col items-center justify-center text-center font-black shadow-xl ring-2 ring-amber-300 active:scale-95 cursor-pointer"
                >
                  <Gift className="w-8 h-8 text-slate-950 animate-bounce" />
                  <span className="text-xs sm:text-sm font-black mt-1 text-slate-950">🎁 미스터리 가구 뽑기</span>
                  <span className="text-[11px] font-black text-slate-950 bg-amber-300 px-3 py-0.5 rounded-full mt-1 border border-amber-400">
                    30코인 🪙
                  </span>
                </motion.button>

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

      {/* [요청 사항 3] 미스터리 상자 언박싱 (Gacha Unboxing Modal) */}
      <AnimatePresence>
        {showGachaModal && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              className="card-pastel bg-gradient-to-b from-purple-900 via-indigo-900 to-slate-950 p-6 rounded-3xl border-4 border-amber-400 max-w-sm w-full text-center space-y-4 text-white shadow-2xl"
            >
              {isUnboxing ? (
                <div className="py-8 space-y-4">
                  <div className="text-7xl animate-bounce">🎁</div>
                  <h3 className="text-xl font-black text-yellow-300 animate-pulse">
                    미스터리 가구 상자가 덜컹덜컹...!
                  </h3>
                  <p className="text-xs text-indigo-200 font-bold">어떤 가구가 나올까?</p>
                </div>
              ) : (
                unboxedItem && (
                  <div className="py-4 space-y-4">
                    <div className="text-7xl animate-bounce">{unboxedItem.icon}</div>
                    <h3 className="text-2xl font-black text-amber-300">✨ 언박싱 성공! ✨</h3>
                    <p className="text-lg font-black text-white">{unboxedItem.name}</p>
                    <p className="text-xs text-indigo-200 font-bold">
                      새로운 3D 가구가 마이룸에 성공적으로 배치되었습니다! 🎉
                    </p>
                    <button
                      onClick={() => setShowGachaModal(false)}
                      className="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm rounded-full shadow-lg border border-amber-300 active:scale-95"
                    >
                      3D 마이룸 확인하기 🚀
                    </button>
                  </div>
                )
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
