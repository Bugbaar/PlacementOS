import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, User, Briefcase, FileText, Users } from 'lucide-react';

const DashboardLayout = () => {
  const { isAdmin } = useAuth();

  const studentMobileLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Profile', path: '/student/profile', icon: User },
    { name: 'Jobs', path: '/student/jobs', icon: Briefcase },
    { name: 'Apps', path: '/student/applications', icon: FileText },
  ];

  const adminMobileLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', path: '/admin/jobs', icon: Briefcase },
    { name: 'Applications', path: '/admin/applications', icon: Users },
  ];

  const mobileLinks = isAdmin ? adminMobileLinks : studentMobileLinks;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1 max-w-7xl w-full mx-auto pb-16 md:pb-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-2 py-1 flex justify-around items-center">
        {mobileLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-3 text-xs font-medium rounded-lg ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {link.name}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardLayout;
