import SwiftUI

struct ContentView: View {
    @StateObject var viewModel = GoalViewModel()
    
    var body: some View {
        NavigationView {
            TabView {
                // ホーム画面
                HomeView(viewModel: viewModel)
                    .tabItem {
                        Label("ホーム", systemImage: "house.fill")
                    }
                
                // 履歴画面
                HistoryView(dataManager: viewModel.dataManager)
                    .tabItem {
                        Label("履歴", systemImage: "calendar")
                    }
            }
        }
    }
}

/// 履歴画面
struct HistoryView: View {
    @ObservedObject var dataManager: DataManager
    
    var body: some View {
        NavigationView {
            VStack {
                // カレンダーヘッダー
                VStack(spacing: 16) {
                    Text("チェックイン履歴")
                        .font(.system(size: 24, weight: .bold))
                    
                    HStack(spacing: 12) {
                        VStack(spacing: 4) {
                            Text("連続日数")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.gray)
                            Text("\(dataManager.currentStreak)日")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.blue)
                        }
                        
                        Divider()
                        
                        VStack(spacing: 4) {
                            Text("最高記録")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.gray)
                            Text("\(dataManager.longestStreak)日")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.purple)
                        }
                        
                        Divider()
                        
                        VStack(spacing: 4) {
                            Text("合計")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.gray)
                            Text("\(dataManager.checkInHistory.filter { $0.isCompleted }.count)回")
                                .font(.system(size: 20, weight: .bold))
                                .foregroundColor(.green)
                        }
                    }
                    .padding(16)
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }
                .padding(16)
                
                // チェックイン一覧
                ScrollView {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 50))], spacing: 8) {
                        ForEach(getLast30Days(), id: \.self) { date in
                            let isCompleted = dataManager.checkInHistory.contains { checkIn in
                                Calendar.current.isDate(checkIn.date, inSameDayAs: date) && checkIn.isCompleted
                            }
                            
                            VStack {
                                Text("\(Calendar.current.component(.day, from: date))")
                                    .font(.system(size: 10, weight: .bold))
                                
                                Image(systemName: isCompleted ? "checkmark.circle.fill" : "circle")
                                    .font(.system(size: 16))
                                    .foregroundColor(isCompleted ? .green : .gray)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(8)
                            .background(isCompleted ? Color.green.opacity(0.1) : Color(.systemGray6))
                            .cornerRadius(8)
                        }
                    }
                    .padding(16)
                }
                
                Spacer()
            }
            .navigationTitle("履歴")
        }
    }
    
    private func getLast30Days() -> [Date] {
        var dates: [Date] = []
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        
        for i in (0..<30).reversed() {
            if let date = calendar.date(byAdding: .day, value: -i, to: today) {
                dates.append(date)
            }
        }
        
        return dates
    }
}

#Preview {
    ContentView()
}
