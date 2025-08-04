# Firebase 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 새 프로젝트 생성
3. 프로젝트 설정에서 웹 앱 추가

## 2. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Firebase Emulator (Development)
REACT_APP_USE_FIREBASE_EMULATOR=false
REACT_APP_FIREBASE_EMULATOR_HOST=localhost
REACT_APP_FIREBASE_EMULATOR_PORT=8080
```

## 3. Firebase 서비스 활성화

### Firestore Database
1. Firestore Database 생성
2. 보안 규칙 설정 (backend/firestore.rules 참조)

### Storage
1. Storage 활성화
2. 보안 규칙 설정 (backend/storage.rules 참조)

### Authentication (필수)
1. Authentication 활성화
2. 이메일/비밀번호 로그인 방법 활성화
3. **관리자 인증 시스템 설정**: [관리자 설정 가이드](./ADMIN_SETUP.md) 참조

## 4. 보안 규칙 배포

```bash
# Firestore 규칙 배포
firebase deploy --only firestore:rules

# Storage 규칙 배포
firebase deploy --only storage
```

## 5. 개발 환경 설정

### 에뮬레이터 사용 (선택사항)
```bash
# Firebase CLI 설치
npm install -g firebase-tools

# 에뮬레이터 시작
firebase emulators:start

# .env 파일에서 에뮬레이터 활성화
REACT_APP_USE_FIREBASE_EMULATOR=true
```

## 6. 테스트

Firebase 설정이 완료되면 다음을 확인하세요:

1. Firebase SDK 설치 확인
2. 환경변수 로드 확인
3. Firestore 연결 테스트
4. Storage 연결 테스트
5. **관리자 인증 시스템 테스트**: [관리자 설정 가이드](./ADMIN_SETUP.md)의 테스트 섹션 참조

## 7. 관리자 인증 시스템

이 프로젝트는 Firebase Authentication을 사용한 관리자 권한 시스템을 포함합니다:

- **공개 접근**: 프로모션 뷰 페이지 (`/view/:id`)
- **관리자 전용**: 대시보드, 프로모션 관리, 고객 관리 등
- **보안**: Firestore admins 컬렉션 기반 권한 확인

자세한 설정 방법은 [관리자 설정 가이드](./ADMIN_SETUP.md)를 참조하세요.

## 주의사항

- `.env` 파일은 절대 Git에 커밋하지 마세요
- 프로덕션 환경에서는 적절한 보안 규칙을 설정하세요
- API 키는 클라이언트 사이드에서 노출되므로 보안 규칙으로 보호하세요
- **관리자 계정은 수동으로만 관리하고, 정기적으로 검토하세요** 