/**
 * MySQL API Endpoint za Super Admin Dashboard
 * Upravljanje uporabniških profilov direktno v MySQL bazi
 */

import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Configuration
const dbConfig = {
  host: process.env.MYSQL_HOST || '195.35.53.6',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'u816302701_virtual',
  password: process.env.MYSQL_PASSWORD || 'Vir007tu@l!',
  database: process.env.MYSQL_DATABASE || 'u816302701_standario2025',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Shared query helper
async function runQuery(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return { data: rows, error: null };
  } catch (error) {
    console.error('MySQL Query Error:', error);
    return { data: null, error: error.message };
  }
}

// Build SELECT statement with optional clauses
function buildSelectQuery(table, columns = '*', conditions = '', params = [], options = {}) {
  let sql = `SELECT ${columns} FROM ${table}`;
  const queryParams = [...params];

  if (conditions) {
    sql += ` WHERE ${conditions}`;
  }

  if (options.orderBy) {
    sql += ` ORDER BY ${options.orderBy} ${options.ascending === false ? 'DESC' : 'ASC'}`;
  }

  if (options.limit) {
    sql += ' LIMIT ?';
    queryParams.push(options.limit);
  }

  if (options.offset) {
    sql += ' OFFSET ?';
    queryParams.push(options.offset);
  }

  return { sql, queryParams };
}

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL povezava uspešna');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL napaka:', error.message);
  }
}

// Generic MySQL endpoints used by the frontend compatibility layer
app.post('/api/mysql/select', async (req, res) => {
  const { table, columns = '*', conditions = '', params = [], options = {} } = req.body || {};

  const { sql, queryParams } = buildSelectQuery(table, columns, conditions, params, options);
  const result = await runQuery(sql, queryParams);
  if (result.error) {
    return res.status(500).json({ success: false, error: result.error });
  }
  return res.json({ success: true, data: result.data });
});

app.post('/api/mysql/query', async (req, res) => {
  const { sql, params = [] } = req.body || {};
  if (!sql) {
    return res.status(400).json({ success: false, error: 'SQL statement is required' });
  }

  const result = await runQuery(sql, params);
  if (result.error) {
    return res.status(500).json({ success: false, error: result.error });
  }
  return res.json({ success: true, data: result.data });
});

app.post('/api/mysql/insert', async (req, res) => {
  const { table, data } = req.body || {};
  if (!table || !data || typeof data !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid insert payload' });
  }

  const columns = Object.keys(data);
  const placeholders = columns.map(() => '?').join(', ');
  const values = columns.map(col => data[col]);
  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

  const result = await runQuery(sql, values);
  if (result.error) {
    return res.status(500).json({ success: false, error: result.error });
  }
  return res.json({ success: true, data: result.data });
});

app.post('/api/mysql/update', async (req, res) => {
  const { table, data, conditions = '', params = [] } = req.body || {};
  if (!table || !data || typeof data !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid update payload' });
  }

  const setClause = Object.keys(data).map(col => `${col} = ?`).join(', ');
  const values = [...Object.values(data), ...params];
  let sql = `UPDATE ${table} SET ${setClause}`;
  if (conditions) {
    sql += ` WHERE ${conditions}`;
  }

  const result = await runQuery(sql, values);
  if (result.error) {
    return res.status(500).json({ success: false, error: result.error });
  }
  return res.json({ success: true, data: result.data });
});

app.post('/api/mysql/delete', async (req, res) => {
  const { table, conditions = '', params = [] } = req.body || {};
  if (!table) {
    return res.status(400).json({ success: false, error: 'Invalid delete payload' });
  }

  let sql = `DELETE FROM ${table}`;
  if (conditions) {
    sql += ` WHERE ${conditions}`;
  }

  const result = await runQuery(sql, params);
  if (result.error) {
    return res.status(500).json({ success: false, error: result.error });
  }
  return res.json({ success: true, data: result.data });
});

