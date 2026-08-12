# PLAN TRIỂN KHAI: "LỖ THỦNG VÍ" — AI Trợ Lý Chi Tiêu Cá Nhân

### (Latte Factor Detector — dự án KHKT)

File này được viết để đưa cho **Antigravity** (AI coding agent) làm kim chỉ nam triển khai từ đầu đến cuối. Antigravity nên đọc toàn bộ file này trước khi bắt tay vào code, và bám theo đúng thứ tự 6 giai đoạn bên dưới, tạo commit/checklist riêng cho mỗi giai đoạn.

---

## 0. Tóm tắt bài toán (đọc từ yêu cầu gốc)

Ứng dụng giúp người dùng phát hiện & kiểm soát "chi tiêu linh tinh" (trà sữa, ăn vặt...) bằng 5 kỹ thuật:

| #   | Kỹ thuật                    | Vai trò trong app                                                                               |
| --- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| 1   | K-Means Clustering          | Gom nhóm giao dịch theo (số tiền, tần suất/tháng, giờ giao dịch) → tự tìm ra "cụm Latte Factor" |
| 2   | Naive Bayes (NLP)           | Phân loại nội dung chuyển khoản → "Thiết yếu" vs "Linh tinh"                                    |
| 3   | Linear Regression           | Dự đoán xu hướng tốn tiền theo thời gian nếu không đổi thói quen                                |
| 4   | Future Value of Annuity     | Tính số tiền tích lũy được nếu bỏ thói quen & gửi tiết kiệm                                     |
| 5   | 0/1 Knapsack (DP)           | Gợi ý chi tiêu tối ưu trong ngân sách "ăn chơi" cố định                                         |
| 6   | Apriori (Association Rules) | Tìm "ngòi nổ" hành vi (VD: 15h thứ Sáu → mua trà sữa) → push notification cảnh báo              |

**Đầu vào dữ liệu:** file Excel/CSV lịch sử giao dịch, hoặc nội dung SMS/chuyển khoản dạng text.
**Đầu ra:** dashboard trực quan + thông báo hành vi + gợi ý ngân sách tối ưu.

---

## 1. Đề xuất công nghệ (ưu tiên đơn giản, deploy free trên GitHub/Firebase)

Vì quy mô dữ liệu là **cá nhân** (vài trăm–vài nghìn giao dịch), không cần backend ML nặng. Đề xuất **toàn bộ chạy client-side (serverless)**, giúp deploy cực đơn giản chỉ bằng static hosting.

