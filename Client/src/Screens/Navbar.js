import React from 'react';
import './Navbar.css';
export default function Navbar() {
    const handleRefresh = () => {
        window.location.reload();
      }
  return (
    <div className='navbar'>
      <ul className="nav-links">
    <li className="logo"> 🔗 Connect Hub</li>
    <li className="center"><a href="/" >Home</a></li>
    <li className="center"><a onClick={handleRefresh} href="#">Refresh</a></li>
    <li className="center"><a href="#">Connect</a></li>

  </ul>
    </div>
  )
}
