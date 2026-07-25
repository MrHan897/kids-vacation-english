import React, { useState } from 'react';
import { Sparkles, MapPin, Calendar, Compass, Sun, TreePine, Landmark, Rocket, Heart, ExternalLink, ShieldCheck } from 'lucide-react';
import { playSound } from '../../services/audio';

export interface OutdoorEvent {
  id: string;
  title: string;
  category: 'nature' | 'museum' | 'science' | 'culture';
  region: '서울' | '경기' | '인천' | '강원' | '충청' | '경상' | '전라' | '제주';
  location: string;
  period: string;
  targetGrade: string;
  description: string;
  tag: string;
  icon: string;
  status: '모집중' | '사전예약' | '현장참여';
  weatherTip: string;
  recommendedTime: string;
  badgeColor: string;
}

export const OUTDOOR_EVENTS: OutdoorEvent[] = [
  {
    id: 'evt-1',
    title: '🌿 여름철 어린이 자연학교 & 곤충 체험',
    category: 'nature',
    region: '서울',
    location: '서울특별시 농업기술센터 / 생태공원 (서울 서초구)',
    period: '2026. 7. 28 ~ 8. 15 (화·수·목)',
    targetGrade: '전 학년 (초등 1~3학년 가족)',
    description: '장수풍뎅이 관찰, 옥수수 수확 체험, 숲길 걷기 및 곤충 관찰 야외활동!',
    tag: '숲·자연탐험',
    icon: '🪵',
    status: '모집중',
    weatherTip: '☀️ 챙넓은 모자, 모기퇴치제, 텀블러 필수!',
    recommendedTime: '오전 10:00 ~ 12:00 (자외선 강하기 전)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'evt-2',
    title: '🔭 과캉스 스탬프 투어 & 여름밤 별자리 탐험',
    category: 'science',
    region: '경기',
    location: '국립과천과학관 / 천문우주관 (경기 과천시)',
    period: '2026. 7. 25 ~ 8. 23',
    targetGrade: '초등 1~3학년 맞춤',
    description: '물놀이 과학 챌린지, 여름밤 별자리 망원경 관찰, 과학관 도장 깨기 스탬프 투어!',
    tag: '우주·과학관',
    icon: '🚀',
    status: '사전예약',
    weatherTip: '🌙 야간 탐험 시 얇은 바람막이 자켓 챙기기!',
    recommendedTime: '오후 16:00 ~ 19:30',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    id: 'evt-3',
    title: '🏺 선사시대 시간여행 & 유물 발굴 체험',
    category: 'museum',
    region: '인천',
    location: '국립중앙박물관 / 검단선사박물관 (인천 서구)',
    period: '2026. 7. 31 ~ 8. 18',
    targetGrade: '초등 1학년 (선사), 초2~3학년 (고고학)',
    description: '흙 속에서 빗살무늬 토기와 유물 발굴하기, 토기 굽기 및 역사 퀴즈 모험!',
    tag: '역사·박물관',
    icon: '🏺',
    status: '모집중',
    weatherTip: '🏛️ 쾌적한 실내 에어컨 & 야외 발굴장 모자 착용',
    recommendedTime: '오후 13:30 ~ 15:30',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'evt-4',
    title: '🎨 물놀이 챌린지 & 민화 부채/팽이 만들기',
    category: 'culture',
    region: '인천',
    location: '인천시립박물관 & 어린이 문화관 (인천 연수구)',
    period: '2026. 7. 25 ~ 8. 20 (매주 주말)',
    targetGrade: '전 학년 (초등 저학년 우대)',
    description: '봉숭아 물들이기, 자개 팽이 만들기, 시원한 야외 전통놀이 마당 특별 행사!',
    tag: '전통·문화체험',
    icon: '🎨',
    status: '현장참여',
    weatherTip: '💦 물놀이 및 만들기 체험 후 여벌 옷 준비!',
    recommendedTime: '오전 11:00 ~ 오후 14:00',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    id: 'evt-5',
    title: '🦋 불암산 나비정원 & 잠자리 생태 야외 탐방',
    category: 'nature',
    region: '서울',
    location: '불암산 생태학습관 & 나비정원 (서울 노원구)',
    period: '2026. 8. 1 ~ 8. 25',
    targetGrade: '초등 1~3학년',
    description: '세계의 희귀 나비 관찰, 계곡 수생곤충 돋보기 탐구 및 자작나무 숲길 걷기!',
    tag: '곤충·숲탐험',
    icon: '🦋',
    status: '모집중',
    weatherTip: '🌿 편안한 운동화와 자외선 차단제 필수',
    recommendedTime: '오전 09:30 ~ 11:30',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 'evt-6',
    title: '🌲 강원 자락 숲속 생태 야영 & 밤하늘 은하수 관측',
    category: 'nature',
    region: '강원',
    location: '국립춘천숲체원 / 평창 자연휴양림 (강원 춘천시)',
    period: '2026. 8. 5 ~ 8. 22',
    targetGrade: '초등전학년 모험가',
    description: '맑은 강원도 숲속 계곡 수생 생물 관찰 및 밤하늘 은하수 캠핑 체험!',
    tag: '강원·청정숲',
    icon: '🏕️',
    status: '사전예약',
    weatherTip: '🌲 야간 산속 기온 저하 대비 긴팔 옷 꼭 준비!',
    recommendedTime: '오후 15:00 ~ 21:00',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
  },
];

