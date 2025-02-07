import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';  // Importing Link for routing
import "../styles/Learning.css";  // Include CSS for the styles

const Learning = () => {
  const [learningAreas, setLearningAreas] = useState([]);
  const [newLearningArea, setNewLearningArea] = useState("");
  const [editingArea, setEditingArea] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState(null);

  const API_URL = "http://localhost:5000/learning-areas"; // Base URL

  // Fetch learning areas from backend
  const fetchLearningAreas = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to load data");
      const data = await response.json();
      console.log("Fetched learning areas:", data); // Debugging log
      setLearningAreas(data);
      setError("");
    } catch (error) {
      console.error("Error fetching learning areas:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningAreas();
  }, []);

  // Handle adding a new learning area
  const handleAddLearningArea = async () => {
    if (!newLearningArea.trim()) return alert("Enter a valid learning area name.");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ DomainName: newLearningArea.trim() }),
      });
      if (!response.ok) throw new Error("Failed to add learning area");
      fetchLearningAreas();
      setNewLearningArea("");
    } catch (error) {
      console.error("Error adding learning area:", error);
      alert("Error adding learning area.");
    }
  };

  // Handle editing a learning area
  const handleEdit = (area) => {
    setEditingArea(area.learningid); // Ensure ID is correctly referenced
    setUpdatedName(area.domainname);
  };

  // Save the updated learning area
  const handleSaveUpdate = async (id) => {
    if (!updatedName.trim()) return alert("Enter a valid name.");
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ DomainName: updatedName }),
      });
      if (!response.ok) throw new Error("Failed to update learning area");
      fetchLearningAreas();
      setEditingArea(null);
      setUpdatedName("");
    } catch (error) {
      console.error("Error updating learning area:", error);
      alert("Error updating learning area.");
    }
  };

  // Handle deleting a learning area (opens modal)
  const handleDelete = (id) => {
    setAreaToDelete(id);
    setShowDeleteModal(true);
  };

  // Confirm the deletion of a learning area
  const handleConfirmDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/${areaToDelete}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete learning area");
      fetchLearningAreas();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting learning area:", error);
      alert("Error deleting learning area.");
    }
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
          <div className="header-title">Learning Areas</div>
        </header>

        {/* Learning Content */}
        <div className="container">
          <h2 className="title">Learning Areas</h2>

          {/* Add New Learning Area */}
          <div className="add-area">
            <input
              type="text"
              className="add-input"
              placeholder="Enter new learning area"
              value={newLearningArea}
              onChange={(e) => setNewLearningArea(e.target.value)}
            />
            <button
              className="btn btn-add"
              onClick={handleAddLearningArea}
              disabled={loading}
            >
              Add
            </button>
          </div>

          {/* Loading & Error Messages */}
          {loading ? (
            <p className="loading">Loading...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {learningAreas.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="no-data">No learning areas available</td>
                  </tr>
                ) : (
                  learningAreas.map((area) => (
                    <tr key={area.learningid}>
                      <td>
                        {editingArea === area.learningid ? (
                          <input
                            type="text"
                            className="add-input"
                            value={updatedName}
                            onChange={(e) => setUpdatedName(e.target.value)}
                          />
                        ) : (
                          area.domainname
                        )}
                      </td>
                      <td>
                        {editingArea === area.learningid ? (
                          <button
                            className="btn btn-save"
                            onClick={() => handleSaveUpdate(area.learningid)}
                            disabled={loading}
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            className="btn btn-update"
                            onClick={() => handleEdit(area)}
                            disabled={loading}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(area.learningid)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Toast Notification */}
          {error && <div className="toast error show">{error}</div>}
          {!error && !loading && !learningAreas.length && (
            <div className="toast show">No learning areas available</div>
          )}
          {!loading && learningAreas.length && (
            <div className="toast show">Learning areas loaded successfully</div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="modal-overlay show">
              <div className="modal">
                <h3>Are you sure?</h3>
                <div className="modal-actions">
                  <button className="btn btn-confirm" onClick={handleConfirmDelete}>Confirm</button>
                  <button className="btn btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Learning;
