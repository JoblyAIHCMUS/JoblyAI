# Kế hoạch Trích xuất và Đánh giá CV bằng LLM (Gemini API)

Tài liệu này vạch ra chiến lược để triển khai 2 tính năng chính cho hệ thống phân tích ứng viên (Candidate Profiling):

1. **Data Parsing**: Phân tích cú pháp và trích xuất thông tin CV (sử dụng kỹ thuật Chain of Thought + JSON format).
2. **AI Scoring**: Đánh giá chấm điểm CV và đưa ra gợi ý cải thiện.

---

## 1. Tính năng Trích xuất thông tin (Parsing) & Hợp nhất (Merging)

### 1.1 Khái quát luồng xử lý (Bất đồng bộ - Asynchronous)

Do giới hạn độ trễ của LLM, quy trình này sẽ không block UI của người dùng:

- **Trigger**: Người dùng tải lên một tệp CV (PDF/Word).
- **Backend (Immediate)**: Lưu tệp vào S3, tạo bản ghi `Resume` và trả về ngay HTTP 200 (Success) để Frontend đóng vòng xoay loading. Đồng thời, đẩy một Job "Extract CV" vào Message Queue (VD: BullMQ/Redis hoặc NestJS Event Emitter).
- **Background Job**: Đọc PDF, đưa qua Gemini API kèm Chain of Thought Prompt để lấy về mẫu cấu trúc JSON. Xử lý gộp/loại bỏ trùng lặp (Diff logic) và lưu kết quả bản nháp (Draft).
- **Frontend (Tương tác)**:
  - Trong lúc chờ, hiện trạng thái: _"Đang phân tích CV..."_.
  - Khi Job hoàn thành, Backend phát một sự kiện Real-time (thông qua WebSocket/Socket.io hoặc Server-Sent Events - SSE) để **bắn Notification (Toast) báo cho User**.
  - Người dùng bấm vào Notification -> Hiện Modal/Popup so sánh dữ liệu Before/After.

### 1.2 Chiến lược xử lý đa CV (Append & Merge data)

Khi một ứng viên có nhiều CV, hệ thống cần hợp nhất dữ liệu một cách thông minh:

- **Mảng (Arrays) như Skills, Languages, Social Links:**
  - _Chiến lược_: Gộp mảng (Union) và loại bỏ trùng lặp (Deduplication). LLM hoặc Backend sẽ chuẩn hóa các chuỗi (ví dụ: "C++" và "c++" là một).
- **Mảng chứa Object (Experiences, Educations, Certifications):**
  - _Chiến lược_: Xác định trùng lặp dựa trên các trường khóa. Ví dụ: trùng Tên công ty + Trùng khoảng thời gian (Start Date - End Date).
  - Nếu trùng: Gộp/cập nhật phần mô tả nội dung (Description). Nếu khác biệt: coi như một bản ghi mới.
- **Trường văn bản dài (About Me / Summary):**
  - _Chiến lược_: Dùng LLM (Gemini) để viết/tổng hợp lại một đoạn giới thiệu bao hàm nội dung của cả thư mục CV thay vì chỉ nối chuỗi cơ học (tránh lủng củng).

### 1.3 Chiến lược xử lý khi XÓA một CV (Giải quyết bài toán trùng lặp)

Vấn đề: Xóa CV A làm sao không mất kỹ năng "Python" nếu CV B cũng có kỹ năng "Python"? Và làm sao xử lý những đoạn text viết chung (Summary) bị mất đi phần thông tin của CV A?

