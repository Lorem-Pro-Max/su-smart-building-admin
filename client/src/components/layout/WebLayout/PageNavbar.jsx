import { BurgerAntdIcon } from "@components/common/IconConverter";
import { SuSceinceLogo, UserIcon } from "@assets/icons";
import { Button } from "antd";
import { useState, useEffect } from 'react';

const MockName = "Nutthawara K.";

function NavbarLeftMenu({ onToggle }) {

  return (
    <div className="h-8 w-max flex items-center gap-5.25">
      <Button
        type="text"
        icon={<BurgerAntdIcon />}
        onClick={onToggle}
        className="flex items-center justify-center hover:bg-white/10"
        style={{
          color: "white",
          fontSize: "20px",
          width: 40,
          height: 40,
          border: "none",
        }}
      />
      <h5 className="font-medium text-white text-lg tracking-figma leading-none ">
        Room Reservation System
      </h5>
    </div>
  );
}

function NavbarRightMenu() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  return (
    <div className="w-fit h-fit gap-4 flex items-center">
      <div className="px-2 py-0.5 h-fit flex items-center bg-navbar-name-card rounded-lg gap-1">
        <UserIcon />
        <p className="font-normal tracking-figma leading-6 text-white">
          {user ? `${user.firstname}  ${user.lastname[0]}.` : 'Admin'}
        </p>
      </div>
      <SuSceinceLogo />
    </div>
  );
}

function Navbar({ onToggle }) {
  return (
    <header className="bg-navbar-dark-green w-full h-14 flex justify-center items-center shrink-0 ">
      <div className="flex w-full justify-between items-center px-7">
        <NavbarLeftMenu onToggle={onToggle} />
        <NavbarRightMenu />
      </div>
    </header>
  );
}

export default Navbar;
