import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();  
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
  }
};
console.log('DB_SERVER =', process.env.DB_SERVER);
export const connectDB = async () => {
  try {
    console.log(' Đang kết nối SQL Server...');
    await sql.connect(config);
    console.log(' Kết nối SQL Server thành công');
  } catch (err) {
    console.error(' Lỗi kết nối SQL Server:', err.message);
    throw err;
  }
};
const conn = new sql.ConnectionPool(config).connect().then(pool => {
  return pool;
});

export { conn, sql };