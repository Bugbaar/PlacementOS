from src.eligibility_engine import check_eligibility
from src.analytics_engine import find_top_missing_skills


def _base_student(**overrides):
    student = {
        "student_id": "S001",
        "name": "Test Student",
        "branch": "CSE",
        "cgpa": "8.5",
        "graduation_year": "2027",
        "skills": "Python,SQL,Data Analysis",
    }
    student.update(overrides)
    return student


def _base_drive(**overrides):
    drive = {
        "company": "Test Company",
        "role": "Data Analyst",
        "min_cgpa": "7.0",
        "eligible_branches": "CSE,ECE,IT",
        "graduation_year": "2027",
        "required_skills": "Python,SQL,Data Analysis",
    }
    drive.update(overrides)
    return drive


def test_student_is_eligible():
    result = check_eligibility(_base_student(), _base_drive())
    assert result["eligible"] is True
    assert result["missing_skills"] == []
    assert result["reasons"] == []


def test_student_missing_required_skill():
    result = check_eligibility(
        _base_student(skills="Python,SQL"),
        _base_drive(),
    )
    assert result["eligible"] is False
    assert "data analysis" in result["missing_skills"]


def test_student_below_required_cgpa():
    result = check_eligibility(
        _base_student(cgpa="6.5"),
        _base_drive(),
    )
    assert result["eligible"] is False
    assert len(result["reasons"]) > 0


def test_nan_cgpa_is_not_eligible():
    result = check_eligibility(
        _base_student(cgpa="nan"),
        _base_drive(),
    )
    assert result["eligible"] is False
    assert any("Invalid student CGPA" in reason for reason in result["reasons"])


def test_missing_skills_normalized_in_analytics():
    results = [
        {
            "eligible": False,
            "missing_skills": ["SQL", "sql", "Sql"],
        }
    ]
    ranked = find_top_missing_skills(results)
    assert ranked == [("sql", 3)]
