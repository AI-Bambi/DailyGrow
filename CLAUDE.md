# Goal Track - 目標達成支援アプリ

## プロジェクト概要
学習と習慣形成をサポートするアプリケーション。ユーザーの達成度や努力を褒めることで、モチベーションを維持し、習慣化を促進する。

- **`Foriphone/`**：iPhone Safari / PWA 向けに最適化した Web プロトタイプ（メイン開発フォルダ）
- **`iOS/`**：Swift/SwiftUI による将来の iOS ネイティブアプリ（**Mac を所有していないため現時点では Xcode ビルド不可**）

> **現在の主な開発環境**：Windows PC + VS Code Live Server（`Foriphone/`）、iPhone PWA（`Foriphone/`）

## 実装済み機能

### 1. 複数目標管理
- 複数の習慣・目標を独立して管理（目標ピル UI で切り替え）
- 各目標に紐づくチェックイン履歴・プラン・統計を個別保持

### 2. 行動の褒賞システム
- **「何をしたか」より「やったこと」を褒める**（プロセス重視）
- 毎日の行動を認識し、ポジティブなメッセージとコンフェッティで祝う

### 3. 連続日数カウント機能
- 連続で行動を継続した日数をカウント
- **段階的な褒賞レベル**
  - 3日: ⭐ 基本的な励まし（confetti 40個）
  - 7日: 🔥 より熱い応援（confetti 60個）
  - 30日: 🏆 盛大なお祝い（confetti 90個）
  - 100日: 🌟 大規模なお祝いと特別ビジュアル（confetti 150個）
- **途切れた時の配慮**：「リセット」ではなく「新しいチャレンジの開始」という表現
- 過去のストリーク記録を履歴として保持

### 4. プラン管理
- タイプ：平日 / 週末 / 毎日 / 今週 / 今月 / 今日 / 明日
- テキストインポートで複数プランを一括登録
- チェックボックスで完了管理

### 5. 日付ロジック
- **日本時間 AM 2:00** を1日の区切りとする（夜間作業対応）
- `gameDay()`：UTC+9 から 2h 引いた日付を "今日" として扱う

### 6. 目標達成機能（`Foriphone/` のみ）
- 設定タブの 🏆 ボタンで目標を「達成」としてアーカイブ
- 達成セレブレーション画面（confetti 150個）＋累計記録を表示
- 記録はアーカイブとして保持（削除されない）
- 全目標達成後はウェルカムシートで新目標入力を促す

### 7. 初回起動ウェルカムシート（`Foriphone/` のみ）
- データが空の状態で起動するとシートが自動表示
- 目標名を入力して「はじめる」でアプリを開始
- 全目標達成後にも再表示

### 8. PWA 対応（`Foriphone/` のみ）
- Safari の「ホーム画面に追加」でアプリとして起動可能
- Safari の UI（アドレスバー・ナビゲーションバー）が非表示になりフルスクリーン表示
- `apple-mobile-web-app-capable` / `black-translucent` 設定済み

## 技術スタック

### Web プロトタイプ（現在の主力）

| フォルダ | 用途 | 備考 |
|---------|------|------|
| `Foriphone/` | PC ブラウザ・iPhone Safari / PWA で確認 | iPhone 最適化済み・メイン開発フォルダ |

| 技術 | 詳細 |
|------|------|
| HTML5 | レスポンシブ（max-width 430px）、3タブ構成 |
| JavaScript（Vanilla） | ビジネスロジック全体、localStorage 永続化 |
| CSS3 | ダークテーマ（#1c1f24）、アニメーション |
| データ | localStorage キー `goaltrack_v2`、v1→v2 マイグレーション対応 |

**`Foriphone/` の iOS 対応：**
- `viewport-fit=cover` + `env(safe-area-inset-*)` によるノッチ・ホームインジケーター対応
- 入力欄の font-size 16px 統一（iOS 自動ズーム防止）
- `overscroll-behavior: none`（オーバースクロール時の白背景防止）
- `background-attachment: scroll`（iOS Safari 非対応の `fixed` を回避）
- `navigator.clipboard` フォールバック（`execCommand` による代替）
- PWA メタタグ（`apple-mobile-web-app-capable` 等）
- 履歴・設定画面のヘッダー固定（`screen-body` 構造で実現）

