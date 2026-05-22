# JoblyAI - Project Instructions & Guidelines

Chào mừng bạn đến với dự án JoblyAI. Tài liệu này đóng vai trò là "Sổ tay hướng dẫn" dành riêng cho đội ngũ phát triển, tập trung vào kiến trúc hệ thống, các tiêu chuẩn kỹ thuật và đặc biệt là chiến lược triển khai AI (Gemini API).

---

## 1. Tổng quan Dự án (Project Identity)

JoblyAI là một nền tảng tuyển dụng thông minh sử dụng sức mạnh của AI để tự động hóa quy trình phân tích hồ sơ (CV Parsing), đánh giá ứng viên (AI Scoring) và kết nối việc làm một cách tối ưu.

---

## 2. Chiến lược Triển khai AI (Gemini API)

Dựa trên tài liệu `DATA_PARSING_SCORING_PLAN.md`, hệ thống tập trung vào hai tính năng AI cốt lõi:

### 2.1. Trích xuất thông tin (Resume Parsing) & Hợp nhất (Merging)

Đây là tính năng chuyển đổi file PDF/Word thành dữ liệu cấu trúc (JSON) để làm giàu Profile ứng viên.

- **Kiến trúc Bất đồng bộ (Non-blocking)**:
  - Tất cả các tác vụ AI phải được xử lý thông qua Background Jobs (sử dụng BullMQ hoặc NestJS EventEmitter).
  - Quy trình: Upload -> S3 -> Trigger Job -> Gemini API -> Draft Data -> Notify via Socket.io/SSE.
- **Prompting Strategy**:
  - Sử dụng kỹ thuật **Chain of Thought (CoT)** để yêu cầu Gemini suy luận trước khi trả về kết quả JSON cuối cùng.
  - Đảm bảo Gemini trả về JSON đúng cấu trúc đã định nghĩa trong Prisma schema.
- **Chiến lược Hợp nhất (Diff & Merge)**:
  - Khi có dữ liệu mới từ AI, Backend phải tạo một bản so sánh (Before/After) để người dùng phê duyệt trước khi ghi đè vào Profile.
  - Sử dụng cờ `isSyncedToProfile` trong bảng `Resume` để theo dõi trạng thái đồng bộ.
- **Source Tracking (Truy xuất nguồn gốc)**:
  - Mọi bản ghi (Education, Experience, Skill...) phải lưu trữ `sourceCvIds` (mảng ID các Resume chứa thông tin đó).
  - Khi xóa một CV, chỉ xóa bản ghi nếu mảng `sourceCvIds` trở nên trống. Nếu không, chỉ gỡ ID của CV bị xóa khỏi mảng.

### 2.2. Chấm điểm & Gợi ý (AI Scoring & Suggestions)

Đánh giá chất lượng CV dưới góc nhìn của một nhà tuyển dụng chuyên nghiệp (ATS System).

- **Thang điểm**: `0.0` đến `1.0`.
- **Tiêu chí đánh giá**:
  - **Format & Layout**: Cách trình bày, độ chuyên nghiệp.
  - **Action Verbs & Impact**: Sử dụng các động từ mạnh và số liệu đo lường kết quả (VD: "Tăng 20% doanh thu").
  - **Keywords Match**: Độ phù hợp của từ khóa với định hướng nghề nghiệp.
- **Data Regeneration (Tái tạo nội dung)**:
  - Khi một CV bị xóa, nếu trường `bio` hoặc `title` được tổng hợp từ nhiều nguồn, hệ thống phải kích hoạt AI để viết lại nội dung dựa trên các CV còn lại (sử dụng trường `rawDescriptions` và `rawTitles` trong `CandidateDescription`).

---

## 3. Tiêu chuẩn Kỹ thuật (Engineering Standards)

### 3.1. Backend (NestJS + Prisma)

- **Surgical Updates**: Khi chỉnh sửa mã nguồn, hãy ưu tiên các thay đổi nhắm mục tiêu chính xác (surgical), tránh refactor những phần không liên quan.
- **Type Safety**: Luôn sử dụng DTO (`class-validator`) cho dữ liệu đầu vào và interface/type cho dữ liệu đầu ra. Không sử dụng `any`.
- **Prisma Patterns**: Sử dụng transactions khi thực hiện các thao tác ghi liên quan đến nhiều bảng (ví dụ: gộp dữ liệu CV vào Profile).

### 3.2. Frontend (Next.js + shadcn/ui)

- **Design System**: Tuân thủ tuyệt đối Design System dựa trên Tailwind CSS và các component từ `shadcn/ui`.
- **Real-time UX**: Sử dụng `Socket.io-client` hoặc SSE để lắng nghe các sự kiện hoàn tất từ AI (Parsing/Scoring) và hiển thị Toast Notification cho người dùng.
- **Split-View Compare**: Modal so sánh dữ liệu CV cũ và mới phải được thiết kế dạng 2 cột, cho phép người dùng chọn lọc từng trường để hợp nhất.

---

## 4. Quản lý Dữ liệu & Bảo mật

- **PII Privacy**: Trước khi gửi dữ liệu lên Gemini API, hãy cân nhắc việc ẩn danh hóa các thông tin nhạy cảm (Email, Số điện thoại) nếu cần thiết.
- **S3 Storage**:
  - `resumes/`: Truy cập riêng tư (Private), chỉ cho phép tải về qua Presigned URL.
  - `assets/avatars/`, `assets/logos/`: Truy cập công khai (Public).

---

## 5. Quy trình Phát triển (Workflow)

1.  **Nghiên cứu & Thử nghiệm Prompt**: Thử nghiệm các prompt mới cho Gemini trong môi trường sandbox trước khi đưa vào code.
2.  **Lộ trình thực hiện**: Chi tiết các bước triển khai kỹ thuật được cập nhật tại [IMPLEMENTATION_STEPS.md](./IMPLEMENTATION_STEPS.md).
3.  **Migrations**: Luôn tạo và kiểm tra Prisma migration khi thay đổi schema.
4.  **Testing**:
    - Viết Unit Test cho các logic xử lý Diff/Merge dữ liệu.
    - Mock Gemini API trong các bài test để tiết kiệm chi phí và đảm bảo tính nhất quán.

---

_Lưu ý: File này được cập nhật liên tục để phản ánh các thay đổi kiến trúc và quy trình của dự án JoblyAI._
