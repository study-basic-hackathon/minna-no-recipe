# 모두의 레시피

[日本語](README.md) | **한국어**

Next.js로 만든 레시피 공유 애플리케이션입니다.

## 개요

TV 등에서 본 모르는 요리를 재현하기 위한 앱입니다. 사용자가 사진을 업로드하면 이미지 분석과 벡터 검색을 수행해, Supabase의 레시피 데이터베이스에서 해당 레시피를 찾아 표시합니다.
TOP 페이지에는 실제로 만들어 본 사람들의 사진을 표시하는 공간도 있습니다.

### 플로우
- 사진 업로드 (Frontend)
- 벡터 검색 및 이미지 분석 수행 (Backend)
- 이미지 분석 결과로 DB(Supabase)에서 레시피 검색 (Backend)
- 검색 결과를 JSON 형식으로 반환 (Backend)
- 받은 JSON으로 화면 구성 (Frontend)

## 참고 사이트
- [10000recipe.com](https://www.10000recipe.com) - 한국 레시피 투고 앱
- [recipe.rakuten.co.jp](https://recipe.rakuten.co.jp) - 라쿠텐 레시피 사이트
- [cookpad.com/jp](https://cookpad.com/jp) - 쿡패드 레시피 사이트

## 디자인 데이터
[Figma Design](https://www.figma.com/design/dCxi2PPTCc0imapdYsPtjc/%E3%81%BF%E3%82%93%E3%81%AA%E3%81%AE%E3%83%AC%E3%82%B7%E3%83%94?node-id=10-13&t=pB0w9Ynqv5UrVo8K-0)

## 사용 예정 기술
- [pyconjp/pyconjp-image-search](https://github.com/pyconjp/pyconjp-image-search) - 이미지 벡터 검색 기능
- [Supabase](https://supabase.com/) - DB (PostgreSQL)
- [Vercel](https://vercel.com/) - 호스팅
- [Next.js](https://nextjs.org/) - 프론트엔드 프레임워크
- [Auth.js](https://authjs.dev/) - 로그인 인증
- [Zod](https://zod.dev/) - DB 검증
- [Hono](https://hono.dev/) - 백엔드 프레임워크
- [Tailwind CSS](https://tailwindcss.com/) - CSS
- [Drizzle ORM](https://orm.drizzle.team/) - ORM

## TODO

### 프론트엔드
- [ ] Next.js 환경 구축: 오야마 (ESLint, Stylelint 도입)
- [ ] Next.js 최신 버전, Node.js ver.22, 패키지 매니저는 pnpm
- [ ] Next.js 내 프론트 디렉토리 구조: 오야마
- [ ] Figma 디자인 시안 작성: 오야마

### 백엔드
- [ ] 이미지 벡터 검색 기능: 하야시
- [ ] Coderabbit 설정: 하야시
- [ ] DB 검색 후 Frontend에 반환: 오가와
- [ ] Supabase 구축: 하야시

### 기타
- [x] README 작성
- [ ] 추천 레시피 검색 등...
- [ ] Cloudflare R2 또는 AWS S3

## 브랜치 전략

이 프로젝트에서는 간결한 GitHub Flow를 채택하고 있습니다. develop 브랜치는 사용하지 않고 main 브랜치만 사용합니다.

- **main 브랜치**: 항상 배포 가능한 상태를 유지합니다.
- **feature 브랜치**: main에서 분기하여 기능 개발을 수행합니다. 브랜치명은 `feature/기능명` 또는 `fix/수정명` 등의 프리픽스를 사용해주세요.

### 개발 플로우
1. main 브랜치에서 feature 브랜치를 만듭니다.
2. 변경사항을 커밋합니다.
3. main 브랜치로 풀 리퀘스트를 만들고, 리뷰 후 머지합니다.

### 커밋 메시지
- add, delete, fix 등, 해당 커밋에서 무엇을 했는지 간결한 메시지를 남겨주세요.
- 예: `feat: 사진 업로드 기능 추가`

## 기능

- 사진 업로드 및 이미지 분석
- 레시피 벡터 검색 및 표시
- 사용자 레시피 투고
- TOP 페이지의 사용자 투고 이미지 표시

## 설치

### 필요 환경

| 항목 | 버전 |
|------|------|
| Node.js | >= 22 |
| pnpm | >= 9.0.0 |

### 절차

1. Node.js (버전 22 이상)를 설치해주세요.
   - [nvm](https://github.com/nvm-sh/nvm)을 사용하는 경우:
     ```bash
     nvm install 22
     nvm use 22
     ```
2. 패키지 매니저로 pnpm을 사용합니다.
   - Corepack을 사용하는 경우:
     ```bash
     corepack enable
     ```
   - 또는 npm으로 설치:
     ```bash
     npm install -g pnpm
     ```
3. 리포지토리를 클론합니다.
   ```
   git clone https://github.com/study-basic-hackathon/minna-no-recipe.git
   ```
4. 의존성을 설치합니다.
   ```
   pnpm install
   ```

## 사용 방법

개발 서버를 실행합니다.
```
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어주세요.

## 빌드

프로덕션 빌드를 생성합니다.
```
pnpm build
```
