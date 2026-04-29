import SwiftUI

/// ホーム画面
struct HomeView: View {
    @StateObject var viewModel: GoalViewModel
    
    var body: some View {
        ZStack {
            // メインコンテンツ
            VStack(spacing: 40) {
                // ヘッダー
                VStack(spacing: 8) {
                    Text("Goal Track")
                        .font(.system(size: 32, weight: .bold))
                        .foregroundColor(.blue)
                    Text("習慣を作ろう")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.gray)
                }
                .padding(.top, 40)
                
                Spacer()
                
                // 連続日数表示
                VStack(spacing: 20) {
                    Text("現在の連続日数")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.gray)
                    
                    Text("\(viewModel.dataManager.currentStreak)")
                        .font(.system(size: 80, weight: .bold))
                        .foregroundColor(.blue)
                    
                    Text("日")
                        .font(.system(size: 24, weight: .medium))
                        .foregroundColor(.gray)
                }
                .padding(40)
                .background(Color(.systemGray6))
                .cornerRadius(20)
                
                // マイルストーン表示
                VStack(spacing: 8) {
                    HStack {
                        Text("次のマイルストーン")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.gray)
                        
                        Spacer()
                        
                        Text("あと\(viewModel.daysUntilNextMilestone())日")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.orange)
                    }
                    
                    ProgressView(value: Double(viewModel.dataManager.currentStreak), total: Double(getNextMilestone(viewModel.dataManager.currentStreak)))
                        .tint(.orange)
                }
                .padding(16)
                .background(Color(.systemGray6))
                .cornerRadius(12)
                
                Spacer()
                
                // チェックインボタン
                Button(action: {
                    viewModel.performCheckIn()
                }) {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 24))
                        
                        Text(viewModel.isTodayCheckedIn() ? "今日のチェック完了！" : "今日のチェックイン")
                            .font(.system(size: 18, weight: .bold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(20)
                    .background(viewModel.isTodayCheckedIn() ? Color.green : Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .disabled(viewModel.isTodayCheckedIn())
                
                // 統計情報
                VStack(spacing: 12) {
                    HStack {
                        Text("最高記録")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.gray)
                        
                        Spacer()
                        
                        Text("\(viewModel.dataManager.longestStreak)日")
                            .font(.system(size: 14, weight: .bold))
                    }
                    
                    Divider()
                    
                    HStack {
                        Text("チェック回数")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.gray)
                        
                        Spacer()
                        
                        Text("\(viewModel.dataManager.checkInHistory.filter { $0.isCompleted }.count)回")
                            .font(.system(size: 14, weight: .bold))
                    }
                }
                .padding(16)
                .background(Color(.systemGray6))
                .cornerRadius(12)
                
                Spacer()
            }
            .padding(20)
            
            // 祝い画面
            if viewModel.showCelebration {
                CelebrationView(
                    message: viewModel.dataManager.getRewardMessage(),
                    level: viewModel.dataManager.getRewardLevel(),
                    streak: viewModel.dataManager.currentStreak
                )
                .transition(.scale.combined(with: .opacity))
            }
        }
    }
}

/// 祝い画面
struct CelebrationView: View {
    let message: String
    let level: RewardLevel
    let streak: Int
    
    var body: some View {
        VStack(spacing: 20) {
            Text(getEmoji(level))
                .font(.system(size: 80))
            
            Text(message)
                .font(.system(size: 24, weight: .bold))
                .multilineTextAlignment(.center)
                .foregroundColor(.white)
            
            if streak > 0 {
                Text("素晴らしい継続力です！")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
            }
        }
        .frame(maxWidth: .infinity)
        .padding(40)
        .background(getBackgroundColor(level))
        .cornerRadius(20)
        .padding(20)
    }
    
    private func getEmoji(_ level: RewardLevel) -> String {
        switch level {
        case .none: return "💭"
        case .basic: return "😊"
        case .good: return "✨"
        case .great: return "🎉"
        case .amazing: return "🌟"
        case .legendary: return "👑"
        }
    }
    
    private func getBackgroundColor(_ level: RewardLevel) -> Color {
        switch level {
        case .none: return Color.blue.opacity(0.7)
        case .basic: return Color.blue.opacity(0.7)
        case .good: return Color.green.opacity(0.7)
        case .great: return Color.orange.opacity(0.7)
        case .amazing: return Color.purple.opacity(0.7)
        case .legendary: return Color.red.opacity(0.7)
        }
    }
}

/// 次のマイルストーンを計算
private func getNextMilestone(_ current: Int) -> Int {
    switch current {
    case 0...2:
        return 3
    case 3...6:
        return 7
    case 7...29:
        return 30
    case 30...99:
        return 100
    default:
        return current + 1
    }
}

#Preview {
    HomeView(viewModel: GoalViewModel())
}
