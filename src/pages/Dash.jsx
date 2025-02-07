import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import Axios for API requests
import '../styles/dash.css';

function Dash() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [users, setUsers] = useState([]); // State to hold user data
    const [courses, setCourses] = useState([]); // State to hold course data
    const [summary, setSummary] = useState({
        activeUsers: 0,
        pendingApprovals: 0,
        pendingPayments: 0,
        courses: 0,
    });

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // Fetch data from backend when the component mounts
    useEffect(() => {
        // Fetch users data
        axios.get('http://localhost:5000/users')
            .then(response => {
                setUsers(response.data);
                setSummary(prevSummary => ({
                    ...prevSummary,
                    activeUsers: response.data.length, // Example: Count active users
                }));
            })
            .catch(error => console.error('Error fetching users:', error));

        // Fetch courses data
        axios.get('http://localhost:5000/courses')
            .then(response => {
                setCourses(response.data);
                setSummary(prevSummary => ({
                    ...prevSummary,
                    courses: response.data.length, // Example: Count courses
                }));
            })
            .catch(error => console.error('Error fetching courses:', error));

        // Fetch additional data like pending approvals or payments if applicable
        // Example: setSummary with pending approvals and payments here
    }, []); // Empty array ensures this effect runs once when the component mounts

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
                    <div className="header-title">Admin Dashboard</div>
                    <div className="user-menu">
                        <button onClick={handleMenu} className="account-btn">Account</button>
                        {anchorEl && (
                            <div className="menu">
                                <div onClick={handleClose}>Profile</div>
                                <div onClick={handleClose}>Logout</div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Dashboard Summary */}
                <div className="summary-cards">
                    <div className="card">
                        <div className="card-title">Active Users</div>
                        <div className="card-value">{summary.activeUsers}</div>
                    </div>
                    <div className="card">
                        <div className="card-title">Pending Approvals</div>
                        <div className="card-value">{summary.pendingApprovals}</div>
                    </div>
                    <div className="card">
                        <div className="card-title">Pending Payments</div>
                        <div className="card-value">{summary.pendingPayments}</div>
                    </div>
                    <div className="card">
                        <div className="card-title">Courses</div>
                        <div className="card-value">{summary.courses}</div>
                    </div>
                </div>

                {/* User Management Table */}
                <div className="data-table">
                    <h3>Recent User Registrations</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.userid}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Reports & Charts */}
                <div className="charts">
                    <div className="chart">
                        <h4>User Activity</h4>
                        <div className="pie-chart"></div> {/* Placeholder for PieChart */}
                    </div>
                    <div className="chart">
                        <h4>Monthly Growth</h4>
                        <div className="line-chart"></div> {/* Placeholder for LineChart */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dash;
