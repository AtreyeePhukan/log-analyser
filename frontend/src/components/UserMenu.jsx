import React from "react";
import { useAuth } from "../context/AuthContext";
import "../UserMenu.css"; 

const UserMenu = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const userInitial = user?.email ? user.email[0].toUpperCase() : "U";

  return (
    <label className="popup">
      <input type="checkbox" />
      <div tabIndex="0" className="burger flex items-center justify-center text-white text-lg font-bold">
        {userInitial}
      </div>
      <nav className="popup-window">
        <legend>User Options</legend>
        <ul>
          <li>
            <button onClick={handleLogout}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M16 13v-2H7.83l2.58-2.59L9 7l-5 5 5 5 1.41-1.41L7.83 13H16z"/>
              </svg>
              <span>Sign Out</span>
            </button>
          </li>
        </ul>
      </nav>
    </label>
  );
};

export default UserMenu;
