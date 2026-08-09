# 🎙️volumeUp

## Front-end 소개

- 러닝 커뮤니티를 주제로 `서로 소통하는 커뮤니티` 프로젝트입니다.
- `express` 라이브러리를 사용하여 구현했습니다.
- 개발은 초기 프로젝트 화면부터, 기능, 백엔드 연결까지 `직접 구현`했습니다.

### 개발 인원 및 기간

- 개발기간 :  2026-05-31 ~ 2026-08-09
- 개발 인원 : 프론트엔드/백엔드 1명 (본인)

### 사용 기술 및 tools
- HTML5 / CSS3
- vanilla JS
- Node.js / Express
- AWS S3 + CloudFront
- GitHub Actions (CI/CD)


### Back-end
- <a href="https://github.com/100-hours-a-week/5-erica-react-be(https://github.com/hyo-lin/WEEKLY_TASK2)">Back-end Github</a>


  <br/>

## 서비스 화면

`홈`
|로그인|회원가입|
|---|---|
|![alt text](image.png)|![alt text](image-1.png)>|


`게시글 목록`
|전체 게시글|
|---|
|![alt text](image-2.png)|


`게시물 작성 / 상세 / 수정 / 삭제`

|게시물 작성|게시물 상세|게시글 수정|게시글 삭제|
|---|---|---|---|
|![alt text](image-3.png)|![alt text](image-4.png)|![alt text](image-5.png)|![alt text](image-6.png)|


`댓글 목록 / 등록 / 수정 /삭제`

|댓글 화면|댓글 등록|댓글 수정|댓글 삭제|
|---|---|---|---|
|![alt text](image-7.png)|![alt text](image-8.png)|![alt text](image-9.png)|![alt text](image-10.png)|

  
`프로필 수정 / 비밀번호 수정 / 회원 탈퇴 / 로그아웃`

|프로필 수정|비밀번호 수정|회원 탈퇴|로그아웃|
|---|---|---|---|
|![alt text](image-11.png)|![alt text](image-12.png)|![alt text](image-13.png)|![alt text](image-14.png)|

<br/>

## 트러블 슈팅
### 이미지 업로드 (S3) 이슈

- 문제: 프로필/게시글 이미지 업로드 시 CORS 에러로 S3 직접 업로드 실패
- 원인: 브라우저에서 presigned URL로 S3에 직접 PUT 요청을 보내는 구조인데, S3 버킷 CORS 설정에 프론트엔드 도메인이 등록되어 있지 않아 preflight 요청이 차단됨
- 해결: S3 버킷 CORS 정책에 허용 Origin·Method(PUT)·Header 추가, 이후 CloudFront 배포 도메인 기준으로 재검증하여 정상 업로드 확인

<br/>

## 프로젝트 후기
express를 활용한 프로젝트는 처음이었다. 프레임워크 없이 vanilla JS로 DOM을 직접 조작하고 상태를 관리하다 보니, 평소 상태 변화에 따른 리렌더링, 컴포넌트 단위 관리를 직접 구현하면서 왜 프레임워크가 필요한지 체감할 수 있었다. 프론트와 백엔드를 함께 다루면서 API 설계 방식이 실제 화면 구현 난이도에 어떤 영향을 주는지도 배울 수 있었던 프로젝트였다.
<br/>
<br/>
<br/>


<p align="center">
  <img src="https://github.com/100-hours-a-week/5-erica-express-fe/assets/81230764/97f46705-5714-40fe-a3c6-ce5250a24285" style="width:200px; margin: 0 auto"/>
</p>