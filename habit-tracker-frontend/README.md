# Habit Tracker Frontend

Frontend React application for the Tiny Habit Streak Tracker.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Features

- Add and delete habits
- Track daily habit completions
- View habits in two modes:
  - **Calendar View**: GitHub-style grid showing the entire month
  - **List View**: Simple checklist with today's habits
- Track streaks and completion rates
- Responsive design for mobile and desktop

## Tech Stack

- React
- CSS3
- Fetch API for backend communication

## Setup & Local Development

### Prerequisites

1. Make sure the backend API is running (see backend README)

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your backend API URL:
```
REACT_APP_API_URL=http://localhost:5000
```

### Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Deployment to Vercel (Recommended)

### Option 1: Vercel Dashboard (Easiest)

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and sign in with GitHub

3. Click "Add New" → "Project"

4. Import your frontend GitHub repository

5. Configure the project:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

6. Add environment variable:
   - Key: `REACT_APP_API_URL`
   - Value: Your backend URL (e.g., `https://your-backend.railway.app`)

7. Click "Deploy"

### Auto-deployment

Once connected to GitHub, Vercel will automatically deploy on every push to your main branch.

## Project Structure

```
src/
├── components/
│   ├── HabitForm.js          # Form to add new habits
│   ├── CalendarView.js       # GitHub-style calendar grid
│   ├── CalendarView.css
│   ├── ListView.js           # Simple checklist view
│   └── ListView.css
├── App.js                    # Main app component
├── App.css                   # Global styles
└── index.js                  # Entry point
```

## Usage

1. **Add a habit**: Enter a habit name and click "Add Habit"
2. **Toggle view**: Switch between Calendar and List view
3. **Mark completion**:
   - In Calendar view: Click on a day to toggle completion
   - In List view: Check/uncheck the checkbox
4. **Delete habit**: Click the "Delete" button or "×" icon
5. **View stats**: See your current streak and monthly completion rate

## Environment Variables

- `REACT_APP_API_URL`: Backend API base URL (required)
