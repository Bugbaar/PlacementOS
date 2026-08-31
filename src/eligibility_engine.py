def check_eligibility(student, drive):
    
    reasons = []
    missing_skills = []

    # Check CGPA
    if float(student["cgpa"]) < float(drive["min_cgpa"]):
        reasons.append(
            f"CGPA requirement not met. "
            f"Required: {drive['min_cgpa']}, "
            f"Student: {student['cgpa']}"
        )

    # Check branch
    eligible_branches = [
        branch.strip()
        for branch in drive["eligible_branches"].split(",")
    ]

    if student["branch"] not in eligible_branches:
        reasons.append(
            f"Branch '{student['branch']}' is not eligible for this drive."
        )

    # Check graduation year
    if int(student["graduation_year"]) != int(drive["graduation_year"]):
        reasons.append(
            f"Graduation year requirement not met. "
            f"Required: {drive['graduation_year']}, "
            f"Student: {student['graduation_year']}"
        )

    # Convert student skills into a clean list
    student_skills = [
        skill.strip().lower()
        for skill in student["skills"].split(",")
    ]

    required_skills = [
        skill.strip()
        for skill in drive["required_skills"].split(",")
    ]

    # Check required skills
    for skill in required_skills:
        if skill.lower() not in student_skills:
            missing_skills.append(skill)

    if missing_skills:
        reasons.append(
            "Missing required skills: " + ", ".join(missing_skills)
        )

    # Final eligibility result
    eligible = len(reasons) == 0

    return {
        "student_id": student["student_id"],
        "student_name": student["name"],
        "company": drive["company"],
        "role": drive["role"],
        "eligible": eligible,
        "missing_skills": missing_skills,
        "reasons": reasons
    }