### iOS ネイティブ（`iOS/`）— 将来対応
| 技術 | 詳細 |
|------|------|
| Swift | MVVM 設計パターン |
| SwiftUI | iOS 14+ 対応、リアクティブUI |
| UserDefaults | JSON Codable で永続化（将来 CoreData 移行可能） |

> **制約**：Mac を所有していないため Xcode ビルドは現時点で不可。Mac 環境が揃い次第 Phase 1 iOS 版を進める。

### 将来のバックエンド（Phase 4 以降）
- CloudKit または Firebase Authentication + Firestore
- 複数デバイス同期・iCloud バックアップ

## アプリケーション構成（実際の構造）

```
GoalTrack/
├── Foriphone/                     # メイン開発フォルダ（iPhone Safari / PWA・PC ブラウザ共用）
│   ├── index.html                 # UI レイアウト（3タブ、モーダル）
│   ├── app.js                     # 全ビジネスロジック
│   └── styles.css                 # ダークテーマ + アニメーション
├── iOS/                           # iOS ネイティブアプリ
│   └── GoalTrack/
│       ├── App.swift              # エントリーポイント
│       ├── Models/
│       │   └── DailyCheckIn.swift
│       ├── Views/
│       │   ├── ContentView.swift
│       │   └── HomeView.swift
│       ├── ViewModels/
│       │   └── GoalViewModel.swift
│       └── Services/
│           └── DataManager.swift
├── SETUP_GUIDE.md                 # Xcode セットアップ手順
├── CLAUDE.md
└── README.md
```

## セキュリティ・機密情報の管理

### .env ファイルの使用
Firebase、API キー、シークレット等の機密情報は必ず `.env` ファイルに記述し、ソースコードに直書きしない。

```bash
# .env の例
FIREBASE_API_KEY=your_api_key_here
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_APP_ID=your_app_id
CLOUDKIT_CONTAINER=iCloud.com.yourname.goaltrack
```

`.env.example`（値なし）はリポジトリに含めてよいが、実際の `.env` は **必ず `.gitignore` に追加**すること。

### .gitignore に追加すべき項目
```
# 機密情報
.env
.env.local
.env.*.local

# Xcode 生成ファイル
*.xcworkspace/xcuserdata/
*.xcodeproj/xcuserdata/
DerivedData/
*.ipa
*.dSYM.zip
*.dSYM

# macOS
.DS_Store
```

## UI/UX 設計の方針

### ホーム画面
- 本日の行動チェック（ボタン一つでタップ）
- 連続日数を大きく表示（Web: 中央、iOS: フォント 80pt）
- 次のマイルストーンまでの残日数を明示

### 褒賞表現
- 連続日数に応じたコンフェッティアニメーション
- 絵文字を活用した視覚的フィードバック
- テキストは前向きで、失敗を責めない表現

### 履歴画面
- カレンダー表示で実績を可視化
- 連続日数・最高記録・合計チェック回数を表示

## 開発フェーズ

| フェーズ | 内容 | 状態 |
|---------|------|------|
| Phase 1 | 基本チェック・連続日数・段階的褒賞・複数目標・プラン管理 | ✅ 完了（Web） / ⏳ Mac 環境が揃い次第（iOS） |
| Phase 2 | アニメーション・サウンド・ハプティックフィードバック拡張 | 📋 予定 |
| Phase 3 | 週間・月間統計、詳細グラフ | 📋 予定 |
| Phase 4 | CloudKit / Firebase 同期、複数デバイス対応 | 📋 予定 |

## 禁止事項

- **Git に勝手にコミットしない**（事前に確認を取る）
- **機密情報をソースコードに直書きしない**（.env を使用）
- インストール・依存関係追加時は日本語で確認を行う
