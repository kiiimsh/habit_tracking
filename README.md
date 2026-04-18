# Habit Tracking Prototype

깨끗하고 직관적인 UI를 제공하는 습관 관리 서비스 프로토타입입니다. 사용자는 날짜별 습관을 기록하고 월간 달성 현황을 표와 그래프로 한눈에 확인할 수 있습니다.

## 🌟 주요 기능
- **날짜 선택 기능**: 오늘뿐만 아니라 과거의 특정 날짜를 선택하여 습관 완료 여부를 기록하고 수정할 수 있습니다.
- **습관 트래커 (Monthly Grid)**: 한 달 전체의 습관 달성 현황을 행(습관)과 열(일자)로 구성된 표 형식으로 제공합니다.
- **시각화 그래프**: 일자별 체크된 습관의 개수를 꺾은선 그래프로 시각화하여 성취도를 확인할 수 있습니다.
- **데이터 영속성**: 로컬 환경에서는 파일 시스템에, Vercel 배포 환경에서는 임시 서버 메모리에 데이터를 안전하게 보존합니다.

## 🛠 기술 스택
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend**: Node.js, Express (Serverless Function 지원)
- **Deployment**: Vercel Optimized (Zero Config 지원 구조)

## 📂 프로젝트 구조
- `public/`: 웹 프론트엔드 자원 (HTML, CSS, JS)
- `api/`: Vercel 서버리스 함수 엔트리 포인트
- `server.js`: 핵심 비즈니스 로직 및 API 서버
- `data/`: 로컬 환경 데이터 저장 디렉토리
- `docs/`: 개발 기록 및 배포 가이드 문서

## 🚀 실행 및 배포 지침

### 1. 로컬에서 실행하기
프로젝트 루트 디렉토리에서 다음 명령어를 실행합니다.
```bash
npm install
npm start
```
이후 브라우저에서 `http://localhost:3000`으로 접속합니다.

### 2. Vercel에 배포하기
본 프로젝트는 Vercel 배포에 최적화된 구조(`public/` 폴더 및 `api/` 라우팅)를 가지고 있습니다.
1. GitHub 저장소를 Vercel에 연결합니다.
2. **Framework Preset**은 `Other` 또는 `Express`로 설정합니다.
3. 배포 버튼을 누르면 자동으로 빌드 및 배포가 완료됩니다.
*상세 가이드는 [docs/deployment_guide.md](./docs/deployment_guide.md)를 참고하세요.*

## 🧠 AI 모델을 위한 개발 지침 (Guidelines for AI Models)
이 프로젝트를 수정하거나 기능을 추가할 때 다음 사항을 준수하십시오:

1. **파일 구조 유지**: 정적 파일은 반드시 `public/` 폴더 내에 위치시켜야 Vercel 배포 시 충돌이 발생하지 않습니다.
2. **API 경로**: 모든 백엔드 통신은 `/api/*` 경로를 통해 이루어집니다. 프론트엔드에서 API 호출 시 상대 경로를 사용하십시오.
3. **환경 감지**: 서버 로직 수정 시 `process.env.VERCEL` 변수를 통해 배포 환경과 로컬 환경을 구분하여 처리하십시오. (예: 파일 쓰기 권한 처리)
4. **데이터 스키마**: 데이터는 `habits` (배열)와 `completionData` (날짜별 습관 배열 객체)로 구성됩니다. 이 구조를 유지하여 기존 데이터와의 호환성을 보장하십시오.

## 📝 업데이트 기록
최신 개발 이력은 [docs/dev_history](./docs/dev_history) 파일에서 확인하실 수 있습니다.
