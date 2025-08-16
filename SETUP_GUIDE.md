# 🚀 Hướng dẫn Setup Hệ thống Tam Quốc Visualization

## 📋 Tổng quan

Hệ thống bao gồm 3 thành phần chính:
1. **Neo4j Database** - Cơ sở dữ liệu graph
2. **FastAPI Backend** - API server với graph analytics
3. **Next.js Frontend** - Web interface

## 🛠️ Prerequisites

### 1. Neo4j Database
- **Neo4j Desktop** hoặc **Neo4j Community Server**
- **Version**: 4.x hoặc 5.x
- **Port**: 7687 (Bolt), 7474 (HTTP)
- **Authentication**: username/password

### 2. Python Backend
- **Python**: 3.8+
- **FastAPI**: Async web framework
- **Neo4j Driver**: Python connector

### 3. Node.js Frontend  
- **Node.js**: 18+
- **npm** hoặc **yarn**
- **Modern browser**: Chrome, Firefox, Safari, Edge

## 📦 Installation Steps

### Step 1: Setup Neo4j Database

#### Option A: Neo4j Desktop (Recommended)
```bash
# 1. Download Neo4j Desktop
# https://neo4j.com/download/

# 2. Create new project
# 3. Add database với:
#    - Name: tamquoc-db
#    - Password: changeit (hoặc password tùy chọn)
#    - Version: 5.x

# 4. Start database
```

#### Option B: Neo4j Community Server
```bash
# Download và extract
# Configure authentication
# Start service
```

### Step 2: Load Data vào Neo4j

```bash
# 1. Cài đặt Python dependencies
pip install -r requirements_loader.txt

# 2. Update connection details trong full_data_loader.py nếu cần:
# URI = "bolt://localhost:7687"
# AUTH = ("neo4j", "your_password")

# 3. Chạy data loader
python run_loader.py

# Hoặc chạy trực tiếp:
python full_data_loader.py
```

**Output mong đợi:**
```
🚀 Starting Tam Quoc data loading process...
🗑️  Clearing database...
✅ Database cleared
📋 Creating constraints and indexes...
✅ Constraints and indexes created
👥 Creating characters...
   Creating 10 characters for Thục Hán...
   Creating 10 characters for Tào Ngụy...
   Creating 10 characters for Đông Ngô...
   Creating 6 characters for Khác...
✅ Created 36 characters across 4 factions
🔗 Creating relationships...
   Creating 3 'Nghĩa huynh' relationships...
   Creating 15 'Chủ - tướng' relationships...
   ...
✅ Created 28 relationships of 10 types
🎉 Tam Quoc data loading completed successfully!
```

### Step 3: Setup FastAPI Backend

```bash
# 1. Cài đặt FastAPI dependencies
pip install fastapi uvicorn neo4j python-multipart

# 2. Cài thêm dependencies từ main (2).py
pip install neo4j-driver pydantic typing

# 3. Update connection trong main (2).py nếu cần:
# NEO4J_URI = "bolt://localhost:7687"
# NEO4J_USER = "neo4j"  
# NEO4J_PASSWORD = "your_password"

# 4. Chạy FastAPI server
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Kiểm tra API:**
- API Docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### Step 4: Setup Next.js Frontend

```bash
# 1. Cài đặt Node.js dependencies
npm install

# 2. Start development server
npm run dev

# 3. Truy cập application
# http://localhost:3000
```

## 🔧 Configuration

### Neo4j Connection
```python
# trong full_data_loader.py và main (2).py
URI = "bolt://localhost:7687"
AUTH = ("neo4j", "your_password")
```

### API Configuration
```javascript
// trong src/lib/api.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

### Environment Variables
```bash
# .env.local (cho Next.js)
NEXT_PUBLIC_API_URL=http://localhost:8000

# .env (cho FastAPI - optional)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=changeit
```

## 🧪 Testing & Verification

### 1. Database Verification
```cypher
# Trong Neo4j Browser (http://localhost:7474)
MATCH (n) RETURN count(n) as total_nodes;
MATCH ()-[r]->() RETURN count(r) as total_relationships;
MATCH (c:Character) RETURN c.faction, count(c) as count ORDER BY count DESC;
```

### 2. API Testing
```bash
# Health check
curl http://localhost:8000/health

# List characters
curl http://localhost:8000/characters

# Get centrality
curl "http://localhost:8000/query/centrality?method=degree&limit=10"
```

### 3. Frontend Testing
- Truy cập: http://localhost:3000
- Kiểm tra API connection status
- Test các tab: Dashboard, Network, Characters, Analytics

## 🚨 Troubleshooting

### Neo4j Issues
```bash
# Kiểm tra service status
# Neo4j Desktop: Check database status
# Server: systemctl status neo4j

# Test connection
python -c "from neo4j import GraphDatabase; print('Neo4j OK' if GraphDatabase.driver('bolt://localhost:7687', auth=('neo4j', 'changeit')).verify_connectivity() else 'Neo4j Error')"
```

### FastAPI Issues
```bash
# Check dependencies
pip list | grep -E "(fastapi|neo4j|uvicorn)"

# Test import
python -c "import fastapi, neo4j; print('Imports OK')"

# Check port
netstat -an | grep :8000
```

### Frontend Issues
```bash
# Check dependencies
npm list --depth=0

# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Check port
netstat -an | grep :3000
```

## 📊 Performance Tuning

### Neo4j Optimization
```bash
# Trong neo4j.conf
dbms.memory.heap.initial_size=2G
dbms.memory.heap.max_size=4G
dbms.memory.pagecache.size=2G
```

### FastAPI Optimization
```python
# Trong main (2).py
# Add connection pooling
# Implement caching
# Add request limits
```

### Frontend Optimization
```bash
# Build optimization
npm run build
npm run start

# Bundle analysis
npm install --save-dev @next/bundle-analyzer
```

## 🔄 Development Workflow

### 1. Daily Development
```bash
# Terminal 1: Neo4j (nếu không dùng Desktop)
neo4j start

# Terminal 2: FastAPI
python -m uvicorn main:app --reload

# Terminal 3: Frontend  
npm run dev
```

### 2. Data Updates
```bash
# Reload data
python run_loader.py

# Restart API để clear cache
# Frontend tự động update
```

### 3. Schema Changes
```bash
# Update full_data_loader.py
# Re-run data loader
# Update API models nếu cần
# Update frontend types nếu cần
```

## 📈 Production Deployment

### Docker Setup (Optional)
```dockerfile
# Dockerfile cho FastAPI
FROM python:3.10-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```dockerfile
# Dockerfile cho Next.js
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  neo4j:
    image: neo4j:5.15
    environment:
      NEO4J_AUTH: neo4j/changeit
    ports:
      - "7474:7474"
      - "7687:7687"
  
  api:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - neo4j
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - api
```

## 🎯 Next Steps

1. **✅ Hoàn thành setup cơ bản**
2. **📊 Khám phá dashboard và network visualization**
3. **👥 Thử nghiệm CRUD operations**
4. **📈 Sử dụng analytics features**
5. **🔧 Customize theo nhu cầu**

---

**🎉 Chúc bạn thành công với hệ thống Tam Quốc Visualization!**
