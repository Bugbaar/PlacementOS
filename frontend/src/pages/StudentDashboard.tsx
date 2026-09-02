import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import StatCard from "../components/dashboard/StatCard";
import ReadinessCard from "../components/dashboard/ReadinessCard";

function StudentDashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, Student
            </h2>

            <p className="mt-1 text-gray-600">
              Here's an overview of your placement activity.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Applications"
              value="12"
              description="Total applications"
            />

            <StatCard
              title="Shortlisted"
              value="4"
              description="Companies shortlisted"
            />

            <StatCard
              title="Upcoming Drives"
              value="8"
              description="Available placement drives"
            />

            <StatCard
              title="Profile"
              value="85%"
              description="Profile completion"
            />
          </div>
          <div className="mt-6">
            <ReadinessCard />
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
