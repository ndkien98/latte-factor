# KHO TRI THỨC AGENT: CONTEXT VÀ KIẾN TRÚC DỰ ÁN "LỖ THỦNG VÍ"

> **Dự án:** Latte Factor Detector — AI Trợ Lý Chi Tiêu Cá Nhân (KHKT)  
> **Repository Root:** `D:\person_work\latte-factor\`  
> **Source Code:** `D:\person_work\latte-factor\3. code\latte-factor\`

---

## 1. Tổng quan Dự án

Ứng dụng giúp người dùng cá nhân phát hiện và kiểm soát thói quen chi tiêu nhỏ lặp lại hàng ngày ("Lỗ Thủng Ví" / Latte Factor) như trà sữa, ăn vặt, mua sắm bốc đồng.

Ứng dụng được thiết kế **100% Client-side (Serverless)**, tự thực thi 6 thuật toán Machine Learning / Toán học thuần TypeScript, không cần server Python hay backend đắt đỏ.

---

## 2. 6 Thuật toán Nòng cốt

| # | Thuật toán | Vị trí File | Mục đích & Đặc tả Toán học |
|---|---|---|---|
| 1 | **K-Means Clustering** | `src/algorithms/kmeans.ts` | Gom nhóm giao dịch theo (Số tiền x₁, Tần suất x₂, Giờ x₃) bằng khoảng cách Euclid min-max normalized. Tự động dán nhãn cụm tiền nhỏ + tần suất cao là "Latte Factor". |
| 2 | **Naive Bayes (NLP)** | `src/algorithms/naiveBayes.ts` | Phân loại nội dung chuyển khoản → "Thiết yếu" vs "Linh tinh" dùng Laplace smoothing và Online Learning (cập nhật xác suất từ phản hồi user). |
| 3 | **Linear Regression** | `src/algorithms/linearRegression.ts` | Dự báo xu hướng tốn tiền ŷ = w₀ + w₁x (closed-form MSE minimization), tính R² score và dự báo 30-180 ngày. |
| 4 | **Future Value of Annuity** | `src/algorithms/futureValue.ts` | Tính số tiền tích lũy tương lai FV = C × [(1+r)ⁿ - 1] / r nếu dừng thói quen chi tiêu linh tinh và gửi tiết kiệm ngân hàng. |
| 5 | **0/1 Knapsack (DP)** | `src/algorithms/knapsack.ts` | Quy hoạch động bảng 1D tối ưu hóa danh mục chi tiêu trong ngân sách cố định W để đạt tổng độ thỏa mãn cao nhất. |
| 6 | **Apriori Association Rules** | `src/algorithms/apriori.ts` | Tìm luật kết hợp hành vi (VD: Thứ 6 15h → Mua trà sữa) qua Support, Confidence, Lift. Tích hợp Web Push Notifications. |

---

## 3. Cấu trúc Mã nguồn (`3. code/latte-factor`)

```
src/
├── algorithms/                 # 6 Thuật toán ML thuần TypeScript
│   ├── kmeans.ts
│   ├── naiveBayes.ts
│   ├── linearRegression.ts
│   ├── futureValue.ts
│   ├── knapsack.ts
│   ├── apriori.ts
│   └── __tests__/              # Vitest Unit test suite (100% Pass)
├── nlp/                        # NLP Tiếng Việt
│   ├── tokenizeVi.ts           # Tokenizer + Chuẩn hóa dấu + Trích xuất tiền/thời gian
│   ├── stopwordsVi.ts          # Từ dừng tiếng Việt
│   └── intentDetector.ts       # Nhận diện ý định hội thoại (Rule-based)
├── store/                      # Zustand State Management + Persistence
│   ├── transactionStore.ts     # Giao dịch + Danh mục CRUD
│   ├── algorithmParamsStore.ts # Cấu hình tham số 6 thuật toán
│   └── chatStore.ts            # Lịch sử hội thoại chatbot
├── components/
│   ├── layout/Sidebar.tsx
│   └── dashboard/              # 7 Tab Dashboard
│       ├── OverviewTab.tsx
│       ├── ClusterTab.tsx
│       ├── TrendTab.tsx
│       ├── FutureValueTab.tsx
│       ├── BudgetTab.tsx
│       ├── AlertsTab.tsx
│       └── ChatHistoryTab.tsx
├── services/
│   ├── exportExcel.ts          # Xuất báo cáo .xlsx 8 sheet (exceljs)
│   └── notification.ts         # Web Push Notification API
├── pages/
│   ├── DashboardPage.tsx
│   ├── InputPage.tsx
│   ├── ChatbotPage.tsx
│   └── SettingsPage.tsx
├── types/index.ts              # TypeScript interfaces dùng chung
├── index.css                   # Glassmorphic Dark UI design system
├── App.tsx                     # Main App container & Routing
└── main.tsx                    # Entry point
```

---

## 4. Cách Khởi động & Kiểm thử

- **Cài đặt:** `cd 3. code/latte-factor && npm install`
- **Chạy môi trường Dev:** `npm run dev`
- **Chạy Test suite:** `npm run test`
- **Build sản phẩm:** `npm run build`