- **Giải pháp - Gắn Tag Nguồn (Source Tracking) kết hợp Tái tạo dữ liệu (Data Regeneration):**
  - Trong DB, mọi thông tin trích xuất phải lưu trữ nguồn gốc: `sourceCvIds: string[]`. Và đối với các trường văn bản đã được gộp/viết lại bởi AI, cần lưu trữ thêm "Raw text" gốc tách biệt của từng CV.
  - Cập nhật Prisma Schema (`apps/backend/prisma/schema.prisma`): Bổ sung `sourceCvIds String[]` cho các Table sau:
    - `Education`
    - `Experience`
    - `CandidateSkill`
    - `CandidateSocial`
    - `CandidateContact`
    - `Certificate`
  - Bổ sung vào bảng `CandidateDescription`: Thêm một trường để lưu bản raw text của từng CV: `rawDescriptions Json?` (Ví dụ: `{"CV_1": "...", "CV_2": "..."}`).
  - **Với Data Dạng Mảng Object (Skills, Educations, Experiences, Socials, Contacts, Certificates):**
    - Xóa `CV_1` khỏi mảng `sourceCvIds`.
    - Phép thử: Nếu trường nào có `sourceCvIds` rỗng (nghĩa là độ dài mảng = 0), thực hiện **xóa thật** thông tin đó. Nếu vẫn còn `CV_2`, thông tin không bị mất.
  - **Với Trường Văn Bản Dài (`CandidateDescription.bio`) & Mảng Hợp nhất:**
    - Cần **Tái tạo (Regeneration)**: Khi CV_1 bị xóa, đoạn text `bio` hiện tại trở nên sai lệch (vì chứa thông tin của CV_1).
    - _Action_: Hệ thống lấy lại các `rawDescriptions` của các CV **còn lại** (Ví dụ CV_2, CV_3) và gửi một prompt mới cho Gemini API để AI **viết/tổng hợp lại** `bio` chỉ dựa trên các CV còn tồn tại.
- **UI/UX**: Khi ấn xóa CV, hiển thị Popup báo cáo: _"Xóa CV này sẽ gỡ bỏ X kỹ năng [liệt kê] và Y kinh nghiệm [liệt kê]. Các mục Giới thiệu (About Me) sẽ được AI tổng hợp lại dựa trên hồ sơ còn lại. Bạn có chắc chắn?"_

---

## 2. Tính năng Chấm điểm & Gợi ý (CV Scoring & Suggestions)

### 2.1 Cách thức hoạt động

- **Mục tiêu**: AI đóng vai trò một nhà tuyển dụng / ATS System, Evaluate CV theo thang điểm `0 - 1.0`.
- **Luồng Frontend**:
  - Ứng viên vào trang Profile -> Tab Quản lý các CV đã tải lên.
  - Tại mỗi CV có một biểu tượng 🪄 **AI Scorer**.
  - **Lần 1 bấm vào (Bất đồng bộ)**:
    - Frontend gọi HTTP request -> Cập nhật trạng thái Button AI Scorer sang dòng chữ loading `"Đang chấm điểm..."` (Progress State).
    - Backend xác nhận request hợp lệ và đẩy một Job (Queue) về hàm `evaluateResume()`.
    - AI làm việc 10 - 15 giây. Khi hoàn thành, gửi kết quả thông qua **WebSocket/SSE** (giống hệt cách thông báo Vấn đề 1). Hệ thống bắn về một Toast Notification: _"CV của bạn đã có điểm"_ -> User bấm vào Toast mở Modal.
  - **Lần 2 bấm vào**: Frontend chỉ đơn giản fetch kết quả (Điểm số + Gợi ý) từ DB và bật Modal ngay lập tức mà không tốn chi phí API.
- **Tiêu chí Đánh giá (Prompts cho Gemini):**
  - _Format & Layout_: Cách ngắt đoạn, sử dụng gạch đầu dòng báo cáo.
  - _Action Verbs & Impact_: Sự hiện diện của động từ mạnh, có đo lường kết quả không (ví dụ "Tăng doanh số 20%").
  - _Keywords Match_: Tính phù hợp với định hướng công việc (nếu có context).

### 2.2 Mối quan hệ giữa "Cập nhật / Thay thế CV" và "Tính năng Chấm Điểm" (AI Scoring)

Vấn đề: Việc người dùng upload lại một CV (thay thế CV cũ) có hoàn toàn tách biệt khỏi các tính năng khác và chỉ phục vụ cho việc chấm điểm lại? Nó có ảnh hưởng gì đến Vấn đề 1 (Trích xuất) không?

