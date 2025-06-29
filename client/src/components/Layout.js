import React from "react";
import "../styles/LayoutStyles.css";
import { adminMenu, userMenu } from "./../Data/data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge, message } from "antd";

const Layout = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();

  // logout function
  const handleLogout = () => {
    localStorage.clear();
    message.success("Logout Successfully");
    navigate("/login");
  };

  // doctor menu
  const doctorMenu = [
    {
      name: "Home",
      path: "/",
      icon: "fa-solid fa-house",
    },
    {
      name: "Appointments",
      path: "/doctor-appointments",
      icon: "fa-solid fa-list",
    },
    // {
    //   name: "Profile",
    //   path: `/doctor/profile/${user?._id}`,
    //   icon: "fa-solid fa-user",
    // },
  ];

  // choosing menu based on user role
  const SidebarMenu = user?.isAdmin
    ? adminMenu
    : user?.isDoctor
    ? doctorMenu
    : userMenu;

  return (
    <>
      <div className="main">
        <div className="layout">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="logo">
              <h6 className="text-light">DOC APP</h6>
              <hr />
            </div>
            <div className="menu">
              {SidebarMenu.filter((menu) => menu.name !== "Profile").map((menu) => {
  const isActive = location.pathname === menu.path;
  return (
    <div className={`menu-item ${isActive && "active"}`} key={menu.path}>
      <i className={menu.icon}></i>
      <Link to={menu.path}>{menu.name}</Link>
    </div>
  );
})}

              <div className="menu-item" onClick={handleLogout}>
                <i className="fa-solid fa-right-from-bracket"></i>
                <Link to="/login">Logout</Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="content">
            {/* Header */}
            <div className="header">
              <div className="header-content" style={{ cursor: "pointer" }}>
                <Badge
                  count={user?.notifcation?.length || 0}
                  onClick={() => {
                    navigate("/notification");
                  }}
                >
                  <i className="fa-solid fa-bell"></i>
                </Badge>
                <Link to="/profile">{user?.name}</Link>
              </div>
            </div>

            {/* Page Body */}
            <div className="body">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
