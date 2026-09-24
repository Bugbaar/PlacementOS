from collections import Counter


def generate_summary(results):
    """
    Generate overall eligibility analytics from all results.
    """

    total_results = len(results)

    eligible_results = [
        result for result in results
        if result["eligible"]
    ]

    eligible_count = len(eligible_results)

    if total_results == 0:
        eligibility_rate = 0
    else:
        eligibility_rate = round(
            (eligible_count / total_results) * 100,
            2
        )

    return {
        "total_evaluations": total_results,
        "eligible_evaluations": eligible_count,
        "eligibility_rate": eligibility_rate
    }


def find_top_missing_skills(results):
    """
    Find the most commonly missing skills across all students.
    """

    missing_skills = []

    for result in results:
        missing_skills.extend(result["missing_skills"])

    skill_counts = Counter(missing_skills)

    return skill_counts.most_common()


def generate_branch_analytics(results, students):
    """
    Calculate eligibility rate for each student branch.
    """

    student_branch_map = {
        student["student_id"]: student["branch"]
        for student in students
    }

    branch_results = {}

    for result in results:

        branch = student_branch_map[result["student_id"]]

        if branch not in branch_results:
            branch_results[branch] = {
                "total": 0,
                "eligible": 0
            }

        branch_results[branch]["total"] += 1

        if result["eligible"]:
            branch_results[branch]["eligible"] += 1

    analytics = {}

    for branch, values in branch_results.items():

        total = values["total"]
        eligible = values["eligible"]

        rate = round((eligible / total) * 100, 2)

        analytics[branch] = {
            "total_evaluations": total,
            "eligible_evaluations": eligible,
            "eligibility_rate": rate
        }

    return analytics