- **Sự tách biệt của tính năng:** Việc "Cập nhật / Update" một file CV đơn thuần là thao tác Quản lý Tệp (File Management), nó nằm ở tầng thao tác quản lý Resume, **không phải là luồng dành riêng** cho tính năng Chấm Điểm AI.
- **Mục đích thực sự của thao tác Update CV:** Người dùng chỉnh sửa PDF để bố cục đẹp hơn, thêm thắt một vài từ khóa, sau đó tải lên đè file cũ để giữ lại cùng một Resume ID khi gửi cho nhà tuyển dụng.
- **Ảnh hưởng đến Trích Xuất (Vấn đề 1):** Hệ thống sẽ **bỏ qua hoàn toàn** bước So sánh & Gộp (Skip Merging). Thao tác này không trigger popup Data Parsing để bảo vệ trải nghiệm của ứng viên. Đồng thời, trạng thái của CV này sẽ chuyển thành **`isSyncedToProfile = false`** (vì nội dung file vừa bị thay đổi, có thể chứa thông tin mới chưa được gộp vào Profile).
- **Ảnh hưởng đến Chấm Điểm AI (Vấn đề 2):** Khi tệp được update xong, hệ thống thực hiện thao tác đơn giản là xoá mất đánh giá cũ: `aiScore = Null` và `aiFeedback = Null`. Khi đó AI Scorer sẽ rơi vào trạng thái "Sẵn sàng để chấm lại" khi người dùng bấm vào icon.

2. **Về việc chấm điểm "Candidate Profile" vs "Điểm CV File" khi nộp hồ sơ (Application):**
   - Theo mô hình CSDL (`Application` liên kết trực tiếp với 1 `ResumeId`), nhà tuyển dụng sẽ nhận và đánh giá file CV cụ thể đó.
   - Do đó, tính năng **AI Scorer (điểm 0-1.0)** nên được gắn liền và chỉ dành riêng cho **File CV (PDF/Word)** vì đó mới là văn bản thực tế quyết định cơ hội phỏng vấn (bố cục, độ dài, câu chữ impact).
   - "Candidate Profile" (các Web Form Experiences, Skills) chỉ đóng vai trò là "Ngân hàng dữ liệu gốc". Ta **không cần** dùng AI để chấm điểm 0-1.0 cho Profile, mà thay vào đó có thể dùng logic thông thường để tính **Profile Completeness (Độ hoàn thiện hồ sơ %)** (ví dụ: có đủ 3 kĩ năng, có mô tả bản thân -> 100%).

### 2.3 Chiến lược xử lý khi Upload CV trực tiếp ở bước Nộp Hồ Sơ (Apply Job)

Vấn đề: Tại màn hình Nộp hồ sơ (Job Application), người dùng tải lên một CV customize riêng. Mặc dù hệ thống hiện Toast hỏi có muốn đồng bộ lại vào hệ thống (Vấn đề 1) không, nhưng nếu người dùng bỏ qua (dismiss Toast) thì sao? Lúc đó dữ liệu CV mới trong hệ thống sẽ như thế nào?

**Giải pháp đề xuất (Quản lý trạng thái Đồng bộ Data):**

1. **Bỏ qua luồng Gộp dữ liệu (Skip Merging lúc Apply):**
   - Khi upload CV từ modal "Apply Job", hệ thống sẽ lưu file mới vào bảng `Resume`, attach thẳng vào `Application`.
   - **Tuyệt đối KHÔNG hiển thị Pop-up Trích xuất (Vấn đề 1)** để tránh làm gián đoạn quá trình nộp đơn.
2. **Cờ trạng thái `isSyncedToProfile`:**
   - Trong bảng Schema DB `Resume`, thêm một trường `isSyncedToProfile Boolean @default(false)`.
   - Các CV upload từ lúc ứng tuyển (như trường hợp này) sẽ mặc định là `false`. Ngược lại các CV up từ trang Hồ Sơ sẽ sau khi trải qua Popup So sánh sẽ là `true`.
3. **Upsell tính năng đồng bộ (Post-Apply) & Toast Notification:**
   - Sau khi Nộp hồ sơ xong, gửi Toast: _"CV mới của bạn đã được gắn vào hồ sơ ứng tuyển thành công. Bạn có muốn [Trích xuất dữ liệu từ CV này] để làm giàu hồ sơ gốc không?"_.
4. **Xử lý khi người dùng muốn Đồng bộ Data lại sau này (Áp dụng chung cho 2 trường hợp: vội bỏ qua Toast khi Apply hoặc vừa Update/Replace file CV):**
   - Ứng viên truy cập vào Tab "Quản lý CV" ở Candidate Profile.
   - Tại các file CV này, UI sẽ hiển thị trạng thái nổi bật: **"✨ Chưa Đồng Bộ"** (Unsynced) bên cạnh icon 🪄 **AI Scorer**.
   - Khi người dùng chủ động click vào nút "Đồng bộ", hệ thống bắt đầu chạy lại nguyên vẹn **quy trình Trích xuất và Pop-up So sánh trước/sau (Vấn đề 1)** để họ review và gộp thông tin mới vào "Ngân hàng dữ liệu Hồ sơ". Sau khi gộp xong, cờ `isSyncedToProfile` được set lại thành `true`.

