"""Placement drive eligibility checks with explainable failure reasons."""

from __future__ import annotations

import math
from typing import Any


def _parse_finite_float(raw: Any, field_name: str) -> float | None:
    """Return a finite float, or None if the value is missing/invalid/non-finite."""
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None
    try:
        value = float(text)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(value):
        return None
    return value


def _parse_int(raw: Any) -> int | None:
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None
    try:
        return int(text)
    except (TypeError, ValueError):
        return None


def _split_csv_list(raw: Any) -> list[str]:
    if raw is None:
        return []
    return [part.strip() for part in str(raw).split(",") if part.strip()]


def check_eligibility(student: dict, drive: dict) -> dict:
    """
    Evaluate one student against one placement drive.

    Rules: CGPA, branch, graduation year, and required skills.
    Invalid / non-finite CGPA values are treated as not eligible.
    """
    reasons: list[str] = []
    missing_skills: list[str] = []

    student_cgpa = _parse_finite_float(student.get("cgpa"), "cgpa")
    min_cgpa = _parse_finite_float(drive.get("min_cgpa"), "min_cgpa")

    if student_cgpa is None:
        reasons.append(
            f"Invalid student CGPA '{student.get('cgpa')}'. "
            "A finite numeric CGPA is required."
        )
    elif min_cgpa is None:
        reasons.append(
            f"Invalid drive minimum CGPA '{drive.get('min_cgpa')}'. "
            "A finite numeric threshold is required."
        )
    elif student_cgpa < min_cgpa:
        reasons.append(
            f"CGPA requirement not met. "
            f"Required: {drive['min_cgpa']}, "
            f"Student: {student['cgpa']}"
        )

    eligible_branches = _split_csv_list(drive.get("eligible_branches"))
    student_branch = str(student.get("branch", "")).strip()
    if student_branch not in eligible_branches:
        reasons.append(
            f"Branch '{student.get('branch')}' is not eligible for this drive."
        )

    student_year = _parse_int(student.get("graduation_year"))
    drive_year = _parse_int(drive.get("graduation_year"))
    if student_year is None or drive_year is None:
        reasons.append(
            "Graduation year could not be compared "
            f"(student={student.get('graduation_year')!r}, "
            f"drive={drive.get('graduation_year')!r})."
        )
    elif student_year != drive_year:
        reasons.append(
            f"Graduation year requirement not met. "
            f"Required: {drive['graduation_year']}, "
            f"Student: {student['graduation_year']}"
        )

    student_skills = {
        skill.strip().lower()
        for skill in _split_csv_list(student.get("skills"))
    }
    required_skills = _split_csv_list(drive.get("required_skills"))

    for skill in required_skills:
        if skill.lower() not in student_skills:
            # Canonical lower form keeps analytics case-stable
            missing_skills.append(skill.strip().lower())

    if missing_skills:
        reasons.append(
            "Missing required skills: " + ", ".join(missing_skills)
        )

    return {
        "student_id": student["student_id"],
        "student_name": student["name"],
        "company": drive["company"],
        "role": drive["role"],
        "eligible": len(reasons) == 0,
        "missing_skills": missing_skills,
        "reasons": reasons,
    }
