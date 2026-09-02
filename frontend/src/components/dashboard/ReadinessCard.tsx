function ReadinessCard() {
  const readiness = 78;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Placement Readiness
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your overall placement preparation
          </p>
        </div>

        <span className="text-2xl font-bold text-gray-900">{readiness}%</span>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gray-900"
          style={{ width: `${readiness}%` }}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">Profile</p>

          <p className="mt-1 text-sm text-gray-500">Complete</p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">Resume</p>

          <p className="mt-1 text-sm text-gray-500">Added</p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">Skills</p>

          <p className="mt-1 text-sm text-gray-500">8 skills added</p>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">
            Interview Preparation
          </p>

          <p className="mt-1 text-sm text-gray-500">In progress</p>
        </div>
      </div>
    </section>
  );
}

export default ReadinessCard;
