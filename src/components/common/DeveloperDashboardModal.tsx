import React, { useState } from 'react';
import { AnalyticsSummary } from '../../types';
import { getAnalyticsData } from '../../services/storage';
import { playSound } from '../../services/audio';
import { Activity, BarChart3, Clock, Eye, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface DeveloperDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperDashboardModal: React.FC<DeveloperDashboardModalProps> = ({ isOpen, onClose }) => {
  const [analyticsData] = useState<AnalyticsSummary>(() => getAnalyticsData());

  // 이 데이터는 브라우저 로컬 저장소에 있으므로 클라이언트 PIN은 보안 경계가 될 수 없다.
  // 프로덕션 번들에서는 대시보드를 렌더링하지 않고 로컬 개발 모드에서만 제공한다.
  if (!import.meta.env.DEV || !isOpen) return null;

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
                LOCAL DEVELOPMENT ONLY
              </span>
              <span className="text-[10px] font-bold text-indigo-300">프로덕션 빌드에서는 제외됨</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-yellow-300 flex items-center gap-2 mt-0.5">
              비공개 이용자 분석 대시보드
            </h3>
          </div>
        </div>

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
            </div>
          </div>
      </motion.div>
    </div>
  );
};

export default DeveloperDashboardModal;
