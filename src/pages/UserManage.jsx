import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "../styles/UserManage.css";

const UserManage = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('');

  // Fetch users from the backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Handle form submission (create or update user)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUser = { name, email, phone: mobile, role };

    try {
      if (editingUser) {
        // Update existing user
        await axios.put(`http://localhost:5000/users/${editingUser.userid}`, newUser);
        setUsers(users.map((user) => (user.userid === editingUser.userid ? { ...user, ...newUser } : user)));
      } else {
        // Create new user
        const response = await axios.post('http://localhost:5000/users', newUser);
        setUsers([...users, response.data]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  // Handle editing a user
  const handleEdit = (user) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setMobile(user.phone);
    setRole(user.role);
  };

  // Handle deleting a user
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/users/${id}`);
      setUsers(users.filter((user) => user.userid !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Reset the form
  const resetForm = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setMobile('');
    setRole('');
  };

  return (
    <div className="dashboard">
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <h2>Admin Menu</h2>
        <ul>
          <li><Link to="/coursemanage">Courses</Link></li>
          <li><Link to="/learning">Domains</Link></li>
          <li><Link to="/usermanage">Users</Link></li>
          <li><Link to="/reports">Reports</Link></li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-title">User Management</div>
        </header>

        {/* User Management Form */}
        <div className="container">
          <form onSubmit={handleSubmit} className="user-form">
            <h2>{editingUser ? 'Edit User' : 'Create User'}</h2>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Mobile No.</label>
              <input
                type="tel"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingUser ? 'Update' : 'Create'}
              </button>
              {editingUser && (
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* User List */}
          <div className="user-list">
            <h2>User List</h2>
            <ul>
              {users.map((user) => (
                <li key={user.userid}>
                  <div className="user-info">
                    <span><strong>Name:</strong> {user.name}</span>
                    <span><strong>Email:</strong> {user.email}</span>
                    <span><strong>Mobile:</strong> {user.phone}</span>
                    <span><strong>Role:</strong> {user.role}</span>
                  </div>
                  <div className="user-actions">
                    <button onClick={() => handleEdit(user)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(user.userid)} className="btn-delete">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManage;
