import Foundation

/// データ管理クラス
class DataManager: ObservableObject {
    @Published var checkInHistory: [DailyCheckIn] = []
    @Published var currentStreak: Int = 0
    @Published var longestStreak: Int = 0
    
    private let checkInKey = "checkInHistory"
    private let streakKey = "currentStreak"
    private let longestStreakKey = "longestStreak"
    
    init() {
        loadData()
    }
    
    /// 本日のチェックイン記録を追加または更新
    func checkInToday() {
        let today = Calendar.current.startOfDay(for: Date())
        
        // 本日の記録がすでにあるかチェック
        if let index = checkInHistory.firstIndex(where: { Calendar.current.isDate($0.date, inSameDayAs: today) }) {
            checkInHistory[index].isCompleted = true
        } else {
            checkInHistory.append(DailyCheckIn(date: today, isCompleted: true))
        }
        
        updateStreak()
        saveData()
    }
    
    /// ストリークを更新
    private func updateStreak() {
        let today = Calendar.current.startOfDay(for: Date())
        var streak = 0
        
        // 今日から遡って連続したチェックインをカウント
        var checkDate = today
        
        while true {
            if checkInHistory.contains(where: { Calendar.current.isDate($0.date, inSameDayAs: checkDate) && $0.isCompleted }) {
                streak += 1
                checkDate = Calendar.current.date(byAdding: .day, value: -1, to: checkDate) ?? checkDate
            } else {
                break
            }
        }
        
        currentStreak = streak
        
        if streak > longestStreak {
            longestStreak = streak
        }
    }
    
    /// 褒賞レベルを取得
    func getRewardLevel() -> RewardLevel {
        switch currentStreak {
        case 0:
            return .none
        case 1...2:
            return .basic
        case 3...6:
            return .good
        case 7...29:
            return .great
        case 30...99:
            return .amazing
        default:
            return .legendary
        }
    }
    
    /// 褒賞メッセージを取得
    func getRewardMessage() -> String {
        let level = getRewardLevel()
        
        switch level {
        case .none:
            return "今日も頑張ろう！💪"
        case .basic:
            return "いい調子だね！\(currentStreak)日継続中🎯"
        case .good:
            return "素晴らしい！\(currentStreak)日も続いている！✨"
        case .great:
            return "最高だ！\(currentStreak)日の連続達成おめでとう！🎉"
        case .amazing:
            return "凄い！\(currentStreak)日間もやり続けている！これぞ本当の習慣！🌟"
        case .legendary:
            return "伝説級の継続力！\(currentStreak)日間達成！あなたは本当に素晴らしい！👑"
        }
    }
    
    /// データを保存
    private func saveData() {
        if let encoded = try? JSONEncoder().encode(checkInHistory) {
            UserDefaults.standard.set(encoded, forKey: checkInKey)
        }
        UserDefaults.standard.set(currentStreak, forKey: streakKey)
        UserDefaults.standard.set(longestStreak, forKey: longestStreakKey)
    }
    
    /// データを読み込み
    private func loadData() {
        if let data = UserDefaults.standard.data(forKey: checkInKey),
           let decoded = try? JSONDecoder().decode([DailyCheckIn].self, from: data) {
            checkInHistory = decoded
        }
        currentStreak = UserDefaults.standard.integer(forKey: streakKey)
        longestStreak = UserDefaults.standard.integer(forKey: longestStreakKey)
    }
}

enum RewardLevel {
    case none
    case basic
    case good
    case great
    case amazing
    case legendary
}
