// import React from "react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { motion } from "framer-motion";

// const profiles = [
//   {
//     name: "Trustree",
//     color: "bg-blue-500",
//     description: "Manage and oversee the platform's operations.",
//   },
//   {
//     name: "Volunteer",
//     color: "bg-green-500",
//     description: "Help with tasks and activities for the community.",
//   },
//   {
//     name: "Donor",
//     color: "bg-purple-500",
//     description: "Support the cause by donating funds or resources.",
//   },
//   {
//     name: "Student",
//     color: "bg-orange-500",
//     description: "Access learning materials and participate in programs.",
//   },
// ];

// function LoginProfiles() {
//   const handleProfileClick = (profile) => {
//     alert(`You selected ${profile} login`);
//     // 👉 Replace alert with navigate("/login?role=" + profile) if using react-router
//   };

//   return (
//     <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
//       {/* Title */}
//       <motion.h1
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="text-4xl font-bold text-gray-800 mb-6"
//       >
//         Who's Logging In?
//       </motion.h1>

//       <p className="text-gray-600 mb-8 text-center max-w-md">
//         Choose your role to continue. Each profile provides a tailored experience.
//       </p>

//       {/* Profile Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl">
//         {profiles.map((profile, idx) => (
//           <motion.div
//             key={profile.name}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: idx * 0.2 }}
//           >
//             <Card
//               className="rounded-2xl shadow-md hover:shadow-xl cursor-pointer border border-gray-100 bg-white hover:scale-105 transition-transform duration-300"
//               onClick={() => handleProfileClick(profile.name)}
//             >
//               <CardContent className="flex flex-col items-center p-6">
//                 {/* Circle Icon */}
//                 <div
//                   className={`w-20 h-20 flex items-center justify-center rounded-full ${profile.color} text-white text-2xl font-bold mb-4 shadow-lg`}
//                 >
//                   {profile.name.charAt(0)}
//                 </div>

//                 {/* Name */}
//                 <h2 className="text-lg font-semibold text-gray-800 mb-2">
//                   {profile.name}
//                 </h2>

//                 {/* Description */}
//                 <p className="text-sm text-gray-500 text-center">
//                   {profile.description}
//                 </p>

//                 {/* Login Button */}
//                 <Button
//                   className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 rounded-full px-6 py-2 shadow-md"
//                 >
//                   Login
//                 </Button>
//               </CardContent>
//             </Card>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default LoginProfiles;

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";

// const profiles = [
//   {
//     name: "Trustee",
//     path: "/login/trustee",
//     color: "bg-blue-500",
//     description: "Manage and oversee the platform's operations.",
//   },
//   {
//     name: "Volunteer",
//     path: "/login/volunteer",
//     color: "bg-green-500",
//     description: "Help with tasks and activities for the community.",
//   },
//   {
//     name: "Donor",
//     path: "/login/donor",
//     color: "bg-purple-500",
//     description: "Support the cause by donating funds or resources.",
//   },
//   {
//     name: "Student",
//     path: "/login/student",
//     color: "bg-orange-500",
//     description: "Access learning materials and participate in programs.",
//   },
// ];

// function LoginProfiles() {
//   const navigate = useNavigate();

//   const handleProfileClick = (profilePath) => {
//     navigate(profilePath);
//   };

//   return (
//     <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
//       {/* Title */}
//       <motion.h1
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="text-4xl font-bold text-gray-800 mb-6"
//       >
//         Who's Logging In?
//       </motion.h1>

//       <p className="text-gray-600 mb-8 text-center max-w-md">
//         Choose your role to continue. Each profile provides a tailored experience.
//       </p>

//       {/* Profile Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl">
//         {profiles.map((profile, idx) => (
//           <motion.div
//             key={profile.name}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: idx * 0.2 }}
//           >
//             <div
//               className="rounded-2xl shadow-md hover:shadow-xl cursor-pointer border border-gray-100 bg-white hover:scale-105 transition-transform duration-300"
//               onClick={() => handleProfileClick(profile.path)}
//             >
//               <div className="flex flex-col items-center p-6">
//                 {/* Circle Icon */}
//                 <div
//                   className={`w-20 h-20 flex items-center justify-center rounded-full ${profile.color} text-white text-2xl font-bold mb-4 shadow-lg`}
//                 >
//                   {profile.name.charAt(0)}
//                 </div>

