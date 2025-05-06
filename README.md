# ExchangeForStudents

Link to Demo Video: https://youtu.be/pfY78eXmzBc?si=8g5hUJcsWBPnLhf5
## Introduction & Team Responsibilities
Exchange4Students is a campus-exclusive marketplace designed to simplify buying and selling among students. Whether it’s furniture, textbooks, electronics, or other essentials, our app provides a streamlined platform for students to connect and exchange items with ease.


### Team Members & Contributions
- **[Thomas Ung]** –  Ensured database consistency and worked on implementing chat messaging functions. Managed backend integration with Firebase and data operations.
- **[Spurthi Setty]** – Led frontend implementation with the database, added browsing features, updated filtering options and edit functionality, and handled disabling posts marked as sold.
- **[Lakshya Vegiraju]** – Helped with user interface implementation, supported documentation, reports, and diagrams, and contributed to architectural planning and UML updates.
- **[Gianna Cerbone]** – Focused on user interface improvements with style sheets, created the logo and buttons, and updated navigation bars. Also contributed to frontend development, profile screens, and notification integration.


## Implemented Functions ✅
- [ ] Function 1 – Users can log into the system.
- [ ] Function 2 – Users can register for an account for the first time.
- [ ] Function 3 – A seller can create a post to sell an item, which could be of any type, with the respective information of the item type collected.
- [ ] Function 4 – A buyer can browse previously posted items and select an item to view details like a description, price and condition.
- [ ] Function 5 - User profile screen created with View My Posts button and View Interested Posts button.
- [ ] Function 6 - View Posts screen and View Interested Posts screen created and functional.
- [ ] Function 7 - Prospective buyer queue created from clicking View Interested Buyers button on View My Posts.
- [ ] Function 8 - Accept / Deny functionality made with notifications from the sellers perspective.
- [ ] Function 9 - Status button created for sellers to place their item into either "Sold", "On Hold", or "Available". Default when posted is available.
- [ ] Function 10 - Posts subclasses implemented with more fields like dimensions, size, color, etc.
- [ ] Messaging and chat functions.
- [ ] Editting profile and posts capabilities.
- [ ] Interactive user interface.


## Not Implemented (Yet) ❌
These features were not completed within the current project scope but will likely be addressed in future milestones.

- Feature 1 - AI Capability! To be done soon. 


### Mapping to Milestones
The missing features were ones that we had created and developed in Milestones 1, 2 and 3 however they have not been implemented yet. This is because as we go forward, we wanted to make sure the main functionality like creating an account, posting items, and browsing items were implemented. These functions directly correlated to our use cases created in Milestone 2. Since then, we have also updated our UML diagrams to reflect the feedback found from finishing Milestone 2. We are keeping our logic and planning that we developed from Milestone 1, however, going forward there are several things the team will have to consider adjusting for changes. These include the chat functions as this might be difficult to implement. We also need to focus on ensuring different types of products will be categorized appropriately. Milestone 3 allowed us to start our implementation and see how our planning from Milestone 1 and Milestone 2 will be followed and updated as we continue implementing our project.
With Milestone 4, we focused on developing our integration and really creating the core of the application. This included adding more details to posts, log in authentication and registering, navigating to different available screens depending on the intended goals, and a way to accept or deny buyer requests. Along with more functionalities listed above, these things were vital in creating our application and directly reflected our use case diagram and activity diagram made back in Milestone 2. Milestone 4 was where we fully implemented most of the planning we did back in previous milestones. However, we still have some more things we would like to implement, specifically the chat and messaging function. This was reflected in our planning in previous milestones and although right now we can provide a way for the buyer and seller to contact eachother outside of the app, getting the chat and messaging functions working would be very ideal. 


## Technologies Used 🛠️
- Firebase (backend & database management)
- React Native (frontend & user interface logic)
- Expo Go (used for viewing the application on a mobile device)
- GitHub (version control)
- Visual Studio Code (IDE used for code development)
- Visual Paradigm (UML Diagram development and design architecture) 


## Project language percentage distribution from GitHub repository:
- [ ]  TypeScript: 55.2% 
- [ ]  Python: 20.4% 
- [ ]  JavaScript: 24.4%


## Installation & Configuration Instructions 🚀
- [ ] Install Node.js (LTS version) from https://nodejs.org.
- [ ] Install Git from https://git-scm.com.
- [ ] Clone the repository: git clone https://github.com/YourTeam/ExchangeForStudents.git
- [ ] Navigate to the frontend folder: cd ExchangeForStudents/frontend
- [ ] Install project dependencies: npm install
- [ ] Install required Expo packages: npx expo install expo-image-picker react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated
- [ ] Install additional libraries: npm install @react-navigation/native @react-navigation/bottom-tabs @react-native-picker/picker
- [ ] No Firebase setup is required — the app is already configured to use the team's existing Firebase project.
Run the app with: npx expo start * If issues refer to the Firebase config below this section * 
- [ ] Scan the QR code using the Expo Go app on your phone (make sure your phone and computer are on the same Wi-Fi network).

## Firebase Configuration
If you need to update or review the Firebase config for any reason, follow these steps:

- Go to the Firebase Console.
- Open the project used by this app.
- Navigate to Project Settings (gear icon in the sidebar).
- Scroll down to the "Your apps" section and locate the Firebase SDK configuration object (looks like apiKey, authDomain, etc.).
- If needed, update the config object in any file with screens that initializes Firebase
- Example Firebase config block (already present in the code):
<pre> ```ts const firebaseConfig = { apiKey: 'YOUR_API_KEY', authDomain: 'YOUR_AUTH_DOMAIN', projectId: 'YOUR_PROJECT_ID', storageBucket: 'YOUR_STORAGE_BUCKET', messagingSenderId: 'YOUR_MESSAGING_SENDER_ID', appId: 'YOUR_APP_ID', }; ``` </pre>
