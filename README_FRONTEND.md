# Tam Quốc Visualization Frontend

## 🎯 Tổng quan

Frontend hoàn chỉnh cho hệ thống phân tích mạng lưới nhân vật Tam Quốc, kết nối với FastAPI backend và cơ sở dữ liệu Neo4j.

## 🚀 Tính năng chính

### 📊 Dashboard
- **Thống kê tổng quan**: Số lượng nhân vật, mối quan hệ, thế lực
- **Phân bố theo thế lực**: Thống kê chi tiết từng phe
- **Preview mạng lưới**: Hiển thị mẫu network graph
- **Top nhân vật**: Danh sách nhân vật quan trọng nhất (theo centrality)
- **Quick actions**: Truy cập nhanh các chức năng chính

### 🕸️ Network Visualization
- **Interactive graph**: Mạng lưới tương tác với vis-network
- **Multiple view modes**: 
  - Subgraph: Hiển thị vùng lân cận của nhân vật
  - Neighbors: Hiển thị những nhân vật liên kết trực tiếp
  - Full: Hiển thị toàn bộ mạng lưới
- **Depth control**: Điều chỉnh độ sâu hiển thị (1-5 hops)
- **Node interaction**: Click để xem thông tin chi tiết
- **Export functionality**: Xuất hình ảnh PNG
- **Real-time stats**: Thống kê số nodes/edges hiện tại

### 👥 Character Management (CRUD)
- **Danh sách nhân vật**: Hiển thị tất cả nhân vật với filtering
- **Tìm kiếm**: Tìm theo tên hoặc thông tin
- **Lọc theo thế lực**: Thục Hán, Tào Ngụy, Đông Ngô, Khác
- **Thêm nhân vật mới**: Form tạo nhân vật với validation
- **Chỉnh sửa**: Update thông tin nhân vật
- **Xóa nhân vật**: Xóa với xác nhận
- **Quản lý mối quan hệ**: Tạo relationships giữa các nhân vật

### 📈 Analytics & Insights
- **Centrality Analysis**: 
  - Degree Centrality: Số lượng kết nối trực tiếp
  - PageRank: Tầm quan trọng dựa trên thuật toán Google
  - Betweenness: Vai trò "cầu nối" trong mạng lưới
- **Shortest Path**: Tìm đường kết nối ngắn nhất giữa 2 nhân vật
- **Network Statistics**: Mật độ, thành phần liên thông
- **Visual Analytics**: Biểu đồ và visualization cho insights

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.4.6 | React framework với App Router |
| **React** | 19.1.0 | UI library |
| **TailwindCSS** | 4.0 | Utility-first CSS framework |
| **vis-network** | 10.0.1 | Network visualization |
| **axios** | 1.6.0 | HTTP client cho API calls |
| **lucide-react** | 0.344.0 | Modern icon library |
| **react-hot-toast** | 2.4.1 | Toast notifications |

## 📁 Cấu trúc Project

```
src/
├── app/
│   ├── layout.js          # Root layout với metadata
│   ├── page.js            # Main application component
│   └── globals.css        # Global styles với TailwindCSS
├── components/
│   ├── Layout/
│   │   └── Navbar.js      # Navigation bar với tabs
│   ├── NetworkGraph/
│   │   └── NetworkGraph.js # Reusable network visualization
│   ├── Tabs/
│   │   ├── DashboardTab.js    # Dashboard overview
│   │   ├── NetworkTab.js      # Network visualization tab
│   │   ├── CharactersTab.js   # CRUD interface
│   │   └── AnalyticsTab.js    # Analytics & insights
│   └── index.js          # Component exports
├── lib/
│   └── api.js            # API client với axios
└── data/
    └── three_kingdoms.js # Static data (backup)
```

## 🔌 API Integration