//                 {/* Name */}
//                 <h2 className="text-lg font-semibold text-gray-800 mb-2">
//                   {profile.name}
//                 </h2>

//                 {/* Description */}
//                 <p className="text-sm text-gray-500 text-center">
//                   {profile.description}
//                 </p>

//                 {/* Login Button */}
//                 <button
//                   onClick={() => handleProfileClick(profile.path)}
//                   className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 rounded-full px-6 py-2 shadow-md"
//                 >
//                   Login
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default LoginProfiles;

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";

// const profiles = [
//   {
//     name: "Trustee",
//     path: "/login/trustee",
//     color: "bg-blue-500",
//     description: "Manage and oversee the platform's operations.",
//   },
//   {
//     name: "Volunteer",
//     path: "/login/volunteer",
//     color: "bg-green-500",
//     description: "Help with tasks and activities for the community.",
//   },
//   {
//     name: "Donor",
//     path: "/login/donor",
//     color: "bg-purple-500",
//     description: "Support the cause by donating funds or resources.",
//   },
//   {
//     name: "Student",
//     path: "/login/student",
//     color: "bg-orange-500",
//     description: "Access learning materials and participate in programs.",
//   },
// ];

// function LoginProfiles() {
//   const navigate = useNavigate();

//   const handleProfileClick = (profilePath) => {
//     navigate(profilePath);
//   };

//   return (
//     <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
//       {/* Title */}
//       <motion.h1
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="text-4xl font-bold text-gray-800 mb-4"
//       >
//         Who's Logging In?
//       </motion.h1>

//       <p className="text-gray-600 mb-10 text-center max-w-md">
//         Choose your role to continue. Each profile provides a tailored experience.
//       </p>

//       {/* Profile Sections */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-7xl">
//         {profiles.map((profile, idx) => (
//           <motion.div
//             key={profile.name}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: idx * 0.15 }}
//           >
//             <div
//               className="flex flex-col justify-between h-full bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-transform duration-300 p-6 cursor-pointer"
//               onClick={() => handleProfileClick(profile.path)}
//             >
//               {/* Icon */}
//               <div className="flex flex-col items-center">
//                 <div
//                   className={`w-20 h-20 flex items-center justify-center rounded-full ${profile.color} text-white text-2xl font-bold mb-4 shadow-lg`}
//                 >
//                   {profile.name.charAt(0)}
//                 </div>

//                 {/* Name */}
//                 <h2 className="text-xl font-semibold text-gray-800 mb-2">
//                   {profile.name}
//                 </h2>

//                 {/* Description */}
//                 <p className="text-sm text-gray-600 text-center">
//                   {profile.description}
//                 </p>
//               </div>

//               {/* Login Button */}
//               <button
//                 onClick={() => handleProfileClick(profile.path)}
//                 className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 rounded-full px-6 py-2 shadow-md w-full"
//               >
//                 Login
//               </button>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default LoginProfiles;

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";

// const profiles = [
//   {
//     name: "Trustee",
//     path: "/login/trustee",
//     color: "bg-blue-600",
//     description: "Manage and oversee the platform's operations.",
//   },
//   {
//     name: "Volunteer",
//     path: "/login/volunteer",
//     color: "bg-green-600",
//     description: "Help with tasks and activities for the community.",
//   },
//   {
//     name: "Donor",
//     path: "/login/donor",
//     color: "bg-purple-600",
//     description: "Support the cause by donating funds or resources.",
//   },
//   {
//     name: "Student",
//     path: "/login/student",
//     color: "bg-orange-600",
//     description: "Access learning materials and participate in programs.",
//   },
// ];

// function LoginProfiles() {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
//       {/* Title */}
//       <motion.h1
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="text-3xl font-bold mb-2"
//       >
//         Who's Logging In?
//       </motion.h1>

//       <p className="text-gray-400 mb-10">
//         Choose your role to continue
//       </p>

//       {/* Profile Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
//         {profiles.map((profile, idx) => (
//           <motion.div
//             key={profile.name}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: idx * 0.15 }}
//             className="flex flex-col items-center"
//           >
//             {/* Profile Card */}
//             <div
//               onClick={() => navigate(profile.path)}
//               className="flex flex-col items-center p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition cursor-pointer w-44 h-52 shadow-lg"
//             >
//               {/* Circle Avatar */}
//               <div
//                 className={`w-16 h-16 flex items-center justify-center rounded-full ${profile.color} text-white text-xl font-bold mb-4`}
//               >
//                 {profile.name.charAt(0)}
//               </div>

