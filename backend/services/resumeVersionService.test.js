const assert = require("assert");
const ResumeVersionService = require("./resumeVersionService");

function runTests() {
  const service = new ResumeVersionService();

  // Test 1: first version should be version 1 and active
  const first = service.createVersion("student-1", {
    name: "Java Developer Resume",
    fileUrl: "/resumes/java-v1.pdf",
  });

  assert.strictEqual(first.version, 1);
  assert.strictEqual(first.isActive, true);

  // Test 2: second version should get version 2
  const second = service.createVersion("student-1", {
    name: "Backend Developer Resume",
    fileUrl: "/resumes/backend-v2.pdf",
  });

  assert.strictEqual(second.version, 2);
  assert.strictEqual(second.isActive, false);

  // Test 3: retrieve all versions
  const versions = service.getVersions("student-1");

  assert.strictEqual(versions.length, 2);

  // Test 4: activate another version
  const activated = service.activateVersion("student-1", second.id);

  assert.strictEqual(activated.isActive, true);
  assert.strictEqual(
    service.getVersion("student-1", first.id).isActive,
    false
  );

  // Test 5: active version cannot be deleted
  assert.throws(
    () => service.deleteVersion("student-1", second.id),
    /Active resume version cannot be deleted/
  );

  // Test 6: inactive version can be deleted
  const deleted = service.deleteVersion("student-1", first.id);

  assert.strictEqual(deleted.id, first.id);
  assert.strictEqual(service.getVersions("student-1").length, 1);

  // Test 7: missing student ID should fail
  assert.throws(
    () =>
      service.createVersion("", {
        name: "Test Resume",
        fileUrl: "/resume.pdf",
      }),
    /studentId is required/
  );

  // Test 8: missing resume information should fail
  assert.throws(
    () => service.createVersion("student-2", {}),
    /name and fileUrl are required/
  );

  // Test 9: different students have independent versions
  const anotherStudent = service.createVersion("student-2", {
    name: "Python Developer Resume",
    fileUrl: "/resumes/python-v1.pdf",
  });

  assert.strictEqual(anotherStudent.version, 1);
  assert.strictEqual(service.getVersions("student-2").length, 1);

  console.log("All Resume Version Service tests passed!");
}

runTests();
