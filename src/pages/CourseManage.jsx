import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/CourseManage.css";

function CourseManage() {
  const [courses, setCourses] = useState([]);
  const [learningAreas, setLearningAreas] = useState([]);
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [learningAreaIds, setLearningAreaIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch courses
    axios.get('http://localhost:5000/courses')
      .then(response => setCourses(response.data))
      .catch(err => console.error("Error fetching courses:", err));

    // Fetch learning areas
    axios.get('http://localhost:5000/learning-areas')
      .then(response => {
        console.log("Fetched Learning Areas:", response.data); // Debugging log
        setLearningAreas(response.data);
      })
      .catch(err => console.error("Error fetching learning areas:", err));
  }, []);

  // Function to handle course creation
  const addCourse = () => {
    // Validate that all fields are filled
    if (!courseName.trim() || !courseDescription.trim() || !coursePrice.trim() || learningAreaIds.length === 0) {
      alert('Please fill in all fields and select at least one learning area');
      return; // Exit if any field is empty
    }

    const requestBody = {
      title: courseName,
      description: courseDescription,
      price: parseFloat(coursePrice),
      learningAreaIds: learningAreaIds // Send the array of learning area IDs
    };

    console.log("Sending request with body:", requestBody); // ✅ Debug log

    axios.post('http://localhost:5000/courses', requestBody)
      .then(response => {
        setCourses([...courses, response.data]);
        setCourseName('');
        setCourseDescription('');
        setCoursePrice('');
        setLearningAreaIds([]); // Reset learning areas
      })
      .catch(err => {
        if (err.response) {
          console.error("Error adding course:", err.response.data);
          alert(`Error adding course: ${err.response.data.message || 'Unknown error'}`);
        } else if (err.request) {
          console.error("No response from server:", err.request);
          alert('No response from server.');
        } else {
          console.error("Error:", err.message);
          alert(`Error adding course: ${err.message}`);
        }
      });
  };

  // Function to handle deleting a course
  const deleteCourse = (courseId) => {
    console.log("Deleting course with ID:", courseId); // Add this line to log the ID
    axios.delete(`http://localhost:5000/courses/${courseId}`)
      .then(() => {
        setCourses(courses.filter(course => course.courseId !== courseId)); // Use course.courseId here
      })
      .catch(err => alert(`Error deleting course: ${err.response?.data?.message || err.message}`));
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to handle learning area selection
  const toggleLearningArea = (learningId) => {
    setLearningAreaIds(prevState => {
      if (prevState.includes(learningId)) {
        return prevState.filter(id => id !== learningId); // Remove if already selected
      } else {
        return [...prevState, learningId]; // Add if not selected
      }
    });
  };

  return (
    <div className="course-manage">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">Course Manager</div>
        <nav>
          <a href="/">Home</a>
          <a href="/courses">Courses</a>
          <a href="/learning-areas">Learning Areas</a>
        </nav>
      </div>

      {/* Content Area */}
      <div className="content">
        {/* Navigation Bar */}
        <nav className="navbar">
          <div className="navbar-brand">Course Manager</div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </nav>

        {/* Header */}
        <header className="header">
          <h1>Welcome to Course Management</h1>
          <p>Organize and manage your courses efficiently.</p>
        </header>

        {/* Form to add a new course */}
        <div className="add-course-form">
          <input
            type="text"
            placeholder="Enter course name"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter course description"
            value={courseDescription}
            onChange={(e) => setCourseDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="Enter course price"
            value={coursePrice}
            onChange={(e) => setCoursePrice(e.target.value)}
          />

          {/* Learning Area Selection */}
          <div className="learning-area-selection">
            <h3>Select Learning Areas</h3>
            <div className="learning-areas">
              {learningAreas.map(area => (
                <label key={area.learningid}>
                  <input
                    type="checkbox"
                    checked={learningAreaIds.includes(area.learningid)}
                    onChange={() => toggleLearningArea(area.learningid)}
                  />
                  {area.domainname}
                </label>
              ))}
            </div>
          </div>

          <button onClick={addCourse}>Add Course</button>
        </div>

        {/* Course List */}
        <div className="course-list">
          <h2>Existing Courses</h2>
          <ul>
            {filteredCourses.length === 0 ? <p>No courses available</p> :
              filteredCourses.map(course => (
                <li key={course.courseId}> {/* Make sure this matches your backend response */}
                  <div className="course-header">
                    <div>
                      <span className="course-title">{course.title}</span>
                      <p className="course-description">{course.description}</p>
                      <p className="course-price">${course.price}</p>
                      <p className="course-learning-area">Learning Areas: {course.learning_areas.join(", ") || "N/A"}</p>
                    </div>
                    <button className="delete-btn" onClick={() => deleteCourse(course.courseId)}>Delete</button> {/* course.courseId */}
                  </div>
                </li>
              ))
            }
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CourseManage;
