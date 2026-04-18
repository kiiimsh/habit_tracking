# Habit Tracking Prototype

깨끗하고 직관적인 UI를 제공하는 습관 관리 서비스 프로토타입입니다. 사용자는 매일의 습관을 기록하고 월간 달성률을 시각적으로 확인할 수 있습니다.

## 핵심 기능
- **습관 관리**: 습관 추가 및 삭제.
- **데일리 체크**: 당일 습관 완료 여부 체크 및 로컬 저장소(`localStorage`)를 통한 데이터 보존.
- **월간 시각화**: SVG 기반의 월간 달성률 꺾은선 그래프 제공.

## 기술 스택
- **Frontend**: HTML5 / CSS3 (Vanilla), JavaScript (Vanilla ES6+)
- **Backend**: Node.js, Express
- **Data**: JSON File-based persistence (foundation for DB migration)

## AI 모델을 위한 지침 (Guidelines for AI Models)
이 프로젝트는 순수 바닐라 스택(HTML/CSS/JS)으로 구축된 경량 프로토타입입니다. 다른 AI 모델이 이 코드를 수정하거나 기능을 추가할 때 다음 지침을 준수하십시오:

1. **디자인 일관성**: `style.css`의 `:root`에 정의된 컬러 팔레트와 디자인 토큰을 사용하십시오. 새로운 UI 요소 추가 시 기존의 미니멀한 블루/화이트 테마를 유지해야 합니다.
2. **상태 관리**: 현재 습관과 완료 데이터는 `script.js` 내의 `habits` 배열과 `completionData` 객체로 관리됩니다. 데이터 구조 변경 시 `saveData()`와 `localStorage` 연동 로직을 반드시 확인하십시오.
3. **시각화 로직**: `renderChart()` 함수는 매달의 날짜 수를 자동으로 계산하여 SVG를 렌더링합니다. 차트 수정 시 뷰박스(viewBox)와 패딩 설정을 고려하여 반응형이 깨지지 않도록 하십시오.
4. **의존성**: 가급적 외부 라이브러리 추가 없이 바닐라 환경을 유지하는 것을 권장합니다.

## 실행 방법
### 1. 로컬 파일 시스템 (Frontend Only)
`index.html` 파일을 브라우저에서 직접 엽니다. (데이터는 `localStorage`에 저장됩니다.)

### 2. 서버 연동 (Full Stack)
서버를 실행하면 데이터가 파일 시스템에 저장되며, 향후 배포가 용이해집니다.
1. Node.js가 설치된 환경에서 다음 명령어를 실행합니다:
   ```bash
   npm install
   npm start
   ```
2. 브라우저에서 `http://localhost:3000` 접속 또는 `index.html`을 엽니다.
