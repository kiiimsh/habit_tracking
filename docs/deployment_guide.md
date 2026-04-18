# 🚀 Vercel 배포 가이드 (Vercel Deployment Guide)

"Habit Tracking" 서비스를 Vercel에 배포하는 방법입니다. 아래 단계를 따라하시면 몇 분 안에 웹 사이트를 공개할 수 있습니다.

## 1. 사전 준비
- GitHub에 현재 코드가 최신 상태로 올라가 있어야 합니다. (이미 진행 완료)
- [Vercel](https://vercel.com/) 계정이 필요합니다. (GitHub 계정으로 로그인 권장)

## 2. Vercel에서 프로젝트 가져오기
1. Vercel 대시보드에서 **[+ New Project]** 버튼을 누릅니다.
2. **"Import Git Repository"** 영역에서 `habit_tracking` 저장소를 찾아 **[Import]**를 누릅니다.

## 3. 프로젝트 설정 (중요!)
Vercel이 자동으로 설정을 잡아주지만, 다음 사항을 확인해 주세요:
- **Framework Preset**: `Other` (또는 자동으로 `Express` 감지 시 그대로 둠)
- **Root Directory**: `./` (기본값)
- **Build and Output Settings**: 
    - 수정할 필요 없습니다. (기본값 그대로 사용)
- **Environment Variables (환경 변수)**:
    - 현재는 특별한 보안 키가 없으므로 비워두셔도 됩니다.

## 4. 배포 완료
1. 하단의 **[Deploy]** 버튼을 누릅니다.
2. 약 1분 후 배포가 완료되며, Vercel에서 제공하는 주소(예: `habit-tracking.vercel.app`)로 접속 가능합니다.

---

## ⚠️ 꼭 알아두셔야 할 사항 (주의!)

### 데이터 저장 관련
현재 서버는 데이터를 파일(`habits.json`)에 저장하도록 되어 있습니다. 
- **문제**: Vercel의 서버리스 환경은 파일 저장이 일시적입니다. 즉, **코드가 다시 배포되거나 일정 시간이 지나면 저장했던 데이터가 초기화될 수 있습니다.**
- **해결 방법**: 나중에 데이터를 영구적으로 보관하려면 **데이터베이스(Vercel Postgres 등)**를 연결해야 합니다. 지금은 프로토타입 배포를 목적으로 구성되었습니다.

### 404 에러 안내
존재하지 않는 주소로 접속할 경우, 설정 파일(`vercel.json`)에 의해 자동으로 메인 화면(`index.html`)으로 연결되도록 설정되어 있습니다.
