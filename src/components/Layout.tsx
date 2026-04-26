import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";  

const Layout = () => {
const [isOpen, setIsOpen] = useState(true);  return (
     

    <div className="dashboard-root">
<Header toggle={() => setIsOpen(!isOpen)} />
        <div className="app">
        <Sidebar isOpen={isOpen} closeSidebar={() => setIsOpen(false)} />
         <main className={`content ${isOpen ? "content-shift" : "content-full"}`}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};



export default Layout;
