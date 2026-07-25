# ☀️ 초등 1학년 맞춤 여름방학 시간표 & 기초 영어 놀이 학습 웹 앱
> **Kids Vacation English & Bio-Routine Timetable Web App**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-sky.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)

초등학교 1학년(만 6~7세) 및 영어를 처음 접하는 어린이가 스스로 여름방학 생활 계획(공부, 놀이, 식사, 수면)을 세우고, 알파벳·파닉스·기초 영어 회화를 게임처럼 즐겁게 배울 수 있는 파스텔 톤의 친화적 웹 애플리케이션입니다.

---

## 🌟 주요 기능 (Key Features)

1. **⏰ 24시간 원형 일러스트 시계 & 시간표 (`CircularClock`)**
   * 한글 일러스트 스타일 24시간 원형 아날로그 시계
   * 밤 9시 ~ 오전 10시 자정을 지나는 야간 수면 시간 연속 렌더링 지원
   * 수면(보라), 식사(주황), 공부(민트), 놀이(핑크) 4대 생체시간 밸런스 링 시각화

2. **🖐️ 초등 1학년 맞춤 64px 핑거 터치 UX (`btn-finger-64`)**
   * 소근육 발달에 맞춘 모바일 하단 64px 대형 탭 버튼 및 젤리 바운스 애니메이션
   * `word-break: keep-all` 적용으로 가독성이 우수한 한글 타이포그래피

3. **🎤 Web Speech STT & TTS 파닉스 영단어 학습**
   * A-Z 알파벳 파닉스 대표 10선 단어 카드 및 네이티브 영문 발음(TTS) 들려주기
   * **말하기 챌린지 🎤 (STT 음성 인식)**: 마이크로 단어를 따라 하면 발음 정확도를 인지하여 칭찬 피드백

4. **✨ 칭찬 스티커 & 3D 캐릭터 보관함 (`CharacterVault`)**
   * 일과 완수 및 퀴즈 성공 시 반짝이는 **별가루 파티클(`StarDustFX`)** 및 Confetti 축하 폭죽
   * 스티커 수집에 따라 해금되는 **3D Framer Motion 캐릭터 홀로그램 카드** (마법 토끼 🐰 등 10종)

5. **👤 자녀 프로필 & LocalStorage 저장**
   * React Portal 기반으로 헤더 가림 없는 프로필 추가 팝업 및 10가지 동물 아바타 제공
   * 로그인 필요 없이 브라우저 `LocalStorage`에 시간표, 스티커, 프로필 자동 보존

---

## 🚀 빠른 시작 (Quick Start)

### 1. 클론 및 설치 (Clone & Install)
```bash
git clone https://github.com/YOUR_USERNAME/kids-vacation-english.git
cd kids-vacation-english
npm install
```

### 2. 개발 서버 실행 (Development)
```bash
npm run dev
# 브라우저에서 http://localhost:3000 접속
```

### 3. 프로덕션 빌드 (Production Build)
```bash
npm run build
```

---

## 🐙 깃허브 업로드 가이드 (GitHub Push Guide)

원격 깃허브 저장소(Remote Repository)에 프로젝트를 올리려면 다음 명령어를 터미널에서 실행하세요:

```bash
# 1. GitHub에서 새로운 레포지토리(kids-vacation-english)를 생성한 후 원격 주소 추가
git remote add origin https://github.com/YOUR_USERNAME/kids-vacation-english.git

# 2. 메인 브랜치로 커밋 푸시
git branch -M main
git push -u origin main
```

---

## 📄 라이선스 (License)
MIT License - 누구나 자유롭게 이용, 수정 및 공유할 수 있습니다.
