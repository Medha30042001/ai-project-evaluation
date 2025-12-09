##################################################################################################

# TimeFlow — AI-assisted Time Tracking & Analytics

TimeFlow is a lightweight, user-friendly time-tracking platform designed to help users log daily activities, analyze productivity patterns, and gain insights into how they spend their time.

Built with HTML, CSS, JS (DOM) and powered by Firebase Auth + Firestore, this project demonstrates clean architecture, modular code, and real-time database integration.

##################################################################################################

# Live demo: 

  -> Github deployment link 
      https://medha30042001.github.io/ai-project-evaluation/
    
  -> Firebase hosting link  
      https://timetrackingapp-a6604.web.app/

##################################################################################################

# Tech Stack

  -> Frontend
    * HTML5
    * CSS3
    * JavaScript (ES6)
    * DOM Manipulation
    * Responsive UI with Tailwind-like utility styles
  
  -> Backend / Database
    * Firebase Authentication 
    * Firebase Firestore
    * Firebase Hosting
    
  -> Version Control
    * Git & GitHub
    
  -> Deployment
    * GitHub Pages (Primary)
    * Firebase Hosting (Alternate)

##################################################################################################

# Features

  ✔ Google Authentication
    -> Users can sign in securely using Google OAuth.
  
  ✔ Add, Edit, Delete Activities
    -> Log activities with:
      * Title
      * Category
      * Duration (in minutes)
      * Notes
  
  ✔ Day-wise Data Storage
    -> Each user gets isolated Firestore paths:
    -> users/{uid}/days/{date}/activities
  
  ✔ Interactive Analytics
    -> Total minutes & hours
    -> Category-wise breakdown
    -> Activity count
    -> Auto calculation
    -> Shown instantly without reloading
  
  ✔ Clean & Responsive UI
    -> Designed to work across mobile, tablet, and desktop.

##################################################################################################

# How to Run the Project Locally

  1. Clone the repository
      git clone https://github.com/Medha30042001/ai-project-evaluation.git
      cd ai-project-evaluation

  2. Add Firebase Config
      Inside /scripts/firebase-config.js, paste your Firebase config:
      
        window.__FIREBASE_CONFIG = {
          apiKey: "...",
          authDomain: "...",
          projectId: "...",
          storageBucket: "...",
          messagingSenderId: "...",
          appId: "..."
        };
     
  3. Open the Project
      Since this is pure HTML/CSS/JS:
      Use Live Server
      OR
      Open index.html directly in your browser

  4. (Optional) Firebase Hosting Setup
        firebase login
        firebase init
        firebase deploy

##################################################################################################

# Folder structure

  ai-project-evaluation
  │
  ├── index.html
  ├── login.html
  ├── activity.html
  ├── analytics.html
  │
  ├── scripts
  │   ├── auth.js
  │   ├── db.js
  │   ├── analytics.js
  │   ├── activity.js
  │   ├── firebase-config.js
  │   └── firebase-init.js
  │
  ├── styles
  │   └── style.css
  │
  ├── dist/
  ├── .github/
  ├── firebase.json
  └── README.md
    

##################################################################################################

# Screenshots / GIFs of the app (recommended)

##################################################################################################

# Future Improvements 
  Add dark mode
  Add weekly/monthly analysis

  
