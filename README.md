# 🎙️ volumeUp

## Front-end 소개

- 러닝 커뮤니티를 주제로 `서로 소통하는 커뮤니티` 프로젝트입니다.
- `express` 라이브러리를 사용하여 구현했습니다.
- 개발은 초기 프로젝트 화면부터 기능, 백엔드 연결까지 `직접 구현`했습니다.

### 개발 인원 및 기간

- **개발 기간** : 2026-05-31 ~ 2026-08-09
- **개발 인원** : 프론트엔드/백엔드 1명 (본인)

### 사용 기술 및 tools

- **Frontend**: HTML5, CSS3, Vanilla JS
- **Backend**: Node.js, Express
- **Infrastructure**: AWS S3, CloudFront
- **CI/CD**: GitHub Actions

### Back-end Repository

- [🔗 Back-end Github 보러가기](https://github.com/hyo-lin/WEEKLY_TASK2)

<br/>

## 서비스 화면

`홈`
|로그인|회원가입|
|---|---|
|<img width="1512" height="856" alt="Image" src="https://github.com/user-attachments/assets/45e95443-7ed1-4988-93e4-02f35a66b727" />|<img width="1510" height="857" alt="Image" src="https://github.com/user-attachments/assets/d2198452-b10b-404c-a8f5-f77d398f4c26" />|

`게시글 목록`
|전체 게시글|
|---|
|<img width="1512" height="857" alt="Image" src="https://github.com/user-attachments/assets/446d86c9-9f97-4a4c-9f3a-bac6a3a8a9c0" />|

`게시물 작성 / 상세 / 수정 / 삭제`
|게시물 작성|게시물 상세|게시글 수정|게시글 삭제|
|---|---|---|---|
|<img width="1512" height="853" alt="Image" src="https://github.com/user-attachments/assets/b7232c97-b698-422b-a670-19c4eccb07ef" />|<img width="1512" height="857" alt="Image" src="https://github.com/user-attachments/assets/9914c1c5-1b26-439f-b82e-a3a87d04c9cb" />|<img width="1512" height="857" alt="Image" src="https://github.com/user-attachments/assets/1364c9f5-49f4-4597-983d-15efa8dcac82" />|<img width="1512" height="855" alt="Image" src="https://github.com/user-attachments/assets/eb1c0284-b746-4a47-a426-dff8b8e9feb6" />|

`댓글 목록 / 등록 / 수정 / 삭제`
|댓글 화면|댓글 등록|댓글 수정|댓글 삭제|
|---|---|---|---|
|<img width="1512" height="856" alt="Image" src="https://github.com/user-attachments/assets/a486e528-d459-47ee-af2f-6aced19c3777" />|<img width="1512" height="853" alt="Image" src="https://github.com/user-attachments/assets/8334c32a-ab78-484c-abfe-e009d0ceddbd" />|<img width="1512" height="857" alt="Image" src="https://github.com/user-attachments/assets/3bfb9066-991d-470a-be02-dbbd9a9b8538" />|<img width="1512" height="856" alt="Image" src="https://github.com/user-attachments/assets/880911d0-a80c-40c7-bae4-fa582a749ae0" />|

`프로필 수정 / 비밀번호 수정 / 회원 탈퇴 / 로그아웃`
|프로필 수정|비밀번호 수정|회원 탈퇴|로그아웃|
|---|---|---|---|
|<img width="1512" height="855" alt="Image" src="https://github.com/user-attachments/assets/c15c335f-7c1a-43d4-8939-f9827797ca0f" />|<img width="1512" height="854" alt="Image" src="https://github.com/user-attachments/assets/ecdbd53e-15ba-40b8-91cd-1f91754e3c04" />|<img width="1512" height="858" alt="Image" src="https://github.com/user-attachments/assets/857adafa-8349-4868-8b5b-8d32738786cb" />|<img width="1512" height="857" alt="Image" src="https://github.com/user-attachments/assets/878f2c47-3610-47a8-b0ed-3888a99a57b1" />|

<br/>

## 🛠️ 트러블 슈팅

### 1. 이미지 업로드 (S3 Presigned URL) CORS 이슈

- **문제**: 프로필 및 게시글 이미지 업로드 시 CORS 에러가 발생하며 S3 직접 업로드 실패
- **원인**: 브라우저에서 발급받은 Presigned URL을 통해 S3로 직접 `PUT` 요청을 전송하는 과정에서, S3 버킷의 CORS 설정에 프론트엔드 Origin이 등록되어 있지 않아 Preflight 요청이 차단됨
- **해결**: S3 버킷 CORS 정책에 프론트엔드 Origin, 허용 메서드(`PUT`), 헤더(`*`)를 추가 설정하고, CloudFront 배포 도메인 기준으로 재검증하여 정방향 업로드 정상 동작 확인

<br/>

## 📝 프로젝트 후기

Express와 Vanilla JS를 활용한 풀스택 프로젝트였습니다. 프레임워크 없이 Vanilla JS로 DOM을 직접 조작하고 상태 변경에 따른 리렌더링 및 컴포넌트 단위 관리를 직접 구현해보면서, 모던 프론트엔드 프레임워크가 제공하는 추상화의 이점과 필요성을 깊이 체감할 수 있었습니다. 또한 프론트엔드와 백엔드를 모두 전담하며 인터페이스 및 API 설계 방식이 실제 클라이언트 화면 개발 생산성과 난이도에 미치는 영향력을 크게 배운 계기가 되었습니다.