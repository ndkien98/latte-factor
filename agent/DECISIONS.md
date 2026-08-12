# KHO TRI THỨC AGENT: QUYẾT ĐỊNH THIẾT KẾ & KIẾN TRÚC (DECISIONS.md)

## 1. Quyết định Kiến trúc & Công nghệ

| STT | Quyết định | Lý do & Bối cảnh | Kết quả |
|---|---|---|---|
| 1 | **100% Client-Side Pure TypeScript** | Không cần duy trì backend Python/FastAPI đắt đỏ; dữ liệu cá nhân nhỏ (vài trăm - vài nghìn dòng) xử lý trực tiếp trên trình duyệt tức thì. | Deploy cực đơn giản lên GitHub Pages / Static Hosting hoàn toàn miễn phí. |
| 2 | **Tailwind CSS v4 + Vanilla Custom Design System** | Tạo giao diện Dark Mode Glassmorphism cao cấp, hiệu ứng ánh sáng gradient lung linh cho cuộc thi KHKT. | Đạt điểm nhìn tuyệt đối mà không cần thư viện UI nặng. |
| 3 | **Naive Bayes Online Learning** | Khi người dùng gắn nhãn lại trong Chatbot ("Thiết yếu" vs "Linh tinh"), mô hình tự cập nhật tần suất từ (`updateWithExample`) thay vì train lại toàn bộ từ đầu. | Chatbot học thông minh dần theo thời gian sử dụng của người dùng. |
| 4 | **Recompute reactive hook (`useComputedResults`)** | Sử dụng Zustand `subscribe` + `useMemo` tính toán lại thuật toán bị ảnh hưởng khi người dùng thay đổi tham số slider. | Mọi tab trên Dashboard phản hồi tức thì dưới 16ms khi kéo slider tham số. |
| 5 | **Export Excel 8 Sheet bằng ExcelJS** | Xuất toàn bộ dữ liệu (Tổng quan, Giao dịch, 5 thuật toán, Lịch sử Chat log) ra 1 file Excel chuyên nghiệp với header màu & format tiền tệ VNĐ. | Phục vụ báo cáo và lưu trữ toàn bộ lịch sử ứng dụng. |

---

## 2. Chuẩn Xử lý Ngôn ngữ Tiếng Việt (NLP)

- **Chuẩn hóa chữ tiếng Việt:** Loại bỏ toàn bộ dấu thanh/dấu phụ (`áàảãạ` → `a`, `đ` → `d`), chuyển về chữ thường để khớp từ khóa chính xác.
- **Trích xuất số tiền linh hoạt:** Nhận diện các dạng `35k`, `35.000đ`, `35000`, `2 triệu`, `50 nghìn`.
- **Trích xuất thời gian:** Tự động parse `hôm nay`, `hôm qua`, `hôm kia`, `lúc 3h chiều`.
