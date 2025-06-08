# MotivAI - Personalized Celebrity Audio Messages

MotivAI is a web-based platform designed to provide personalized audio messages in the voice of a user's favorite celebrity. The platform combines AI technologies with emotional engagement to inspire, motivate, and entertain users.

## How It Works

MotivAI uses advanced AI voice synthesis technology to generate personalized audio messages that mimic the voice of a selected celebrity. Users can input their desired message, and the platform processes this input to create a realistic audio clip in the celebrity's voice. The system leverages machine learning models trained on celebrity voice data to ensure high-quality and natural-sounding results. These machine learning models are accessed indirectly via external AI voice synthesis services, such as the ElevenLabs API, rather than being implemented directly within the project codebase.

## Project Structure

This project is a Next.js application with React components that uses client-side storage (localStorage) for data persistence.

## Getting Started

### Prerequisites

- Node.js (version 16 or higher recommended)
- npm (comes with Node.js) or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HoussamAlrifaii/MotivAI.git
   cd MotivAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   or if you prefer yarn:
   ```bash
   yarn install
   ```

### Running the Application

To start the development server:

```bash
npm run dev
```
or
```bash
yarn dev
```

The application will be available at `http://localhost:3000`.

### Building for Production

To build the application for production:

```bash
npm run build
```
or
```bash
yarn build
```

To start the production server:

```bash
npm start
```
or
```bash
yarn start
```

## Additional Information

- The application uses localStorage for client-side data persistence.
- The project includes an admin panel accessible via `/admin/login`.
- For any issues or contributions, please open an issue or pull request on the GitHub repository.
