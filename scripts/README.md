# Scripts for Deployment

## Initial Deployment

* On a fresh Ubuntu 22.04 server, log in as `root` and create the file `/root/setup_production.sh` and copy into it the contents of the `setup_production.sh` file from this repo. Suggested command:  
  `nano /root/setup_production.sh`
* Run the script  
  `cd /root/`  
  `chmod +x ./setup_production.sh`  
  `./setup_production.sh`
  - Tell the script the URL for this server (press ENTER if just using locally)
  - Script will randomly create some passwords.
  - Script will allow you to edit the `.env` file to configure username and password for email account and Views.
  - Script will link the `update.sh` script into the `/root/` folder for future updates.

## Update Server to New Version

To update a running server, log in via SSH as `root` and execute the `/root/update.sh` script.

## Release Process

To release code to the staging server, or mark ready for production, do the following:

1. Delete the protected branch you would like the code to appear on (either `staging` or `production`)
    * In GitLab, goto Repository > Branches
    * Ensure the branch you are going to delete is not ahead of `master`. If it is, it means there are commits to this branch which have not been merged to `master` and should be considered before proceeding.
    * Click the delete button beside the branch and complete the confirmation screen

2. Re-create the protected branch you just deleted
    * In GitLab, goto Repository > Branches
    * Click "New Branch" button
    * Enter name and source branch for recreated branch:
        * If `staging`, set the source branch to `master`
        * If `production`, set the source branch to `staging`
    * When the branch is recreated, GitLab will remember its protected status from before.

This will put the current version of the code from the source branch into the protected `staging` or `production` branch without creating a new commit. This is important because the deployment process depends on a docker image for a commit being built just once (when merged to `master`). And commits to either the `staging` or `production` branches will break the deployment process.

## Tags on Docker Hub

Development, staging, and deployment servers will run docker images pulled from Docker Hub. Images are tagged as follows:

- Each build on `master` is tagged with something like `v2022-05-22.acbd1234`
- The build of the latest code on `master` is additionally tagged with `:dev`
- The build of the latest code on `staging` is additionally tagged with `:staging`
- The build of the latest code on `production` is additionally tagged with `:prod`

### Docker Hub Tag Details 

When code is merged to the `master` branch, the CI/CD pipeline automatically builds each part of the application and then generates the frontend (and caddy reverse-proxy) docker image, and the backend docker image. These are tagged with both the commit date/SHA (such as `v2022-12-31.abcd5678`), plus the tag `dev` and pushed to Docker Hub. Code is then deployed to the dev-server for testing.

When code makes it to the `staging` branch, its docker image (previously built when that commit was merged to `master`) is given an additional tag on Docker Hub of `staging`. This tag is applied to the most recent docker image that has been put onto the `staging` branch. Plus, the staging deployment server updates to this new version for testing.

When code makes it to the `production` branch, its docker image (previously built when merged to `master`) is given an additional tag on Docker Hub of `prod`. This tag is applied to the most recent docker image that has been put onto the `production` branch. The administrator of the production server must then run the `/root/update.sh` script to update to the latest version on `production`. Note that this update script actually pulls a specific version of the Docker image from Docker Hub, instead of using the `prod` tag. It knows which specific version to pull based on the latest commit in the `production` branch of the code which has been cloned onto the production server, likely through GitHub.

Note that the code in GitLab is continually mirrored to the publicly accessible GitHub repo.