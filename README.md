# SUPPLY2U 🌍 FRONTEND
**Harnessing geolocation and real-time analytics to optimize farm-to-market operations.**

## Introduction
At Supply2U, we are revolutionizing how agricultural supply chains operate from farm to fork. Our innovative platform seamlessly integrates geolocation data of farms, real-time analytics, and consumer behavior insights to empower stakeholders at every step of the supply chain. By focusing on efficiency, sustainability, and profitability, we aim to transform how stakeholders connect and thrive in a dynamic market through a holistic, data-driven, and innovative approach.

## Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technologies-used)
- [Installation & Setup](#installation)

## Project Overview
Supply2U is an innovative platform designed to enhance the efficiency, sustainability, and profitability of agricultural supply chains. By leveraging geolocation data, real-time analytics, and consumer behavior insights, Supply2U empowers stakeholders from farmers to consumers, ensuring a seamless and effective supply chain.

## Features
- **Geolocation Data Integration:** Real-time tracking of farm locations and transportation routes.
- **Real-Time Analytics:** Get to understand supply chain performance and consumer behavior with detailed analytics. 
- **Consumer Insights:** Gain insights into consumer preferences and demand patterns for smarter decision-making.
- **Soil Information Tracking:** Store & retrieve soil health data.
- **Weather Tracking:** Get weather forecasts for farm locations.

## Technology Stack
- **Frontend:** React, HTML, CSS, JavaScript
- **State Management:** Redux Toolkit
- **Mapping and Geolocation:** Leaflet, React Leaflet
- **HTTP Requests:** Axios
- **Animations:** Lottie Web Animations
- **UI Components:** React Icons, React Toastify
- **Routing:** React Router DOM

## Installation & Setup
Before you begin, please ensure that the following prerequisites are installed:

- **Node.js (version 16.x or higher)**
- **npm or yarn**
- **Git**

Once installed, you should be all set to proceed with the following:

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/supply2u.git
   cd supply2u

2. **Install dependencies:**

   ```sh
    npm install

3. **Set up environment variables:**  
   - Create a `.env` file in the root directory of the frontend project.  
   - Add the necessary environment variables such as:  
     ```env
     REACT_APP_API_BASE_URL=your-backend-api-url
     REACT_APP_MAP_API_KEY=your-mapping-service-api-key
     REACT_APP_AUTH_CLIENT_ID=your-auth-client-id
     ```  
   - **Note:** The backend database credentials and other sensitive configurations should be managed in the backend project, not in this frontend repository.  

4. **Start the development server:**
   ```sh
    npm start

5. **Usage**
    ```sh
    Open your browser and navigate to http://localhost:3000 to access the platform.