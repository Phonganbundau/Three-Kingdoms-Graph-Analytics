export const nodes = [
  // --- Thục Hán ---
  { id: 1, label: "Lưu Bị", group: "Thục Hán", color: "#4CAF50" },
  { id: 2, label: "Quan Vũ", group: "Thục Hán", color: "#4CAF50" },
  { id: 3, label: "Trương Phi", group: "Thục Hán", color: "#4CAF50" },
  { id: 4, label: "Triệu Vân", group: "Thục Hán", color: "#4CAF50" },
  { id: 5, label: "Mã Siêu", group: "Thục Hán", color: "#4CAF50" },
  { id: 6, label: "Hoàng Trung", group: "Thục Hán", color: "#4CAF50" },
  { id: 7, label: "Gia Cát Lượng", group: "Thục Hán", color: "#4CAF50" },
  { id: 8, label: "Bàng Thống", group: "Thục Hán", color: "#4CAF50" },
  { id: 9, label: "Khương Duy", group: "Thục Hán", color: "#4CAF50" },
  { id: 10, label: "Ngụy Diên", group: "Thục Hán", color: "#4CAF50" },

  // --- Tào Ngụy ---
  { id: 20, label: "Tào Tháo", group: "Tào Ngụy", color: "#2196F3" },
  { id: 21, label: "Tào Phi", group: "Tào Ngụy", color: "#2196F3" },
  { id: 22, label: "Tào Chân", group: "Tào Ngụy", color: "#2196F3" },
  { id: 23, label: "Tư Mã Ý", group: "Tào Ngụy", color: "#2196F3" },
  { id: 24, label: "Hạ Hầu Đôn", group: "Tào Ngụy", color: "#2196F3" },
  { id: 25, label: "Hạ Hầu Uyên", group: "Tào Ngụy", color: "#2196F3" },
  { id: 26, label: "Trương Liêu", group: "Tào Ngụy", color: "#2196F3" },
  { id: 27, label: "Hứa Chử", group: "Tào Ngụy", color: "#2196F3" },
  { id: 28, label: "Từ Hoảng", group: "Tào Ngụy", color: "#2196F3" },
  { id: 29, label: "Vu Cấm", group: "Tào Ngụy", color: "#2196F3" },

  // --- Đông Ngô ---
  { id: 40, label: "Tôn Kiên", group: "Đông Ngô", color: "#FF9800" },
  { id: 41, label: "Tôn Sách", group: "Đông Ngô", color: "#FF9800" },
  { id: 42, label: "Tôn Quyền", group: "Đông Ngô", color: "#FF9800" },
  { id: 43, label: "Chu Du", group: "Đông Ngô", color: "#FF9800" },
  { id: 44, label: "Lỗ Túc", group: "Đông Ngô", color: "#FF9800" },
  { id: 45, label: "Lữ Mông", group: "Đông Ngô", color: "#FF9800" },
  { id: 46, label: "Lục Tốn", group: "Đông Ngô", color: "#FF9800" },
  { id: 47, label: "Cam Ninh", group: "Đông Ngô", color: "#FF9800" },
  { id: 48, label: "Hoàng Cái", group: "Đông Ngô", color: "#FF9800" },
  { id: 49, label: "Đinh Phụng", group: "Đông Ngô", color: "#FF9800" },

  // --- Thế lực khác ---
  { id: 60, label: "Đổng Trác", group: "Khác", color: "#9C27B0" },
  { id: 61, label: "Lữ Bố", group: "Khác", color: "#9C27B0" },
  { id: 62, label: "Điêu Thuyền", group: "Khác", color: "#9C27B0" },
  { id: 63, label: "Hoa Đà", group: "Khác", color: "#9C27B0" },
  { id: 64, label: "Viên Thiệu", group: "Khác", color: "#9C27B0" },
  { id: 65, label: "Viên Thuật", group: "Khác", color: "#9C27B0" },
  { id: 66, label: "Trương Tùng", group: "Khác", color: "#9C27B0" },
];

export const edges = [
  // --- Quan hệ nghĩa huynh ---
  { from: 1, to: 2, label: "Nghĩa huynh" },
  { from: 1, to: 3, label: "Nghĩa huynh" },
  { from: 2, to: 3, label: "Nghĩa huynh" },

  // --- Chủ - tướng Thục ---
  { from: 1, to: 4, label: "Chủ - tướng" },
  { from: 1, to: 5, label: "Chủ - tướng" },
  { from: 1, to: 6, label: "Chủ - tướng" },
  { from: 1, to: 10, label: "Chủ - tướng" },

  // --- Quân sư Thục ---
  { from: 1, to: 7, label: "Quân sư" },
  { from: 1, to: 8, label: "Quân sư" },
  { from: 7, to: 9, label: "Kế thừa" },

  // --- Chủ - tướng Ngụy ---
  { from: 20, to: 21, label: "Cha - con" },
  { from: 20, to: 22, label: "Chủ - tướng" },
  { from: 20, to: 23, label: "Quân sư" },
  { from: 20, to: 24, label: "Chủ - tướng" },
  { from: 20, to: 25, label: "Chủ - tướng" },
  { from: 20, to: 26, label: "Chủ - tướng" },
  { from: 20, to: 27, label: "Chủ - tướng" },
  { from: 20, to: 28, label: "Chủ - tướng" },
  { from: 20, to: 29, label: "Chủ - tướng" },

  // --- Chủ - tướng Ngô ---
  { from: 40, to: 41, label: "Cha - con" },
  { from: 41, to: 42, label: "Anh - em" },
  { from: 42, to: 43, label: "Chủ - tướng" },
  { from: 42, to: 44, label: "Chủ - tướng" },
  { from: 42, to: 45, label: "Chủ - tướng" },
  { from: 42, to: 46, label: "Chủ - tướng" },
  { from: 42, to: 47, label: "Chủ - tướng" },
  { from: 42, to: 48, label: "Chủ - tướng" },
  { from: 42, to: 49, label: "Chủ - tướng" },

  // --- Quan hệ nổi bật khác ---
  { from: 60, to: 61, label: "Chủ - tướng" },
  { from: 61, to: 62, label: "Tình cảm" },
  { from: 64, to: 65, label: "Anh - em" },
  { from: 1, to: 43, label: "Đồng minh Xích Bích" },
  { from: 42, to: 1, label: "Đồng minh Xích Bích" },
  { from: 1, to: 20, label: "Kẻ thù" },
  { from: 20, to: 42, label: "Kẻ thù" },
  { from: 61, to: 20, label: "Từng phục vụ" },
];
