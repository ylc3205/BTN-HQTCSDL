import express from 'express';
import { connectDB } from './config/connect.js';
import pkg from 'node-sql-parser';
import { conn, sql } from './config/connect.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import cors from 'cors';
const app = express();
const { Parser } = pkg;
const parser = new Parser();

// Middleware để parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SQL Web Editor API'
}));

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Kiểm tra trạng thái của API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API đang hoạt động
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: API is healthy
 */
app.get('/api/health', (req, res) => {
  res.send('API is healthy');
});

/**
 * @swagger
 * /api/query:
 *   post:
 *     summary: Thực thi SQL SELECT query
 *     description: Endpoint để thực thi các câu lệnh SQL SELECT. Chỉ chấp nhận SELECT queries, các loại query khác sẽ bị từ chối.
 *     tags: [Query]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QueryRequest'
 *     responses:
 *       200:
 *         description: Query thực thi thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QueryResponse'
 *       400:
 *         description: Query không hợp lệ hoặc lỗi syntax
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Query không được phép (không phải SELECT)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: Chỉ được phép thực thi câu lệnh SELECT
 *               details: "Phát hiện statement type: INSERT"
 */
app.post('/api/query', async (req, res) => {
  const { query } = req.body;

  // Validate query exists
  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      error: 'Query không hợp lệ',
      details: 'Body phải chứa field "query" kiểu string'
    });
  }

  try {
    // Parse SQL để kiểm tra
    const ast = parser.astify(query);
    
    // Kiểm tra nếu là array (multiple statements)
    const statements = Array.isArray(ast) ? ast : [ast];
    
    // Kiểm tra tất cả statements phải là SELECT
    for (const statement of statements) {
      if (statement.type !== 'select') {
        return res.status(403).json({
          error: 'Chỉ được phép thực thi câu lệnh SELECT',
          details: `Phát hiện statement type: ${statement.type.toUpperCase()}`
        });
      }
    }

    // Thực thi query
    const pool = await conn;
    const result = await pool.request().query(query);

    res.json({
      success: true,
      columns: result.recordset.length > 0
        ? Object.keys(result.recordset[0])
        : [],
      rows: result.recordset,
      rowCount: result.recordset.length
    });

  } catch (err) {
    console.error('Query error:', err);
    res.status(400).json({
      success: false,
      error: 'SQL không hợp lệ',
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

