import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  Users,
  Building2,
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  const studentLinks = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/student/profile', icon: User },
    { name: 'Available Jobs', path: '/student/jobs', icon: Briefcase },
    { name: 'My Applications', path: '/student/applications', icon: FileText },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Jobs', path: '/admin/jobs', icon: Briefcase },
    { name: 'Applications', path: '/admin/applications', icon: Users },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div>
        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {isAdmin ? 'Admin Console' : 'Student Portal'}
        </div>
        <nav className="mt-2 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role Badge Footer */}
      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-purple-500' : 'bg-green-500'}`}></div>
          <p className="text-xs font-medium text-gray-700">
            Role: <span className="font-semibold">{user?.role}</span>
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