| Lớp                     | Công nghệ                                                                                                                                                                                                                                                                | Lý do                                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Frontend framework      | **Vite + React + TypeScript**                                                                                                                                                                                                                                            | Nhẹ, build nhanh, dễ deploy static                                                                                        |
| UI / styling            | **Tailwind CSS + shadcn/ui**                                                                                                                                                                                                                                             | Dựng dashboard nhanh, đẹp                                                                                                 |
| Biểu đồ                 | **Recharts**                                                                                                                                                                                                                                                             | Vẽ cluster, xu hướng chi tiêu, dòng tiền tương lai                                                                        |
| Thuật toán ML           | **TypeScript thuần** (tự viết K-Means, Naive Bayes, Linear Regression, Knapsack DP, Apriori) — dùng thư viện `ml-kmeans`, `natural`/`compromise` (NLP tiếng Việt cơ bản) nếu cần                                                                                         | Dữ liệu nhỏ, không cần Python/TensorFlow; tránh phải dựng server                                                          |
| Import dữ liệu          | `papaparse` (CSV) + `xlsx` (SheetJS) đọc file Excel/CSV người dùng tải lên                                                                                                                                                                                               | Đáp ứng "quét file Excel/CSV lịch sử chi tiêu"                                                                            |
| Lưu trữ                 | **Firebase Firestore** (free tier) hoặc **IndexedDB** cục bộ nếu muốn 100% offline                                                                                                                                                                                       | Firestore cho phép đồng bộ nhiều thiết bị; IndexedDB đơn giản hơn cho bản demo KHKT                                       |
| Notification            | **Firebase Cloud Messaging** (web push)                                                                                                                                                                                                                                  | Đáp ứng yêu cầu push notification 14h45 thứ Sáu                                                                           |
| Testing                 | **Vitest** (unit test cho từng thuật toán)                                                                                                                                                                                                                               | Nhẹ, tích hợp sẵn với Vite                                                                                                |
| CI/CD                   | **GitHub Actions**                                                                                                                                                                                                                                                       | Tự động test + build + deploy                                                                                             |
| Hosting                 | **GitHub Pages** (bản demo tĩnh, không cần Firestore) hoặc **Firebase Hosting** (nếu dùng Firestore/FCM)                                                                                                                                                                 | Cả hai đều free, phù hợp yêu cầu "github hoặc filebase"                                                                   |
| State/Config management | **Zustand** (global store cho tham số thuật toán)                                                                                                                                                                                                                        | Khi user đổi param ở màn Config, mọi component dashboard subscribe store và tự re-render/recompute ngay, không cần reload |
| Xử lý tiếng Việt (NLP)  | `wink-nlp` hoặc `compromise` cho tokenize/stopword cơ bản; **`vietnamese-stopwords`** (npm) cho danh sách từ dừng tiếng Việt; tự viết bộ chuẩn hóa dấu (loại dấu, lowercase)                                                                                             | Naive Bayes cần tách từ + bỏ dấu câu + stopword tiếng Việt để phân loại nội dung chuyển khoản chính xác hơn               |
| Chatbot input           | UI chat tự viết bằng React (không cần LLM ngoài) — chatbot chỉ đóng vai "giao diện nhập liệu hội thoại", mọi câu trả lời sinh ra từ chính kết quả Naive Bayes + rule-based intent (regex/keyword) để nhận diện ý định ("thêm giao dịch", "hỏi báo cáo", "đổi ngân sách") | Giữ đơn giản, không phụ thuộc API LLM trả phí, vẫn chạy 100% client-side                                                  |
| Export Excel            | **`xlsx` (SheetJS) write mode** hoặc **`exceljs`** (định dạng đẹp hơn: màu, border, nhiều sheet)                                                                                                                                                                         | Xuất toàn bộ báo cáo dashboard + lịch sử chat ra 1 file `.xlsx` nhiều sheet                                               |

> Nếu về sau muốn nâng cấp Naive Bayes/NLP tiếng Việt cho chính xác hơn, có thể tách một Python microservice (FastAPI + scikit-learn + underthesea) triển khai trên Render/Railway free tier — nhưng **không bắt buộc cho bản MVP**.

---

## 2. Cấu trúc thư mục đề xuất

```
latte-factor/
├── .github/workflows/ci.yml          # test + build + deploy
├── docs/
│   ├── ALGORITHMS.md                 # giải thích toán học từng thuật toán
│   ├── DATA_SCHEMA.md                # schema giao dịch
│   └── API.md
├── public/
├── src/
│   ├── algorithms/
│   │   ├── kmeans.ts
│   │   ├── naiveBayes.ts
│   │   ├── linearRegression.ts
│   │   ├── futureValue.ts
│   │   ├── knapsack.ts
│   │   └── apriori.ts
│   ├── algorithms/__tests__/         # unit test song song mỗi file thuật toán
│   ├── data/
│   │   ├── importers/ (csvImporter.ts, excelImporter.ts, smsParser.ts)
│   │   └── sampleDatasets/           # dataset mẫu tải từ Hugging Face (đã tiền xử lý)
│   ├── nlp/ (tokenizeVi.ts, stopwordsVi.ts, intentDetector.ts)  # cho chatbot + Naive Bayes
│   ├── store/
│   │   ├── algorithmParamsStore.ts   # Zustand: k, minSupport, minConfidence, r, n, W...
│   │   ├── categoryStore.ts          # danh mục chi tiêu do user định nghĩa
│   │   └── transactionStore.ts
│   ├── components/
│   │   ├── dashboard/ (ClusterTab, TrendTab, BudgetTab, AlertsTab, OverviewTab)
│   │   ├── input/ (TransactionInputForm, CategoryManager)
│   │   ├── chatbot/ (ChatbotPanel, ChatMessage, ChatInputBox)
│   │   ├── config/ (ParamsConfigPanel — form cho toàn bộ tham số 6 thuật toán)
│   │   └── export/ (ExportExcelButton)
│   ├── hooks/ (useRecomputeOnParamsChange.ts)
│   ├── services/ (firebase.ts, notification.ts, exportExcel.ts)
│   ├── pages/ (DashboardPage, InputPage, ChatbotPage, SettingsPage)
│   └── main.tsx
├── package.json
├── vite.config.ts
└── README.md
```

