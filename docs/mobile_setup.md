# CRADLE Mobile Set Up

## Running the app locally

In the home screen, there should be a gear icon in the top right. Clicking here should open the settings for the app.

There are 2 settings that are relevant here. For local development, open the advanced settings (the "Advanced" tab) and change it to wherever the Flask server is running. Locally, it should be something like `10.0.02.2` for the hostname and `5000` for the port.

## Running the app with the CRADLE SMS Relay app

Be sure to start the emulator that is running the SMS Relay App before starting the emulator running the CRADLE Mobile app.

This will make sure that the SMS Relay App is running on an emulator with the phone number 5555215554 and the CRADLE Mobile app is running on 5555215556.
