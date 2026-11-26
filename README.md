# Guniva — Full-Stack Stay & Property Rental Platform

Guniva is a full-stack web application for discovering, listing, reviewing, and booking curated stays. Built with an MVC architecture using Node.js, Express, MongoDB, and EJS.

## Key Features
- **Authentication & Authorization:** User signup, login, and logout using Passport.js (`passport-local-mongoose`), with route protection and ownership checks for editing/deleting listings and reviews.
- **Property Listings (CRUD):** Create, view, edit, and delete listings with server-side Joi validation and responsive Bootstrap 5 UI.
- **Cloud Image Uploads:** Integrated Multer and Cloudinary for property image storage and optimized previews.
- **Interactive Maps & Geocoding:** Automatic forward geocoding via Mapbox SDK and interactive location maps using Mapbox GL JS.
- **Search, Category Filters & GST Toggle:** Filter stays by category or keyword (`title`, `location`, `country`) and toggle 18% GST pricing on listing cards.
- **Reviews & Ratings:** 5-star review system with Starability UI and author-only review deletion.
- **Razorpay Payment Integration:** Server-side price calculation (including 18% GST), Razorpay order creation, and HMAC-SHA256 signature verification stored in MongoDB.
- **Dark & Light Mode:** Persistent theme switcher using CSS custom properties and `localStorage`.

## Tech Stack
- **Backend:** Node.js, Express.js, Mongoose, Passport.js, Joi, Express-Session, Connect-Flash
- **Frontend:** EJS, EJS-Mate, Bootstrap 5, HTML5, CSS3, Vanilla JavaScript
- **Database:** MongoDB
- **Services:** Cloudinary, Mapbox, Razorpay

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Guniva
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**  
   Create a `.env` file in the root directory:
   ```env
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   MAP_TOKEN=your_mapbox_access_token
   RAZORPAY_KEY_ID=your_razorpay_test_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
   MONGO_URL=mongodb://127.0.0.1:27017/Guniva
   SESSION_SECRET=your_session_secret
   ```

4. **Run the application**
   ```bash
   node app.js
   ```
   Open `http://localhost:8080` in your browser.
