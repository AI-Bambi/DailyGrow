# Goal Track

学習と習慣形成をサポートするアプリ。継続した行動をプロセス重視で褒め、モチベーションを維持する。

## 現在の状態

| プラットフォーム | パス | 用途 | 状態 |
|-------------|------|------|------|
| Web（PC） | `Test/` | Windows PC ブラウザで確認 | ✅ 動作中 |
| Web（iPhone） | `ForIphone/` | iPhone Safari / PWA で確認 | ✅ 動作中・最適化済み |
| iOS ネイティブ | `iOS/GoalTrack/` | App Store 配信用 | ⏳ Mac 環境が揃い次第 |

> **開発環境**：Windows PC + VS Code Live Server。`Test/` と `ForIphone/` は**別管理**（`ForIphone/` は iPhone 専用の追加機能・最適化あり）。

## 実装済み機能（Phase 1）

- ✅ 複数目標管理（目標ピルで切り替え）
- ✅ 1タップでチェックイン記録
- ✅ 連続日数カウント（今日または昨日から遡って計算）
- ✅ 段階的褒賞（3 / 7 / 30 / 100日）＋コンフェッティ
- ✅ プラン管理（平日・週末・毎日等、テキスト一括インポート対応）
- ✅ 履歴カレンダー表示（過去30日）
- ✅ 日本時間 AM 2:00 を1日の区切りとする夜間作業対応
- ✅ データ永続化（Web: localStorage / iOS: UserDefaults）
- ✅ v1 → v2 データマイグレーション対応

### ForIphone/ 追加機能
- ✅ 初回起動ウェルカムシート（目標名入力）
- ✅ 目標達成機能（🏆 アーカイブ・記録保持・達成セレブレーション）
- ✅ PWA 対応（ホーム画面に追加でフルスクリーン起動）
- ✅ iPhone Safari 最適化（ノッチ・ホームインジケーター・自動ズーム対応）
- ✅ 履歴・設定タブのヘッダー固定表示

## ファイル構造

```
GoalTrack/
├── Test/                          # Web プロトタイプ ← 主な動作確認はここ
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── ForIphone/                     # iPhone 向け Web プロトタイプ（Test と同内容）
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── iOS/GoalTrack/                 # iOS ネイティブ（SwiftUI）
│   ├── App.swift
│   ├── Models/DailyCheckIn.swift
│   ├── Views/ContentView.swift
│   ├── Views/HomeView.swift
│   ├── ViewModels/GoalViewModel.swift
│   └── Services/DataManager.swift
├── SETUP_GUIDE.md                 # Xcode セットアップ手順
├── CLAUDE.md                      # 開発ガイドライン
└── README.md
```

## 実行方法

### PC（Windows）で確認
`Test/index.html` をブラウザ（Chrome / Edge 等）でダブルクリックして開く。

### iPhone で確認（Live Server 推奨）
1. VS Code で `ForIphone/index.html` を右クリック →「Open with Live Server」
2. PC のローカル IP を確認（コマンドプロンプトで `ipconfig`）
3. iPhone Safari で `http://[PCのIP]:5500/ForIphone/index.html` を開く
4. コード保存で iPhone も自動リロード

### iPhone に PWA としてインストール
1. 上記 Live Server または GitHub Pages の URL を Safari で開く
2. 共有ボタン（□↑）→「ホーム画面に追加」
3. ホーム画面のアイコンから起動 → Safari UI なしのフルスクリーン表示

### iOS ネイティブ（将来対応）
Mac + Xcode が必要なため現時点では不可。[SETUP_GUIDE.md](SETUP_GUIDE.md) に手順を記載済み。

## セキュリティ

Firebase・API キー等の機密情報は `.env` に記述し、`.gitignore` で除外する。
`.env.example`（値なし）はリポジトリに含めてよい。

## データモデル（Web）

```javascript
// localStorage キー: goaltrack_v2
{
  version: 2,
  goals: [
    {
      id: string,
      name: string,
      createdAt: string,
      checkins: { 'YYYY-MM-DD': { memo: string } },
      bestStreak: number,
      pastStreaks: [],
      plans: []
    }
  ],
  activeGoalId: string
}
```

## 褒賞レベル

| 日数 | 絵文字 | confetti数 |
|-----|--------|-----------|
| 3日 | ⭐ | 40 |
| 7日 | 🔥 | 60 |
| 30日 | 🏆 | 90 |
| 100日 | 🌟 | 150 |

## 次のステップ（Phase 2-4）

### Phase 2
- [ ] アニメーション・サウンド追加
- [ ] ハプティックフィードバック（iOS）

### Phase 3
- [ ] 週間・月間統計グラフ
- [ ] 目標詳細設定

### Phase 4
- [ ] CloudKit / Firebase 同期
- [ ] 複数デバイス対応
- [ ] iCloud バックアップ

## 技術スタック

| 層 | 技術 |
|---|------|
| Web UI | HTML5 / CSS3（ダークテーマ）/ Vanilla JavaScript |
| Web データ | localStorage（`goaltrack_v2`） |
| iOS UI | SwiftUI（iOS 14+） |
| iOS データ | UserDefaults + JSON Codable |

---

**作成日**: 2026年4月29日 / **最終更新**: 2026年4月30日
