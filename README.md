# Goal Track

学習と習慣形成をサポートするアプリ。継続した行動をプロセス重視で褒め、モチベーションを維持する。

## 現在の状態

| プラットフォーム | パス | 用途 | 状態 |
|-------------|------|------|------|
| Web（PC） | `Test/` | Windows PC ブラウザで確認 | ✅ 動作中 |
| Web（スマホ） | `ForIphone/` | iPhone Safari で確認 | ✅ 動作中 |
| iOS ネイティブ | `iOS/GoalTrack/` | App Store 配信用 | ⏳ Mac 環境が揃い次第 |

> **開発環境**：Windows PC のため Xcode は使用不可。現在は `Test/` と `ForIphone/` の Web 版が主な動作確認環境。

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

### iPhone（Safari）で確認
`ForIphone/index.html` を iPhone の Safari で開く（ローカルファイルまたは Live Server 等で配信）。

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
