import AdminDashboard from "@/components/admin-dashboard";
import EmployeeDashboard from "@/components/employee-dashboard";
import HRDashboard from "@/components/hr-dashboard";
import SupervisorDashboard from "@/components/supervisor-dashboard";

interface DashboardComponentWrapperProps {
  userRole: string;
  userName: string;
  userEmail: string;
}

const DashboardComponentWrapper: React.FC<DashboardComponentWrapperProps> = ({ userRole, userName, userEmail }) => {
  return (
    <div>
      <h2>Welcome, {userName}!</h2>
      <p>Email: {userEmail}</p>
      <p>Role: {userRole}</p>

      {/* ✅ Directly rendering dashboard based on user role instead of passing props */}
      {userRole === "admin" ? <AdminDashboard /> :
       userRole === "hr" ? <HRDashboard /> :
       ["supervisor", "manager", "director"].includes(userRole) ? <SupervisorDashboard /> :
       <EmployeeDashboard />}
    </div>
  );
};

export default DashboardComponentWrapper;