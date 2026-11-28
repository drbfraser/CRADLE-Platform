# Testing Dashboard Workflow
## Summary
Every early morning at 3 AM, the [Testing Dashboard workflow](../../.github/workflows/testing-dashboard.yml) runs. This workflow downloads Platform's and Mobile's test report artifact using GitHub CLI. It then feeds these reports into a the report-generator Python script inside [testing-dashboard/](../../testing-dashboard) where a json is produced for the dashboard's HTML page to use. The json and HTML page is then hosted on [GitHub Pages](https://pages.github.sfu.ca/cradle-project/Cradle-Platform/).

## The Testing Dashboard workflow
The workflow can be found with the other workflows in [.github/workflows](../../.github/workflows). An important reminder is that the tests themselves and subsequently the reports are produced in `main-cicd.yml`. The `testing-dashboard.yml` workflow downloads the report after.

This means that the workflow can only run on the latest successful` main-cicd.yml` runs, and the GitHub Pages only displays said run as well.

## The tools used
The webpage used for the dashboard and the Python script to convert the reports into json are located in [testing-dashboard/](../../testing-dashboard). All of the JavaScript for the page is inside `index.html`. The `report-generator.py` Python script is ran by the workflow, where it takes the path where the frontend, backend, mobile artifacts are located. It also takes a path where the previous artifacts are located, which is used to calculate the code coverage trend.

**It is important to note that the tools and their versions must be manually updated in `report-generator.py` in the case that they are changed.**