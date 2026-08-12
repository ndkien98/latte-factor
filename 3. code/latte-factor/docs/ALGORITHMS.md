# ALGORITHMS.md — Đặc tả kỹ thuật 6 Thuật toán

## 1. K-Means Clustering

**Mục đích:** Gom nhóm giao dịch tự động theo 3 chiều: số tiền (x₁), tần suất/tháng (x₂), giờ giao dịch (x₃).

**Công thức:**
- Khoảng cách Euclid: `d(Xᵢ, Cⱼ) = √((x₁-c₁)² + (x₂-c₂)² + (x₃-c₃)²)`
- Objective: `J = Σⱼ Σ_{Xᵢ∈Sⱼ} ||Xᵢ - Cⱼ||² → min`

**Input:** `Transaction[]`, `k` (số cụm, mặc định 3)  
**Output:** `Cluster[]` — mỗi cụm gồm danh sách giao dịch + centroid + nhãn auto

**Lưu ý:** Chuẩn hóa min-max trước khi tính khoảng cách để tránh `amount` (hàng chục nghìn) át `hour` (0-23).

**Auto-label logic:**  
- Cụm có `centroid.amount` thấp + `centroid.frequency` cao → nhãn `"Latte Factor"`
- Cụm có `centroid.amount` cao + `centroid.frequency` thấp → nhãn `"Chi tiêu lớn"`
- Còn lại → nhãn `"Thiết yếu"`

**Độ phức tạp:** O(k × n × iterations)

---

## 2. Naive Bayes (NLP)

**Mục đích:** Phân loại nội dung chuyển khoản → "Thiết yếu" vs "Linh tinh".

**Công thức:**
- `P(C|D) = P(D|C) × P(C) / P(D)`
- Quyết định: `Ĉ = argmax_C P(C) ∏ᵢ P(wᵢ|C)`
- Laplace smoothing: `P(wᵢ|C) = (count(wᵢ, C) + 1) / (totalWords(C) + |V|)`

**Input:** text (nội dung chuyển khoản), labeled training data  
**Output:** `{ category: string, confidence: number, label: "essential" | "latte" }`

**Vietnamese NLP pipeline:**
1. Lowercase + bỏ dấu câu
2. Tokenize theo khoảng trắng
3. Bỏ stopwords tiếng Việt
4. Bag-of-words → Naive Bayes predict

**Online learning:** Khi user sửa nhãn → update word counts incrementally (không retrain từ đầu)

---

## 3. Linear Regression

**Mục đích:** Dự đoán xu hướng chi tiêu linh tinh theo thời gian.

**Công thức:**
- `ŷ = w₀ + w₁x` (x = số ngày kể từ ngày đầu tiên)
- Loss: `MSE = (1/N) Σ(yᵢ - ŷᵢ)² → min`
- Closed-form solution:
  - `w₁ = (N·Σxᵢyᵢ - Σxᵢ·Σyᵢ) / (N·Σxᵢ² - (Σxᵢ)²)`
  - `w₀ = (Σyᵢ - w₁·Σxᵢ) / N`

**Input:** `{ x: number, y: number }[]` (ngày, tổng chi tiêu ngày đó)  
**Output:** `{ w0: number, w1: number, predict: (x: number) => number, r2: number }`

---

## 4. Future Value of Annuity

**Mục đích:** Tính số tiền tích lũy nếu bỏ thói quen chi tiêu linh tinh và gửi tiết kiệm.

**Công thức:**
- `FV = C × [(1+r)ⁿ - 1] / r`
- C: số tiền tiết kiệm/kỳ (VD: 1.500.000đ/tháng)
- r: lãi suất/tháng (VD: 0.5%/tháng = 0.005)
- n: số kỳ hạn (số tháng)

**Input:** `{ C: number, r: number, n: number }`  
**Output:** `{ fv: number, totalSaved: number, interestEarned: number, schedule: { month: number, fv: number }[] }`

---

## 5. 0/1 Knapsack (Dynamic Programming)

**Mục đích:** Gợi ý chi tiêu tối ưu trong ngân sách "ăn chơi" cố định W.

**Công thức:**
- Maximize: `Σ vᵢxᵢ` subject to `Σ wᵢxᵢ ≤ W`, `xᵢ ∈ {0,1}`
- Recurrence:
  ```
  V[i,w] = V[i-1,w]                           nếu wᵢ > w
  V[i,w] = max(V[i-1,w], V[i-1,w-wᵢ] + vᵢ)  nếu wᵢ ≤ w
  ```

**Input:** `items: { name, weight, value }[]`, `W: number` (ngân sách)  
**Output:** `{ selectedItems: BudgetItem[], totalValue: number, totalWeight: number }`

---

## 6. Apriori (Association Rules)

**Mục đích:** Tìm "ngòi nổ" hành vi chi tiêu (VD: Thứ Sáu 15h → mua trà sữa).

**Công thức:**
- `Support(A→B) = count(A∩B) / totalTransactions`
- `Confidence(A→B) = Support(A→B) / Support(A)`
- Lift: `Lift(A→B) = Confidence(A→B) / Support(B)`

**Input:** `Transaction[]`, `minSupport: number`, `minConfidence: number`  
**Output:** `Rule[]` — mỗi rule: `{ antecedent, consequent, support, confidence, lift }`

**Notification trigger:** Nếu Confidence > ngưỡng cấu hình → gửi Web Notification cảnh báo.
