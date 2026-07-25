import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { UserProfile } from '../../types';
import { playSound } from '../../services/audio';
import { resetScheduleByGrade } from '../../services/storage';
import { Check, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
}) => {
  const [name, setName] = useState(userProfile.name);
  const [grade, setGrade] = useState(userProfile.grade);
  const [avatar, setAvatar] = useState(userProfile.avatar);

  useEffect(() => {
    if (isOpen) {
      setName(userProfile.name);
      setGrade(userProfile.grade);
      setAvatar(userProfile.avatar || '🐰');
    }
  }, [isOpen, userProfile]);

  const gradeOptions = ['유치부', '초등 1학년', '초등 2학년', '초등 3학년', '초등 4학년 이상'];
  
  // 10 Cute Animal Character Avatars
  const animalAvatars = [
    { emoji: '🐰', name: '토끼', bg: 'bg-pink-100' },
    { emoji: '🐥', name: '병아리', bg: 'bg-amber-100' },
    { emoji: '🐻', name: '곰돌이', bg: 'bg-[#FFE4D6]' },
    { emoji: '🦊', name: '여우', bg: 'bg-orange-100' },
    { emoji: '🐱', name: '고양이', bg: 'bg-rose-100' },
    { emoji: '🐶', name: '강아지', bg: 'bg-yellow-100' },
    { emoji: '🦄', name: '유니콘', bg: 'bg-purple-100' },
    { emoji: '🦁', name: '사자', bg: 'bg-amber-200' },
    { emoji: '🐼', name: '판다', bg: 'bg-slate-100' },
    { emoji: '🐨', name: '코알라', bg: 'bg-blue-100' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    playSound('success');
    
    // Auto switch schedule template if grade changed
    if (userProfile.grade !== grade) {
      resetScheduleByGrade(grade);
    }

    onSaveProfile({
      ...userProfile,
      name: name.trim(),
      grade,
      avatar,
    });
    onClose();
  };

  if (!isOpen) return null;

  // Render via React Portal to document.body to break out of sticky header context
  return ReactDOM.createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="bg-white max-w-sm w-full p-6 shadow-2xl rounded-[32px] border-4 border-pink-300 relative my-auto"
        >
          {/* Top Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Header */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">자녀 프로필 추가</h2>
            <p className="text-xs text-slate-500 font-bold mt-1">
              새로운 친구의 정보를 입력하고 멋진 아바타를 골라주세요!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Child Name Input */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1 text-left">어린이 이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                required
                maxLength={10}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none text-slate-800 font-bold text-sm bg-slate-50 focus:bg-white transition-all"
              />
            </div>

            {/* 2. Grade Selector */}
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1 text-left">학년 선택</label>
              <div className="relative">
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none text-slate-800 font-bold text-sm bg-slate-50 focus:bg-white appearance-none cursor-pointer transition-all"
                >
                  {gradeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                  ▼
                </div>
              </div>
            </div>

            {/* 3. Avatar Section */}
            <div className="pt-1">
              <label className="block text-xs font-black text-slate-800 mb-2 text-left">
                나만의 아바타 고르기
              </label>
              <div className="grid grid-cols-5 gap-2.5">
                {animalAvatars.map((item) => {
                  const isSelected = avatar === item.emoji;
                  return (
                    <button
                      key={item.emoji}
                      type="button"
                      title={item.name}
                      onClick={() => {
                        playSound('click');
                        setAvatar(item.emoji);
                      }}
                      className={`relative aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 ${item.bg} ${
                        isSelected
                          ? 'ring-4 ring-pink-400 ring-offset-2 scale-105 shadow-md font-bold'
                          : 'hover:scale-105 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <span>{item.emoji}</span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-pink-400 hover:bg-pink-500 text-white font-black text-xs shadow-md transition-all active:scale-95"
              >
                확인
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