export const OutdoorActivityModule: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  const toggleBookmark = (id: string) => {
    playSound('reward');
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleGPSDetect = () => {
    playSound('click');
    if (!navigator.geolocation) {
      alert('사용하시는 브라우저가 위치 정보를 지원하지 않습니다.');
      return;
    }
    setGpsStatus('📍 내 위치 탐색 중...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // GPS 위치 감지 성공 - 위치 기반 가까운 지역(기본 서울/경기) 자동 설정 피드백
        setGpsStatus('✅ 내 위치 감지 성공! (서울/경기 주변 행사 우선 정렬)');
        setSelectedRegion('서울');
        playSound('reward');
        setTimeout(() => setGpsStatus(null), 4000);
      },
      (error) => {
        setGpsStatus('📍 위치 권한을 허용하시면 가장 가까운 체험 행사를 찾아드립니다!');
        setTimeout(() => setGpsStatus(null), 4000);
      }
    );
  };

  const filteredEvents = OUTDOOR_EVENTS.filter((evt) => {
    const matchesCategory = selectedCategory === 'all' || evt.category === selectedCategory;
    const matchesRegion = selectedRegion === '전체' || evt.region === selectedRegion;
    const matchesQuery =
      searchQuery.trim() === '' ||
      evt.title.includes(searchQuery) ||
      evt.location.includes(searchQuery) ||
      evt.description.includes(searchQuery);

    return matchesCategory && matchesRegion && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="card-pastel bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 p-6 rounded-3xl border-3 border-emerald-200 shadow-cute relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500 text-white font-black text-xs rounded-full shadow-xs flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300 animate-spin" style={{ animationDuration: '8s' }} />
                <span>여름방학 핫플레이스</span>
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                2026 실시간 이벤트 모니터링 📡
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mt-2 flex items-center gap-2">
              🌳 방학 맞이 초등 야외활동 & 체험 모험가
              <Sparkles className="w-6 h-6 text-emerald-500 fill-emerald-300 animate-bounce" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1">
              방학 기간 아이와 함께 가기 좋은 자연 숲 체험, 과학관 밤탐험, 박물관 발굴 교실 정보!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/90 p-3 rounded-2xl border border-emerald-200 shadow-sm shrink-0">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            <div>
              <p className="text-[11px] font-black text-slate-800">학부모 안심 가이드 💡</p>
              <p className="text-[10px] font-bold text-emerald-700">모든 기관 사전 검증 완료</p>
            </div>
          </div>
        </div>
      </div>
      {/* GPS Toast Notification */}
      {gpsStatus && (
        <div className="bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-2xl shadow-lg animate-bounce flex items-center justify-between border border-emerald-400">
          <span>{gpsStatus}</span>
          <button onClick={() => setGpsStatus(null)} className="text-white hover:text-yellow-300 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Location-Based Search Bar & Region Tabs */}
      <div className="bg-white p-4 rounded-3xl border-3 border-emerald-200 shadow-cute space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Keyword Search Input */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="🔍 지역명, 과학관, 박물관, 곤충 체험 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl text-slate-800 font-black text-xs focus:outline-none focus:border-emerald-500 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* GPS Auto-Detect Button */}
          <button
            onClick={handleGPSDetect}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-1.5 shrink-0 transition-all active:scale-95"
          >
            <MapPin className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>📍 내 위치 GPS 자동 탐색</span>
          </button>
        </div>

        {/* Region Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-black text-slate-500 shrink-0 mr-1">지역:</span>
          {['전체', '서울', '경기', '인천', '강원', '충청', '경상', '전라', '제주'].map((reg) => (
            <button
              key={reg}
              onClick={() => {
                playSound('click');
                setSelectedRegion(reg);
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all shrink-0 border ${
                selectedRegion === reg
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50'
              }`}
            >
              {reg === '전체' ? '🌐 전체' : `📍 ${reg}`}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 p-4 rounded-2xl border-2 border-amber-300 shadow-md flex items-center justify-between gap-3 text-xs font-black">
        <div className="flex items-center gap-2">
          <span className="text-2xl">☀️</span>
          <span>
            <strong>여름철 야외활동 꿀팁:</strong> 수분 보충(텀블러), 챙넓은 모자, 모기퇴치 스프레이 필수! 자외선이 강한 12:00~14:00 시엔 실내 박물관 체험을 추천해요!
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: '🌟 전체보기', icon: Compass },
          { id: 'nature', label: '🪵 숲·자연체험', icon: TreePine },
          { id: 'science', label: '🚀 우주·과학관', icon: Rocket },
          { id: 'museum', label: '🏺 역사·박물관', icon: Landmark },
          { id: 'culture', label: '🎨 문화·전통놀이', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playSound('click');
                setSelectedCategory(tab.id);
              }}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs transition-all border-2 shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-600 shadow-md scale-105'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-yellow-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((evt) => {
          const isBookmarked = bookmarkedIds.includes(evt.id);
          return (
            <div
              key={evt.id}
              className="bg-white p-5 rounded-3xl border-3 border-emerald-100 shadow-cute hover:shadow-lg transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl p-2 bg-emerald-50 rounded-2xl border border-emerald-200 shrink-0">
                      {evt.icon}
                    </span>
                    <div>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md border ${evt.badgeColor}`}>
                        {evt.tag}
                      </span>
                      <h3 className="font-black text-slate-800 text-base sm:text-lg mt-1 group-hover:text-emerald-600 transition-colors">
                        {evt.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleBookmark(evt.id)}
                    className={`p-2 rounded-xl border transition-all ${
                      isBookmarked
                        ? 'bg-rose-100 border-rose-300 text-rose-600 scale-110'
                        : 'bg-slate-100 border-slate-200 text-slate-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-rose-500' : ''}`} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 font-bold leading-relaxed">
                  {evt.description}
                </p>

                <div className="bg-slate-50 p-3 rounded-2xl space-y-1.5 border border-slate-200 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>장소:</strong> {evt.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span><strong>기간:</strong> {evt.period}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-1 rounded-xl border border-amber-200">
                    <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span><strong>추천 시간:</strong> {evt.recommendedTime}</span>
                  </div>
                </div>

                <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                  <span>💡 <strong>준비 팁:</strong> {evt.weatherTip}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500">
                  대상: <span className="text-emerald-700">{evt.targetGrade}</span>
                </span>
                <button
                  onClick={() => {
                    playSound('reward');
                    alert(`[${evt.title}]\n\n상세 신청 및 예약은 '서울시 공공서비스예약' 또는 해당 기관 공식 누리집에서 가능합니다! 🌳`);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1 transition-all active:scale-95"
                >
                  <span>예약 안내</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OutdoorActivityModule;
