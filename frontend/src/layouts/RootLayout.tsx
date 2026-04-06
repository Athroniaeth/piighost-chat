import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="bg-background-soft-100 overflow-x-hidden">
      <Outlet />
    </div>
  );
}
