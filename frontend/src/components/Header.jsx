import React from "react";
import UserMenu from "./UserMenu";

export default function Header() {
  return (
    <header className="dashboard-header">
      <h1 className="dashboard-title">Dashboard</h1>
      <div className="absolute top-4 right-4">
        <UserMenu />
      </div>
    </header>
  );
}

