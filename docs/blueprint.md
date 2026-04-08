# **App Name**: Tech Bazaar

## Core Features:

- User Authentication: Email/password signup and login using Firebase Auth. Basic user data (name, email) is stored upon registration.
- User Profiles: Each user has a profile displaying their name, optional profile picture, contact info (phone/WhatsApp), and a list of all products they have posted.
- Product Listing Creation: Users can create new product listings by providing a title, description, price, category, location, and uploading images to Firebase Storage. All listing details are saved to Firestore.
- Listings Feed: The homepage displays all available product listings, sorted by newest. Includes basic search by title keyword and filtering by category.
- Listing Detail Page: A dedicated page for each listing showing all product details, seller information, and a button to contact the seller via WhatsApp link or phone number.
- My Listings Management: Logged-in users can view all their active listings, with options to edit or delete their own posts.

## Style Guidelines:

- Primary color: A cool and trustworthy blue (#2290CD) to symbolize technology and reliability.
- Background color: A very light, desaturated blue (#EBF5FA) providing a clean and open feel, appropriate for a light color scheme.
- Accent color: A vibrant cyan-green (#14CCC0) to draw attention to interactive elements and calls to action, contrasting yet harmonious with the primary blue.
- Headline and body font: 'Inter', a neutral, modern sans-serif font, chosen for its excellent readability and contemporary feel, suitable for all textual content.
- Use minimalist, outline-style icons to maintain a clean and uncluttered user interface, focusing on clarity and functionality.
- Implement a card-based layout for product listings on the main feed to provide clear visual separation and easy scannability of products.
- Subtle hover effects on product cards and buttons, offering gentle feedback without distracting from the main content.