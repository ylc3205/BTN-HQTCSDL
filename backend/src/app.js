import express from 'express';
import { connectDB } from './config/connect.js';
import { conn, sql } from './config/connect.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import cors from 'cors';
import rateLimit from 'express-rate-limit'; // Thêm thư viện Rate Limit

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ==========================================
// CẤU HÌNH BẢO MẬT (RATE LIMITING)
// ==========================================
// Giới hạn 30 request / 1 phút / 1 IP cho API Query
const queryLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Quá tải hệ thống',
    details: 'Bạn đã thực thi quá nhiều câu lệnh. Vui lòng đợi 1 phút.'
  }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SQL Web Editor API'
}));

app.get('/api/health', (req, res) => {
  res.send('API is healthy');
});

// Gắn queryLimiter vào route này
app.post('/api/query', queryLimiter, async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      error: 'Query không hợp lệ',
      details: 'Body phải chứa field "query" kiểu string'
    });
  }

  // BẢO MẬT 1: Ngăn chặn chạy nhiều câu lệnh cùng lúc (Multiple Queries)
  if (query.includes(';')) {
    return res.status(403).json({
      error: 'Phát hiện truy vấn kép',
      details: 'Chỉ được phép chạy 1 câu lệnh duy nhất mỗi lần (không dùng dấu ;)'
    });
  }

  // BẢO MẬT 2: Chỉ cho phép câu lệnh bắt đầu bằng SELECT hoặc WITH
  if (!/^\s*(select|with)\b/i.test(query)) {
    return res.status(403).json({
      error: 'Chỉ được phép thực thi câu lệnh SELECT',
      details: 'Vui lòng bắt đầu câu lệnh bằng SELECT hoặc WITH'
    });
  }

  try {
    const pool = await conn;
    const result = await pool.request().query(query);

    res.json({
      success: true,
      columns: result.recordset && result.recordset.length > 0
        ? Object.keys(result.recordset[0])
        : [],
      rows: result.recordset || [],
      rowCount: result.recordset ? result.recordset.length : 0
    });

  } catch (err) {
    console.error('Query error:', err);
    res.status(400).json({
      success: false,
      error: 'Lỗi thực thi SQL',
      details: err.message
    });
  }
});

const startServer = async () => {
  await connectDB();

  app.listen(5001, () => {
    console.log('Server is running on port 5001');
  });
};

startServer();
export default app;