import { useState } from "react";
import { Navbar, SideBar } from "..";
import { Outlet } from "react-router-dom";

function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="h-screen w-full flex flex-col bg-canvas-background font-main overflow-hidden">
      <Navbar onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex flex-1 overflow-y-auto">
        <SideBar collapsed={collapsed} />

        <main className="flex-1 min-w-0 pl-6 transition-all duration-300 overflow-hidden">
          <div className="mx-auto w-full h-full min-w-0 min-h-0 overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
