import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'; // Import Router components
import './App.css';

function App() {
  const [stock, setStock] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedItem, setEditedItem] = useState({});
  const [newItem, setNewItem] = useState({ productName: '', email: '', price: '' });

  const [user, setUser] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetch('http://localhost:3000/stock')
      .then(res => res.json())
      .then(data => setStock(data))
      .catch(err => {
        console.error('Error fetching data:', err);
        alert('Error fetching stock data.');
      });
  }, []);

  // Add product
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newItem.productName || !newItem.email || !newItem.price) return alert('All fields required.');
    fetch('http://localhost:3000/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    })
      .then(res => res.json())
      .then(added => {
        setStock(prev => [...prev, { ...newItem, productId: added.productId }]);
        setNewItem({ productName: '', email: '', price: '' });
      })
      .catch(() => alert('Error adding product.'));
  };

  // Edit
  const handleEdit = (item) => {
    setEditingItemId(item.productId);
    setEditedItem({ ...item });
  };

  const handleSave = () => {
    fetch(`http://localhost:3000/stock/${editingItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editedItem),
    })
      .then(res => res.json())
      .then(() => {
        setStock(prev => prev.map(item => item.productId === editingItemId ? editedItem : item));
        setEditingItemId(null);
        setEditedItem({});
      })
      .catch(() => alert('Error updating item.'));
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:3000/stock/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => setStock(prev => prev.filter(item => item.productId !== id)))
      .catch(() => alert('Error deleting item.'));
  };

  const handleCancel = () => {
    setEditingItemId(null);
    setEditedItem({});
  };

  const handleChange = (e, setStateFunc) => {
    const { name, value } = e.target;
    setStateFunc(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
  };

  const renderTable = (isEditable = true) => (
    <>
      {isEditable && (
        <form onSubmit={handleAddProduct}>
          <h3>Enter Product</h3>
          <input name="productName" value={newItem.productName} onChange={e => handleChange(e, setNewItem)} placeholder="Product Name" />
          <input name="email" value={newItem.email} onChange={e => handleChange(e, setNewItem)} placeholder="Email" />
          <input name="price" type="number" value={newItem.price} onChange={e => handleChange(e, setNewItem)} placeholder="Price" />
          <button type="submit">Add Product</button>
        </form>
      )}
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Email</th><th>Price</th>
            {isEditable && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {stock.length === 0 ? (
            <tr><td colSpan={isEditable ? 5 : 4}>No inventory data.</td></tr>
          ) : (
            stock.map(item => (
              <tr key={item.productId}>
                <td>{item.productId}</td>
                <td>{editingItemId === item.productId ? <input name="productName" value={editedItem.productName || ''} onChange={e => handleChange(e, setEditedItem)} /> : item.productName}</td>
                <td>{editingItemId === item.productId ? <input name="email" value={editedItem.email || ''} onChange={e => handleChange(e, setEditedItem)} /> : item.email}</td>
                <td>{editingItemId === item.productId ? <input name="price" type="number" value={editedItem.price || ''} onChange={e => handleChange(e, setEditedItem)} /> : item.price}</td>
                {isEditable && (
                  <td>
                    {editingItemId === item.productId ? (
                      <>
                        <button onClick={handleSave}>Save</button>
                        <button onClick={handleCancel}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(item)}>Edit</button>
                        <button onClick={() => handleDelete(item.productId)}>Delete</button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );

  const renderUserForm = () => (
    <form style={{ maxWidth: 400, margin: 'auto' }}>
      <h3>User Register Form</h3>
      <input name="name" placeholder="Name" value={user.name} onChange={e => handleChange(e, setUser)} />
      <input name="email" placeholder="Email" value={user.email} onChange={e => handleChange(e, setUser)} />
      <input name="password" placeholder="Password" type="password" value={user.password} onChange={e => handleChange(e, setUser)} />
      <button type="button" onClick={() => alert(`Registered: ${user.name}`)}>Register</button>
    </form>
  );

  return (
    <Router>
      <div className="App">
        {/* Navbar */}
        <nav className="navbar">
          <Link to="/">Home</Link>
          <Link to="/report">Report</Link>
          <Link to="/user">User Register</Link>
        </nav>

        <h2>
          <Routes>
            <Route path="/" element={<div>Inventory Stock</div>} />
            <Route path="/report" element={<div>Inventory Report</div>} />
            <Route path="/user" element={<div>User Registration</div>} />
          </Routes>
        </h2>

        <Routes>
          <Route path="/" element={renderTable(true)} />
          <Route path="/report" element={renderTable(false)} />
          <Route path="/user" element={renderUserForm()} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