---

## 3. Bốn màn hình CMS bắt buộc (bổ sung theo yêu cầu)

Đây là phần UI trước đó plan còn thiếu — mô tả chi tiết để Antigravity build đúng, không đoán mò.

### 3.1. Màn hình nhập liệu thủ công (Manual Input & Danh mục)

**Mục tiêu:** cho user tự nhập giao dịch bằng tay (không chỉ import file), và tự quản lý danh mục chi tiêu — không phụ thuộc hoàn toàn vào AI phân loại.

- Form nhập 1 giao dịch: `Số tiền`, `Ngày giờ`, `Nội dung/ghi chú`, `Danh mục` (dropdown), `Thiết yếu / Linh tinh` (toggle — có thể để trống để AI tự đoán).
- **CategoryManager**: CRUD danh mục do user tự định nghĩa (VD: Trà sữa, Ăn vặt, Tiền nhà, Xăng xe...), mỗi danh mục có `label`, `icon`, `nhãn mặc định` (Thiết yếu/Linh tinh) để làm dữ liệu train bổ sung cho Naive Bayes.
- Bảng danh sách giao dịch đã nhập, cho sửa/xoá.
- Component: `TransactionInputForm.tsx`, `CategoryManager.tsx` → lưu vào `transactionStore` / `categoryStore` (đồng bộ Firestore nếu bật).

### 3.2. Chatbot nhập liệu bằng tiếng Việt (Naive Bayes + NLP)

**Mục tiêu:** user gõ tự nhiên kiểu "hôm nay mua trà sữa 35k lúc 3h chiều" → chatbot tự parse thành giao dịch có cấu trúc + tự phân loại.

- Pipeline xử lý câu nhập:
  1. `tokenizeVi()` — chuẩn hóa, tách từ, bỏ stopword tiếng Việt.
  2. **Trích số tiền & thời gian** bằng regex (nhận diện `35k`, `35.000đ`, `lúc 3h`, `hôm qua`...).
  3. **Intent detector** (rule-based) phân biệt: "thêm giao dịch" / "hỏi báo cáo" ("tháng này tốn bao nhiêu tiền trà sữa?") / "đổi ngân sách" ("đặt ngân sách ăn vặt 500k").
  4. Nếu là "thêm giao dịch" → phần nội dung còn lại đưa qua `naiveBayes.predict(text)` để gắn danh mục + nhãn Thiết yếu/Linh tinh.
  5. Chatbot phản hồi xác nhận: _"Đã ghi nhận: Trà sữa – 35.000đ – 15:00 hôm nay (phân loại: Linh tinh, độ tin cậy 87%)"_, có nút Sửa nếu phân loại sai (dùng để **online-learning**: cập nhật lại Naive Bayes với nhãn đúng do user chỉnh).
  6. Nếu là "hỏi báo cáo" → chatbot truy vấn `transactionStore` + kết quả các thuật toán, trả lời bằng text (không gọi LLM ngoài, chỉ template hoá kết quả tính toán).
