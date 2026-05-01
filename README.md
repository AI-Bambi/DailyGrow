# DailyGrow

毎日の小さな積み上げを可視化し、継続をプロセス重視でサポートする習慣形成アプリ。
結果よりも「続けること」を大切にし、ポジティブなフィードバックでモチベーションを維持する。

## 現在の状態

| プラットフォーム | パス | 用途 | 状態 |
|-------------|------|------|------|
| Web（PC・iPhone） | `Foriphone/` | PC ブラウザ・iPhone Safari / PWA で確認 | ✅ 動作中・最適化済み |
| iOS ネイティブ | `iOS/GoalTrack/` | App Store 配信用 | ⏳ Mac 環境が揃い次第 |

> **開発環境**：Windows PC + VS Code Live Server（`Foriphone/`）、iPhone PWA（`Foriphone/`）

## 実装済み機能

- ✅ 複数目標管理（目標ピルで切り替え）
- ✅ 1タップでチェックイン記録
- ✅ 連続日数カウント（今日または昨日から遡って計算）
- ✅ 段階的褒賞（3 / 7 / 30 / 100日）＋コンフェッティ
- ✅ プラン管理（平日・週末・毎日・今週・今月・今日・明日、テキスト一括インポート対応）
- ✅ 履歴カレンダー表示（月ナビゲーション◀▶付き）
- ✅ 期限設定・カウントダウン表示（近づくほど暖色で強調）
- ✅ 期限内達成時の特別セレブレーション
- ✅ チェックイン後のメモ入力（感想・気づきを記録）
- ✅ 初回起動ウェルカムシート（目標名入力）
- ✅ 目標達成機能（アーカイブ・記録保持・達成セレブレーション）
- ✅ PWA 対応（ホーム画面に追加でフルスクリーン起動）
- ✅ iPhone Safari 最適化（ノッチ・ホームインジケーター・自動ズーム対応）
- ✅ 日本時間 AM 2:00 を1日の区切りとする夜間作業対応
- ✅ データ永続化（localStorage `goaltrack_v2`）、v1→v2 マイグレーション対応

## ファイル構造

```
GoalTrack/
├── Foriphone/                     # メイン開発フォルダ（PC・iPhone 共用）
│   ├── index.html                 # UI レイアウト（3タブ、モーダル）
│   ├── app.js                     # 全ビジネスロジック
│   └── styles.css                 # ダークテーマ + アニメーション
├── iOS/GoalTrack/                 # iOS ネイティブ（SwiftUI）— 将来対応
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

### PC で確認
`Foriphone/index.html` をブラウザ（Chrome / Edge 等）でダブルクリックして開く。

### iPhone で確認（Live Server 推奨）
1. VS Code で `Foriphone/index.html` を右クリック →「Open with Live Server」
2. PC のローカル IP を確認（コマンドプロンプトで `ipconfig`）
3. iPhone Safari で `http://[PCのIP]:5500/Foriphone/index.html` を開く
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
      deadline: string | null,       // 'YYYY-MM-DD'
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
| 目標達成 | 🏆 | 150 |
| 期限内達成 | 🎯 | 200 |

## 次のステップ

- [ ] GitHub Pages 公開（HTTPS 取得）
- [ ] プッシュ通知実装（Service Worker + Cloudflare Workers）
- [ ] データエクスポート機能

### Phase 2 以降
- [ ] アニメーション・サウンド追加
- [ ] 週間・月間統計グラフ
- [ ] CloudKit / Firebase 同期・複数デバイス対応

## 技術スタック

| 層 | 技術 |
|---|------|
| Web UI | HTML5 / CSS3（ダークテーマ）/ Vanilla JavaScript |
| Web データ | localStorage（`goaltrack_v2`） |
| iOS UI | SwiftUI（iOS 14+） |
| iOS データ | UserDefaults + JSON Codable |

---

**作成日**: 2026年4月29日 / **最終更新**: 2026年5月1日
