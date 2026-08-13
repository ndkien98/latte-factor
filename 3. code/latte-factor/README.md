# Lỗ Thủng Ví (Latte Factor Detector) — AI Trợ Lý Chi Tiêu Cá Nhân

Ứng dụng web serverless 100% Client-side giúp người dùng phát hiện & kiểm soát thói quen chi tiêu linh tinh (Latte Factor) bằng 6 thuật toán Machine Learning & Toán học tài chính.

---

## 📖 Mục lục

- [Tổng quan & Điểm nổi bật](#-tổng-quan--điểm-nổi-bật)
- [Kiến trúc Mã nguồn (Source Code Overview)](#-kiến-trúc-mã-nguồn-source-code-overview)
- [6 Thuật toán Nòng cốt](#-6-thuật-toán-nòng-cốt)
- [Hướng dẫn Cài đặt & Khởi chạy (Getting Started)](#-hướng-dẫn-cài-đặt--khởi-chạy-getting-started)
- [Kiểm thử Tự động (Automated Testing)](#-kiểm-thử-tự-động-automated-testing)
- [Đóng góp & Giấy phép](#-đóng-góp--giấy-phép)

---

## 🌟 Tổng quan & Điểm nổi bật

- **100% Serverless & Client-Side**: Toàn bộ dữ liệu xử lý trực tiếp trên trình duyệt, đảm bảo quyền riêng tư tuyệt đối cho dữ liệu tài chính cá nhân.
- **6 Thuật toán tích hợp**: K-Means, Naive Bayes (NLP), Linear Regression, Future Value of Annuity, 0/1 Knapsack (DP), Apriori Rules.
- **Trợ lý AI với Online Learning**: Chatbot hiểu tiếng Việt tự nhiên, tự học và cập nhật trọng số khi người dùng phản hồi phân loại.
- **Giao diện Glassmorphism Dark Mode**: Thiết kế chuẩn người dùng chuyên nghiệp với hệ thống SVG Icon tùy biến, responsive và micro-animations.
- **Xuất Báo cáo Excel 8 Sheet**: Định dạng màu sắc, phân trang và format tiền tệ VNĐ chuẩn xác bằng `exceljs`.

---

## 📁 Kiến trúc Mã nguồn (Source Code Overview)

Cấu trúc thư mục mã nguồn trong `src/`:

```
src/
├── algorithms/                 # Thuật toán Machine Learning & Toán học
│   ├── kmeans.ts               # K-Means Clustering với K-Means++ init & auto-labeling
│   ├── naiveBayes.ts            # Naive Bayes Classifier với Laplace smoothing & Online Learning
│   ├── linearRegression.ts     # Linear Regression với closed-form MSE & R² evaluation
│   ├── futureValue.ts          # Future Value of Annuity & dự báo tính lũy tiền gửi
│   ├── knapsack.ts             # 0/1 Knapsack quy hoạch động 1D rolling array
│   ├── apriori.ts              # Apriori Association Rules mining & trigger notification
│   └── __tests__/              # Unit test suite toàn bộ thuật toán (Vitest)
│       └── algorithms.test.ts
├── nlp/                        # Xử lý Ngôn ngữ Tự nhiên tiếng Việt
│   ├── normalizeVi.ts          # Chuẩn hóa chuỗi tiếng Việt, bỏ dấu thanh, tách từ
│   ├── stopwordsVi.ts         # Danh sách từ dừng tiếng Việt (Vietnamese stopwords)
│   └── intentDetector.ts       # Nhận diện ý định hội thoại (Rule-based Intent)
├── store/                      # State Management (Zustand Persistent Stores)
│   ├── transactionStore.ts     # Quản lý trạng thái giao dịch & danh mục (CRUD)
│   ├── algorithmParamsStore.ts # Quản lý tham số tùy chỉnh cho 6 thuật toán
│   └── chatStore.ts            # Lưu vết nhật ký trò chuyện trợ lý AI
├── components/                 # UI Components
│   ├── common/
│   │   └── Icons.tsx           # Bộ SVG icon chuẩn hóa chuyên nghiệp
│   ├── layout/
│   │   └── Sidebar.tsx         # Thanh điều hướng sidebar
│   └── dashboard/              # 7 Tab hiển thị phân tích chuyên sâu
│       ├── OverviewTab.tsx     # Tab Tổng quan & Thống kê cơ cấu chi tiêu
│       ├── ClusterTab.tsx      # Tab Scatter chart Phân cụm K-Means
│       ├── TrendTab.tsx        # Tab Line chart Xu hướng Hồi quy tuyến tính
│       ├── FutureValueTab.tsx  # Tab Area chart Tích lũy tài sản tương lai
│       ├── BudgetTab.tsx       # Tab Tối ưu ngân sách Knapsack
│       ├── AlertsTab.tsx       # Tab Cảnh báo hành vi Apriori & Web Push
│       └── ChatHistoryTab.tsx  # Tab Lịch sử hội thoại Chatbot
├── services/                   # Dịch vụ hệ thống
│   ├── exportExcel.ts          # Xuất báo cáo Excel 8 Sheet bằng exceljs & file-saver
│   └── notification.ts         # Quản lý Web Push Notification API
├── pages/                      # Màn hình chính ứng dụng
│   ├── DashboardPage.tsx       # Trang trung tâm điều khiển Dashboard
│   ├── InputPage.tsx           # Trang Nhập liệu thủ công, Import CSV/Excel sao kê
│   ├── ChatbotPage.tsx         # Trang Trợ lý AI hội thoại tiếng Việt
│   └── SettingsPage.tsx        # Trang Cấu hình tham số thuật toán linh hoạt
├── types/                      # TypeScript Interface definitions dùng chung
│   └── index.ts
├── index.css                   # Design system, CSS variables & Glassmorphic theme
├── App.tsx                     # Container ứng dụng & routing màn hình
└── main.tsx                    # Entry point React
```

---

## 🧠 6 Thuật toán Nòng cốt

### 1. K-Means Clustering (`src/algorithms/kmeans.ts`)
- **Đầu vào**: Tập giao dịch với $X_i = (\text{Số tiền } x_1, \text{Tần suất } x_2, \text{Giờ giao dịch } x_3)$.
- **Phương pháp**: Min-max normalization tránh lệch thang đo, khoảng cách Euclid $d(X_i, C_j)$, khởi tạo tâm cụm K-Means++.
- **Gắn nhãn tự động**: Cụm có số tiền nhỏ và tần suất lặp lại cao được gắn nhãn `"Cụm Latte Factor"`.

### 2. Naive Bayes NLP (`src/algorithms/naiveBayes.ts`)
- **Đầu vào**: Chuỗi nội dung chuyển khoản tiếng Việt (đã qua Tokenizer & Stopwords filter).
- **Phương pháp**: Định lý Bayes với Laplace Smoothing $P(w_i|C) = \frac{\text{count}(w_i, C) + 1}{\text{totalWords}(C) + |V| + 1}$.
- **Online Learning**: Phương thức `updateWithExample` cho phép học trực tiếp từ phản hồi của người dùng mà không cần huấn luyện lại từ đầu.

### 3. Linear Regression (`src/algorithms/linearRegression.ts`)
- **Phương trình**: $\hat{y} = w_0 + w_1 x$ với $x$ là số ngày kể từ mốc thời gian bắt đầu.
- **Tối ưu**: Closed-form solution cực tiểu hóa Mean Squared Error (MSE), tự động tính hệ số xác định $R^2$ score và sinh đường dự báo 30-180 ngày.

### 4. Future Value of Annuity (`src/algorithms/futureValue.ts`)
- **Công thức**: $FV = C \times \left[ \frac{(1+r)^n - 1}{r} \right]$
- **Ứng dụng**: Ước tính tổng tiền thu được (gốc + lãi kép) nếu gửi tiết kiệm định kỳ $C$ VNĐ/tháng với lãi suất $r$ trong $n$ kỳ hạn.

### 5. 0/1 Knapsack DP (`src/algorithms/knapsack.ts`)
- **Bài toán**: Maximizing $\sum v_i x_i$ thỏa mãn ràng buộc $\sum w_i x_i \le W$.
- **Giải thuật**: Quy hoạch động mảng 1D rolling array tối ưu bộ nhớ, tự động đệ quy truy vết danh mục chi tiêu được chọn.

### 6. Apriori Association Rules (`src/algorithms/apriori.ts`)
- **Chỉ số**:
  - $\text{Support}(A \rightarrow B) = \frac{P(A \cap B)}{N}$
  - $\text{Confidence}(A \rightarrow B) = \frac{\text{Support}(A \rightarrow B)}{\text{Support}(A)}$
  - $\text{Lift}(A \rightarrow B) = \frac{\text{Confidence}(A \rightarrow B)}{\text{Support}(B)}$
- **Ứng dụng**: Nhận diện ngòi nổ hành vi (VD: Chiều Thứ 6 $\rightarrow$ Mua trà sữa) và tự động phát Web Push Notification cảnh báo.

---

## 🛠 Hướng dẫn Cài đặt & Khởi chạy (Getting Started)

### Yêu cầu tiên quyết
- Node.js version 18.0 trở lên
- npm version 9.0 trở lên

### Các bước khởi chạy local

1. **Di chuyển vào thư mục code:**
   ```bash
   cd "D:\person_work\latte-factor\3. code\latte-factor"
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Khởi chạy môi trường phát triển (Dev Server):**
   ```bash
   npm run dev
   ```
   Mở trình duyệt truy cập: `http://localhost:5173/`

4. **Đóng gói ứng dụng cho Production:**
   ```bash
   npm run build
   ```
   Sản phẩm đầu ra được đóng gói tối ưu tại thư mục `dist/`.

---

## 🧪 Kiểm thử Tự động (Automated Testing)

Dự án sử dụng **Vitest** để kiểm thử tự động toàn bộ 6 thuật toán và module NLP.

### Chạy test suite:
```bash
npm run test
```

### Chạy test đo độ phủ mã nguồn (Coverage):
```bash
npm run test:coverage
```

**Kết quả kiểm thử:**
- 9/9 Test cases **PASS** 100%.
- Độ phủ code các module thuật toán đạt trên 85%.

---

## 🌐 Triển khai (Deployment)

Dự án sử dụng **Firebase Hosting** để lưu trữ ứng dụng web tĩnh với hiệu năng cao và độ bảo mật tốt.

### 1. Triển khai bằng Script tự động (Một click chuột)
Để biên dịch và cập nhật trang web nhanh chóng, bạn chỉ cần nhấp đúp vào tệp tin **[deploy.bat](file:///d:/person_work/latte-factor/deploy.bat)** ở thư mục gốc của repository.

### 2. Triển khai thủ công từ dòng lệnh
Nếu bạn muốn tự chạy các lệnh bằng tay từ terminal, hãy làm theo hướng dẫn dưới đây:

**Bước A: Đăng nhập Firebase (chỉ làm lần đầu tiên)**
```bash
npx firebase-tools login
```

**Bước B: Chạy build và deploy**
```bash
# Di chuyển vào thư mục code (nếu chưa ở đây)
cd "3. code/latte-factor"

# Chạy deploy tự động
npm run deploy
```

*Địa chỉ trang web sau khi deploy thành công:* [https://late-factor.web.app](https://late-factor.web.app)

---

## 📝 Giấy phép

Dự án phát triển phục vụ mục đích nghiên cứu KHKT và quản lý tài chính cá nhân.

