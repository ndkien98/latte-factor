# IMPLEMENTATION PLAN: Lỗ Thủng Ví — AI Trợ Lý Chi Tiêu Cá Nhân

## Tổng quan

Xây dựng ứng dụng web phát hiện & kiểm soát "chi tiêu linh tinh" (Latte Factor) sử dụng 6 thuật toán ML/AI thuần TypeScript, chạy hoàn toàn client-side (serverless), deploy miễn phí.

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **UI/Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **ML Algorithms**: TypeScript thuần (tự implement)
- **NLP**: compromise + custom Vietnamese tokenizer
- **State**: Zustand
- **Data Import**: papaparse (CSV) + xlsx (SheetJS) 
- **Export**: exceljs
- **Storage**: IndexedDB (localStorage fallback)
- **Notifications**: Web Notifications API (đơn giản nhất)
- **Testing**: Vitest

## Phân tích 6 Thuật toán (từ ảnh requirements)

### 1. K-Means Clustering
- Input: transactions với (amount x₁, frequency/month x₂, hour x₃)
- Distance: d(Xᵢ, Cⱼ) = √((x₁-c₁)² + (x₂-c₂)² + (x₃-c₃)²)
- Objective: J = Σⱼ Σ_{Xᵢ∈Sⱼ} ||Xᵢ - Cⱼ||² → min
- Auto-label: cụm có tiền nhỏ + tần suất cao = "Cụm Latte Factor"

### 2. Naive Bayes (NLP)
- P(C|D) = P(D|C)·P(C) / P(D)
- Ĉ = argmax_C P(C) ∏ᵢ P(wᵢ|C)
- Phân loại: "Thiết yếu" vs "Linh tinh"

### 3. Linear Regression
- ŷ = w₀ + w₁x (x = số ngày)
- MSE = (1/N) Σ(yᵢ - ŷᵢ)² → min
- Dự đoán xu hướng chi tiêu tương lai

### 4. Future Value of Annuity
- FV = C × [(1+r)ⁿ - 1] / r
- C: tiền tiết kiệm/kỳ, r: lãi suất/tháng, n: số tháng

### 5. 0/1 Knapsack (DP)
- max Σ vᵢxᵢ, với Σ wᵢxᵢ ≤ W, xᵢ ∈ {0,1}
- V[i,w] = V[i-1,w] nếu wᵢ > w, hoặc max(V[i-1,w], V[i-1,w-wᵢ]+vᵢ)

### 6. Apriori (Association Rules)
- Support(A→B) = count(A∩B) / total
- Confidence(A→B) = Support(A→B) / Support(A)
- Tìm "ngòi nổ" hành vi → push notification

## Cấu trúc thư mục

```
3. code/latte-factor/
├── .github/workflows/ci.yml
├── docs/
│   ├── ALGORITHMS.md
│   ├── DATA_SCHEMA.md
│   ├── API.md
│   └── UI_SCREENS.md
├── public/
├── src/
│   ├── algorithms/
│   │   ├── kmeans.ts
│   │   ├── naiveBayes.ts
│   │   ├── linearRegression.ts
│   │   ├── futureValue.ts
│   │   ├── knapsack.ts
│   │   ├── apriori.ts
│   │   └── __tests__/
│   ├── data/
│   │   ├── importers/
│   │   └── sampleDatasets/
│   ├── nlp/
│   ├── store/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── input/
│   │   ├── chatbot/
│   │   ├── config/
│   │   └── export/
│   ├── hooks/
│   ├── services/
│   ├── pages/
│   └── main.tsx
├── agent/                    # Kho tri thức
│   ├── CONTEXT.md
│   ├── DECISIONS.md
│   └── PROGRESS.md
└── package.json
```

## Kế hoạch triển khai (5 Giai đoạn)

### Giai đoạn 1: Scaffold & Docs (G1)
- [x] Init Vite+React+TS project
- [x] Setup Tailwind + shadcn/ui
- [x] Tạo docs/ALGORITHMS.md
- [x] Tạo docs/DATA_SCHEMA.md
- [x] Tạo dataset mẫu

### Giai đoạn 2: Core Algorithms (G2-G3 algorithms)
- [ ] kmeans.ts
- [ ] naiveBayes.ts  
- [ ] linearRegression.ts
- [ ] futureValue.ts
- [ ] knapsack.ts
- [ ] apriori.ts
- [ ] NLP: tokenizeVi.ts + intentDetector.ts

### Giai đoạn 3: UI Components (G3 UI)
- [ ] Store: Zustand stores
- [ ] TransactionInputForm + CategoryManager
- [ ] ChatbotPanel
- [ ] ParamsConfigPanel
- [ ] Dashboard (7 tabs)
- [ ] ExportExcel

### Giai đoạn 4: Testing (G4)
- [ ] Unit tests cho 6 algorithms
- [ ] Integration tests
- [ ] Coverage > 80%

### Giai đoạn 5: Deploy (G6)
- [ ] GitHub Actions CI/CD
- [ ] Agent knowledge base cập nhật

## Verification Plan
- `npm run test` → tất cả pass
- `npm run build` → build thành công
- Manual: import file CSV mẫu → 6 algorithms chạy đúng → export Excel
