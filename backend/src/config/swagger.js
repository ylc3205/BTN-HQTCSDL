import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SQL Web Editor API',
      version: '1.0.0',
      description: 'API cho SQL Web Editor - Chỉ hỗ trợ SELECT queries',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server'
      },
      {
        url: 'https://api.production.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints'
      },
      {
        name: 'Query',
        description: 'SQL query execution endpoints'
      }
    ],
    components: {
      schemas: {
        QueryRequest: {
          type: 'object',
          required: ['query'],
          properties: {
            query: {
              type: 'string',
              description: 'SQL SELECT query',
              example: 'SELECT * FROM users WHERE id = 1'
            }
          }
        },
        QueryResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Trạng thái thực thi query',
              example: true
            },
            columns: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Danh sách tên các cột',
              example: ['id', 'username', 'email']
            },
            rows: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Dữ liệu trả về',
              example: [
                { id: 1, username: 'user1', email: 'user1@example.com' },
                { id: 2, username: 'user2', email: 'user2@example.com' }
              ]
            },
            rowCount: {
              type: 'integer',
              description: 'Số lượng rows trả về',
              example: 2
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Trạng thái thực thi',
              example: false
            },
            error: {
              type: 'string',
              description: 'Thông báo lỗi',
              example: 'SQL không hợp lệ'
            },
            details: {
              type: 'string',
              description: 'Chi tiết lỗi',
              example: 'Syntax error near SELECT'
            }
          }
        }
      }
    }
  },
  // Scan file app.js để lấy JSDoc comments
  apis: [join(__dirname, '../app.js')]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

console.log('📚 Swagger scanning:', join(__dirname, '../app.js'));

export default swaggerSpec;
