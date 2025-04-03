# EDLEARN - Online Learning Platform (In Progress)

## Project Overview

EDLEARN is an in-progress online learning platform designed to provide users with access to various educational courses. This project aims to create a user-friendly environment where students can browse courses, enroll, watch video lessons, track their progress, and engage with course content.

This README outlines the features implemented so far and provides a brief overview of the project structure.

## Features Implemented

As of [Date of this README], the following features have been implemented:

* **User Authentication (Basic):**
    * Users can register a new account with their first name, last name, email, and password.
    * Users can log in to their existing accounts using their email and password.
    * Basic authentication handling to manage user sessions (using `localStorage`).
* **Dashboard:**
    * Authenticated users are redirected to a dashboard upon login.
    * The dashboard displays a summary of the user's learning progress, including:
        * The number of currently enrolled courses.
        * A list of courses in progress with a visual progress bar.
        * A list of completed courses.
* **Course Listing:**
    * A dedicated "Courses" page displays a catalog of available courses.
    * Each course listing shows the title, tutor, thumbnail, and the number of videos.
    * Users can navigate to a course's playlist page from the course listing.
* **Watch Video Page:**
    * Users can access a dedicated page to watch video lessons.
    * The page includes a video player with standard controls.
    * Basic video metadata (title, tutor) is displayed.
* **Basic Video Progress Tracking:**
    * The platform attempts to track the user's progress as they watch videos.
    * The last watched position and a percentage watched are recorded.
    * A basic "completed" status is tracked (though there might be ongoing refinements).
    * Progress data is stored using a local JSON Server.
* **Course Playlist:**
    * A "Playlist" page lists the videos available within a specific course.
    * Users can navigate to individual video lessons from the playlist.
* **Search Functionality:**
    * A search bar is available in the header.
    * Users can search for courses by title.
    * A dedicated "Search Results" page displays courses matching the search query in a card-like format.

## Project Structure (Client-Side)

The client-side of the project is primarily built using HTML, CSS, and JavaScript. The main directories and files include:

* `index.html`: The initial landing page (may contain login/registration).
* `dashboard.html`: The user's main dashboard.
* `courses.html`: Page displaying the list of all courses.
* `watch-video.html`: Page for watching individual video lessons.
* `playlist.html`: Page listing the videos in a specific course.
* `search.html`: Page displaying search results.
* `css/`: Contains CSS files for styling.
    * `dist/css/main.css`: The main stylesheet.
* `js/`: Contains JavaScript files for functionality.
    * `script.js`: General utility scripts.
    * `auth_handler.js`: Handles user authentication logic.
    * `enrollment.js`: (Potentially handles enrollment related functions).
    * `playlist.js`: Functionality for the playlist page.
    * `watch-video.js`: Logic for the watch video page, including progress tracking.
    * `progress.js`: Functions for fetching and displaying user progress on the dashboard.
    * `search.js`: Handles the search functionality and displaying results.
* `images/`: Contains images used in the platform.
* `dist/`: Contains compiled CSS (if using a preprocessor like SASS).

## Backend (Simulated with JSON Server)

The backend functionality for this project is currently simulated using a local JSON Server. The `db.json` file in the project root serves as the database and stores data for:

* `users`: User account information.
* `courses`: Details about the available courses.
* `comments`: (Potentially for future comment functionality).
* `courseProgress`: Records of user progress in different courses.

## Getting Started (Development)

1.  **Clone the repository:** `git clone [your-repository-url]`
2.  **Navigate to the project directory:** `cd [your-project-directory]`


4.  **Install JSON Server (if you haven't already):** `npm install -g json-server` or `yarn global add json-server`
5.  **Install node.js (if you haven't already):
6.  **Start the JSON Server:** `json-server --watch db.json --port 3000` (Ensure no other application is using port 3000)
7.  **Open the HTML files in your web browser** (e.g., `index.html` or `dashboard.html`).


## Backend

The backend of the EDLEARN platform utilizes a combination of a local JSON Server and a Node.js server (`server.js`) to handle different aspects of the application:

* **JSON Server (`db.json`):** This is used as a simple data storage solution for:
    * `users`: User account information (excluding direct authentication handling by `server.js`).
    * `courses`: Details about the available courses.
    * `comments`: (Potentially for future comment functionality).
    * `courseProgress`: Records of user progress in different courses.

* **Node.js Server (`server.js`):** This server handles the following critical user authentication functionalities:
    * **User Registration ("Get Started"):** Processes the submission of new user registration forms, validates input, and adds new user data to the `db.json` file (or a persistent database if implemented later).
    * **User Login (Sign-in):** Handles the submission of login forms, authenticates users by comparing provided credentials with the data in `db.json`, and manages user sessions (currently using `localStorage` on the client-side after successful login).

This hybrid approach allows for simulating a more complete backend with dedicated logic for user authentication while still leveraging the simplicity of JSON Server for other data management.

**To run the backend:**

1.  **Start the JSON Server:** `json-server --watch db.json --port 3000` (Ensure no other application is using port 3000)
2.  **Start the Node.js server:** `node server.js` (Ensure you have Node.js installed)

The client-side application will then communicate with both the JSON Server (for general data) and the Node.js server (for authentication) via HTTP requests.


## Future Enhancements

The following features are planned for future development:

* [List potential future features, e.g., more robust video progress tracking, commenting system, user profiles, instructor roles, course enrollment functionality, improved UI/UX, etc.]

## Known Issues and Limitations

* Video progress tracking might have some inconsistencies or edge cases that need further refinement.
* User enrollment is currently managed through manual updates in `db.json`.
* [Mention any other known issues or limitations you are aware of.]

## Contact

[Your Name/Contact Information]
