import React, { useEffect, useState } from "react";
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
      { id: 1, title: "Form 1", dateSubmitted: "2024-01-01", details: "Details for Form 1 here, including other relevant information about the form.", dataForEdit: { first_name: "John", last_name: "Doe", age: 20 } },
      { id: 2, title: "Form 2", dateSubmitted: "2024-02-15", details: "Details for Form 2 here, including other relevant information about the form.", dataForEdit: { first_name: "Jane", last_name: "Smith", age: 22 } },
      { id: 3, title: "Form 3", dateSubmitted: "2024-03-05", details: "Details for Form 3 here, including other relevant information about the form.", dataForEdit: { first_name: "Alice", last_name: "Johnson", age: 21 } }
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

  return (
    <div className="volunteer-dashboard" style={{display: "flex", height: "100vh", width: "100vw", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}}>
      <aside className="sidebar" style={{width: "280px", backgroundColor: "#0052cc", color: "white", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
        <div className="profile" style={{textAlign: "center"}}>
          {/* Avatar removed as per request */}
          <h2 style={{margin: 0}}>{volunteerName}</h2>
          <p style={{marginTop: "6px", fontSize: "0.9rem", opacity: 0.85}}>{volunteerEmail}</p>
        </div>
        <div className="stats" style={{marginTop: "40px"}}>
          <div className="card" style={{backgroundColor: "#edf2ff", borderRadius: "8px", padding: "18px 20px", marginBottom: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)"}}>
            <h3 style={{margin:0, fontSize: "1.9rem", color: "#0052cc"}}>{forms.length}</h3>
            <p style={{marginTop: "4px", fontWeight: "600", letterSpacing: "0.03em", color: "#1D2B4A"}}>Forms Submitted</p>
          </div>
        </div>
      </aside>
      <main className="main-content" style={{flex:1, backgroundColor: "white", padding: "25px 30px", overflowY: "auto"}}>
        <div className="main-header" style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px"}}>
          <div>
            <h1 style={{margin: "0 0 6px 0", color: "#0052cc", fontWeight: "700", fontSize: "2.1rem"}}>Volunteer Dashboard</h1>
            <p style={{margin: 0, color: "#666", fontSize: "0.95rem"}}>Welcome, <strong>{volunteerName}</strong></p>
          </div>
          <button className="fill-form-btn" onClick={handleFillFormClick} style={{
            padding: "10px 24px",
            backgroundColor: "#3b82f6",
            border: "none",
            borderRadius: "50px",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "0.95rem",
            transition: "all 0.3s ease",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)"
          }} onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#2563eb";
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(59, 130, 246, 0.4)";
          }} onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#3b82f6";
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(59, 130, 246, 0.2)";
          }}>
            <span style={{fontSize: "1.2rem"}}>+</span>
            New Form
          </button>
        </div>
        <table className="forms-table" style={{marginTop: "30px", borderCollapse: "collapse", width: "100%"}}>
          <thead style={{backgroundColor: "#edf2ff"}}>
            <tr>
              <th style={{padding: "14px 18px", borderBottom: "1px solid #e1e4e8", textAlign: "left", fontSize: "1rem"}}>Form ID</th>
              <th style={{padding: "14px 18px", borderBottom: "1px solid #e1e4e8", textAlign: "left", fontSize: "1rem"}}>Title</th>
              <th style={{padding: "14px 18px", borderBottom: "1px solid #e1e4e8", textAlign: "left", fontSize: "1rem"}}>Date Submitted</th>
              <th style={{padding: "14px 18px", borderBottom: "1px solid #e1e4e8", textAlign: "left", fontSize: "1rem"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map(form => (
            <tr key={form.id} style={{
                backgroundColor: form.id === selectedFormId ? "#d0e0ff" : "transparent",
              }}>
                <td style={{padding: "14px 18px", borderBottom: "1px solid #e1e4e8", cursor: "pointer"}} onClick={() => handleFormClick(form.id)}>{form.id}</td>
                <td style={{padding: "14px 18px", borderBottom: "1px solid #e1e4e8", cursor: "pointer"}} onClick={() => handleFormClick(form.id)}>{form.title}</td>
                <td style={{padding: "14px 18px", borderBottom: "1px solid #e1e4e8", cursor : "pointer"}} onClick={() => handleFormClick(form.id)}>{form.dateSubmitted}</td>
                <td style={{padding: "14px 18px", borderBottom: "1px solid #e1e4e8", display: "flex", gap: "12px", alignItems: "center", justifyContent: "center"}}>
                  <button style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#f0f2f5",
                    border: "none",
                    cursor: "pointer",
                    color: "#0079bf",
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    flexShrink: 0
                  }} 
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#e8eef5";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.12)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f2f5";
                    e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                  }}
                  onClick={() => handleEditClick(form)} 
                  aria-label="Edit form" 
                  title="Edit">
                    ✎
                  </button>
                  <button style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    backgroundColor: "#f0f2f5",
                    border: "none",
                    cursor: "pointer",
                    color: "#dc3545",
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    flexShrink: 0
                  }} 
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffe8e8";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.12)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f2f5";
                    e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.05)";
                  }}
                  onClick={() => handleDeleteClick(form.id)} 
                  aria-label="Delete form" 
                  title="Delete">
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {selectedForm && (
          <div className="form-details" style={{
            marginTop: "30px",
            padding: "20px",
            border: "1px solid #d6d9dc",
            borderRadius: "8px",
            backgroundColor: "#fafafa"
          }}>
            <h2 style={{marginTop: 0, color: "#0052cc"}}>{selectedForm.title}</h2>
            <p style={{fontSize: "1rem", lineHeight: "1.5"}}>{selectedForm.details}</p>
          </div>
        )}
      </main>
    </div>
  );
}