- Component: `ChatbotPanel.tsx`, `ChatMessage.tsx`, `ChatInputBox.tsx`; logic ở `nlp/intentDetector.ts`.
- Vì không dùng LLM ngoài, độ "thông minh" chatbot giới hạn ở rule-based + Naive Bayes — ghi rõ trong docs để không kỳ vọng chatbot hiểu mọi câu tự do.

### 3.3. Màn hình cấu hình tham số thuật toán (Params Config Panel)

**Mục tiêu:** user chỉnh tham số → **toàn bộ dashboard recompute và render lại ngay lập tức**, không cần load lại trang.

| Thuật toán        | Tham số cho user chỉnh                                            | UI control            |
| ----------------- | ----------------------------------------------------------------- | --------------------- |
| K-Means           | `k` (số cụm), trọng số chuẩn hóa mỗi trục (amount/frequency/hour) | Slider số nguyên 2–10 |
| Naive Bayes       | Ngưỡng độ tin cậy tối thiểu để tự động gắn nhãn                   | Slider %              |
| Linear Regression | Số ngày dự báo về tương lai (`x` range)                           | Input số              |
| Future Value      | Lãi suất `r` (%/tháng), số kỳ `n` (tháng)                         | 2 input số            |
| Knapsack          | Ngân sách `W` (VNĐ/tháng)                                         | Input tiền tệ         |
| Apriori           | `minSupport`, `minConfidence`                                     | 2 slider %            |

- Toàn bộ giá trị lưu ở `algorithmParamsStore` (Zustand).
- Hook `useRecomputeOnParamsChange()`: subscribe store, mỗi khi param đổi → chạy lại đúng thuật toán liên quan (không chạy lại toàn bộ 6 thuật toán để tối ưu hiệu năng) → cập nhật state kết quả → các tab dashboard tự re-render qua props/context.
- Có nút **"Reset về mặc định"** và **"Lưu cấu hình"** (persist vào localStorage/Firestore để giữ khi user quay lại).
- Component: `ParamsConfigPanel.tsx`.

### 3.4. Dashboard nhiều tab + Export Excel toàn bộ

**Mục tiêu:** một màn hình trung tâm dạng tab, tổng hợp toàn bộ kết quả, và cho export ra file Excel — kể cả nội dung đã trao đổi trong chatbot.

- Cấu trúc tab (dùng shadcn `Tabs`):
  1. **Tổng quan** — tổng chi tiêu, % Linh tinh vs Thiết yếu, số tiền "lỗ thủng ví" ước tính tháng này.
  2. **Phân cụm (K-Means)** — scatter chart cụm giao dịch, bảng chi tiết từng cụm.
  3. **Xu hướng (Linear Regression)** — line chart chi tiêu thực tế + đường dự báo.
  4. **Tích lũy tương lai (FV Annuity)** — bảng/biểu đồ số tiền tiết kiệm được nếu bỏ thói quen theo từng mốc thời gian.
  5. **Ngân sách tối ưu (Knapsack)** — danh sách món được chọn tối ưu trong ngân sách, tổng "độ thỏa mãn".
  6. **Cảnh báo hành vi (Apriori)** — bảng luật kết hợp tìm được + lịch sử cảnh báo đã gửi.
  7. **Lịch sử Chatbot** — toàn bộ hội thoại + giao dịch được tạo qua chatbot.
- **Nút "Xuất Excel"** ở góc trên: gọi `exportExcel.ts`, xuất **1 file .xlsx nhiều sheet** tương ứng 7 tab trên (mỗi tab = 1 sheet), dùng `exceljs` để có định dạng (header tô màu, format số tiền, tự động resize cột).
- Component: `DashboardPage.tsx` chứa các `*Tab.tsx`, `ExportExcelButton.tsx`.

---

## 4. Workflow 6 giai đoạn cho Antigravity

