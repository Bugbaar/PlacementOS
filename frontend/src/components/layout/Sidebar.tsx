function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">PlacementOS</h1>

        <p className="mt-1 text-sm text-gray-500">Student Portal</p>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          <li>
            <a
              href="#"
              className="block rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-900"
            >
              Dashboard
            </a>
          </li>

          <li>
            <a
              href="#"
              className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              Applications
            </a>
          </li>

          <li>
            <a
              href="#"
              className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              Placement Drives
            </a>
          </li>

          <li>
            <a
              href="#"
              className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              Resume
            </a>
          </li>

          <li>
            <a
              href="#"
              className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              Profile
            </a>
          </li>

          <li>
            <a
              href="#"
              className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              Settings
            </a>
          </li>
        </ul>
      </nav>

      <div className="border-t border-gray-200 px-4 py-4">
        <p className="text-xs text-gray-500">PlacementOS Student Portal</p>
      </div>
    </aside>
  );
}

export default Sidebar;
