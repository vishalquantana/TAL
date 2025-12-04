import React, { useEffect, useState } from "react";
import "./VolunteerDashboard.css";
import supabase from "./supabaseClient";

export default function VolunteerDashboard() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [volunteerName, setVolunteerName] = useState("Volunteer");
  const [volunteerEmail, setVolunteerEmail] = useState("");

  useEffect(() => {
    // Fetch logged-in volunteer data from Supabase
    const fetchVolunteerData = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          const user = data.session.user;
          setVolunteerEmail(user.email || "");
          
          // Get the volunteer's name from user metadata or email
          const name = user.user_metadata?.name || user.email?.split("@")[0] || "Volunteer";
          setVolunteerName(name);
        }
      } catch (error) {
        console.error("Error fetching volunteer data:", error);
      }
    };

    fetchVolunteerData();

    // Initialize dummy forms data
    const dummyForms = [
      { id: 1, title: "Form 1", dateSubmitted: "2024-01-15", details: "Details for Form 1 here, including other relevant information about the form.", dataForEdit: { first_name: "John", last_name: "Doe", age: 20 } },
      { id: 2, title: "Form 2", dateSubmitted: "2024-02-20", details: "Details for Form 2 here, including other relevant information about the form.", dataForEdit: { first_name: "Jane", last_name: "Smith", age: 22 } },
      { id: 3, title: "Form 3", dateSubmitted: "2024-03-05", details: "Details for Form 3 here, including other relevant information about the form.", dataForEdit: { first_name: "Alice", last_name: "Johnson", age: 21 } },
      { id: 4, title: "Form 4", dateSubmitted: "2024-04-10", details: "Details for Form 4", dataForEdit: { first_name: "Bob", last_name: "Williams", age: 23 } },
      { id: 5, title: "Form 5", dateSubmitted: "2024-05-18", details: "Details for Form 5", dataForEdit: { first_name: "Carol", last_name: "Davis", age: 24 } },
      { id: 6, title: "Form 6", dateSubmitted: "2024-06-12", details: "Details for Form 6", dataForEdit: { first_name: "David", last_name: "Miller", age: 25 } },
    ];
    setForms(dummyForms);
  }, []);

  const handleFormClick = (id) => {
    setSelectedFormId(id);
  };

  const handleFillFormClick = () => {
    // Clear any existing edit data
    localStorage.removeItem("editFormData");
    window.location.href = "/studentform"; // or use navigate in real app
  };

  const handleDeleteClick = (id) => {
    if(window.confirm("Are you sure you want to delete this form?")) {
      setForms((prev) => prev.filter(form => form.id !== id));
      // If deleted form was selected, clear selection
      if (selectedFormId === id) setSelectedFormId(null);
    }
  };

  const handleEditClick = (form) => {
    // Save form data for edit in localStorage (or context/state management)
    localStorage.setItem("editFormData", JSON.stringify(form.dataForEdit));
    // Navigate to form page for editing
    window.location.href = "/studentform";
  };

  const selectedForm = forms.find(f => f.id === selectedFormId);
  
  // Calculate statistics
  const thisMonthForms = forms.filter(f => new Date(f.dateSubmitted).getMonth() === new Date().getMonth()).length;
  const lastMonthForms = forms.filter(f => {
    const formDate = new Date(f.dateSubmitted);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return formDate.getMonth() === lastMonth.getMonth() && formDate.getFullYear() === lastMonth.getFullYear();
  }).length;

  return (
    <div className="volunteer-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="profile">
            <h2>{volunteerName}</h2>
            <p>{volunteerEmail}</p>
          </div>
          
          {/* Statistics Cards */}
          <div className="stats">
            <div className="card">
              <h3>{thisMonthForms}</h3>
              <p>This Month</p>
            </div>
            <div className="card">
              <h3>{lastMonthForms}</h3>
              <p>Last Month</p>
            </div>
            <div className="card">
              <h3>{forms.length}</h3>
              <p>Total Forms</p>
            </div>
          </div>
        </div>
        
        <button className="sidebar-logout-btn">Logout</button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header Section */}
        <div className="main-header">
          <button className="btn primary fill-form-btn" onClick={handleFillFormClick}>
            <span>+</span>
            New Form
          </button>
        </div>

        {/* Table Wrapper */}
        <div className="table-wrapper">
          {/* Forms Table */}
          <table className="forms-table">
            <thead>
              <tr>
                <th>Form ID</th>
                <th>Title</th>
                <th>Date Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map(form => (
                <tr key={form.id} className={form.id === selectedFormId ? "selected" : ""}>
                  <td onClick={() => handleFormClick(form.id)}>{form.id}</td>
                  <td onClick={() => handleFormClick(form.id)}>{form.title}</td>
                  <td onClick={() => handleFormClick(form.id)}>{form.dateSubmitted}</td>
                  <td>
                    <button 
                      className="btn primary small"
                      onClick={() => handleEditClick(form)}
                      title="Edit"
                    >
                      ✎ Edit
                    </button>
                    <button 
                      className="btn danger small"
                      onClick={() => handleDeleteClick(form.id)}
                      title="Delete"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form Details Section */}
        {selectedForm && (
          <div className="form-details">
            <h2>{selectedForm.title}</h2>
            <p>{selectedForm.details}</p>
            <div className="form-actions">
              <button 
                className="btn primary"
                onClick={() => handleEditClick(selectedForm)}
              >
                ✎ Edit Form
              </button>
              <button 
                className="btn danger"
                onClick={() => handleDeleteClick(selectedForm.id)}
              >
                🗑 Delete Form
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}