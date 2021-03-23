# <img src="readme-img/logo.png" width=40> Cradle VSA System: React Front-End and Python (Flask) Back-End

[![License](https://img.shields.io/github/license/Cradle-VSA/cradle-platform)](https://github.com/Cradle-VSA/cradle-platform/blob/master/LICENCE)

React front-end web application and Python back-end web server for the Cradle 
VSA System, a technological health care system to improve maternal care and 
reduce preventable maternal deaths in Ugandan villages.

<img src="readme-img/screenshot.png" width="600px"/>

## Sites and Servers

* Issue tracking is managed via JIRA at: https://icradle.atlassian.net
* `master` is continuously deployed on: https://staging.cradleplatform.com (SFU server)
* `prod` is deployed on: https://cradleplatform.com (Vultr server)
   * Note that the deployment job must be manually run from the CI/CD Jobs list

## Setup Instructions

Please follow the setup instructions located in [docs/dev_env_setup.md](docs/dev_env_setup.md).

## Default Usernames & Passwords

When you `seed_minimal`, only one user is added:

| Username           | Password | Role                   |
|--------------------|----------|------------------------|
| admin123@admin.com | admin123 | ADMIN - Administrator  |

If you choose to seed additional test data using either `seed_test_data` or `seed`,
the previously mentioned admin user is added along with a few additional users:

| Username           | Password | Role                         |
|--------------------|----------|------------------------------|
| admin123@admin.com | admin123 | ADMIN - Administrator        |
| hcw@hcw.com        | hcw123   | HCW   - Healthcare Worker    |
| cho@cho.com        | cho123   | CHO   - Chief Health Officer |
| vht@vht.com        | vht123   | VHT   - Village Health Team  |

## Contributors

| Name | Email |
| --- | --- |
| Brian Fraser | bfraser@sfu.ca |
| Jeffrey Leung | jyl52@sfu.ca |
| Kat Siu | kysiu@sfu.ca |
| Kevin Le | lekevinl@sfu.ca |
| Keyi Huang | keyih@sfu.ca |
| Matt Doyle | mwdoyle@sfu.ca |
| Vinson Ly | vinsonl@sfu.ca |
| Sachin Raturi | sraturi@sfu.ca |
| Simran Gulati | sgulati@sfu.ca |
| Quintin Sim | ksim@sfu.ca |
| Kisub Song | kisubs@sfu.ca |
| Waswa Olunga | wolunga@sfu.ca |
| Jeremy Schwartz | jdschwar@sfu.ca |
| Avneet Toor | a_toor22@hotmail.com |
| Faraz Fazlalizadeh | ffazlali@sfu.ca |
| Ethan Hinchliff | ehinchli@sfu.ca |
| Brian Marwood | bmarwood@sfu.ca |
| Paul Ngo | paul_ngo@sfu.ca |
| Ali Tohidi | atohidi@sfu.ca |
| Liyang Zhou | lza132@sfu.ca |
