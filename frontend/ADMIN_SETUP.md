# 관리자 인증 시스템 설정 가이드

이 가이드는 Firebase Authentication을 사용한 관리자 권한 시스템의 초기 설정 방법을 설명합니다.

## 사전 요구사항

- [Firebase 설정 가이드](./FIREBASE_SETUP.md) 완료
- Firebase 프로젝트 생성 및 기본 설정 완료
- Firebase CLI 설치 완료

## 1. Firebase Authentication 활성화

### 1.1 Authentication 서비스 활성화
1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 선택
2. 왼쪽 메뉴에서 **Authentication** 클릭
3. **시작하기** 버튼 클릭

### 1.2 이메일/비밀번호 로그인 방법 활성화
1. Authentication 페이지에서 **로그인 방법** 탭 클릭
2. **이메일/비밀번호** 제공업체 찾기
3. **사용 설정** 토글 활성화
4. **저장** 버튼 클릭

## 2. 관리자 계정 생성

### 2.1 Firebase Console에서 관리자 계정 생성
1. Authentication 페이지에서 **사용자** 탭 클릭
2. **사용자 추가** 버튼 클릭
3. 다음 정보 입력:
   - **이메일**: 관리자 이메일 주소 (예: admin@example.com)
   - **비밀번호**: 안전한 비밀번호 (최소 6자)
4. **사용자 추가** 버튼 클릭
5. 생성된 사용자의 **UID** 복사 (나중에 필요)

### 2.2 관리자 UID 확인 방법
1. 생성된 사용자 클릭
2. **UID** 필드의 값을 복사
3. 이 UID를 다음 단계에서 사용

## 3. Firestore admins 컬렉션 설정

### 3.1 Firestore Database 접근
1. Firebase Console에서 **Firestore Database** 클릭
2. **데이터** 탭 선택

### 3.2 admins 컬렉션 생성
1. **컬렉션 시작** 버튼 클릭
2. 컬렉션 ID: `admins` 입력
3. **다음** 버튼 클릭

### 3.3 관리자 문서 생성
1. 문서 ID: 관리자 UID 입력 (2.1에서 복사한 UID)
2. 다음 필드 추가:

| 필드명 | 타입 | 값 |
|--------|------|-----|
| `uid` | string | 관리자 UID |
| `email` | string | 관리자 이메일 |
| `role` | string | `admin` |
| `createdAt` | timestamp | 현재 시간 |
| `createdBy` | string | `system` |

3. **저장** 버튼 클릭

### 3.4 예시 문서 구조
```json
{
  "uid": "관리자_UID_값",
  "email": "admin@example.com",
  "role": "admin",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "createdBy": "system"
}
```

## 4. 보안 규칙 배포

### 4.1 Firestore 보안 규칙 배포
```bash
# 프로젝트 루트 디렉토리에서
cd frontend
firebase deploy --only firestore:rules
```

### 4.2 배포 확인
배포가 성공하면 다음과 같은 메시지가 표시됩니다:
```
+ firestore: released rules firestore.rules to cloud.firestore
+ Deploy complete!
```

## 5. 테스트 및 검증

### 5.1 애플리케이션 실행
```bash
npm start
```

### 5.2 로그인 테스트
1. 브라우저에서 애플리케이션 접속
2. 관리자 로그인 페이지 표시 확인
3. 생성한 관리자 계정으로 로그인 시도:
   - 이메일: admin@example.com
   - 비밀번호: 설정한 비밀번호
4. 로그인 성공 시 관리자 대시보드 접근 확인

### 5.3 권한 테스트
1. **프로모션 뷰 페이지** (`/view/:id`)는 로그인 없이 접근 가능한지 확인
2. **관리자 페이지들**은 로그인 후에만 접근 가능한지 확인
3. **로그아웃** 기능 정상 작동 확인

## 6. 추가 관리자 계정 생성

### 6.1 새 관리자 추가
1. **2.1** 단계에서 새 사용자 계정 생성
2. **3.3** 단계에서 admins 컬렉션에 새 문서 추가
3. 새 관리자로 로그인 테스트

### 6.2 관리자 권한 해제
1. Firestore Database에서 해당 관리자 문서 삭제
2. 또는 `role` 필드를 `admin`에서 다른 값으로 변경

## 7. 문제 해결

### 7.1 로그인 실패
- **"관리자 권한이 없습니다"** 오류:
  - admins 컬렉션에 해당 UID가 있는지 확인
  - 문서 구조가 올바른지 확인

- **"등록되지 않은 이메일입니다"** 오류:
  - Firebase Authentication에 사용자가 등록되어 있는지 확인

### 7.2 보안 규칙 오류
- Firestore 보안 규칙이 올바르게 배포되었는지 확인
- `firebase deploy --only firestore:rules` 재실행

### 7.3 환경변수 오류
- `.env` 파일의 Firebase 설정이 올바른지 확인
- 애플리케이션 재시작

## 8. 보안 고려사항

### 8.1 관리자 계정 보안
- 강력한 비밀번호 사용
- 정기적인 비밀번호 변경
- 2단계 인증 활성화 권장

### 8.2 Firestore 보안
- admins 컬렉션은 수동으로만 관리
- 자동화된 스크립트로 관리자 추가 금지
- 정기적인 관리자 목록 검토

### 8.3 프로덕션 환경
- HTTPS 강제 적용
- 적절한 CORS 설정
- 정기적인 보안 감사

## 9. 참고 자료

- [Firebase Authentication 문서](https://firebase.google.com/docs/auth)
- [Firestore 보안 규칙 문서](https://firebase.google.com/docs/firestore/security/get-started)
- [기존 Firebase 설정 가이드](./FIREBASE_SETUP.md) 