app.post('/api/mysql/batch-delete', async (req, res) => {
  const { table, ids = [] } = req.body || {};
  if (!table || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: 'Invalid batch delete payload' });
  }

  const placeholders = ids.map(() => '?').join(', ');
  const sql = `DELETE FROM ${table} WHERE id IN (${placeholders})`;

  const result = await runQuery(sql, ids);
  if (result.error) {
    return res.status(500).json({ success: false, error: result.error });
  }
  return res.json({ success: true, data: result.data });
});

app.post('/api/mysql/batch-update', async (req, res) => {
  const { table, data, ids = [] } = req.body || {};
  if (!table || !data || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, error: 'Invalid batch update payload' });
  }

  const setClause = Object.keys(data).map(col => `${col} = ?`).join(', ');
  const placeholders = ids.map(() => '?').join(', ');
  const sql = `UPDATE ${table} SET ${setClause} WHERE id IN (${placeholders})`;
  const values = [...Object.values(data), ...ids];

  const result = await runQuery(sql, values);
  if (result.error) {
    return res.status(500).json({ success: false, error: result.error });
  }
  return res.json({ success: true, data: result.data });
});

app.post('/api/mysql/search', async (req, res) => {
  const { table, columns = [], searchTerm = '', options = {} } = req.body || {};
  if (!table || !Array.isArray(columns) || columns.length === 0) {
    return res.status(400).json({ success: false, error: 'Invalid search payload' });
  }

  const likeConditions = columns.map(col => `${col} LIKE ?`).join(' OR ');
  const params = columns.map(() => `%${searchTerm}%`);
  const { sql, queryParams } = buildSelectQuery(table, '*', likeConditions, params, options);

  const result = await runQuery(sql, queryParams);
  if (result.error) {
    return res.status(500).json({ success: false, error: result.error });
  }
  return res.json({ success: true, data: result.data });
});

// GET /api/profiles - List all profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const { search, organization_id, role } = req.query;
    
    let query = 'SELECT * FROM profiles WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (email LIKE ? OR full_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (organization_id) {
      query += ' AND organization_id = ?';
      params.push(organization_id);
    }
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/profiles - Create new profile
app.post('/api/profiles', async (req, res) => {
  try {
    const { email, full_name, role, organization_id, first_name, last_name } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    // Generate UUID for new profile
    const id = crypto.randomUUID();
    const user_id = crypto.randomUUID();
    
    const query = `
      INSERT INTO profiles (
        id, user_id, email, full_name, first_name, last_name,
        role, organization_id, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `;
    
    const params = [
      id,
      user_id,
      email,
      full_name || '',
      first_name || '',
      last_name || '',
      role || 'user',
      organization_id || null
    ];
    
    await pool.query(query, params);
    
    // Fetch the created profile
    const [rows] = await pool.query('SELECT * FROM profiles WHERE id = ?', [id]);
    
    res.json({ success: true, data: rows[0], message: 'Profile created successfully' });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/profiles/:id - Update profile
app.patch('/api/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, role, organization_id, first_name, last_name } = req.body;
    
    const updates = [];
    const params = [];
    
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (full_name !== undefined) {
      updates.push('full_name = ?');
      params.push(full_name);
    }
    if (first_name !== undefined) {
      updates.push('first_name = ?');
      params.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push('last_name = ?');
      params.push(last_name);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }
    if (organization_id !== undefined) {
      updates.push('organization_id = ?');
      params.push(organization_id);
    }
    
    updates.push('updated_at = NOW()');
    params.push(id);
    
    const query = `UPDATE profiles SET ${updates.join(', ')} WHERE id = ?`;
    
    await pool.query(query, params);
    
    // Fetch updated profile
    const [rows] = await pool.query('SELECT * FROM profiles WHERE id = ?', [id]);
    
    res.json({ success: true, data: rows[0], message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/profiles/:id - Delete profile
app.delete('/api/profiles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM profiles WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ status: 'OK', database: 'Connected' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', database: error.message });
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 MySQL API Server running on port ${PORT}`);
  await testConnection();
});

export default app;
