#!/bin/bash

git fetch --prune

# Retrieve a list of all branches merged into main, 
# and use sed to remove the leading "origin/" and any whitespace.
MERGED_BRANCHES=$(git branch -r --merged main | sed -e 's/\s*origin\///')

for BRANCH in $MERGED_BRANCHES;
do 
  # Delete all branches that have been merged into main.
  git push origin -d "$BRANCH"
done
