import React, { useState, useEffect } from 'react';
import { ScheduleItem } from '../../types';
import { motion } from 'framer-motion';
import { getScheduleEmoji } from '../../utils/iconHelper';

interface CircularClockProps {
  schedule: ScheduleItem[];
  onSelectSlot?: (item: ScheduleItem) => void;
}

export const CircularClock: React.FC<CircularClockProps> = ({ schedule, onSelectSlot }) => {
  // Real-time clock state
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // SVG Size & Center definitions matching reference illustration
  const size = 380;
  const center = size / 2;
  const outerBorderRadius = 175;
  const outerRadius = 152;
  const innerHubRadius = 78;
  const sliceMidRadius = (outerRadius + innerHubRadius) / 2; // 115

  // Current time variables
  const currentHours24 = now.getHours();
  const currentMinutes = now.getMinutes();
  const isPM = currentHours24 >= 12;
  const displayHours12 = currentHours24 % 12 === 0 ? 12 : currentHours24 % 12;
  const formattedMinutes = currentMinutes.toString().padStart(2, '0');
  const formattedTimeString = `${currentHours24.toString().padStart(2, '0')}:${formattedMinutes}`;

  const monthsKR = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const daysKR = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dateString = `${daysKR[now.getDay()]}, ${monthsKR[now.getMonth()]} ${now.getDate()}일`;

  // Pastel Color Palette & Korean/Icon Mappings matching reference illustration
  const categoryColorMap: Record<string, string> = {
    study: '#BBF7D0', // Soft Pastel Green (공부/학교)
    play: '#FFC0D3',  // Soft Pastel Pink (자유놀이)
    meal: '#FFD3B6',  // Soft Pastel Orange (식사/아침/점심/저녁)
    rest: '#BFDBFE',  // Soft Pastel Blue/Purple (휴식/취침)
  };

  const categoryEmojiMap: Record<string, string> = {
    study: '📚',
    play: '🧸',
    meal: '🍽️',
    rest: '🛌',
  };

  // 12-Hour Pastel Hands Angles
  const hourHandAngle = ((currentHours24 % 12) + currentMinutes / 60) * 30; // 30 deg/h
  const minuteHandAngle = (currentMinutes / 60) * 360; // 360 deg/h

  // 12-Hour Tick Marks (inner hub)
  const inner12Hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  // Convert "HH:MM" or time range "09:00 - 10:00" or overnight "21:00 - 10:00" to list of 24h segments
  const parseHoursSegments = (item: ScheduleItem): { startHour: number; endHour: number }[] => {
    let start = 9;
    let end = 10;

    if (item.timeSlot && item.timeSlot.includes('-')) {
      const parts = item.timeSlot.split('-').map((s) => s.trim());
      const sH = parseInt(parts[0].split(':')[0], 10);
      const eH = parseInt(parts[1].split(':')[0], 10);
      if (!isNaN(sH)) start = sH % 24;
      if (!isNaN(eH)) end = eH === 0 ? 24 : eH % 24;
    } else if (item.time) {
      const sH = parseInt(item.time.split(':')[0], 10);
      if (!isNaN(sH)) {
        start = sH % 24;
        end = (start + 1) % 25;
      }
    }

    // Overnight schedule spanning midnight (e.g. 21:00 - 10:00)
    if (start >= end) {
      return [
        { startHour: start, endHour: 24 },
        { startHour: 0, endHour: end },
      ];
    }

    return [{ startHour: start, endHour: end }];
  };

  // Convert hour (0..24) to angle (0..360 deg), top = -90 deg
  const hourToAngle = (hour: number) => {
    return (hour / 24) * 360 - 90;
  };

  // Helper to calculate SVG donut slice path
  const createSlicePath = (startHour: number, endHour: number) => {
    const startAngle = hourToAngle(startHour) * (Math.PI / 180);
    const endAngle = hourToAngle(endHour) * (Math.PI / 180);

    const x1_out = center + outerRadius * Math.cos(startAngle);
    const y1_out = center + outerRadius * Math.sin(startAngle);
    const x2_out = center + outerRadius * Math.cos(endAngle);
    const y2_out = center + outerRadius * Math.sin(endAngle);

    const x1_in = center + innerHubRadius * Math.cos(endAngle);
    const y1_in = center + innerHubRadius * Math.sin(endAngle);
    const x2_in = center + innerHubRadius * Math.cos(startAngle);
    const y2_in = center + innerHubRadius * Math.sin(startAngle);

    const largeArc = endHour - startHour > 12 ? 1 : 0;

    return `M ${x1_out} ${y1_out} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2_out} ${y2_out} L ${x1_in} ${y1_in} A ${innerHubRadius} ${innerHubRadius} 0 ${largeArc} 0 ${x2_in} ${y2_in} Z`;
  };

  // Korean Title & Category formatting (matching illustration: 수면, 자유시간, 숙제, 식사 등)
  const getKoreanLabel = (item: ScheduleItem): { categoryText: string; detailText: string } => {
    const title = item.title.trim();
    if (title.includes('아침 식사') || title.includes('기상')) return { categoryText: '식사', detailText: '아침식사' };
    if (title.includes('점심')) return { categoryText: '식사', detailText: '점심식사' };
    if (title.includes('저녁')) return { categoryText: '식사', detailText: '저녁식사' };
    if (title.includes('숙제') || title.includes('공부')) return { categoryText: '공부', detailText: '방학숙제' };
    if (title.includes('파닉스') || title.includes('영어')) return { categoryText: '공부', detailText: '영어학습' };
    if (title.includes('놀이') || title.includes('신나는')) return { categoryText: '놀이', detailText: '자유시간' };
    if (title.includes('수면') || title.includes('취침') || title.includes('꿈나라')) return { categoryText: '휴식', detailText: '취침수면' };
    if (title.includes('휴식') || title.includes('간식')) return { categoryText: '휴식', detailText: '휴식시간' };
    if (title.includes('운동') || title.includes('바깥')) return { categoryText: '놀이', detailText: '야외운동' };

    const catName = item.category === 'study' ? '공부' : item.category === 'play' ? '놀이' : item.category === 'meal' ? '식사' : '휴식';
    return { categoryText: catName, detailText: title.slice(0, 4) };
  };

  // Generate 24 hour markers (0..23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/90 backdrop-blur-md rounded-[36px] border-4 border-pink-200 shadow-xl w-full max-w-md mx-auto my-2 relative overflow-hidden">
      {/* Cute Background Decorative Illustrations (Clouds, Stars, Leaves matching reference image) */}
      <div className="absolute top-3 left-4 text-amber-300 text-lg">⭐</div>
      <div className="absolute top-4 left-10 text-sky-200 text-sm">☁️</div>
      <div className="absolute top-3 right-5 text-amber-300 text-sm">⭐</div>
      <div className="absolute top-5 right-12 text-sky-200 text-xs">☁️</div>
      <div className="absolute bottom-4 left-4 text-emerald-400 text-xs">🍃</div>
      <div className="absolute bottom-4 right-4 text-emerald-400 text-xs">🍃</div>

      {/* Header */}
      <div className="flex items-center gap-2 mb-2 z-10">
        <span className="text-xl">☀️</span>
        <h3 className="text-base font-black text-slate-800 tracking-tight">여름방학 일일 계획표</h3>
      </div>

      <div className="relative w-[380px] h-[380px] flex items-center justify-center select-none z-10">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-md">
          <defs>
            {/* Pattern for Completed Achievement Overlay */}
            <pattern id="completedStripe" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#10B981" strokeWidth="2.5" opacity="0.4" />
            </pattern>

            {/* Pastel Soft Shadow for Cute Pastel Clock Hands */}
            <filter id="pastelHandShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="1.5" dy="2.5" stdDeviation="2" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Outer Border Outer Circle (White with Dotted Hour Ring matching illustration) */}
          <circle
            cx={center}
            cy={center}
            r={outerBorderRadius}
            fill="#FAFAFA"
            stroke="#E2E8F0"
            strokeWidth="2.5"
          />

          {/* 4 Biological Rhythms Outer Color Balance Ring (Sleep-Purple, Meal-Orange, Study-Green, Play-Pink) */}
          <circle
            cx={center}
            cy={center}
            r={outerBorderRadius - 6}
            fill="none"
            stroke="#C084FC"
            strokeWidth="3.5"
            strokeDasharray="160 380"
            strokeDashoffset="70"
            opacity="0.85"
          />
          <circle
            cx={center}
            cy={center}
            r={outerBorderRadius - 6}
            fill="none"
            stroke="#BBF7D0"
            strokeWidth="3.5"
            strokeDasharray="90 450"
            strokeDashoffset="-90"
            opacity="0.85"
          />
          <circle
            cx={center}
            cy={center}
            r={outerBorderRadius - 6}
            fill="none"
            stroke="#FFC0D3"
            strokeWidth="3.5"
            strokeDasharray="120 420"
            strokeDashoffset="-210"
            opacity="0.85"
          />

          {/* Outer Dotted Ring inside outer border */}
          <circle
            cx={center}
            cy={center}
            r={outerBorderRadius - 16}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="2 4"
          />

          {/* Donut Slice Base Background Circle */}
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="2"
          />

          {/* Schedule Donut Slices (Soft Pastel Colors matching reference illustration) */}
          {schedule.flatMap((item) => {
            const segments = parseHoursSegments(item);
            const fillColor = item.color || categoryColorMap[item.category] || '#FFC0D3';

            return segments.map((seg, idx) => {
              const pathData = createSlicePath(seg.startHour, seg.endHour);

              return (
                <g key={`${item.id}-seg-${idx}`}>
                  {/* Base Slice Color */}
                  <motion.path
                    d={pathData}
                    fill={fillColor}
                    opacity={item.completed ? 0.95 : 0.88}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    whileHover={{ scale: 1.02 }}
                    className="cursor-pointer transition-all hover:opacity-100"
                    onClick={() => onSelectSlot && onSelectSlot(item)}
                  >
                    <title>{`${item.title} (${seg.startHour}:00 ~ ${seg.endHour}:00)`}</title>
                  </motion.path>

                  {/* Striped Overlay if Completed */}
                  {item.completed && (
                    <path
                      d={pathData}
                      fill="url(#completedStripe)"
                      className="pointer-events-none"
                    />
                  )}
                </g>
              );
            });
          })}

          {/* Korean Labels & Illustrated Icons inside Donut Slices */}
          {schedule.flatMap((item) => {
            const segments = parseHoursSegments(item);
            const { categoryText, detailText } = getKoreanLabel(item);
            const emoji = getScheduleEmoji(item);

            return segments.map((seg, idx) => {
              const duration = seg.endHour - seg.startHour;
              const midHour = (seg.startHour + seg.endHour) / 2;
              const midAngle = hourToAngle(midHour) * (Math.PI / 180);

              // Coordinates for slice midpoint
              const xMid = center + sliceMidRadius * Math.cos(midAngle);
              const yMid = center + sliceMidRadius * Math.sin(midAngle);

              return (
                <g
                  key={`label-${item.id}-seg-${idx}`}
                  className="pointer-events-none select-none cursor-pointer"
                  onClick={() => onSelectSlot && onSelectSlot(item)}
                >
                  {item.completed ? (
                    <g transform={`translate(${xMid}, ${yMid})`}>
                      <circle r="14" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" className="drop-shadow-md" />
                      <text x="0" y="1" textAnchor="middle" dominantBaseline="central" className="text-[12px] font-black fill-white">
                        ✓
                      </text>
                    </g>
                  ) : duration >= 2 ? (
                    <g transform={`translate(${xMid}, ${yMid})`}>
                      {/* Top Category Label (e.g. 공부, 놀이, 휴식, 식사) */}
                      <text
                        x="0"
                        y="-16"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[10px] font-black fill-slate-700 uppercase tracking-tight"
                      >
                        {categoryText}
                      </text>
                      {/* Center Emoji Icon */}
                      <text
                        x="0"
                        y="-1"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-base font-extrabold"
                      >
                        {emoji}
                      </text>
                      {/* Bottom Detail Label */}
                      <text
                        x="0"
                        y="15"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[10px] font-extrabold fill-slate-800 tracking-tighter"
                      >
                        {detailText}
                      </text>
                    </g>
                  ) : (
                    <g transform={`translate(${xMid}, ${yMid})`}>
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-sm font-black"
                      >
                        {emoji}
                      </text>
                    </g>
                  )}
                </g>
              );
            });
          })}

          {/* ⚪ Central Warm Cream White Dial Hub (Matching Reference Illustration) */}
          <circle
            cx={center}
            cy={center}
            r={innerHubRadius}
            fill="#FFFDF7"
            stroke="#CBD5E1"
            strokeWidth="2.5"
            className="drop-shadow-sm"
          />

          {/* 🔢 12-Hour Tick Marks inside Central Hub (Matching Reference Illustration) */}
          {inner12Hours.map((h12) => {
            const rad = (h12 * 30 - 90) * (Math.PI / 180);
            const xTickInner = center + (innerHubRadius - 12) * Math.cos(rad);
            const yTickInner = center + (innerHubRadius - 12) * Math.sin(rad);
            const xTickOuter = center + (innerHubRadius - 6) * Math.cos(rad);
            const yTickOuter = center + (innerHubRadius - 6) * Math.sin(rad);

            return (
              <line
                key={`inner-tick-${h12}`}
                x1={xTickInner}
                y1={yTickInner}
                x2={xTickOuter}
                y2={yTickOuter}
                stroke="#64748B"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {/* 🕒 Cute Rounded Pastel Hands (Matching Reference Illustration Design) */}
          
          {/* 1. Hour Hand (Thick Rounded Pastel Pink Hand) */}
          <line
            x1={center}
            y1={center}
            x2={center + 42 * Math.cos((hourHandAngle - 90) * (Math.PI / 180))}
            y2={center + 42 * Math.sin((hourHandAngle - 90) * (Math.PI / 180))}
            stroke="#F472B6"
            strokeWidth="9"
            strokeLinecap="round"
            filter="url(#pastelHandShadow)"
          />
          <line
            x1={center}
            y1={center}
            x2={center + 42 * Math.cos((hourHandAngle - 90) * (Math.PI / 180))}
            y2={center + 42 * Math.sin((hourHandAngle - 90) * (Math.PI / 180))}
            stroke="#FCE7F3"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* 2. Minute Hand (Long Rounded Pastel Mint/Green Hand) */}
          <line
            x1={center}
            y1={center}
            x2={center + 60 * Math.cos((minuteHandAngle - 90) * (Math.PI / 180))}
            y2={center + 60 * Math.sin((minuteHandAngle - 90) * (Math.PI / 180))}
            stroke="#4ADE80"
            strokeWidth="7"
            strokeLinecap="round"
            filter="url(#pastelHandShadow)"
          />
          <line
            x1={center}
            y1={center}
            x2={center + 60 * Math.cos((minuteHandAngle - 90) * (Math.PI / 180))}
            y2={center + 60 * Math.sin((minuteHandAngle - 90) * (Math.PI / 180))}
            stroke="#DCFCE7"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* 3. Seconds/Indicator Hand (Long Thin Pastel Sky Blue Hand) */}
          <line
            x1={center}
            y1={center}
            x2={center + 65 * Math.cos(((now.getSeconds() / 60) * 360 - 90) * (Math.PI / 180))}
            y2={center + 65 * Math.sin(((now.getSeconds() / 60) * 360 - 90) * (Math.PI / 180))}
            stroke="#38BDF8"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* 4. Cute Center Joint Ring Knob (Matching Reference Illustration) */}
          <circle cx={center} cy={center} r="10" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          <circle cx={center} cy={center} r="6" fill="#F472B6" />
          <circle cx={center} cy={center} r="3" fill="#FFFFFF" />

          {/* 5. Center Hub Real-Time Digital Time & Date Display (Matching Illustration: "16:30", "수요일, 7월 25일") */}
          <g transform={`translate(${center}, ${center + 42})`}>
            <text
              x="0"
              y="-2"
              textAnchor="middle"
              dominantBaseline="central"
              className="text-xl font-black fill-slate-800 tracking-tight select-none"
            >
              {formattedTimeString}
            </text>
            <text
              x="0"
              y="15"
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[10px] font-extrabold fill-slate-500 tracking-tighter uppercase select-none"
            >
              {dateString}
            </text>
          </g>

          {/* 🔢 Outer 24-Hour Numbers (0..23) along outer border (Matching Reference Illustration) */}
          {hours.map((h) => {
            const angle = hourToAngle(h) * (Math.PI / 180);
            
            // Outer Ring Tick Lines
            const xTickOuter = center + outerRadius * Math.cos(angle);
            const yTickOuter = center + outerRadius * Math.sin(angle);
            const xTickInner = center + (outerRadius - 6) * Math.cos(angle);
            const yTickInner = center + (outerRadius - 6) * Math.sin(angle);

            // Outer Circle Border Numbers Location (r = 163)
            const xOuterNumber = center + 163 * Math.cos(angle);
            const yOuterNumber = center + 163 * Math.sin(angle);

            const isMajor = h % 3 === 0;

            return (
              <g key={`outer-h-${h}`}>
                {/* Tick Mark Line on Outer Ring */}
                <line
                  x1={xTickInner}
                  y1={yTickInner}
                  x2={xTickOuter}
                  y2={yTickOuter}
                  stroke={isMajor ? '#475569' : '#CBD5E1'}
                  strokeWidth={isMajor ? '2' : '1'}
                />

                {/* Outer Border Hour Numbers (0, 1, 2, 3 ... 23) matching reference illustration */}
                <text
                  x={xOuterNumber}
                  y={yOuterNumber}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`select-none ${
                    isMajor
                      ? 'text-xs font-black fill-slate-800'
                      : 'text-[10px] font-bold fill-slate-500'
                  }`}
                >
                  {h}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend Guide */}
      <div className="flex flex-wrap justify-center gap-3 mt-1 text-[11px] font-bold text-slate-600 z-10">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#BBF7D0] inline-block border border-emerald-400"></span>공부</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#FFC0D3] inline-block border border-pink-400"></span>놀이</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#FFD3B6] inline-block border border-orange-400"></span>식사</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#BFDBFE] inline-block border border-blue-400"></span>휴식</span>
        <span className="flex items-center gap-1"><span className="w-3.5 h-3.5 rounded-full bg-[#10B981] text-white text-[9px] flex items-center justify-center font-bold">✓</span>완료</span>
      </div>
    </div>
  );
};