## 3. Kiến trúc kỹ thuật và Data Model chi tiết (NestJS + Prisma)

### 3.1. Cập nhật Database Schema (`apps/backend/prisma/schema.prisma`)

**1. Bảng `Resume` (Quản lý File CV)**
Cần bổ sung các trường phục vụ lưu trữ kết quả AI và trạng thái đồng bộ:

```prisma
model Resume {
  // Các trường hiện có: id (Int), candidateId, fileKey, fileName, parsedText...
  aiScore           Float?    // Đã có sẵn trong schema hiện tại (0-1)
  aiFeedback        Json?     // MỚI: Lưu JSON phản hồi của AI (điểm mạnh, yếu, gợi ý)
  isSyncedToProfile Boolean   @default(true) // MỚI: Cờ kiểm tra CV đã được Parser & Merge vào Profile chưa. (CV upload qua Job Application mặc định truyền false)
}
```

**2. Các bảng chi tiết của Candidate Profile (Gắn Source Tracking)**
Bổ sung mảng `sourceCvIds Int[]` (mapping với `Resume.id`) vào tất cả các bảng Collection sau để phục vụ tính năng XÓA CV:

```prisma
// Ví dụ cho bảng Education, lặp lại cho Experience, CandidateSkill, CandidateContact, CandidateSocial, Certificate
model Education {
   ...
   sourceCvIds Int[] // MỚI: Lưu danh sách Resume ID chứa thông tin này
}
```

**3. Bảng `CandidateDescription` (Tái tạo nội dung dài)**
Bổ sung trường lưu trữ văn bản gốc (Raw text) của từng CV để phục vụ cho tính năng AI Regeneration khi 1 CV bị xóa.

```prisma
model CandidateDescription {
  // Các trường hiện có: id, candidateId, bio, title...
  rawDescriptions Json? // MỚI: {"ResumeId_1": "Raw bio from CV 1", "ResumeId_2": "Raw bio from CV 2"}
}
```

### 3.2. Thiết kế Kiến trúc Backend (NestJS Modules)

Để đảm bảo Clean Architecture, luồng nghiệp vụ AI sẽ được tách thành các Service chuyên biệt trong Backend:

1. **`AiProviderService` (Core AI)**

   - Chịu trách nhiệm khởi tạo kết nối với Google Gemini API (`@google/generative-ai`).
   - Đảm nhận toàn bộ các lệnh gọi (prompting) liên quan đến LLM, cấu hình Token, format JSON trả về.

2. **`ResumeParserService` (Giải quyết Vấn đề 1 - Parsing)**
   - **Hàm `extractDataFromPdf(fileBuffer)`**: Thực hiện OCR hoặc dùng thư viện (như `pdf-parse`) đọc nội dung file sang Text thô.
   - **Hàm `parseResumeTextToProfile(rawText)`**: Gọi `AiProviderService` với "Chain of Thought Prompt" để Gemini trả về JSON theo đúng interface của Schema DB (VD: mảng Education, Experience...).
3. **`ProfileSyncService` / `CandidateProfileService` (Giải quyết logic Hợp nhất & Xóa)**

   - **Hàm `generateDiff(candidateId, newParsedData)`**: Lấy data hiện hành trong DB của User so sánh với `newParsedData` tạo ra object Before/After trả về cho Client.
   - **Hàm `commitMerge(candidateId, resumeId, mergedData)`**: Sau khi client xác nhận, tiến hành ghi vào DB (Upsert) và thêm `resumeId` vào mảng `sourceCvIds`. Set `Resume.isSyncedToProfile = true`.
   - **Hàm `handleResumeDeletion(candidateId, resumeId)`**: Khi xóa 1 file CV, service này quét tất cả các bảng. Nếu `resumeId` nằm trong `sourceCvIds`, gỡ nó ra. Nếu mảng rỗng -> Delete. Đồng thời lấy `rawDescriptions` còn lại để prompt AI viết lại trường `bio`.

