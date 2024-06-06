# CRADLE Mobile Set Up

## Running the app locally

In the home screen, there should be a gear icon in the top right. Clicking here should open the settings for the app.

There are 2 settings that are relevant here. For local development, open the advanced settings (the "Advanced" tab) and change it to wherever the Flask server is running. Locally, it should be something like `10.0.02.2` for the hostname and `5000` for the port. Ensure that it is using HTTP rather than HTTPS.

## Running the app with the CRADLE SMS Relay app

Make sure the phone number of the CRADLE SMS Relay app is specified in the settings of CRADLE Mobile.
