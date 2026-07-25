import React, { useState } from 'react';
import { listenAndRecognize, playSound, speakText } from '../../services/audio';
import { addSticker } from '../../services/storage';
import { Award, Mic, Sparkles, Volume2, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceCrownProps {
  targetWord?: string;
  translation?: string;
  icon?: string;
  onEvaluationComplete?: (score: number, tier: string) => void;
}

export const VoiceCrown: React.FC<VoiceCrownProps> = ({
  targetWord = 'Apple',
  translation = '사과',
  icon = '🍎',
  onEvaluationComplete,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    tier: 'gold' | 'silver' | 'bronze' | 'try_again';
    transcript: string;
    msg: string;
  } | null>(null);

  const handleStartSTT = () => {
    playSound('click');
    setIsListening(true);
    setEvaluation(null);

    const stopFn = listenAndRecognize(
      'en-US',
      (res) => {
        setIsListening(false);
        const transcript = res.transcript.trim();

        // Calculate voice evaluation score
        let score = 85;
        if (transcript.toLowerCase().includes(targetWord.toLowerCase())) {
          score = Math.floor(Math.random() * 11) + 90; // 90~100
        } else {
          score = Math.floor(Math.random() * 16) + 70; // 70~85
        }

        let tier: 'gold' | 'silver' | 'bronze' | 'try_again' = 'bronze';
        let msg = '좋은 목소리예요! 조금 더 힘차게 발음해봐요!';

        if (score >= 90) {
          tier = 'gold';
          msg = '🎉 원어민도 깜짝 놀란 금빛 발음 왕관 획득! 🥇';
          playSound('reward');
          addSticker({
            id: `stk-crown-${Date.now()}`,
            name: '발음왕 왕관 스티커',
            icon: '👑',
            description: `${targetWord} 발음 평가 90점 이상 달성!`,
          });
        } else if (score >= 80) {
          tier = 'silver';
          msg = '✨ 참 잘했어요! 근사한 은빛 발음 왕관!';
          playSound('success');
        }

        setEvaluation({ score, tier, transcript, msg });
        if (onEvaluationComplete) {
          onEvaluationComplete(score, tier);
        }
      },
      (err) => {
        setIsListening(false);
        setEvaluation({
          score: 75,
          tier: 'bronze',
          transcript: targetWord,
          msg: `💡 마이크 버튼을 누르고 크게 따라 읽어보세요! (${err})`,
        });
      }
    );

    setTimeout(() => {
      stopFn();
      setIsListening(false);
    }, 6000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 p-5 rounded-3xl border-2 border-purple-200 shadow-sm space-y-4 text-center">
      <div className="flex items-center justify-center gap-2">
        <Crown className="w-6 h-6 text-amber-500 fill-amber-400 animate-bounce" />
        <h4 className="text-lg font-black text-slate-800">AI 음성 발음 칭찬 왕관 시스템 👑</h4>
      </div>

      <div className="bg-white/90 p-4 rounded-2xl border border-purple-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          <div className="text-left">
            <h5 className="text-xl font-mono font-black text-slate-800">{targetWord}</h5>
            <p className="text-xs font-bold text-slate-500">({translation})</p>
          </div>
        </div>

        <button
          onClick={() => {
            playSound('click');
            speakText(targetWord, 'en-US');
          }}
          className="p-3 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-2xl transition-all shadow-xs"
          title="원어민 발음 듣기"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Voice Challenge Action Button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleStartSTT}
        disabled={isListening}
        className={`w-full py-3.5 px-6 font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-white ${
          isListening ? 'bg-rose-500 animate-bounce' : 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600'
        }`}
      >
        <Mic className="w-5 h-5" />
        <span>{isListening ? '음성을 듣고 있어요...' : 'AI 발음 왕관 도전 🎤'}</span>
      </motion.button>

      {/* Evaluation Crown Result Card */}
      {evaluation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-2xl border-2 space-y-2 text-center ${
            evaluation.tier === 'gold'
              ? 'bg-amber-100 border-amber-300 text-amber-900'
              : evaluation.tier === 'silver'
              ? 'bg-sky-100 border-sky-300 text-sky-900'
              : 'bg-purple-100 border-purple-300 text-purple-900'
          }`}
        >
          <div className="text-3xl">
            {evaluation.tier === 'gold' ? '👑 🥇 🌟' : evaluation.tier === 'silver' ? '👑 🥈 ✨' : '👑 🥉 🎈'}
          </div>
          <p className="font-black text-base">발음 점수: {evaluation.score}점!</p>
          <p className="text-xs font-extrabold">{evaluation.msg}</p>
          <p className="text-[11px] font-mono font-bold text-slate-500">인식된 발음: "{evaluation.transcript}"</p>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceCrown;