4. **`ResumeScoringService` (Giải quyết Vấn đề 2 - Scoring)**
   - **Hàm `evaluateResume(resumeId)`**: Tìm text thô của PDF (lấy từ field `parsedText`), gửi cho `AiProviderService` kèm Prompt "Vai trò HR chuyên nghiệp" để lấy về điểm số `0-1.0` và đánh giá điểm mạnh/yếu. Lệnh Prisma `update` lưu kết quả vào `aiScore` và `aiFeedback`.

### 3.3. Thiết kế Frontend Components (Next.js / shadcn-ui)

Để nhất quán với hệ thống Design System hiện tại của `apps/web` (Tailwind CSS + shadcn/ui + Lucide Icons), các component mới sẽ được triển khai bằng các thư viện UIKit có sẵn trong codebase:

- **`ResumeUploadButton`**:
  - Kế thừa component Upload hoặc `Button` (shadcn) hiện tại.
  - Hỗ trợ thêm logic cấu hình qua prop: `mode="add" | mode="replace"`.
- **`CvSyncCompareModal`**:
  - Sử dụng `Dialog` (shadcn) để làm pop-up lớn.
  - Chức năng 2 cột dạng Split-View (sử dụng Tailwind Grid/Flex): Trái (Old Data), Phải (Merged Data). Sử dụng `Checkbox` hoặc `Switch` của shadcn để người dùng dễ dàng bật/tắt từng trường muốn hợp nhất.
- **`ResumeListItem`**:
  - Cập nhật Card hoặc Table Row danh sách CV hiện có. Bổ sung các Icon từ `lucide-react`:
  - Icon `Wand2` hoặc `Sparkles` (AI Scorer Icon) có bọc thêm `Tooltip` báo trạng thái: Chưa chấm / Điểm (0-1).
  - Sử dụng component `Badge` của shadcn báo hiệu trạng thái màu cảnh báo: **"✨ Chưa Đồng Bộ"** (khi `isSyncedToProfile === false`), và dùng nó làm nút bấm kích hoạt quy trình Trích xuất.
- **`AiFeedbackModal`**:
  - Sử dụng `Dialog` hoặc `Sheet` (shadcn). Hiển thị điểm số bằng Progress Bar/Circular Progress (tuỳ biến bằng Tailwind) và danh sách gợi ý cải thiện (AI Feedback) được format rành mạch.

---

## 4. Các yếu tố Cần Cân Nhắc Bổ Sung (Rủi ro & Giải pháp)

Trước khi thực hiện Code, chúng ta cần thống nhất một số nguyên tắc đảm bảo ứng dụng **Scale-able** (có thể mở rộng) và **Robust** (chống lỗi):

### 4.1. Sự thiếu ổn định của LLM (Hallucination)

- **Vấn đề**: Gemini có thể trả về JSON không chuẩn (sai format, thiếu dấu ngoặc) do hiện tượng chập chờn của Prompt.
- **Giải pháp**: Xây dựng **Validation Layer** ở Backend. Khi nhận string JSON từ API, sử dụng thư viện `zod` hoặc `class-validator`/`class-transformer` đã có trong NestJS để phân tích bắt buộc (parse). Nếu JSON hỏng, hàm `AiProviderService` phải tự động gọi lại (Retry) tối đa 1-2 lần, hoặc báo lỗi tử tế về Frontend thay vì sập toàn bộ luồng.

### 4.2. Độ trễ của LLM API (Đọc file > 10 giây)

- **Vấn đề**: Việc AI xử lý hàm `extractDataFromPdf` và trả về một khối block dữ liệu lớn (Kinh nghiệm, Học vấn) hoặc phân tích một điểm số dài có thể tốn từ **10 đến 25 giây**. Việc bắt Frontend giữ connection HTTP mở trong thời gian dài như vậy là cực kỳ tồi cho Scalability, rất dễ bị 504 Gateway Timeout bởi Load Balancers (như Nginx).
- **Giải pháp - Kiến trúc Non-Blocking (Background Jobs)**:
  - Thay vì chờ Gemini xử lý rồi mới Return HTTP Response, NestJS Endpoint phải đóng ngay lập tức bằng Status `202 Accepted` hoặc `200 OK` (Job Scheduled).
  - Tác vụ gọi Google API sẽ được ủy thác vào một hệ thống Background Queues (Ví dụ: Redis `bullmq` / NestJS `@nestjs/bull`). Điều này đảm bảo Server không bao giờ crash nếu có 100 ông User upload CV cùng một lúc.
