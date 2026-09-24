import csv

from src.eligibility_engine import check_eligibility
from src.analytics_engine import (
    generate_summary,
    find_top_missing_skills,
    generate_branch_analytics
)


def load_csv_data(file_path):
    """
    Load data from a CSV file and return it as a list of dictionaries.
    """

    with open(file_path, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        return list(reader)


def main():
    # Load student and placement drive data
    students = load_csv_data("data/students.csv")
    placement_drives = load_csv_data("data/placement_drives.csv")

    # Store all eligibility results
    results = []

    # Check every student against every placement drive
    for student in students:
        for drive in placement_drives:
            result = check_eligibility(student, drive)
            results.append(result)

    # Generate analytics
    summary = generate_summary(results)

    top_missing_skills = find_top_missing_skills(results)

    branch_analytics = generate_branch_analytics(
        results,
        students
    )

    # Project heading
    print("\n" + "=" * 60)
    print("PLACEMENTOS - ELIGIBILITY & ANALYTICS ENGINE")
    print("=" * 60)

    # Individual results
    print("\nINDIVIDUAL ELIGIBILITY RESULTS")
    print("-" * 60)

    for result in results:

        status = "ELIGIBLE" if result["eligible"] else "NOT ELIGIBLE"

        print(
            f"\nStudent: {result['student_name']} "
            f"| Company: {result['company']} "
            f"| Role: {result['role']}"
        )

        print(f"Status: {status}")

        if result["reasons"]:
            print("Reasons:")

            for reason in result["reasons"]:
                print(f"  - {reason}")

    # Overall analytics
    print("\n" + "=" * 60)
    print("OVERALL ANALYTICS")
    print("=" * 60)

    print(f"Total Evaluations: {summary['total_evaluations']}")
    print(f"Eligible Evaluations: {summary['eligible_evaluations']}")
    print(f"Eligibility Rate: {summary['eligibility_rate']}%")

    # Missing skills
    print("\nMOST COMMONLY MISSING SKILLS")

    if top_missing_skills:
        for skill, count in top_missing_skills:
            print(f"- {skill}: {count}")
    else:
        print("No missing skills found.")

    # Branch analytics
    print("\nBRANCH-WISE ELIGIBILITY ANALYTICS")

    for branch, values in branch_analytics.items():
        print(
            f"- {branch}: "
            f"{values['eligibility_rate']}% "
            f"({values['eligible_evaluations']}/"
            f"{values['total_evaluations']} eligible)"
        )

    print("\n" + "=" * 60)
    print("ANALYSIS COMPLETE")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()