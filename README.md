# Meteor NASA - Meteor Madness Challenge

This project was developed in less than 2 days for the "Meteor Madness" challenge of the NASA Space Apps Challenge 2025, aiming to create innovative solutions related to meteors.

Our team developed an interactive web application that simulates asteroid impacts on Earth using real data from NASA’s Near-Earth Object (NEO) API. The system enables users to visualize asteroids orbiting in 3D and analyze collision consequences based on physical parameters such as diameter, velocity, and impact angle. The simulation integrates Three.js for realistic 3D rendering and custom algorithms for calculating impact energy and damage. In addition, an intelligent sidebar provides detailed impact analysis and a mitigation assistant that offers context-aware suggestions. This project aims to enhance scientific education and public awareness about space hazards by combining data science, visualization, and interactivity in an engaging and accessible experience.

## Project Demonstration
https://drive.google.com/file/d/18ep-iajogEgcpjiJIN2Cl_dYBx1gOMXe/view

## Project
https://meteormitigate.earth/en

## Project Details
### Project Title: Real-Time Asteroid Impact Simulation on Earth Using Three.js and Physics Engines

### Overview
Our project is an interactive 3D simulation that visualizes the collision of an asteroid with Earth in real time. The goal is to provide an engaging and educational experience that demonstrates the physical dynamics of high-energy impacts, including deformation, energy release, and shockwave propagation across the planet’s surface.

### How It Works
The simulation is built using Three.js integrated with React through @react-three/fiber. An asteroid object travels toward Earth using realistic physics provided by @react-three/cannon. When the collision occurs, the impact point is calculated, the Earth’s surface deforms dynamically, and an expanding energy wave visualizes the shock effect. The camera reacts with subtle shaking to enhance realism. The environment includes realistic planetary textures, atmospheric lighting, and space backgrounds with stars for immersion.

### Data Integration and User Interaction
The simulation is powered by NASA’s Near-Earth Object (NEO) API, which provides real-time data on asteroids and comets that approach Earth. The API allows querying NEO datasets within a selectable date range of up to seven days, returning detailed information such as asteroid name, estimated diameter, velocity, approach distance, orbital parameters, and potential hazard classification.

Within our system, users begin by selecting a date range to fetch asteroid data directly from the NASA API. The results are displayed in an interactive list, showing key attributes like size, velocity, and hazard level. Upon selecting a specific asteroid, the application retrieves additional details from the NEO Lookup endpoint, including its trajectory and closest-approach parameters.

Once an asteroid is chosen, the 3D visualization initializes a preview of the simulated impact, where the object’s motion, velocity, and collision point are rendered dynamically using the physical parameters provided by NASA. Users can adjust impact variables such as angle, density, and surface type, observing how these changes influence the outcome — crater size, shockwave intensity, and total energy release.

The experience is enhanced by an integrated AI Assistant, developed using ChromaDB and OpenAI Embeddings, which acts as a contextual guide throughout the simulation. This agent can explain results in natural language, provide comparisons to real-world events, or suggest mitigation strategies based on the asteroid’s characteristics (e.g., deflection methods, early detection strategies, or evacuation scenarios). By combining open scientific data with conversational intelligence, the system transforms raw NASA datasets into an interactive, accessible, and educational experience.

### Benefits and Impact
This project makes complex astronomical and physical concepts more tangible and accessible. It can be used as a learning tool for students, educators, and enthusiasts to explore real-time physical interactions in space environments. Beyond education, it showcases the potential of browser-based 3D visualization for scientific applications.

---

## Technologies Used

The project is built with the following technologies and libraries:

*   **Language**: TypeScript
*   **Framework**: Next.js (React 19)
*   **3D Libraries**: Three.js, @react-three/fiber, @react-three/drei
*   **Styling**: TailwindCSS, Framer Motion
*   **Backend / Build**: Node.js
*   **State Management**: Zustand
*   **UI/UX**: Shadcn UI, Radix UI
*   **Internationalization**: next-intl
*   **Authentication**: NextAuth.js
*   **Vector Database**: ChromaDB
*   **AI APIs**: OpenAI (for embeddings), DeepSeek (for chat)
*   **Assets**: Earth textures provided by NASA (color, normal, and specular maps)

## Environment Variables Configuration

For the correct functioning of the project, the following environment variables must be configured. It is recommended to use a `.env.local` file for local development and direct configuration in the Vercel dashboard for production.

*   `NEXTAUTH_URL`: The base URL of your application (e.g., `http://localhost:3333` for development, `https://www.meteormitigate.earth` for production).
*   `NEXT_PUBLIC_API_URL`: The base URL of your internal API (usually the same as `NEXTAUTH_URL`).
*   `NASA_API_KEY`: Your NASA API key to access NEO data.
*   `INTERNAL_API_KEY`: An internal secret key for authentication between your project's proxy and internal API.
*   `GOOGLE_CLIENT_ID`: The Google OAuth 2.0 client ID.
*   `GOOGLE_CLIENT_SECRET`: The Google OAuth 2.0 client secret.
*   `NEXTAUTH_SECRET`: A random, complex string for signing NextAuth.js session tokens.

## How to Run the Project Locally

1.  Clone the repository.
2.  Install dependencies with `pnpm install` (or `npm install`/`yarn install`).
3.  Create a `.env.local` file in the project root and configure the necessary environment variables.
4.  Run the development server with `pnpm dev`.
5.  Access `http://localhost:3333` in your browser.