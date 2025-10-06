// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// import CoverPage from "./CoverPage";          // Landing page
// import VolunteerLogin from "./volunteerlogin"; // Volunteer login
// import Register from "./register";             // Volunteer register
// import StudentForm from "./studentform";       // Student form
// import StudentDocs from "./studentdocs";       // Student docs
// import LoginProfiles from "./login";
// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Cover page shows first */}
//         <Route path="/" element={<CoverPage />} />

//         {/* Volunteer auth */}
//         <Route path="/volunteerlogin" element={<VolunteerLogin />} />
//         <Route path="/register" element={<Register />} /> {/* Register route added */}

//         {/* Student flow */}
//         <Route path="/studentform" element={<StudentForm />} />
//         <Route path="/studentdocs" element={<StudentDocs />} />
//       </Routes>
//     </Router>
//   );
// }

// //export default App;
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CoverPage from "./CoverPage";
import LoginProfiles from "./loginProfiles";
import RoleLogin from "./RoleLogin";
import VolunteerLogin from "./volunteerlogin";  // import volunteer login
import Register from "./register";              // import register
import StudentForm from "./studentform";        // import student form

function App() {
  return (
    <Router>
      <Routes>
        {/* Cover Page */}
        <Route path="/" element={<CoverPage />} />

        {/* Role Selection */}
        <Route path="/login" element={<LoginProfiles />} />

        {/* Role-specific login with shared component */}
        <Route path="/login/:role" element={<RoleLogin />} />

        {/* Volunteer-specific login page */}
        <Route path="/volunteerlogin" element={<VolunteerLogin />} />

        {/* Volunteer registration page */}
        <Route path="/register" element={<Register />} />

        {/* Student Form page */}
        <Route path="/studentform" element={<StudentForm />} />
      </Routes>
    </Router>
  );
}

export default App;
