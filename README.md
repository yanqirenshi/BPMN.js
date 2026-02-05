# BPMN D3 Viewer

React, TypeScript, そして D3.js を使用して構築された BPMN 2.0 ビューワーアプリケーションです。
bpmn-moddle を使用して BPMN ファイルを解析し、D3.js を使用して SVG として描画します。

## 機能

- **BPMN 2.0 ファイルの読み込み**: ローカルの `.bpmn` または `.xml` ファイルをアップロードして表示できます。
- **D3.js によるレンダリング**: 軽量かつ高速な SVG 描画を行います。
- **対応要素**:
  - タスク (Task / Activity)
  - イベント (Start, End, Intermediate 等)
  - ゲートウェイ (Gateway)
  - プールとレーン (Pools / Lanes)
  - シーケンスフロー (矢印付きの接続線)

## 技術スタック

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [D3.js](https://d3js.org/)
- [bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle)

## セットアップと実行

プロジェクトをクローンした後、以下の手順で実行してください。

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで表示された URL (通常は http://localhost:5173) にアクセスしてください。

### 3. ビルド

プロダクション向けのビルドを行う場合:

```bash
npm run build
```

## 使い方

1. アプリケーションを起動します。
2. 画面上部の「ファイルを選択」ボタンをクリックします。
3. 手持ちの `.bpmn` ファイルを選択します。
4. 画面に BPMN ダイアグラムが描画されます。
