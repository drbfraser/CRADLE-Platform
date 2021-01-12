#### Note: This is an old guide on how to deploy cradle to the SFU servers, the deployment architecture has changed. Deployment is now automated using GitLab CI/CD pipelines. For a manual deployment guide with the new deployment architecture, visit: https://csil-git1.cs.surrey.sfu.ca/415-cradle/cradle-platform/-/wikis/Manual-Deployment-Guide

This is a guide on how to deploy the current master branch to the remote VM

## On Your Computer

1. Fetch all changes from origin and update your local master branch:
```
git fetch --all
git checkout master
git pull
```

2. Checkout the 'deploy' branch and reset it to contain all the changes in the remote master branch:
```
git checkout -b deploy
git reset --hard origin/master
```

3. Install any missing python modules and node modules:
```
cd cradleplatform/server
source venv/bin/activate
pip install -r requirements.txt
cd ../client
yarn install
```

4. In one terminal window, start the server (make sure that the venv is activated beforehand):
```
cd cradleplatform/server
python app.py 
```

5. In another terminal window, start the web client:
```
cd cradleplatform/client
yarn start
```

6. Navigate to http://localhost:3000 and ensure that the app is working fine.

Press `CTRL + F5` to hard refresh in case your browser is loading a cached version of the web client from a previous session.

7. If everything is working well, create a React production build file:
```
cd cradleplatform/client
npm run build
```

8. Add all changes to your local deploy branch and force push the changes to the remote deploy branch:
```
git add -A
git commit -m "this is a meaningful commit message"
git push -f origin deploy
```

9. SSH into the VM and enter your SFU password when prompted:
```
ssh -p 1008 <your_sfu_username>@cmpt373.csil.sfu.ca
```

## On the VM

10. Change to the root user:
```
sudo su
```

11. Fetch all changes from the deploy branch:
```
cd /var/www/cradleplatform
git fetch --all
git reset --hard origin/deploy
```

12. Check most recent commit to ensure that our changes have made it to the remote server:
```
git log
```

13. Ensure all required Python modules for the Flask app is installed:
```
cd server
source venv/bin/activate
pip install -r requirements.txt
```

14. Restart the project daemon and nginx:
```
sudo systemctl restart cradleplatform
sudo systemctl restart nginx
```

15. Navigate to http://cmpt373.csil.sfu.ca:8088 to view the deployed changes!