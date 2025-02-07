const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL Database"))
  .catch(err => console.error("❌ Database connection error:", err.message));

/** ==========================
 * 🛡️ Admin Authentication Routes
 ========================== */

// Admin Login
// Admin Login (without password hashing)
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Admin login attempt with email:", email);

    // Fetch admin details from database (no hashing here)
    const adminResult = await pool.query('SELECT id, email, password FROM admin WHERE email = $1', [email.toLowerCase()]);

    if (adminResult.rows.length === 0) {
      console.log("Admin not found.");
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const admin = adminResult.rows[0];

    // Compare password directly with plain text password
    if (password !== admin.password) {
      console.log("Password mismatch.");
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Successful login
    console.log("Login successful:", admin.email);
    res.status(200).json({
      message: 'Admin login successful',
      admin: { id: admin.id, email: admin.email },  // Return only available fields
    });
  } catch (err) {
    console.error("Error during admin login:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Create a new Admin
app.post('/admin/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Check if email is already registered
    const emailCheck = await pool.query('SELECT email FROM admin WHERE email = $1', [email.toLowerCase()]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store admin in the database
    const result = await pool.query(
      'INSERT INTO admin (email, password) VALUES ($1, $2) RETURNING id, email',
      [email.toLowerCase(), hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating admin:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
/** ==========================
 * 👤 User Management Routes
 ========================== */

// Fetch all users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT userid, name, email, phone, role, created_at, updated_at FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new user with default password
app.post('/users', async (req, res) => {
  const { name, email, phone, role } = req.body;

  // Check if required fields are present
  if (!name || !email || !phone) {
    return res.status(400).json({ error: "Name, email, and phone are required" });
  }

  try {
    // Default password
    const defaultPassword = 'defaultPassword123';
    
    // Hash the default password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Insert the user into the database
    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING userid, name, email, phone, role, created_at, updated_at',
      [name, email, phone, hashedPassword, role || 'student']
    );

    // Return the created user data
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update a user
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, phone = $3, role = $4, updated_at = NOW() WHERE userid = $5 RETURNING userid, name, email, phone, role, updated_at',
      [name, email, phone, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a user
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users WHERE userid = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/** ==========================
 * 📚 Learning Areas Routes
 ========================== */

// Get all learning areas
app.get('/learning-areas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM learningarea');
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching learning areas:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add a new learning area
app.post('/learning-areas', async (req, res) => {
  const { DomainName } = req.body;
  if (!DomainName) {
    return res.status(400).json({ error: "DomainName is required" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO learningarea (domainname) VALUES ($1) RETURNING *',
      [DomainName]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding learning area:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a learning area
app.delete('/learning-areas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM learningarea WHERE learningid = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Learning area not found" });
    }
    res.json({ message: "Learning area deleted successfully" });
  } catch (err) {
    console.error("Error deleting learning area:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post('/courses', async (req, res) => {
  const { title, description, price, learningAreaIds } = req.body;

  if (!title || !description || !price || !Array.isArray(learningAreaIds) || learningAreaIds.length === 0) {
    return res.status(400).json({ error: 'All fields are required, and at least one learning area should be selected' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const insertCourseQuery = `
      INSERT INTO courses (title, description, price, created_at, updated_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING courseid
    `;
    const courseResult = await client.query(insertCourseQuery, [title, description, price]);
    
    if (!courseResult.rows.length) {
      throw new Error('Failed to insert course');
    }
    
    const courseId = courseResult.rows[0].courseid;
    
    for (let learningAreaId of learningAreaIds) {
      const insertLearningAreaQuery = `
        INSERT INTO CourseLearningArea (CourseId, LearningId)
        VALUES ($1, $2)
      `;
      await client.query(insertLearningAreaQuery, [courseId, learningAreaId]);
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Course added successfully', courseId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding course:', err);
    res.status(500).json({ error: `Error adding course: ${err.message}` });
  } finally {
    client.release();
  }
});


// Create a new course
app.get('/courses', async (req, res) => {
  try {
    // Query to fetch courses with their associated learning areas
    const result = await pool.query(`
      SELECT c.courseid, c.title, c.description, c.price, 
             COALESCE(json_agg(l.domainname) FILTER (WHERE l.domainname IS NOT NULL), '[]') AS learning_areas
      FROM courses c
      LEFT JOIN CourseLearningArea cla ON c.courseid = cla.CourseId
      LEFT JOIN LearningArea l ON cla.LearningId = l.LearningId
      GROUP BY c.courseid
    `);

    // Send the fetched courses as a JSON response
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching courses:", err);
    
    // Respond with a more specific error message if possible
    if (err.code) {
      res.status(500).json({ error: `Database error: ${err.message}` });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});


app.delete('/courses/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // First delete related learning areas (if any)
    await pool.query('DELETE FROM courselearningarea WHERE courseid = $1', [id]);

    // Now delete the course itself
    const result = await pool.query('DELETE FROM courses WHERE courseid = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).send('Course not found');
    }

    res.status(200).send('Course deleted successfully');
  } catch (err) {
    console.error('Error deleting course:', err);  // More detailed error logging
    res.status(500).send(`Error deleting course: ${err.message}`);
  }
});

// Update a course
app.put('/courses/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, price } = req.body;

  try {
    const result = await pool.query(
      'UPDATE courses SET title = $1, description = $2, price = $3, updated_at = NOW() WHERE courseid = $4 RETURNING courseid, title, description, price, updated_at',
      [title, description, price, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating course:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/learning-areas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM learningarea');
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching learning areas:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
