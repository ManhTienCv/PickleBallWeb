

<!-- Start of picture text -->
I<br>System/information<br>engineering<br>| —- ai ~_}<br><!-- End of picture text -->

# **Trọng tâm phải thể hiện được:** 

1. Tổng quan về Kiến trúc và thiết kế phần mềm ( _Cơ sở lý thuyết_ ) 

2. Phân tích yêu cầu 

3. Thiết kế kiến trúc 

4. Thiết kế dữ liệu và lớp 

5. Thiết kế giao diện và thiết kế thành phần. 

|**Trang bìa chính**|**Mở đầu**|
|---|---|
|**Trang bìa phụ**|**Chương 1: Tổng quan về Kiến trúc và thiết kế phần mềm**|
|**Lời cảm ơn**|**Chương 2: Phân tích yêu cầu hệ thống**|
|**Mục lục**|**Chương 3: Thiết kế kiến trúc**|
|**Danh mục chữ viết tắt**|**Chương 4: Thiết kế dữ liệu và lớp**|
|**Danh mục bảng biểu**|**Chương 5: Thiết kế giao diện và thành phần**|
|**Danh mục hình ảnh**|**Kết luận và kiến nghị**|
||**Tài liệu tham khảo**|



||**Câu hỏi trọng tâm**|**Sản phẩm chính**|
|---|---|---|
|**Chương**|||
|1. Tổng|Thiết kế phần mềm là gì?||
|quan|||
|2. Phân<br>tích yêu<br>cầu|Phần mềm làm được gì? Như thế nào?|Use Case<br>Activity Diagram|
|3. Kiến|Hệ thống được tổ chức như thế nào?|Architecture Diagram|
|trúc|||
|4. Dữ liệu|Các đối tượng và dữ liệu được tổ chức ra sao?|ERD, Class Diagram|
|& lớp|Đối tượng thay đổi trạng thái như thế nào?|State Diagram|
|5. Giao|Người dùng tương tác thế nào và từng thành phần làm gì?|UI|
|diện &|Các đối tượng/thành phần tương tác với nhau như thế nào?|Component Diagram|
|thành phần||Sequence Diagram|



|**Mở đầu**<br>1. Lý do chọn đề tài<br>2. Mục tiêu nghiên cứu<br>3. Đối tượng và phạm vi nghiên cứu<br>4. Phương pháp thực hiện<br>5. Cấu trúc báo cáo<br>|**Chương 1: Tổng quan về Kiến trúc và thiết kế**<br>**phần mềm**<br>1.1. Thiết kế phần mềm trong quy trình phát triển<br>1.2. Kiến trúc phần mềm<br>1.3. Các nguyên lý thiết kế<br>1.4. Thể loại và phong cách kiến trúc<br>1.5. Mẫu thiết kế<br>|
|---|---|
|**Chương 2: Phân tích yêu cầu hệ thống**<br>2.1. Tổng quan bài toán<br>2.2. Yêu cầu chức năng<br> _(Sơ đồ use case_<br>_Đặc tả một số use case trọng tâm)_<br>2.3. Mô hình hóa quy trình nghiệp vụ<br>2.4. Yêu cầu phi chức năng và ràng buộc<br>|**Chương 3: Thiết kế kiến trúc**<br>3.1. Thể loại kiến trúc<br>3.2. Lựa chọn phong cách kiến trúc<br>3.3. Kiến trúc tổng thể của hệ thống<br> _(Sơ đồ kiến trúc tổng thể)_<br>3.4. Phân rã hệ thống thành các thành phần<br> _(Sơ đồ phân rã thành phần)_<br>3.5. Đánh giá kiến trúc<br>|
|**Chương 4: Thiết kế dữ liệu và lớp**<br>4.1. Thiết kế dữ liệu_(Sơ đồ ERD)_<br>4.2. Thiết kế lớp_(Sơ đồ lớp)_<br>4.3. Ánh xạ giữa mô hình lớp và mô hình<br>dữ liệu<br>4.4. Thiết kế hành vi của đối tượng<br>_(Sơ đồ trạng thái)_<br>4.5. Quan hệ giữa thiết kế lớp và thiết kế<br>kiến trúc|**Chương 5: Thiết kế giao diện và thành phần**<br>5.1. Thiết kế giao diện<br>5.2. Thiết kế thành phần (T_ương tác giữa các_<br>_thành phần => Sơ đồ tuần tự)_<br>-----------------------------------------------------------<br>**Kết luận và kiến nghị**<br>1. Kết luận<br>- Kết quả đạt được<br>- Hạn chế<br>2. Kiến nghị<br>3. Hướng phát triển<br>-----------------------------------------------------------|



**<u>Tài liệu tham khảo</u>** 

# **CHƯƠNG 1. TỔNG QUAN VỀ KIẾN TRÚC VÀ THIẾT KẾ PHẦN MỀM 1.1. Thiết kế phần mềm trong quy trình phát triển** 

- _1.1.1. Một số khái niệm_ 

- _1.1.2. Chuyển đổi sang mô hình thiết kế_ 

# **1.2. Kiến trúc phần mềm** 

- _1.2.1. Khái niệm kiến trúc phần mềm_ 

