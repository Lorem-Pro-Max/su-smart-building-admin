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

        <main className="flex-1 pl-6 transition-all duration-300">
          <div className="mx-auto w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
