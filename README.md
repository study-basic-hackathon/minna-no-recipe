# みんなのレシピ

**日本語** | [한국어](README.ko.md)

Next.jsを使って作られたレシピ共有アプリケーションです。

## 概要

テレビなどで見た知らない料理を再現するためのアプリです。ユーザーが写真をアップロードすると、画像分析とベクター検索を行い、Supabase上のレシピデータベースから該当するレシピを検索して表示します。
TOPページには実際に作ってみた人たちの画像を表示するスペースもあります。

### フロー

- 写真をアップロード (Frontend)
- ベクター検索と画像分析を行う (Backend)
- 画像分析結果を使ってDB（Supabase）にレシピを検索 (Backend)
- 検索結果をJSON形式で返す (Backend)
- 受け取ったJSONを使って画面を作成 (Frontend)

## 参考サイト

- [10000recipe.com](https://www.10000recipe.com) - 韓国のレシピ投稿アプリ
- [recipe.rakuten.co.jp](https://recipe.rakuten.co.jp) - Rakutenレシピサイト
- [cookpad.com/jp](https://cookpad.com/jp) - Cookpadレシピサイト

## デザインデータ

[Figma Design](https://www.figma.com/design/dCxi2PPTCc0imapdYsPtjc/%E3%81%BF%E3%82%93%E3%81%AA%E3%81%AE%E3%83%AC%E3%82%B7%E3%83%94?node-id=10-13&t=pB0w9Ynqv5UrVo8K-0)

## 使用予定技術

- [pyconjp/pyconjp-image-search](https://github.com/pyconjp/pyconjp-image-search) - 画像のベクター検索機能
- [Supabase](https://supabase.com/) - DB (PostgreSQL)
- [Vercel](https://vercel.com/) - Hosting
- [Next.js](https://nextjs.org/) - Frontend Framework
- [Auth.js](https://authjs.dev/) - ログイン認証
- [Zod](https://zod.dev/) - DB検証
- [Hono](https://hono.dev/) - Backend Framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS
- [Drizzle ORM](https://orm.drizzle.team/) - ORM

## TODO

### フロント周り

- [ ] Next.jsの環境構築: 大山 (ESLint, Stylelint導入)
- [ ] Next.jsのバージョンは最新, Node.js ver.22、パッケージマネージャーはpnpm
- [ ] Next.js内のフロント周りディレクトリ構造: 大山
- [ ] Figma デザインカンプ作成: 大山

### バックエンド周り

- [ ] 画像のベクター検索機能: 林
- [ ] Coderabbitの作成: 林
- [ ] DBの検索し、Frontendに返す: 小川
- [ ] Supabase構築: 林

### 他の周り

- [x] README 作成
- [ ] おすすめのレシピ検索など。。。
- [ ] クラウドフレア R2 or AWS S3

## ブランチ戦略

このプロジェクトでは、簡潔なGitHub Flowを採用しています。developブランチは使用せず、mainブランチのみを使用します。

- **mainブランチ**: 常にデプロイ可能な状態を維持します。
- **featureブランチ**: mainから切り、機能開発を行います。ブランチ名は `feature/機能名` や `fix/修正名` などのプレフィックスを使用してください。

### 開発フロー

1. mainブランチからfeatureブランチを作成します。
2. 変更をコミットします。
3. mainブランチにプルリクエストを作成し、レビューを経てマージします。

### コミットメッセージ

- add, delete, fixなど、そのコミットで何をおこなったのか簡潔なメッセージを残してください。
- 例: `feat: 写真アップロード機能追加`

## 機能

- 写真アップロードと画像分析
- レシピのベクター検索と表示
- ユーザーのレシピ投稿
- TOPページのユーザー投稿画像表示

## インストール

### 必要環境

| 項目    | バージョン |
| ------- | ---------- |
| Node.js | >= 22      |
| pnpm    | >= 9.0.0   |

### 手順

1. Node.js (バージョン 22 以上) をインストールしてください。
   - [nvm](https://github.com/nvm-sh/nvm) を使う場合:
     ```bash
     nvm install 22
     nvm use 22
     ```
2. パッケージマネージャーとして pnpm を使用します。
   - Corepack を使う場合:
     ```bash
     corepack enable
     ```
   - または npm でインストール:
     ```bash
     npm install -g pnpm
     ```
3. リポジトリをクローンします。
   ```
   git clone https://github.com/study-basic-hackathon/minna-no-recipe.git
   ```
4. 依存関係をインストールします。
   ```
   pnpm install
   ```

## 使用方法

開発サーバーを起動します。

```
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ビルド

本番用ビルドを作成します。

```
pnpm build
```
