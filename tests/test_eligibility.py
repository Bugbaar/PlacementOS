from src.eligibility_engine import check_eligibility


def test_student_is_eligible():

    student = {
        "student_id": "S001",
        "name": "Test Student",
        "branch": "CSE",
        "cgpa": "8.5",
        "graduation_year": "2027",
        "skills": "Python,SQL,Data Analysis"
    }

    drive = {
        "company": "Test Company",
        "role": "Data Analyst",
        "min_cgpa": "7.0",
        "eligible_branches": "CSE,ECE,IT",
        "graduation_year": "2027",
        "required_skills": "Python,SQL,Data Analysis"
    }

    result = check_eligibility(student, drive)

    assert result["eligible"] is True
    assert result["missing_skills"] == []
    assert result["reasons"] == []


def test_student_missing_required_skill():

    student = {
        "student_id": "S002",
        "name": "Test Student",
        "branch": "CSE",
        "cgpa": "8.0",
        "graduation_year": "2027",
        "skills": "Python,SQL"
    }

    drive = {
        "company": "Test Company",
        "role": "Data Analyst",
        "min_cgpa": "7.0",
        "eligible_branches": "CSE,ECE,IT",
        "graduation_year": "2027",
        "required_skills": "Python,SQL,Data Analysis"
    }

    result = check_eligibility(student, drive)

    assert result["eligible"] is False
    assert "Data Analysis" in result["missing_skills"]


def test_student_below_required_cgpa():

    student = {
        "student_id": "S003",
        "name": "Test Student",
        "branch": "CSE",
        "cgpa": "6.5",
        "graduation_year": "2027",
        "skills": "Python,SQL,Data Analysis"
    }

    drive = {
        "company": "Test Company",
        "role": "Data Analyst",
        "min_cgpa": "7.0",
        "eligible_branches": "CSE,ECE,IT",
        "graduation_year": "2027",
        "required_skills": "Python,SQL,Data Analysis"
    }

    result = check_eligibility(student, drive)

    assert result["eligible"] is False
    assert len(result["reasons"]) > 0