/**
 * MySQL API Endpoint za Super Admin Dashboard
 * Upravljanje uporabniških profilov direktno v MySQL bazi
 */

import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

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