### Endpoints được sử dụng:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Kiểm tra kết nối API |
| `/characters` | GET/POST/PUT/DELETE | CRUD nhân vật |
| `/factions` | GET | Danh sách thế lực |
| `/relationships` | POST | Tạo mối quan hệ |
| `/query/visual` | GET | Dữ liệu visualization |
| `/query/centrality` | GET | Phân tích centrality |
| `/query/shortest_path` | GET | Tìm đường đi ngắn nhất |
| `/query/subgraph` | GET | Trích xuất subgraph |
| `/query/multi_hop` | GET | Multi-hop traversal |

### Error Handling:
- **Network errors**: Hiển thị warning khi API offline
- **API errors**: Toast notifications với error details  
- **Validation**: Form validation trước khi submit
- **Loading states**: Loading indicators cho UX tốt hơn

## 🎨 UI/UX Features

### Design System:
- **Color scheme**: Themed theo 4 thế lực Tam Quốc
  - 🟢 Thục Hán: Green (#4CAF50)
  - 🔵 Tào Ngụy: Blue (#2196F3) 
  - 🟠 Đông Ngô: Orange (#FF9800)
  - 🟣 Khác: Purple (#9C27B0)

### Responsive Design:
- **Mobile-first**: Tối ưu cho mobile devices
- **Tablet support**: Layout grid responsive
- **Desktop**: Full features với sidebar layouts

### Accessibility:
- **Keyboard navigation**: Tab support
- **Screen reader**: Semantic HTML
- **Color contrast**: WCAG compliant
- **Focus indicators**: Clear focus states

## 🚦 Hướng dẫn chạy

### 1. Cài đặt dependencies:
```bash
npm install
# hoặc
yarn install
```

### 2. Khởi động development server:
```bash
npm run dev
# hoặc 
yarn dev
```

### 3. Truy cập ứng dụng:
```
http://localhost:3000
```

### 4. Đảm bảo FastAPI backend đang chạy:
```
http://localhost:8000
```

## 🔧 Configuration

### Environment Variables:
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Customization:
- **API URL**: Thay đổi trong `src/lib/api.js`
- **Colors**: Customize trong `src/app/globals.css`
- **Network options**: Modify trong `NetworkGraph.js`

## 📊 Performance

### Optimizations:
- **Code splitting**: Automatic với Next.js App Router
- **Image optimization**: Next.js built-in
- **Bundle analysis**: `npm run build` để check size
- **Lazy loading**: Components load on demand

### Network Performance:
- **Request caching**: Axios interceptors
- **Debounced search**: Reduce API calls
- **Pagination**: Large datasets handling
- **Error boundaries**: Graceful error handling

## 🐛 Troubleshooting

### Common Issues:

1. **API Connection Failed**:
   - Check FastAPI server: `http://localhost:8000/docs`
   - Verify CORS settings in backend
   - Check network/firewall settings

2. **Network Graph Not Loading**:
   - Ensure vis-network dependency installed
   - Check browser console for errors
   - Verify data format matches vis-network spec

3. **Styling Issues**:
   - Run `npm run build` to check Tailwind compilation
   - Check for CSS conflicts
   - Verify TailwindCSS config

## 🤝 Contributing

### Development Workflow:
1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards:
- **ESLint**: Follow Next.js recommended config
- **Prettier**: Code formatting
- **Component naming**: PascalCase for components
- **File structure**: Group by feature/function

## 📈 Future Enhancements

- [ ] **Real-time updates**: WebSocket integration
- [ ] **Advanced filtering**: Multiple criteria filtering
- [ ] **Data export**: CSV/JSON export functionality  
- [ ] **User authentication**: Login/role-based access
- [ ] **Themes**: Dark/light mode toggle
- [ ] **Performance metrics**: Graph analysis benchmarks
- [ ] **Mobile app**: React Native version

## 📞 Support

Nếu gặp vấn đề, hãy tạo issue trên GitHub hoặc liên hệ team phát triển.

---

**🎉 Chúc bạn khám phá thú vị với mạng lưới nhân vật Tam Quốc!**