//               {/* Name */}
//               <h2 className="text-lg font-semibold">{profile.name}</h2>

//               {/* Description */}
//               <p className="text-xs text-gray-400 mt-2 text-center px-2">
//                 {profile.description}
//               </p>
//             </div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default LoginProfiles;

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "./loginProfiles.css";

// function loginProfiles() {
//   const navigate = useNavigate();

//   const roles = [
//     { name: "Trustee", path: "/trustee-login" },
//     { name: "Volunteer", path: "/volunteerlogin" },
//     { name: "Student", path: "/studentform" },
//     { name: "Donor", path: "/donor-login" },
//   ];

//   return (
//     <div className="profiles-container">
//       <h2 className="profiles-title">Choose Your Profile</h2>
//       <div className="profiles-grid">
//         {roles.map((r) => (
//           <div
//             key={r.name}
//             className="profile-card"
//             onClick={() => navigate(r.path)}
//           >
//             <div className="profile-avatar">{r.name.charAt(0)}</div>
//             <p>{r.name}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default loginProfiles;

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "./loginProfiles.css";

// function LoginProfiles() {
//   const navigate = useNavigate();

//   const roles = [
//     { name: "Trustee", path: "/trustee-login" },
//     { name: "Volunteer", path: "/volunteerlogin" },
//     { name: "Student", path: "/studentform" },
//     { name: "Donor", path: "/donor-login" },
//   ];

//   return (
//     <div className="profiles-container">
//       <h2 className="profiles-title">Choose Your Profile</h2>
//       <div className="profiles-grid">
//         {roles.map((r) => (
//           <div
//             key={r.name}
//             className="profile-card"
//             onClick={() => navigate(r.path)}
//           >
//             <div className="profile-avatar">{r.name.charAt(0)}</div>
//             <p className="profile-name">{r.name}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default LoginProfiles;

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "./loginProfiles.css";

// function LoginProfiles() {
//   const navigate = useNavigate();

//   const roles = [
//     { name: "Trustee", path: "/trustee-login", color: "#f94144" },
//     { name: "Volunteer", path: "/volunteerlogin", color: "#43aa8b" },
//     { name: "Student", path: "/studentform", color: "#f9c74f" },
//     { name: "Donor", path: "/donor-login", color: "#577590" },
//   ];

//   return (
//     <div className="profiles-container">
//       <h2 className="profiles-title">Choose Your Profile</h2>
//       <div className="profiles-grid">
//         {roles.map((r) => (
//           <div
//             key={r.name}
//             className="profile-card"
//             onClick={() => navigate(r.path)}
//           >
//             <div
//               className="profile-avatar"
//               style={{ background: r.color }}
//             >
//               {r.name.charAt(0)}
//             </div>
//             <p className="profile-name">{r.name}</p>
//           </div>
//         ))}

//         {/* Add new profile card */}
//         <div className="profile-card add-card" onClick={() => alert("Add Profile")}>
//           <div className="profile-avatar add-avatar">+</div>
//           <p className="profile-name">Add Profile</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default LoginProfiles;

// 
import React from "react";
import { useNavigate } from "react-router-dom";
import "./loginProfiles.css";

function LoginProfiles() {
  const navigate = useNavigate();

  const roles = [
    { name: "Trustee", path: "/trustee-login", color: "#F44336" }, // Red-ish
    { name: "Volunteer", path: "/volunteerlogin", color: "#4CAF50" }, // Green
    { name: "Student", path: "/studentform", color: "#FF9800" }, // Orange
    { name: "Donor", path: "/donor-login", color: "#2196F3" }, // Blue
  ];

  return (
    <div className="profiles-container">
      <h2 className="profiles-title">Login as</h2>
      <div className="profiles-grid">
        {roles.map((r) => (
          <div
            key={r.name}
            className="profile-card"
            onClick={() => navigate(r.path)}
          >
            <div
              className="profile-avatar"
              style={{ background: r.color }}
            >
              {r.name.charAt(0)}
            </div>
            <p className="profile-name">{r.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoginProfiles;
