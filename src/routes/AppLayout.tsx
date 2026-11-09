import { Outlet } from "react-router-dom";
import Navbar from "../components/HomePages/Navbar/Navbar";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
}