- **Giải pháp UX - Event-Driven Notify**:
  - Web UI (Next.js) không hiện Loading Spinner chình ình giữa màn hình bắt User nhìn chằm chằm.
  - Sử dụng **WebSocket** (`socket.io` hoặc `Socket.io-client` React) hoặc **Server-Sent Events (SSE)**.
  - Khi cái Job Redis ở phía Backend chạy xong (Gemini gen xong Data), Backend Push một event thẳng lên Desktop Client: `RESUME_EXTRACTION_SUCCESS_{UserId}`.
  - Frontend bắt ngay event -> Hiện Toast Pop-up thanh nhã góc màn hình: `"Quá trình đọc bộ CV của bạn đã hoàn tất. Bấm vào đây để Xem và Gộp thông tin!"` (Click thẳng vào là mở cái "Modal Vấn đề 1" ra luôn).
  - Việc này cũng áp dụng tương tự cho "Tính năng AI Chấm điểm" (Vấn đề 2). User ấn gọi chấm điểm, cất máy đi lấy cốc nước, quay lại sẽ thấy chuông báo Notifications của trang Web báo điểm thi đã về. Cực kì mượt và chuyên nghiệp.

### 4.3. Tương tác User trong lúc chờ AI (Concurrency / Race Condition)

- **Vấn đề**: Trong khoảng 15-25 giây AI đang phân tích CV, có nên block (khóa) các trường Web Form Profile (Kinh nghiệm, Kỹ năng...) để cấm người dùng tự sửa đổi dữ liệu không?
- **Giải pháp UX & Kỹ thuật**:
  - **KHÔNG NÊN BLOCK** người dùng. Việc block toàn bộ Profile form chỉ vì 1 file tải lên đi ngược lại nguyên lý UX Non-blocking.
  - Về mặt Logic: AI xử lý ở phía Backend chỉ đơn thuần là phân tích **file PDF tĩnh** để xuất ra một cục cấu trúc biến JSON (ví dụ gọi là `extractedJsonData`). Cục thông tin này hoàn toàn không tự động ghi đè ngay vào Database.
  - Phép so sánh **Diff (Before/After)** (vui lòng xem Mục 3.2 - hàm `generateDiff`) chỉ được Backend thực sự tính toán tại đúng cái khoảnh khắc mà người dùng **Click vào Toast Notification** để mở Popup Model.
  - Do vậy, trong 15-25s chờ đợi đó, dù người dùng có vừa tay nhanh tay thay đổi thêm "Kỹ năng Photoshop" vào hồ sơ trên web, thì lúc họ bấm vào Toast, Backend sẽ dùng cục `extractedJsonData` để so sánh chéo với **cơ sở dữ liệu Profile mới nhất ở chính giây phút click đó**, đảm bảo người dùng chả vấp phải xung đột (Race Condition) nào cả.

### 4.4. Dung lượng File & Context Window Limit

- **Vấn đề**: Candidate có thể upload file PDF nặng 20MB hoặc tệp dài tận 10 trang. Gửi toàn bộ text nhảm này lên API sẽ tốn RẤT lớn chi phí (Token Cost).
- **Giải pháp**:
  - Đặt giới hạn ở Middleware của NestJS (VD: Max 5MB cho PDF CV).
  - Có hàm `trimText()` để cắt gọt giới hạn số lượng ký tự tối đa của PDF (VD: Cắt lấy 5000 - 8000 words đầu tiên) để vừa đủ nhận diện toàn bộ CV thông thường, vừa tiết kiệm Token gửi lên LLM.

### 4.4. Bảo mật dữ liệu ứng viên (PII Privacy)

- **Vấn đề**: Việc gửi thông tin như Số Điện Thoại, Tên thật, Địa chỉ lên API của Google có vi phạm chính sách quyền riêng tư hay không?
- **Giải pháp**: Bản chất API trả phí (Google Cloud Vertex AI hoặc Gemini Developer API bản Pro) không lạm dụng (opt-out) dữ liệu gửi vào để tính toán huấn luyện mô hình. Tuy nhiên trong tương lai, có thể viết một hàm Regex ở Backend chuyên thay thế các số điện thoại / email thật thành `[REDACTED_PHONE]` hoặc `[REDACTED_EMAIL]` trước khi phi chuỗi Text lên đám mây, sau đó khi gen ra JSON thì Backend tự map ngược lại số thật vào. Điều này mang lại sự bảo mật tuyệt đối 100%.
