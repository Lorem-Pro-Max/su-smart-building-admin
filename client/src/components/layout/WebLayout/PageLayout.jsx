import { useState } from "react";
import { Navbar, SideBar } from "..";
import { Outlet } from "react-router-dom";

function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-canvas-background font-main">
      <Navbar onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex flex-1 overflow-hidden">
        <SideBar collapsed={collapsed} />

        <main className="flex-1 overflow-y-auto pl-6 transition-all duration-300">
          <div className="mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