### Giai đoạn 1 — Nghiên cứu & chốt yêu cầu

- [ ] Đọc kỹ 6 công thức toán trong tài liệu gốc, viết lại thành đặc tả kỹ thuật ngắn gọn trong `docs/ALGORITHMS.md`.
- [ ] Định nghĩa schema 1 giao dịch: `{ id, amount, timestamp, note, category?, source }`.
- [ ] Xác định input thực tế: CSV/Excel sao kê ngân hàng (cột: ngày, số tiền, nội dung CK) — ghi vào `docs/DATA_SCHEMA.md`.

### Giai đoạn 2 — Kế hoạch code & tìm dataset

- [ ] Tìm kiếm trên **Hugging Face Datasets** (`huggingface.co/datasets`) các bộ dữ liệu phù hợp để huấn luyện/kiểm thử Naive Bayes phân loại nội dung chuyển khoản tiếng Việt. Gợi ý từ khóa tìm kiếm:
  - `vietnamese banking transaction`
  - `vietnamese sms classification`
  - `vietnamese text classification expense`
  - `personal finance transaction categorization`
  - Nếu không có dataset tiếng Việt phù hợp → tự tạo dataset mẫu (synthetic) ~200-300 dòng nội dung chuyển khoản giả lập (trà sữa, ăn vặt, tiền nhà, điện nước...) gắn nhãn thủ công, lưu ở `src/data/sampleDatasets/transactions_vi.csv`.
- [ ] Viết pseudo-code chi tiết cho từng module trong `src/algorithms/` dựa đúng công thức toán đã có (Euclid distance cho K-Means, Bayes theorem, MSE cho Linear Regression, FV annuity, Bellman DP cho Knapsack, Support/Confidence cho Apriori).
- [ ] Lập danh sách interface TypeScript dùng chung (`Transaction`, `Cluster`, `BudgetItem`, `Rule`).

### Giai đoạn 3 — Triển khai code

- [ ] Cài đặt project: `npm create vite@latest latte-factor -- --template react-ts`.
- [ ] Cài Tailwind, shadcn/ui, Recharts, papaparse, xlsx/exceljs, firebase, zustand.
- [ ] Implement từng thuật toán độc lập, thuần function, không phụ thuộc UI (dễ test):
  - `kmeans(transactions, k)` → trả về clusters + tự động gắn nhãn cụm có tần suất cao/tiền nhỏ là "Latte Factor".
  - `naiveBayes.train(labeledData)` / `.predict(text)`.
  - `linearRegression(points)` → trả `{w0, w1}` + hàm dự đoán.
  - `futureValueAnnuity(C, r, n)`.
  - `knapsack01(items, W)` → trả danh sách item chọn tối ưu bằng quy hoạch động.
  - `apriori(transactions, minSupport, minConfidence)` → trả luật kết hợp.
- [ ] Xây `algorithmParamsStore` (Zustand) + `useRecomputeOnParamsChange()` — đây là xương sống để mục 3.3 hoạt động đúng "đổi param là dashboard đổi theo".
- [ ] Xây màn **Nhập liệu thủ công** (`TransactionInputForm`, `CategoryManager`) theo mục 3.1.
- [ ] Xây **Chatbot** (`ChatbotPanel` + `nlp/intentDetector.ts` + tích hợp Naive Bayes) theo mục 3.2, có luồng "sửa nhãn → học lại".
- [ ] Xây **Params Config Panel** theo mục 3.3, đủ 6 nhóm tham số trong bảng.
- [ ] Ghép **Dashboard nhiều tab** (`DashboardPage` + 7 tab) theo mục 3.4: Tổng quan / Cluster / Trend / FV / Budget / Alerts / Lịch sử Chatbot.
- [ ] Xây **Export Excel** (`ExportExcelButton` + `services/exportExcel.ts`) xuất đủ 7 sheet, kể cả lịch sử chatbot.
- [ ] Import dữ liệu: cho phép upload CSV/Excel, hoặc dán nội dung SMS để Naive Bayes phân loại on-the-fly (song song với chatbot, dùng chung `naiveBayes.predict`).

