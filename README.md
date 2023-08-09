### About
An express example backend utilizing the googleapis npm package to provide a simple endpoint to manage a google sheet as a database. <br>
This is a Proof Of Concept Project for the Kamodb repo

- Create: Done
- Read: Done
- Update: 
- Delete: 

### How to setup
- run ``npm install``
- Setup google api:
    - Create or select an existing project on https://console.cloud.google.com/welcome
    - activate the google sheets api
    - Create a Service-acc
    - Create and download a json keys file and put it in ``./secrets/[the keys file]``
    - create a google spreadsheet and share it with the service-acc's email address
    - get the spreadsheetId from the url
    - Edit the ``const keyFileLocation``, ``const spreadsheetId`` and ``const sheetName`` in index.js accordingly
- run ``node index.js`` to start the express server 