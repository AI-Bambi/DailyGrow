import Foundation
import SwiftUI

/// ゴール管理ビューモデル
class GoalViewModel: ObservableObject {
    @Published var dataManager: DataManager
    @Published var showCelebration: Bool = false
    
    init() {
        self.dataManager = DataManager()
    }
    
    /// チェックインを実行
    func performCheckIn() {
        dataManager.checkInToday()
        showCelebration = true
        
        // 3秒後に祝い画面を消す
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
            self.showCelebration = false
        }
    }
    
    /// 本日チェック済みかどうか
    func isTodayCheckedIn() -> Bool {
        let today = Calendar.current.startOfDay(for: Date())
        return dataManager.checkInHistory.contains { checkIn in
            Calendar.current.isDate(checkIn.date, inSameDayAs: today) && checkIn.isCompleted
        }
    }
    
    /// 次のマイルストーンまでの日数
    func daysUntilNextMilestone() -> Int {
        let nextMilestone: Int
        
        switch dataManager.currentStreak {
        case 0...2:
            nextMilestone = 3
        case 3...6:
            nextMilestone = 7
        case 7...29:
            nextMilestone = 30
        case 30...99:
            nextMilestone = 100
        default:
            return 0
        }
        
        return max(0, nextMilestone - dataManager.currentStreak)
    }
}
