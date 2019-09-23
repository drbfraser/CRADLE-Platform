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

if __name__ == '__main__':
    app.run(debug=True)