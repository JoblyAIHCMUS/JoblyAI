# Kế hoạch Triển khai AI (Data Parsing & Scoring) - 12 Bước

Tài liệu này chi tiết hóa các bước thực hiện tính năng trích xuất dữ liệu CV và chấm điểm bằng Gemini API.

### Giai đoạn 1: Chuẩn bị Hạ tầng & Cấu trúc Dữ liệu (Backend)

1.  **Cập nhật Prisma Schema**:
    - Bảng `Resume`: Thêm `aiScore` (Float), `aiFeedback` (Json), `isSyncedToProfile` (Boolean).
    - Các bảng Collection (`Education`, `Experience`, `Skill`, `Social`, `Contact`, `Certificate`): Thêm `sourceCvIds` (Int[]).
    - Bảng `CandidateDescription`: Thêm `rawDescriptions` (Json) để lưu trữ raw text theo từng CV ID.
    - Thực thi: `npx prisma migrate dev --name resume_ai_fields`.
2.  **Thiết lập Message Queue (BullMQ/Redis)**:
    - Cài đặt và cấu hình BullMQ trong NestJS.
    - Tạo các queue: `resume-extraction`, `resume-scoring`.
3.  **Thiết lập Real-time Notifications (Socket.io)**:
    - Tạo `AiGateway` (`apps/backend/src/app/ai/ai.gateway.ts`) để phát events `RESUME_PARSED_{userId}` và `RESUME_SCORED_{userId}`.
    - Đăng ký `AiGateway` vào `AiModule` và tích hợp vào các Processor (`ResumeProcessor`, `ScoringProcessor`) để thông báo cho người dùng khi Background Jobs hoàn thành.

### Giai đoạn 2: Phát triển Core AI Services (Backend)

4.  **`AiProviderService`**:
    - Wrapper cho `@google/genai`.
    - Triển khai logic Retry, Validation (Zod) và ép kiểu JSON đầu ra.
5.  **`ResumeParserService`**:
    - Tích hợp `pdf-parse` để trích xuất văn bản thô.
    - Xây dựng Chain of Thought Prompt để chuyển văn bản sang JSON cấu trúc.
6.  **`ResumeScoringService`**:
    - Xây dựng prompt đánh giá CV (Action Verbs, Keywords, Layout).
    - Lưu kết quả chấm điểm vào DB.

### Giai đoạn 3: Logic Nghiệp vụ & Hợp nhất Dữ liệu (Backend)

7.  **`ProfileSyncService` (Merging Logic)**:
    - Hàm `generateDiff`: So sánh dữ liệu hiện tại trong DB và dữ liệu mới từ AI.
    - Hàm `commitMerge`: Thực hiện transaction cập nhật Profile, gán `sourceCvIds` cho từng mảng dữ liệu.
    - **Persistent Storage**: Lưu trữ bản JSON gốc từ AI vào trường `parsedText` của bảng `Resume` để phục vụ tái tính toán.
    - **Normalization Layer**: Chuẩn hóa toàn bộ chuỗi (trim, lowercase) trước khi đối chiếu sự trùng lặp (Deduplication).
8.  **Xử lý Xóa & Tái tạo (Source Tracking & Recalculation)**:
    - Tạo hàm `handleResumeDeletion`: Khi xóa CV, gỡ `resumeId` khỏi mảng `sourceCvIds`.
    - **Cumulative Recalculation**: Tính toán lại (SUM) số năm kinh nghiệm và lấy Level cao nhất cho Kỹ năng dựa trên tất cả các bản CV nguồn còn lại.
    - **Logic Tái tạo (Regeneration)**: Xóa text gốc của CV bị xóa khỏi `rawDescriptions` và kích hoạt AI viết lại phần giới thiệu (bio) chuyên nghiệp dựa trên những nguồn còn lại.
    - **Logic xóa CV** cũng phải kích hoạt việc xóa dữ liệu liên quan trong các bảng Collection (Education, Experience, Skill, Social, Contact, Certificate) nếu `sourceCvIds` trống. Dùng transaction để đảm bảo tính toàn vẹn dữ liệu.

### Giai đoạn 4: Xây dựng Giao diện & Trải nghiệm (Frontend)

9.  **Lắng nghe Sự kiện Real-time (Socket Client)**:
    - Tạo React hook `useAiSocket` (`apps/web/src/hooks/useAiSocket.ts`) để lắng nghe các event từ Backend và hiển thị Toast notification (`sonner`) mời người dùng xem kết quả.
10. **Quản lý CV (Resume Dashboard) & Component So sánh**:
    - Cập nhật UI danh sách CV: Hiển thị trạng thái đồng bộ (VD: Badge "✨ Chưa Đồng Bộ").
    - Tạo `CvSyncCompareModal` (`apps/web/src/features/candidate/components/CvSyncCompareModal.tsx`): Modal Split-view (Trái: Profile hiện tại, Phải: Data AI trích xuất) với tính năng Approve & Sync.
11. **Giao diện Chấm Điểm AI (AI Feedback)**:
    - Tích hợp icon chấm điểm AI (🪄) vào danh sách CV.
    - Tạo `AiFeedbackModal` (`apps/web/src/features/candidate/components/AiFeedbackModal.tsx`): Modal hiển thị Điểm số và các Gợi ý cải thiện định dạng JSON.

### Giai đoạn 5: Tối ưu hóa & Testing

12. **Kiểm thử & Error Handling**:
    - Xử lý lỗi AI Hallucination (Zod Validation).
    - Unit test cho logic Diff/Merge và Source Tracking.
    - Tối ưu hóa Token (trimText) cho các CV dài.
