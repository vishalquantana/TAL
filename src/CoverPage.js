// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "./CoverPage.css"; // Using the updated CSS

// export default function CoverPage() {
//   const navigate = useNavigate();

//   const handleLogin = () => {
//     navigate("/login");
//   };

//   const handleDonate = () => {
//     // Navigate to a donation link or section
//     console.log("Navigating to Donation Page...");
//   };

//   return (
//     <div className="cover-container-minimal">
//       {/* Header with Logo and CTA */}
//       <header className="header-minimal">
//         <div className="header-inner-minimal">
//           <h1 className="logo-text-minimal">Touch A Life</h1>
//           <button className="login-btn-minimal" onClick={handleLogin}>
//             LOGIN
//           </button>
//         </div>
//       </header>

//       {/* Centered Hero Content */}
//       <main className="hero-content-minimal">
        
//         {/* Eyebrow Text (Context) */}
//         <p className="eyebrow-text">
//           Touching 
//         </p>

//         {/* Main Headline (Outcome-Focused) */}
//         <h2 className="main-headline">
//           Empower a Girl to <span className="highlight-text-minimal">Learn, Dream, and Lead</span>
//         </h2>
        
//         {/* Subtext (Reduced Hesitation) */}
//         <p className="cta-subtext">
//           100% of your donation goes directly to educational needs.
//         </p>

//         {/* Primary Call to Action */}
//         <button className="donate-btn-minimal" onClick={handleDonate}>
//           DONATE NOW
//         </button>
        
//         {/* Secondary Low-Friction CTA */}
//         <p className="secondary-cta">
//           Need details first? <a href="#" className="explore-link">Explore Our Impact Stories</a>
//         </p>

//       </main>
//     </div>
//   );
// }

import React from "react";
import { useNavigate } from "react-router-dom";
import "./CoverPage.css"; // Using the updated CSS

export default function CoverPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleDonate = () => {
    // Navigate to a donation link or section
    console.log("Navigating to Donation Page...");
  };

  return (
    <div className="cover-container-minimal">
      {/* Header with Logo and CTA */}
      <header className="header-minimal">
        <div className="header-inner-minimal">
          {/* LOGO IMAGE RE-ADDED HERE */}
          <img
            src="https://touchalifeorg.com/wp-content/uploads/2025/04/logo-e1745902555693.png"
            alt="Touch A Life logo"
            className="logo-image-minimal"
            loading="lazy"
            width="140"
            height="45"
          />
          <button className="login-btn-minimal" onClick={handleLogin}>
            LOGIN
          </button>
        </div>
      </header>

      {/* Centered Hero Content */}
      <main className="hero-content-minimal">
        
        {/* Eyebrow Text (Context) */}
        <p className="eyebrow-text">
          For the Future of India's Daughters
        </p>

        {/* Main Headline (Outcome-Focused) */}
        <h2 className="main-headline">
          Empower a Girl to <span className="highlight-text-minimal">Learn, Dream, and Lead</span>
        </h2>
        
        {/* Subtext (Reduced Hesitation) */}
        <p className="cta-subtext">
          100% of your donation goes directly to educational needs.
        </p>

        {/* Primary Call to Action */}
        <button className="donate-btn-minimal" onClick={handleDonate}>
          DONATE NOW
        </button>
        
        {/* Secondary Low-Friction CTA */}
        <p className="secondary-cta">
          Need details first? <a href="#" className="explore-link">Explore Our Impact Stories</a>
        </p>

      </main>
    </div>
  );
}

