Notes: 
* The master branch is the branch we will be regularly merging updates into and should be the destination branch for merge requests
* the production branch contains the latest stable revision of the app
* master should be merged into production once a week
* VSCode has a neat version control tool to resolve merge conflicts that makes things super easy
* Heres a git cheat sheet that might be helpful if you'd like to use the git command line rather than a GUI: https://rogerdudler.github.io/git-guide/files/git_cheat_sheet.pdf
***
1. Select an issue to work on from the issues page/issues board and create a branch to address that issue/ticket
(Only make one branch per issue)

2. When working on something new, create a new branch from the 'master' branch
```
$ git checkout master
$ git pull # update local master branch
$ git checkout -b issuenumber-feature-<featurename> # (eg: 10-feature-loginpage OR 12-bugfix-uifixes)
```

3. Commit your changes to your branch
```
$ git add -A # stages all of your changes
$ git commit -m "your commit message"
$ git push origin <BRANCH_NAME>
```
4. Regularly merge the master branch into your working branch to prevent future merge conflicts
```
$ git checkout master
$ git pull # runs fetches changes made in the remote branch and merges changes from the remote staging branch to local staging branch
$ git checkout <BRANCH_NAME>
$ git merge master # merges master into your feature branch
```

5. Put up a merge request to merge your feature branch into the master branch and assign a team member to review the merge request.
    * Check the CI/CD pipeline that was trigged by this merge request to verify that the changes pass the build and test stages

6. Assignee reviews the pull request and submits a feedback/change request to the author if required, else a thumbs up is given to the merge request 

7. Once the merge request receives a thumbs up, the change author will be responsible for merging the feature branch into the master

8. Delete local and remote branch feature branch
```
$ git branch -d <BRANCH_NAME> # deletes your local branch
$ git push <remote_name> --delete <BRANCH_NAME> # deletes the remote branch, the remote_name is likely "origin"
```

Notes: 
* The master branch is the branch we will be regularly merging updates into and should be the destination branch for merge requests
* the production branch contains the latest stable revision of the app
* master should be merged into production once a week
* VSCode has a neat version control tool to resolve merge conflicts that makes things super easy
* Heres a git cheat sheet that might be helpful if you'd like to use the git command line rather than a GUI: https://rogerdudler.github.io/git-guide/files/git_cheat_sheet.pdf
***
1. Select an issue to work on from the issues page/issues board and create a branch to address that issue/ticket
(Only make one branch per issue)

2. When working on something new, create a new branch from the 'master' branch
```
$ git checkout master
$ git pull # update local master branch
$ git checkout -b issuenumber-feature-<featurename> # (eg: 10-feature-loginpage OR 12-bugfix-uifixes)
```

3. Commit your changes to your branch
```
$ git add -A # stages all of your changes
$ git commit -m "your commit message"
$ git push origin <BRANCH_NAME>
```
4. Regularly merge the master branch into your working branch to prevent future merge conflicts
```
$ git checkout master
$ git pull # runs fetches changes made in the remote branch and merges changes from the remote staging branch to local staging branch
$ git checkout <BRANCH_NAME>
$ git merge master # merges master into your feature branch
```

5. Put up a merge request to merge your feature branch into the master branch and assign a team member to review the merge request.
    * Check the CI/CD pipeline that was trigged by this merge request to verify that the changes pass the build and test stages

6. Assignee reviews the pull request and submits a feedback/change request to the author if required, else a thumbs up is given to the merge request 

7. Once the merge request receives a thumbs up, the change author will be responsible for merging the feature branch into the master

8. Delete local and remote branch feature branch
```
$ git branch -d <BRANCH_NAME> # deletes your local branch
$ git push <remote_name> --delete <BRANCH_NAME> # deletes the remote branch, the remote_name is likely "origin"
```
9. The master branch can be manually merged deployed to the production server using the GitLab CI/CD GUI.  

10. Master branch is tested at the end of every sprint and merged into the production branch
    * Changes committed and pushed to the production master branch will be automatically deployed to the production server via Gitlab CI/CD