# Eligibility & Placement Analytics (Python sidecar)

Standalone CSV-driven eligibility + analytics demo for PlacementOS.

Lives under `tools/` so it does **not** replace the main MERN app (`backend/` / `frontend/`).

## Features

- Eligibility: CGPA, branch, graduation year, required skills
- Explainable failure reasons
- Analytics: overall rate, top missing skills, branch-wise rates
- Invalid / non-finite CGPA values are rejected (not treated as eligible)

## Setup

```bash
cd tools/eligibility-analytics
python -m pip install -r requirements.txt
```

## Run

```bash
python main.py
python -m pytest -v
```

## Layout

```text
tools/eligibility-analytics/
├── data/
│   ├── students.csv
│   └── placement_drives.csv
├── src/
│   ├── eligibility_engine.py
│   └── analytics_engine.py
├── tests/
│   └── test_eligibility.py
├── main.py
└── requirements.txt
```

This module can later be ported into the Node/Mongo eligibility services used by the main app.
