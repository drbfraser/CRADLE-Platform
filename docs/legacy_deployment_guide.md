This is a guide on how to deploy the current master branch to the remote VM

## On Your Computer

1. Fetch all changes from origin and update your local master branch:
```shell
git fetch --all
git checkout master
git pull
```

2. Checkout the 'deploy' branch and reset it to contain all the changes in the remote master branch:
```shell
git checkout -b deploy
git reset --hard origin/master
```

3. Install any missing python modules and node modules:
```shell
cd cradleplatform/server
source venv/bin/activate
pip install -r requirements.txt
cd ../client
yarn install
```

4. In one terminal window, start the server (make sure that the `venv` is activated beforehand):
```shell
cd cradleplatform/server
python app.py 
```

5. In another terminal window, start the web client:
```shell
cd cradleplatform/client
yarn start
```

6. Navigate to http://localhost:3000 and ensure that the app is working fine.

Press `CTRL + F5` to hard refresh in case your browser is loading a cached version of the web client from a previous session.

7. If everything is working well, create a React production build file:
```shell
cd cradleplatform/client
npm run build
```

8. Add all changes to your local deploy branch and force push the changes to the remote deploy branch:
```shell
git add -A
git commit -m "this is a meaningful commit message"
git push -f origin deploy
```

9. SSH into the VM and enter your SFU password when prompted:
```shell
ssh -p 22 cradle@cradle.eastus.cloudapp.azure.com
```

## On the VM

10. Change to the root user:
```shell
sudo su
```

11. Fetch all changes from the deploy branch:
```shell
cd /var/www/cradleplatform
git fetch --all
git reset --hard origin/deploy
```

12. Check most recent commit to ensure that our changes have made it to the remote server:
```shell
git log
```

13. Rebuild, recreate, and restart docker containers
```shell
docker-compose -f docker-compose.prod.yml up --build -d
```

14. Navigate to https://cradle.eastus.cloudapp.azure.com/ to view the deployed changes!