# Lỗ Thủng Ví (Latte Factor Detector) — AI Trợ Lý Chi Tiêu Cá Nhân

Dự án KHKT phát hiện & kiểm soát "chi tiêu linh tinh" (Latte Factor) bằng 6 thuật toán Machine Learning & Toán học tài chính, chạy 100% Client-Side Serverless.

---

## 📂 Cấu trúc Thư mục Dự án

- **`1. requirements/`**: Chứa yêu cầu bài toán gốc (`req.txt`) và các hình ảnh công thức toán học (`img/`).
- **`2. doc/`**: Chứa kế hoạch triển khai chi tiết (`plan_clau.md`, `implementation_plan.md`).
- **`3. code/latte-factor/`**: Toàn bộ mã nguồn ứng dụng web (Vite + React + TypeScript + Tailwind CSS).
- **`agent/`**: Kho tri thức dành cho AI Agent (`CONTEXT.md`, `DECISIONS.md`, `PROGRESS.md`).

---

## 🚀 Hướng dẫn Nhanh Khởi chạy Ứng dụng

```bash
# 1. Chuyển vào thư mục mã nguồn
cd "3. code/latte-factor"

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Chạy giao diện sản phẩm
npm run dev

# 4. Chạy kiểm thử tự động
npm run test
```

Địa chỉ ứng dụng khi chạy local: `http://localhost:5173/`

---

## 🌐 Triển khai (Deployment) lên Firebase

Dự án được tích hợp sẵn cấu hình triển khai lên Firebase Hosting miễn phí.

### Tập lệnh tự động hóa:
Để xây dựng (build) và triển khai phiên bản code mới nhất, bạn chỉ cần nhấp đúp (double-click) vào tệp **[build-and-deploy.bat](file:///d:/person_work/latte-factor/build-and-deploy.bat)** tại thư mục gốc. Script này sẽ tự động:
1. Chạy quá trình build ứng dụng (`npm run build`).
2. Tự động xác thực thông qua tệp Service Account JSON Key có sẵn tại thư mục `4. key/firebase`.
3. Tải ứng dụng lên Firebase Hosting dự án `late-factor`.

*Lưu ý: Nếu bạn muốn chạy triển khai thủ công từ dòng lệnh, bạn có thể tham khảo thêm hướng dẫn chi tiết tại [3. code/latte-factor/README.md](file:///D:/person_work/latte-factor/3.%20code/latte-factor/README.md).*

