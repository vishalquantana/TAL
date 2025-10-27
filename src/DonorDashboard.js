import React from 'react';
import { Home, Users, Settings, LogOut, DollarSign, BookOpen, Heart, ChevronDown } from 'lucide-react'; 
import './DonorDashboard.css'; // Import the new CSS file

// --- Data Definitions (Unchanged) ---
const NAV_ITEMS = [
  { name: 'Dashboard', icon: Home, active: true },
  { name: 'Donation History', icon: DollarSign },
  { name: 'Student Impact', icon: BookOpen },
];

const DONOR_ITEMS = [
  { name: 'My Profile', icon: Users },
  { name: 'Settings', icon: Settings },
  { name: 'Support', icon: Heart },
];

const OVERVIEW_DATA = [
    { title: 'Scholarships Active', value: 45 },
    { title: 'Current Campaign Goal', value: 125000 },
    { title: 'Pending Matching Funds', value: 5000 },
    { title: 'Total Donors in Network', value: 3450 },
];

const ACTIVITY_DATA = [
    { text: 'Your monthly recurring donation was processed.', color: 'green' },
    { text: 'A new student, S.K., was awarded a scholarship from your fund.', color: 'blue' },
    { text: 'The "Books for Girls" campaign needs your help to reach its goal.', color: 'orange' },
];

// --- Sub-Components (Styled with Classes) ---

const Sidebar = () => (
    <aside className="sidebar">
        <div>
            <h1 className="logo-text">Touch A Life</h1>
            <nav className="nav-menu">
                {NAV_ITEMS.map((item) => (
                    <a key={item.name} href="#" className={`nav-item ${item.active ? 'active' : ''}`}>
                        <item.icon size={18} className="nav-icon" />
                        {item.name}
                    </a>
                ))}
            </nav>
            <hr className="divider" />
            <nav className="nav-menu">
                {DONOR_ITEMS.map((item) => (
                    <a key={item.name} href="#" className="nav-item">
                        <item.icon size={18} className="nav-icon" />
                        {item.name}
                    </a>
                ))}
                <a href="#" className="nav-item">
                    <LogOut size={18} className="nav-icon" />
                    Quit
                </a>
            </nav>
        </div>
        <div className="support-box">
            <div className="support-graphic">[Support Graphic Placeholder]</div>
            <p className="support-text">24/7 Support</p>
        </div>
    </aside>
);

const MetricCard = ({ title, value, change, icon, iconBgColor }) => {
    const isPositive = !change.includes('-');
    const changeClass = isPositive ? 'positive-change' : 'negative-change';
    
    return (
        <div className="metric-card">
            <div className="card-content">
                <p className="card-title">{title}</p>
                <h2 className="card-value">{value}</h2>
                <p className={`card-change ${changeClass}`}>{change}</p>
            </div>
            <div className={`card-icon-wrapper ${iconBgColor}`}>
                {icon}
            </div>
        </div>
    );
};

const OverviewList = () => (
    <div className="dashboard-card overview-list">
        <div className="card-header-flex">
            <h2 className="card-header-title">Campaign Overview</h2>
            <a href="#" className="view-link">This Quarter <ChevronDown size={14} style={{ marginLeft: '4px' }} /></a>
        </div>
        <div className="overview-items">
            {OVERVIEW_DATA.map((item, index) => {
                const isNegative = item.value < 0;
                const formattedValue = item.title.includes('Goal') || item.title.includes('Funds') 
                    ? `$${item.value.toLocaleString()}` 
                    : item.value.toLocaleString();
                const valueClass = isNegative ? 'negative-value' : 'positive-value';
                
                return (
                    <div key={index} className="overview-item">
                        <span className="overview-item-title">{item.title}</span>
                        <span className={`overview-item-value ${valueClass}`}>
                            {formattedValue}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
);

const TotalSaleChart = () => {
    const percentage = 70;
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="dashboard-card total-sale-chart">
            <div className="card-header-flex">
                <h2 className="card-header-title">Annual Goal Progress</h2>
                <a href="#" className="view-link-green">View Plan</a>
            </div>
            <div className="chart-container">
                <svg viewBox="0 0 140 140" className="chart-svg">
                    <circle cx="70" cy="70" r={radius} fill="transparent" stroke="#f0f0f0" strokeWidth="16"/>
                    <circle 
                        cx="70" cy="70" r={radius} 
                        fill="transparent" 
                        stroke="#10b981" 
                        strokeWidth="16" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={offset} 
                        strokeLinecap="round"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '70px 70px' }}
                    />
                </svg>
                <div className="chart-percentage">
                    <span className="percentage-value">{percentage}%</span>
                </div>
            </div>
            <p className="chart-info">
                Your contributions cover {percentage}% of the current Annual Scholarship Fund goal.
            </p>
        </div>
    );
};

// Main Dashboard Component
const DonorDashboard = () => {
  return (
    <div className="app-container">
      <div className="dashboard-layout">
        
        <Sidebar />
        
        <main className="main-content">
          <header className="main-header">
            <h1 className="page-title">Donor Impact Dashboard</h1>
            <div className="user-info">
              <span className="user-name">Monica Ashan</span>
              <div className="user-avatar"></div>
            </div>
          </header>
          
          <div className="metrics-grid">
            <MetricCard 
                title="Your Total Donated" 
                value="$67,343" 
                change="+10.2% YTD" 
                icon={<DollarSign size={24} />}
                iconBgColor="icon-green"
            />
            <MetricCard 
                title="Students Supported (Total)" 
                value="23" 
                change="+2 New Last Quarter" 
                icon={<BookOpen size={24} />}
                iconBgColor="icon-blue"
            />
            <MetricCard 
                title="Monthly Recurring Gift" 
                value="$500" 
                change="Active" 
                icon={<Heart size={24} />}
                iconBgColor="icon-red"
            />
          </div>

          <div className="bottom-grid">
            
            <OverviewList />
            <TotalSaleChart />

            <div className="dashboard-card activity-feed">
              <div className="card-header-flex">
                <h2 className="card-header-title">Recent Impact Activity</h2>
                <a href="#" className="view-link-green">View All</a>
              </div>
              
              {ACTIVITY_DATA.map((item, index) => (
                <div key={index} className="activity-item">
                  <span className={`activity-dot dot-${item.color}`}></span>
                  <p className="activity-text">{item.text}</p>
                </div>
              ))}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default DonorDashboard;