### Giai đoạn 4 — Test & kiểm thử tự động

- [ ] Viết unit test (Vitest) cho **mỗi** hàm thuật toán với ít nhất:
  - 1 test case đầu vào chuẩn (biết trước kết quả đúng, tính tay hoặc so với sklearn để đối chiếu).
  - 1 test case biên (dữ liệu rỗng, 1 điểm, trùng lặp).
  - 1 test case ngẫu nhiên lớn hơn để kiểm tra hiệu năng/độ ổn định.
- [ ] Test tích hợp: import file CSV mẫu → pipeline chạy hết 6 thuật toán → snapshot kết quả không lỗi.
- [ ] Thêm bước `npm run test -- --coverage`, mục tiêu coverage > 80% cho thư mục `algorithms/`.

### Giai đoạn 5 — Tài liệu

- [ ] `README.md`: mô tả dự án, cách chạy local (`npm install && npm run dev`), ảnh chụp dashboard.
- [ ] `docs/ALGORITHMS.md`: mỗi thuật toán 1 mục — công thức toán, input/output, độ phức tạp, vì sao chọn nó cho bài toán này (để dùng làm báo cáo KHKT).
- [ ] `docs/DATA_SCHEMA.md`: định dạng file CSV/Excel mẫu để người chấm/người dùng tự thử.
- [ ] `docs/API.md`: chữ ký hàm (function signature) từng module trong `src/algorithms/`.

### Giai đoạn 6 — Deploy

- [ ] `.github/workflows/ci.yml`: chạy `npm ci && npm run test && npm run build` trên mọi push/PR.
- [ ] Thêm job deploy:
  - **Phương án A (đơn giản nhất, không cần Firestore):** deploy static build lên **GitHub Pages** bằng `actions/deploy-pages`.
  - **Phương án B (nếu dùng Firestore/FCM):** deploy lên **Firebase Hosting** bằng `FirebaseExtended/action-hosting-deploy`, cấu hình secret `FIREBASE_TOKEN` trong GitHub repo settings.
- [ ] Viết hướng dẫn deploy thủ công (dự phòng) trong README: `firebase deploy` hoặc bật GitHub Pages trong repo settings.

---

## 5. Checklist tổng để Antigravity theo dõi tiến độ

```
[ ] G1 - docs/ALGORITHMS.md + docs/DATA_SCHEMA.md hoàn chỉnh
[ ] G2 - dataset mẫu sẵn sàng trong src/data/sampleDatasets/
[ ] G2 - interface TypeScript dùng chung định nghĩa xong
[ ] G3 - 6 module thuật toán implement xong, có type-check pass
[ ] G3 - algorithmParamsStore + useRecomputeOnParamsChange hoạt động (đổi param → recompute đúng, không cần reload)
[ ] G3 - Màn Nhập liệu thủ công + CategoryManager hoạt động (CRUD giao dịch, CRUD danh mục)
[ ] G3 - Chatbot nhập liệu tiếng Việt hoạt động: parse số tiền/thời gian, phân loại Naive Bayes, cho sửa nhãn
[ ] G3 - Params Config Panel đủ 6 nhóm tham số, có Reset/Lưu cấu hình
[ ] G3 - Dashboard đủ 7 tab: Tổng quan / Cluster / Trend / FV / Budget / Alerts / Lịch sử Chatbot
[ ] G3 - Export Excel xuất đủ 7 sheet, format đúng (header, số tiền)
[ ] G4 - unit test cho 6 module thuật toán, coverage > 80%
[ ] G4 - test cho intentDetector + naiveBayes online-learning (sửa nhãn → train lại đúng)
[ ] G4 - test tích hợp: đổi param trên UI → snapshot kết quả dashboard đổi theo đúng kỳ vọng
[ ] G5 - README + 3 file docs hoàn chỉnh, có thêm docs/UI_SCREENS.md mô tả 4 màn CMS
[ ] G6 - GitHub Actions workflow chạy xanh (test + build + deploy)
[ ] G6 - Link demo public hoạt động (Pages hoặc Firebase Hosting)
```

