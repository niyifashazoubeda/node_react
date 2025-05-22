const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');  // Import bcryptjs for password hashing

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Change to your MySQL username
  password: '',  // Change to your MySQL password
  database: 'inventory'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err.message);
    return;
  }
  console.log('Connected to the MySQL database "inventory".');
});

// Get all products
app.get("/stock", (req, res) => {
  db.query('SELECT productId, productName, email, price FROM stock', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

// Add a new product
app.post("/stock", (req, res) => {
  const { productName, email, price } = req.body;
  if (!productName || !email || !price) {
    return res.status(400).json({ error: 'Please provide product name, email, and price' });
  }
  const query = 'INSERT INTO stock (productName, email, price) VALUES (?, ?, ?)';
  db.query(query, [productName, email, price], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
  });
});

// Update a product
app.put("/stock/:productId", (req, res) => {
  const { productId } = req.params;
  const { productName, email, price } = req.body;

  if (!productName && !email && !price) {
    return res.status(400).json({ error: 'Please provide at least one field to update (productName, email, or price)' });
  }

  const updateFields = [];
  const updateValues = [];
  if (productName) {
    updateFields.push('productName = ?');
    updateValues.push(productName);
  }
  if (email) {
    updateFields.push('email = ?');
    updateValues.push(email);
  }
  if (price) {
    updateFields.push('price = ?');
    updateValues.push(price);
  }

  const query = `UPDATE stock SET ${updateFields.join(', ')} WHERE productId = ?`;
  db.query(query, [...updateValues, productId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product updated successfully' });
  });
});

// Delete a product
app.delete("/stock/:productId", (req, res) => {
  const { productId } = req.params;

  const query = 'DELETE FROM stock WHERE productId = ?';
  db.query(query, [productId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// User Signup Route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists.' });
      }

      // Hash the password before storing it
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Insert new user into the users table
      db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database query failed' });
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Optional root route
app.get('/', (req, res) => {
  res.send('Server is running and connected to MySQL database "inventory".');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
// Register new user
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide a username, email, and password' });
  }

  // Hash the password before storing it in the database (using bcryptjs)
  const bcrypt = require('bcryptjs');
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Error hashing password' });
    }

    // Insert the new user into the database
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database query failed' });
      }
      res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    });
  });
});
