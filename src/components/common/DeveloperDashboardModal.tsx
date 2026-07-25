import React, { useState } from 'react';
import { AnalyticsSummary } from '../../types';
import { getAnalyticsData } from '../../services/storage';
import { playSound } from '../../services/audio';
import { ShieldAlert, KeyRound, Activity, BarChart3, Users, Clock, Eye, Trash2, X, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface DeveloperDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperDashboardModal: React.FC<DeveloperDashboardModalProps> = ({ isOpen, onClose }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary>(() => getAnalyticsData());

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default Secret Developer Pin: 7777
    if (passwordInput === '7777' || passwordInput === 'admin' || passwordInput === '0000') {
      playSound('reward');
      setIsAuthenticated(true);
      setAuthError(false);
      setAnalyticsData(getAnalyticsData());
    } else {
      playSound('click');
      setAuthError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 rounded-3xl border-4 border-indigo-500 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 text-white my-8"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            playSound('click');
            onClose();
          }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all z-10 font-bold border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-indigo-800/80 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-indigo-300 flex items-center justify-center text-2xl shadow-lg shrink-0">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-yellow-400 text-slate-950 font-black text-[10px] rounded-full border border-yellow-300">
                🔒 SECRET DEVELOPER ONLY
              </span>
              <span className="text-[10px] font-bold text-indigo-300">비공개 개발자 관리자 전용</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-yellow-300 flex items-center gap-2 mt-0.5">
              비공개 이용자 분석 대시보드
            </h3>
          </div>
        </div>

        {/* Secret Auth Challenge if not authenticated */}
        {!isAuthenticated ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-900/80 border-2 border-indigo-400 flex items-center justify-center text-3xl mx-auto shadow-inner text-yellow-300">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-black text-white">개발자 인증 암호 필요</h4>
              <p className="text-xs font-bold text-indigo-300 mt-1">
                이용 내역 및 대시보드는 나(학부모/개발자)만 볼 수 있습니다. (초기 암호: <code className="text-yellow-300 bg-black/40 px-1.5 py-0.5 rounded">7777</code>)
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-2">
              <input
                type="password"
                placeholder="인증 암호 4자리 입력 (7777)"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                className="w-full text-center px-4 py-3 bg-slate-950 border-2 border-indigo-500 rounded-2xl text-yellow-300 font-black text-lg focus:outline-none focus:border-yellow-400 tracking-widest placeholder:text-xs placeholder:tracking-normal"
              />
              {authError && (
                <p className="text-xs font-black text-rose-400">⚠️ 암호가 올바르지 않습니다. (초기 암호: 7777)</p>
              )}
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all"
            >
              대시보드 암행 승인 🔓
            </button>
          </form>
        ) : (
          /* Authenticated Dashboard Content */
          <div className="space-y-6">
            {/* Realtime Key Metrics KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-indigo-950/80 p-3.5 rounded-2xl border border-indigo-700/60 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-sky-400" /> 총 페이지 방문
                </span>
                <p className="text-2xl font-black text-yellow-300 mt-2">{analyticsData.totalVisits}회</p>
              </div>

              <div className="bg-indigo-950/80 p-3.5 rounded-2xl border border-indigo-700/60 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> 몰입 공부 세션
                </span>
                <p className="text-2xl font-black text-emerald-400 mt-2">{analyticsData.totalStudySessions}회</p>
              </div>

              <div className="bg-indigo-950/80 p-3.5 rounded-2xl border border-indigo-700/60 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-purple-400" /> 영어/수학 정답
                </span>
                <p className="text-2xl font-black text-purple-300 mt-2">{analyticsData.totalQuizzesSolved}개</p>
              </div>

              <div className="bg-indigo-950/80 p-3.5 rounded-2xl border border-indigo-700/60 flex flex-col justify-between">
                <span className="text-[10px] font-bold text-indigo-300 flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-pink-400" /> 커스텀 3D 가구
                </span>
                <p className="text-2xl font-black text-pink-400 mt-2">{analyticsData.totalCustomFurnitureCreated}개</p>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-black text-yellow-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>실시간 이용자 행동 로그 데이터 (최근 50건)</span>
                </h4>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                  자동 실시간 로깅
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {analyticsData.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-950/90 rounded-xl border border-indigo-800/80 flex items-center justify-between text-xs font-bold gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-900 text-indigo-200 border border-indigo-700 shrink-0">
                        {log.tab}
                      </span>
                      <span className="text-slate-200 truncate">{log.details}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-[10px] text-slate-400">
                      <span className="text-yellow-300 font-bold">{log.userGrade}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-indigo-800/60 flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-400">
                🔒 일반 유저 화면 및 네비게이션에는 이 대시보드가 표시되지 않습니다.
              </p>
              <button
                onClick={() => {
                  playSound('click');
                  setIsAuthenticated(false);
                  setPasswordInput('');
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs rounded-xl border border-slate-700"
              >
                암행 잠금 🔒
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DeveloperDashboardModal;