---

## 6. Rủi ro & lưu ý khi triển khai

- **Naive Bayes tiếng Việt**: tách từ tiếng Việt không đơn giản như tiếng Anh (không có khoảng trắng phân từ rõ ràng). Với dataset nhỏ, dùng tokenize theo khoảng trắng + bag-of-words là đủ cho bản demo KHKT; không cần mô hình NLP phức tạp.
- **K-Means cần chuẩn hóa dữ liệu** (amount, frequency, hour có thang đo khác nhau) trước khi tính khoảng cách Euclid — nếu không, `amount` (hàng chục nghìn) sẽ át hết `hour` (0-23). Nhớ áp dụng min-max hoặc z-score normalization.
- **Apriori** với dữ liệu cá nhân ít giao dịch có thể không đủ support để ra luật ý nghĩa — nên cho phép người dùng chỉnh `minSupport`/`minConfidence` trong UI.
- **Push Notification thật (FCM)** cần HTTPS + đăng ký domain trên Firebase Console — nếu deploy GitHub Pages (không dùng Firebase), có thể thay bằng in-app notification/banner để đơn giản hóa cho bản demo.
- **Bảo mật dữ liệu tài chính**: nếu dùng Firestore, nhớ cấu hình Security Rules chỉ cho user đọc/ghi dữ liệu của chính mình.
- **Recompute hiệu năng**: nếu mỗi lần đổi param đều chạy lại cả 6 thuật toán trên toàn bộ dữ liệu, UI có thể giật với dataset lớn. Chỉ recompute đúng thuật toán bị ảnh hưởng bởi param vừa đổi (ví dụ đổi `W` chỉ chạy lại Knapsack, không chạy lại K-Means).
- **Chatbot không phải LLM thật**: cần nói rõ trong demo/báo cáo KHKT rằng chatbot dùng rule-based intent + Naive Bayes, không phải mô hình ngôn ngữ lớn — tránh hiểu nhầm khi hội đồng chấm hỏi sâu về công nghệ.
- **Naive Bayes online-learning**: khi user sửa nhãn qua chatbot hoặc form nhập liệu, cần retrain lại mô hình (hoặc cập nhật incremental xác suất) — nếu không làm đúng, mô hình sẽ không "học" theo thời gian như kỳ vọng của tính năng chatbot.
- **Export Excel nhiều sheet**: dữ liệu lịch sử chatbot có thể dài — nên giới hạn số dòng export gần nhất (ví dụ 500 tin nhắn) hoặc phân trang để tránh file quá nặng.

---

_File này là bản kế hoạch (spec), không phải code. Antigravity nên tạo repository mới theo cấu trúc mục 2, rồi thực thi tuần tự các checklist ở mục 4–5, commit theo từng giai đoạn để dễ review._

Comment của user;

Rủi ro & lưu ý khi triển khai

Naive Bayes tiếng Việt; cứ tìm tất cả các dataset tốt nhất hiện tại, mục tiêu cover được càng nhiều case càng tốt + với xử lý thêm các thư viện xử lý ngôn ngữ tự nhiên
A priori: đồng ý triển khai
Push Notification: cứ làm thế nào đơn giản nhất có thể.
Bảo mật dữ liệu tài chính; đây là phần mềm dùng cá nhân và bản demo. dữ liệu ko cầnbảo mật. chỉ cần có lưu ý trong tài liệu triển khai
đồng ý với toàn bộ rủi do còn lại. hãy triển khai giải pháp nào để đơn giản nhất có thể
