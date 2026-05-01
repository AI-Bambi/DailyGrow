# DailyGrow - Xcode セットアップ・実行ガイド

> **現在の状況**：開発者は Windows PC 環境のため、このガイドは **Mac 環境が揃い次第** 参照してください。
> 現時点での動作確認は `Foriphone/`（iPhone PWA・PC ブラウザ共用）で行っています。

## ⚠️ 前提条件

- **Mac** が必要です（Xcode は macOS でのみ動作）
- **Xcode 14.0 以上**
- **iOS 14+ の iPhone シミュレータ**

---

## 📋 セットアップ手順

### ステップ 1: Xcode をインストール

```bash
# App Store から Xcode をインストール
# または下記でコマンドラインツールをインストール
xcode-select --install
```

### ステップ 2: 新規プロジェクト作成

#### 方法 A: Xcode GUI から作成

1. Xcode を起動
2. **File** → **New** → **Project** をクリック
3. **iOS** を選択
4. **App** テンプレートを選択
5. 以下の情報を入力：
   - **Product Name**: `DailyGrow`
   - **Team**: （Apple Developer アカウント不要）
   - **Organization Identifier**: `com.example` など任意の値
   - **Language**: **Swift**
   - **User Interface**: **SwiftUI**
   - **Include Tests**: 任意（チェック不要）

6. **Next** → プロジェクトを保存する場所を指定

#### 方法 B: コマンドラインから作成

```bash
# プロジェクトディレクトリに移動
cd /path/to/GoalTrack/iOS

# 新規プロジェクト作成
mkdir GoalTrack.xcodeproj
# （自動生成される）
```

### ステップ 3: ソースファイルを追加

Xcode プロジェクト内に以下のフォルダ構造を作成し、各ファイルを配置します：

```
GoalTrack/
├── Models/
│   └── DailyCheckIn.swift
├── Views/
│   ├── ContentView.swift
│   └── HomeView.swift
├── ViewModels/
│   └── GoalViewModel.swift
├── Services/
│   └── DataManager.swift
└── App.swift
```

#### ファイル追加の手順

1. **Project Navigator** でプロジェクトを右クリック
2. **New Group** を選択 → フォルダ名を入力（例：`Models`）
3. フォルダを右クリック → **New File** → **Swift File** を選択
4. ファイル名を入力（例：`DailyCheckIn.swift`）
5. ファイル内容をコピー&ペースト

---

## 🚀 iPhone シミュレータで実行

### 方法 1: Xcode から実行（推奨）

1. **Xcode ウィンドウの上部** にあるシミュレータ選択ボタンをクリック
   ```
   [GoalTrack] ▶ [iPhone 15 Pro] ▶ [Generic iOS Device]
   ```

2. 実行したいシミュレータを選択
   - 例：`iPhone 15 Pro`
   - 例：`iPhone SE (3rd generation)`

3. **Product** → **Run** をクリック（または `⌘ + R`）

4. シミュレータが起動し、アプリが実行される

### 方法 2: コマンドラインから実行

```bash
# Xcode プロジェクトディレクトリに移動
cd /path/to/GoalTrack/iOS

# ビルド
xcodebuild -scheme GoalTrack -destination 'platform=iOS Simulator,name=iPhone 15 Pro'

# または
xcodebuild build -scheme GoalTrack -configuration Debug -destination generic/platform=iOS\ Simulator
```

---

## 📱 シミュレータ操作ガイド

### アプリの操作

| 操作 | 方法 |
|------|------|
| アプリ起動 | Xcode で Run（⌘R） |
| アプリ終了 | Xcode で Stop（⌘.） |
| ホームに戻る | Cmd + Shift + H |
| 再起動 | Cmd + Shift + K（Xcode） |

### デバッグ機能

```bash
# シミュレータの言語を日本語に設定
# Simulator の Settings → General → Language & Region → 日本語

# シミュレータをリセット
xcrun simctl erase all
```

---

## 🔧 よくあるトラブルシューティング

### ❌ ビルドエラー「No such module」

**原因**: ファイルが正しいターゲットに追加されていない

**解決策**:
1. File Inspector でファイルを選択
2. **Target Membership** で `GoalTrack` にチェック

### ❌ シミュレータが起動しない

**解決策**:
```bash
# キャッシュをクリア
rm -rf ~/Library/Caches/com.apple.dt.Xcode

# Xcode を再起動
```

### ❌ アプリデータが初期化されない

**解決策**:
```bash
# シミュレータをリセット
xcrun simctl erase "iPhone 15 Pro"

# または Simulator メニューから Device → Erase All Content and Settings...
```

### ❌ 日本語表示が文字化けしている

**解決策**:
1. **Simulator** → **Settings** → **General** → **Language & Region**
2. 言語を「日本語」に設定
3. Xcode で再ビルド（⌘R）

---

## 📊 デバッグコンソール

Xcode 下部の **Console** パネルでログ出力を確認できます：

```swift
// コード内で
print("デバッグメッセージ")

// Console に出力されます
// デバッグメッセージ
```

---

## 💾 テストデータを確認

アプリで何度かチェックインした後：

1. **Xcode** の **Debug Navigator** を開く
2. **View** → **Navigators** → **Show Debug Navigator** （⌘6）
3. Core Data のデータが保存されているか確認

UserDefaults のデータを確認：

```bash
# シミュレータのドキュメント フォルダを確認
open ~/Library/Developer/CoreSimulator/Devices/[DEVICE_ID]/data/Containers/Data/Application/[APP_ID]/
```

---

## 📱 実機テスト（オプション）

実際の iPhone でテストするには：

1. **Apple Developer アカウント**（無料版可）が必要
2. Xcode に Apple ID を登録
3. iPhone を Mac に接続
4. シミュレータ選択で `iPhone` デバイスを選択
5. **Product** → **Run**

---

## 次のステップ

実行確認後：
- ✅ 日々のチェックイン機能をテスト
- ✅ 連続日数が正しくカウントされるか確認
- ✅ 祝い画面のアニメーションを確認
- ✅ 履歴画面でカレンダーが表示されるか確認

---

## 参考リンク

- [Apple Developer - Xcode ドキュメント](https://developer.apple.com/documentation/xcode)
- [iOS Simulator ガイド](https://developer.apple.com/documentation/xcode/running-your-app-in-the-simulator)
- [SwiftUI チュートリアル](https://developer.apple.com/tutorials/SwiftUI)
