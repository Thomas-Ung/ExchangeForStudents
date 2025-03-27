# ExchangeForStudents


## Introduction & Team Responsibilities
Exchange4Students is a campus-exclusive marketplace designed to simplify buying and selling among students. Whether it’s furniture, textbooks, electronics, or other essentials, our app provides a streamlined platform for students to connect and exchange items with ease.


### Team Members & Contributions
- **[Thomas Ung]** –  Mainly backend developer. Worked with Firebase to connect the front end. Set up a Firebase project and figured out how to store data and database management.
- **[Spurthi Setty]** – Mainly frontend developer. Developed main frontend logic for users to view different screens and navigate through the app from the users perspective.
- **[Lakshya Vegiraju]** – Mainly design architecture. Worked on updating UML diagrams and working with other team members to adjust our new software system architecture.
- **[Gianna Cerbone]** – Mainly team floater. Helped on frontend development when needed and looked into how the frontend and backend need to interact to be successful. 


## Implemented Functions ✅
- [ ] Function 1 – Users can log into the system.
- [ ] Function 2 – Users can register for an account for the first time.
- [ ] Function 3 – A seller can create a post to sell an item, which could be of any type, with the respective information of the item type collected.
- [ ] Function 4 – A buyer can browse previously posted items and select an item to view details like a description, price and condition.


## Not Implemented (Yet) ❌
These features were not completed within the current project scope but will likely be addressed in future milestones.


- Feature 1 – User profile screen not created. We did not yet create a screen for users to view/edit their account profile.
- Feature 2 – Messaging screen / capabilities. Did not yet implement a way for the buyers to connect with sellers through direct chats.
- Feature 3 – Prospective buyer queue. Did not yet implement a way for buyers to enter a queue when interested in an item so that sellers can contact them about the item.
- Feature 4 – Interested button for buyers to select when wanting an item so that other users can see this item may be on hold and could potentially be sold soon.
- Feature 5 – Sold button for sellers to place a sold item into sold when they sell said item to a buyer.
- Feature 6 – Comments section on posts for prospective buyers to ask sellers questions about the product before engaging in a conversation to buy it. 


### Mapping to Milestones
The missing features were ones that we had created and developed in Milestones 1 & 2 however they have not been implemented yet. This is because as we go forward, we wanted to make sure the main functionality like creating an account, posting items, and browsing items were implemented. These functions directly correlated to our use cases created in Milestone 2. Since then, we have also updated our UML diagrams to reflect the feedback found from finishing Milestone 2. We are keeping our logic and planning that we developed from Milestone 1, however, going forward there are several things the team will have to consider adjusting for changes. These include the chat functions as this might be difficult to implement. We also need to focus on ensuring different types of products will be categorized appropriately. Milestone 3 allowed us to start our implementation and see how our planning from Milestone 1 and Milestone 2 will be followed and updated as we continue implementing our project.


## Technologies Used 🛠️
- Firebase (backend & database management)
- React Native (frontend & user interface logic)
- Expo Go (used for viewing the application on a mobile device)
- GitHub (version control)
- Visual Studio Code (IDE used for code development)
- Visual Paradigm (UML Diagram development and design architecture) 


## Project language percentage distribution from GitHub repository:
- [ ]  TypeScript: 63.7% 
- [ ]  Python: 29.2% 
- [ ]  JavaScript: 7.1%


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
