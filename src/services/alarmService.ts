import { ScheduleItem } from '../types';
import { playSound } from './audio';

const ALARM_STORAGE_KEY = 'kids_vacation_alarm_enabled';
const ALARM_NOTIFIED_KEY = 'kids_vacation_notified_slots';

/**
 * Check if Web Notifications are supported in browser
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get alarm notification toggle state
 */
export function isAlarmEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ALARM_STORAGE_KEY) === 'true';
}

/**
 * Save alarm notification toggle state
 */
export function setAlarmEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ALARM_STORAGE_KEY, enabled ? 'true' : 'false');
}

/**
 * Request Web Notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    const isGranted = permission === 'granted';
    if (isGranted) {
      setAlarmEnabled(true);
    }
    return isGranted;
  } catch (err) {
    console.warn('[alarm] Permission request error:', err);
    return false;
  }
}

/**
 * Show a native or in-app notification / audio chime for a schedule activity
 */
export function triggerScheduleAlarm(item: ScheduleItem): void {
  playSound('timer_alarm');

  const title = `🔔 [${item.title}] 시간이에요!`;
  const body = `${item.timeSlot || item.time || ''} 활동이 시작되었습니다. 파이팅! ✨`;

  // 1. Trigger Web Native Notification if granted
  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '☀️',
        tag: item.id,
      });
    } catch (e) {
      console.warn('[alarm] Native notification trigger failed:', e);
    }
  }

  // 2. Speak TTS text announcement for kids
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      const utterance = new SpeechSynthesisUtterance(`${item.title} 시간이에요! 신나게 시작해봐요!`);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // ignore TTS error
    }
  }
}

/**
 * Check current schedule items against current time HH:MM to trigger alarms
 */
export function checkScheduleAlarms(schedule: ScheduleItem[]): void {
  if (!isAlarmEnabled()) return;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentHH = now.getHours().toString().padStart(2, '0');
  const currentMM = now.getMinutes().toString().padStart(2, '0');
  const currentHM = `${currentHH}:${currentMM}`;

  // Read already notified slots key for today e.g. "2026-07-31:slot_123:09:00"
  const notifiedRaw = localStorage.getItem(ALARM_NOTIFIED_KEY) || '[]';
  let notifiedList: string[] = [];
  try {
    notifiedList = JSON.parse(notifiedRaw);
  } catch (e) {
    notifiedList = [];
  }

  schedule.forEach((item) => {
    if (item.completed) return;

    // Parse start time from "09:00 - 10:00" or single time "09:00"
    const timeStr = item.timeSlot || item.time || '';
    const startTimeStr = timeStr.split('-')[0].trim(); // "09:00"

    if (startTimeStr === currentHM) {
      const alarmToken = `${todayStr}:${item.id}:${currentHM}`;
      if (!notifiedList.includes(alarmToken)) {
        triggerScheduleAlarm(item);
        notifiedList.push(alarmToken);
        // Keep last 50 notified tokens
        localStorage.setItem(ALARM_NOTIFIED_KEY, JSON.stringify(notifiedList.slice(-50)));
      }
    }
  });
}
