#### Vulnerability Tracker

#### Description of the project

This project was created with a React front end, with a Node.JS backend and API handling with Express.JS. With this project it is targeted to monitor security threats based on certain technologies used in a developer's workflow. For example if a developer's software was written in Python, they can view some of the vulnerabilites reported by NVD. User's are only able to track 5 technologies at a time and each technology for now shows 5 vulnerabilites (Planned to be changed).

#### Description of the target browsers

For the target browsers any standard browser like chrome, firefox and safari on both desktop and mobile devices.

#### Link to Developer Manual

You can find the full setup guide, backend API details, and installation steps here:
[Link to Developer Manual](#developer-manual)

---

#### Developer Manual

#### Install the application and dependencies

Make sure you install Node.JS

Run `npm install` to download all of the required packages in the package.json

#### Run your application on a server

Two terminals are required for this

- One terminal needs to run `npm run dev` (To use vite to test the frontend locally)
- Second terminal can have two different commands to run the backend server which can be `npm start index.js` or `npm run server`.

#### No units but to test the web application

- Making sure that the frontend and backend are active on both the terminals
- Checking if the login in and sign up work on the login page
- Checking if the add and delete button in the dashboard and the respective CVE cards show and delete

#### The API ENDPOINTS

For the API Endpoint there are four of them:

- **ENDPOINT 1 (Read)**

  - Uses a GET method (`"/api/watchlist"`) and this endpoint is called to get the user's watchlist on Supabase and in the request it needs to have a user_id in query to get the exact watchlist from Supabase.

- **ENDPOINT 2 (Update)**

  - Uses a POST method (`"/api/watchlist"`) and this endpoint is used to update the user's watchlist on supabase and on the frontend. It needs to have the name of the tech that the user wants to track in the body of the request. In which it only allows for the user to track only 5 technologies and checks for duplicates to prevent them from putting the same technology in the database. Also, it checks if the technology is part of the NVD API and if not its not added to the frontend and the database.

- **ENDPOINT 3 (Read)**

  - Uses a GET method (`"/api/vulnerabilities"`) and it borrows the logic from the ENDPOINT 1 and ENDPOINT 2 and gets the data about the selected technology in which it shows only 5 of the CVEs for each selected technologies. It needs the userId inside of the url query.

- **ENDPOINT 4 (Delete)**
  - Uses a DELETE method ("/api/watchlist") and it is used to remove a technology from the frontend and the database. It needs the userID and the tech name inside of the url query.

#### Known bugs and a road-map for future development

First, since the API only shows vulnerabilities that occured while ago, like in the 90s, we have to figure out how to show new vulnerabilities, because sometimes in 2026 in returns no vulnerabilities.
