"""
    @File: app.py
    @ Description:
    - This file is the main entry point for the server
    - It's main job is to initilize all of its connections including:
      * Connect to database
      * Serve React App
      * Initilize server routes
      * Start Flask server
"""


import config
import routes

app = config.app
routes.init(config.api)

# For Heroku configuration
port = os.environ.get('PORT')
host = None
if port is None:
    print('PORT environment variable not found. Using Flask default.')
else:
    print('PORT environment variable found:', port)
    print('Binding to host 0.0.0.0')
    host = '0.0.0.0'

routes.init(api)

if __name__ == '__main__':
    app.run(debug=True, host=host, port=port)
