# Triển khai dự án lên Firebase bằng GitHub CI/CD

Kế hoạch này giúp tự động hóa quá trình xây dựng (build), kiểm thử (test) và triển khai (deploy) ứng dụng Latte Factor lên Firebase Hosting thông qua GitHub Actions mỗi khi có thay đổi được đẩy lên nhánh `main`.

## User Review Required

> [!IMPORTANT]
> Để GitHub CI/CD có thể triển khai lên Firebase, bạn cần thực hiện các bước sau trên Repository GitHub của mình:
> 1. Truy cập vào Firebase Console của dự án, vào **Project Settings > Service Accounts**, tạo mới một Service Account Key (định dạng JSON).
> 2. Đổi tên trường trong JSON hoặc sao chép toàn bộ nội dung file JSON đó.
> 3. Vào repo GitHub của bạn, chọn **Settings > Secrets and variables > Actions > New repository secret**.
> 4. Tạo secret tên là `FIREBASE_SERVICE_ACCOUNT` và dán toàn bộ nội dung file JSON của Service Account vừa tải về vào đó.
> 5. (Tùy chọn) Nếu bạn muốn triển khai thủ công từ máy cá nhân hoặc dùng token cũ, bạn có thể thiết lập `FIREBASE_TOKEN` bằng lệnh `firebase login:ci`. Tuy nhiên, phương pháp sử dụng Service Account được khuyến nghị vì độ bảo mật cao hơn.

## Open Questions

> [!IMPORTANT]
> Hãy cung cấp cho tôi thông tin sau hoặc bạn có thể tự thay đổi sau:
> - **Firebase Project ID**: ID của dự án Firebase mà bạn muốn triển khai là gì? (Ví dụ: `latte-factor-app` hoặc `latte-factor-xxxx`). Hiện tại tôi sẽ để mặc định trong file `.firebaserc` là `latte-factor-app` làm mẫu. Bạn có thể thay thế bằng ID dự án thực tế của mình.

## Proposed Changes

Chúng ta sẽ tạo mới các tệp cấu hình Firebase và GitHub Actions ở thư mục gốc của repository (vì `.git` nằm ở thư mục gốc `d:\person_work\latte-factor`):

---

### Firebase Configuration

#### [NEW] [firebase.json](file:///d:/person_work/latte-factor/firebase.json)
Tệp cấu hình của Firebase Hosting, trỏ thư mục deploy (`public`) vào `3. code/latte-factor/dist` và thiết lập rewrite mọi request về `index.html` (phù hợp với Single Page Application dùng client-side routing).

#### [NEW] [.firebaserc](file:///d:/person_work/latte-factor/.firebaserc)
Tệp cấu hình liên kết dự án Firebase mặc định.

---

### CI/CD Workflow

#### [NEW] [deploy.yml](file:///d:/person_work/latte-factor/.github/workflows/deploy.yml)
Tệp cấu hình GitHub Actions chạy tự động trên mỗi push lên nhánh `main`. Nó sẽ cài đặt node, cache, chạy kiểm thử, build code production và triển khai lên Firebase Hosting.

## Verification Plan

### Automated Tests
- Chạy lệnh test trên môi trường CI để đảm bảo code không bị lỗi trước khi triển khai:
  ```bash
  npm run test
  ```
- Chạy linter:
  ```bash
  npm run lint
  ```
- Chạy build:
  ```bash
  npm run build
  ```

### Manual Verification
- Sau khi được bạn duyệt kế hoạch, tôi sẽ tạo các file cấu hình này.
- Bạn có thể push code lên nhánh `main` của GitHub để kiểm tra quá trình CI/CD chạy và deploy lên Firebase Hosting thành công.
