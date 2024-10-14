MusicFanZone

Overview

MusicFanZone is a web application that allows users to create and manage playlists using the YouTube API, and engage in discussions through a forum dedicated to music topics. Users can create, add, edit, and delete playlists, as well as manage forum topics and comments.

Features
- **User Authentication**: Secure sign-up and login functionality.
- **Playlist Management**: Create, view, edit, and delete playlists using the YouTube API.
- **Forum System**: Create and manage topics, along with adding, editing, and deleting comments.
- **YouTube Search Integration**: Search for YouTube videos directly from the application.
- **Hide/View Music Videos**: Users can toggle the visibility of music videos within their playlists. This allows for a personalized listening experience, enabling users to hide videos they do not wish to see or play.
- **Listen to Music Videos**: Easily play music videos directly from the application, providing a seamless experience to enjoy music without navigating away from the platform.

Technologies Used
- **Backend**: Node.js, Express
- **Frontend**: React
- **Database**: MongoDB
- **APIs**: YouTube API
- **CSS**: Custom CSS for styling the application

- **Dependencies**: 
  Backend:
    - `axios`: For making HTTP requests.
    - `bcrypt`: For password hashing.
    - `cookie-parser`: For parsing cookies.
    - `cors`: To enable Cross-Origin Resource Sharing.
    - `dotenv`: For environment variable management.
    - `express`: The web application framework.
    - `jsonwebtoken`: For user authentication.
    - `mongoose`: MongoDB object modeling.
    - `qs`: For query string parsing.
    - `react-player`: For embedding YouTube videos.
  
  Frontend:
    - `@testing-library/jest-dom`: For custom jest matchers.
    - `@testing-library/react`: For testing React components.
    - `@testing-library/user-event`: For simulating user interactions.
    - `axios`: For making HTTP requests.
    - `jwt-decode`: To decode JWT tokens.
    - `react`: The main React library.
    - `react-dom`: For DOM rendering.
    - `react-player`: For embedding YouTube videos.
    - `react-router-dom`: For routing within the app.
    - `react-scripts`: For scripts and configuration used by Create React App.

- **Responsive Design**
  To enhance usability across devices, media queries have been integrated into MusicFanZone, allowing the layout and features to adapt fluidly to different 
  screen sizes. This approach ensures an optimal user experience by providing a mobile-friendly design that maintains functionality and aesthetics, regardless of the 
  device being used.
  