function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Student Dashboard
        </h1>

        <p className="text-sm text-gray-500">Track your placement journey</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Notifications"
        >
          🔔
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
            AJ
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">Student</p>

            <p className="text-xs text-gray-500">Placement Candidate</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
