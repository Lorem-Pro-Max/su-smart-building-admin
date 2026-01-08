import { useState } from "react";
import { Navbar, SideBar } from ".";

function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false); // The Source of Truth

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-canvas-background font-main">
      <Navbar onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex flex-1 overflow-hidden">
        <SideBar collapsed={collapsed} />

        <main className="flex-1 overflow-y-auto p-7 transition-all duration-300">
          <div className="mx-auto w-full max-w-dashboard">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
