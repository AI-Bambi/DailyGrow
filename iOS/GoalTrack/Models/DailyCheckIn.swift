import Foundation

/// 毎日のチェックイン記録
struct DailyCheckIn: Identifiable, Codable {
    let id: UUID
    let date: Date
    var isCompleted: Bool
    
    init(date: Date, isCompleted: Bool = false) {
        self.id = UUID()
        self.date = date
        self.isCompleted = isCompleted
    }
}

/// ストリーク（連続日数）の記録
struct StreakRecord: Identifiable, Codable {
    let id: UUID
    let startDate: Date
    var endDate: Date?
    var longestStreak: Int
    
    init(startDate: Date) {
        self.id = UUID()
        self.startDate = startDate
        self.endDate = nil
        self.longestStreak = 0
    }
}