- _1.2.2. Kiến trúc và các thuộc tính chất lượng_ 

- _1.2.3. Yêu cầu có ý nghĩa kiến trúc_ 

# **1.3. Các nguyên lý thiết kế** 

- _1.3.1. Trừu tượng hóa và che giấu thông tin_ 

- _1.3.2. Phân tách mối quan tâm và mô đun hóa_ 

- _1.3.3. Tính gắn kết và tính ghép nối_ 

- _1.3.4. Nguyên lý SOLID_ 

# **1.4. Thể loại và phong cách kiến trúc** 

- _1.4.1. Thể loại kiến trúc_ 

- Khái niêm: 

- Một số thể loại kiến trúc: 

- _1.4.2. Phong cách kiến trúc_ 

- Khái niêm: 

- Một số phong cách kiến trúc: 

- _1.4.3. So sánh thể loại và phong cách kiến trúc_ 

# **1.5. Mẫu thiết kế** 

# **CHƯƠNG 2. PHÂN TÍCH YÊU CẦU HỆ THỐNG** 

# **2.1. Tổng quan bài toán** 

- _2.1.1. Bối cảnh và hiện trạng_ 

- _2.1.2. Vấn đề cần giải quyết và mục tiêu hệ thống_ 

- _2.1.3. Phạm vi hệ thống_ 

# **2.2. Yêu cầu chức năng** 

- _2.2.1. Danh mục yêu cầu chức năng_ 

- _2.2.2. Sơ đồ use case_ 

- _2.2.3. Đặc tả các use case trọng tâm_ 

# **2.3. Mô hình hóa quy trình nghiệp vụ** 

_2.3.1. Quy trình …???_ 

- _2.3.2. Quy trình …???_ 

_2.3.3. Quy trình …???_ 

# **2.5. Yêu cầu phi chức năng và ràng buộc** 

- _2.5.1. Yêu cầu phi chức năng_ 

- _2.5.2. Ràng buộc_ 

**CHƯƠNG 3. THIẾT KẾ KIẾN TRÚC** 

- **3.1. Thể loại hệ thống và tiêu chí lựa chọn** 

- **3.2. Lựa chọn phong cách kiến trúc** 

   - _3.2.1. So sánh các phương án theo tiêu chí_ 

   - _3.2.2. Quyết định lựa chọn kiến trúc phân lớp_ 

   - _3.2.3. Quan hệ giữa phong cách kiến trúc, mẫu kiến trúc và mẫu thiết kế_ 

# **3.3. Kiến trúc tổng thể của hệ thống** 

- _3.3.1. Sơ đồ kiến trúc tổng thể_ 

- _3.3.2. Trách nhiệm của từng tầng_ 

- _3.3.3. Quy tắc phụ thuộc và trao đổi dữ liệu giữa các tầng_ 

# **3.4. Phân rã hệ thống thành các thành phần** 

- _3.4.1. Danh mục thành phần và trách nhiệm_ 

- _3.4.2. Sơ đồ phân rã thành phần_ 

- _3.4.3. Phụ thuộc giữa các thành phần_ 

# **3.5. Đánh giá kiến trúc** 

- _3.5.1. Phương pháp đánh giá_ 

- _3.5.2. Đánh giá theo các kịch bản chất lượng_ 

- _3.5.3. Điểm nhạy cảm, điểm đánh đổi và rủi ro_ 

**CHƯƠNG 4. THIẾT KẾ DỮ LIỆU VÀ LỚP** 

# **4.1. Thiết kế dữ liệu** 

- _4.1.1. Thực thể, thuộc tính_ 

- _4.1.2. Mối quan hệ_ 

- _4.1.3. Sơ đồ thực thể quan hệ_ 

# **4.2. Thiết kế lớp** 

- _4.2.1. Xác định lớp và trách nhiệm_ 

- _4.2.2. Thuộc tính, phương thức và quan hệ giữa các lớp_ 

- _4.2.3. Sơ đồ lớp_ 

# **4.3. Thiết kế hành vi của đối tượng** 

- _4.3.1. Sơ đồ trạng thái đối tượng …???_ 

- _4.3.2. Sơ đồ trạng thái đối tượng …???_ 

- _4.3.3. Sơ đồ trạng thái đối tượng …???_ 

# **4.4. Quan hệ giữa thiết kế lớp và thiết kế kiến trúc** 

# **CHƯƠNG 5. THIẾT KẾ GIAO DIỆN VÀ THÀNH PHẦN** 

# **5.1. Thiết kế giao diện** 

- _5.1.1. Nguyên tắc thiết kế giao diện_ 

- _5.1.2. Người dùng và cấu trúc điều hướng_ 

- _5.1.3. Thiết kế màn hình_ 

- _5.1.4. Thiết kế giao diện với hệ thống ngoài_ 

# **5.2. Thiết kế thành phần** 

- _5.2.1. Interface của các thành phần_ 

- _5.2.2. Sơ đồ thành phần_ 

- _5.2.3. Thiết kế tương tác giữa các thành phần_ 

- _5.2.4. Thiết kế chi tiết các thành phần trọng tâm_ 

- _5.2.5. Đánh giá theo tính gắn kết và tính ghép nối_ 

