import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/learning.css"; // Import the same CSS

const EditLearningArea = () => {
  const { id } = useParams(); // Get the ID from the URL
  const navigate = useNavigate();
  const [area, setArea] = useState(null);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedDetails, setUpdatedDetails] = useState("");
  const [updatedCourses, setUpdatedCourses] = useState(0);
  const [updatedStudents, setUpdatedStudents] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch area details based on ID from the URL
  useEffect(() => {
    const fetchAreaDetails = async () => {
      try {
        // Replace with your API call to fetch learning area details by ID
        const response = await axios.get(`/api/learning-areas/${id}`);
        setArea(response.data);
        setUpdatedName(response.data.name);
        setUpdatedDetails(response.data.details);
        setUpdatedCourses(response.data.numberOfCourses);
        setUpdatedStudents(response.data.enrolledStudents);
      } catch (error) {
        console.error("Error fetching area details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAreaDetails();
  }, [id]);

  // Handle save changes
  const handleSave = async () => {
    try {
      // Simulate saving updated data
      await axios.put(`/api/learning-areas/${id}`, {
        name: updatedName,
        details: updatedDetails,
        numberOfCourses: updatedCourses,
        enrolledStudents: updatedStudents,
      });

      // After saving, navigate back to the main page
      navigate("/learning");
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h1 className="title">Edit Learning Area</h1>
      {area && (
        <>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              placeholder="Enter learning area name"
            />
          </div>

          <div className="form-group">
            <label>Details</label>
            <textarea
              value={updatedDetails}
              onChange={(e) => setUpdatedDetails(e.target.value)}
              placeholder="Enter learning area details"
            />
          </div>

          <div className="form-group">
            <label>Number of Courses</label>
            <input
              type="number"
              value={updatedCourses}
              onChange={(e) => setUpdatedCourses(e.target.value)}
              placeholder="Enter number of courses"
            />
          </div>

          <div className="form-group">
            <label>Enrolled Students</label>
            <input
              type="number"
              value={updatedStudents}
              onChange={(e) => setUpdatedStudents(e.target.value)}
              placeholder="Enter number of enrolled students"
            />
          </div>

          <div className="form-group">
            <button onClick={handleSave} className="btn btn-save">
              Save Changes
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default EditLearningArea;
