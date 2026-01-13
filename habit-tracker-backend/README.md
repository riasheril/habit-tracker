# Habit Tracker Backend

Backend API for the Tiny Habit Streak Tracker application.

## Tech Stack

- Node.js
- Express
- PostgreSQL
- CORS

## Setup

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your PostgreSQL connection string:
```
DATABASE_URL=postgresql://username:password@localhost:5432/habit_tracker
PORT=5000
NODE_ENV=development
```

4. Set up the database:
```bash
psql -U your_username -d habit_tracker -f schema.sql
```

Or create the database and run the schema:
```bash
createdb habit_tracker
psql -U your_username -d habit_tracker -f schema.sql
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Habits

- `GET /api/habits` - Get all habits
- `POST /api/habits` - Create a new habit
  - Body: `{ "name": "Habit name" }`
- `DELETE /api/habits/:id` - Delete a habit

### Habit Completions

- `GET /api/habits/:id/completions` - Get completions for a habit
  - Query params: `start_date`, `end_date` (optional)
- `POST /api/habits/:id/completions` - Toggle habit completion
  - Body: `{ "date": "YYYY-MM-DD" }`

### Health Check

- `GET /health` - Check API status
- `GET /` - Welcome message

## Deployment to Railway

1. Create a new project on [Railway](https://railway.app)

2. Add a PostgreSQL database:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will automatically provide a `DATABASE_URL`

3. Deploy the backend:
   - Click "New" → "GitHub Repo"
   - Select your backend repository
   - Railway will auto-detect Node.js and deploy

4. Set environment variables in Railway:
   - `NODE_ENV=production`
   - `DATABASE_URL` (automatically set by Railway)
   - `PORT` (automatically set by Railway)

5. Run the database schema:
   - In Railway, open the PostgreSQL database
   - Go to "Query" tab and paste the contents of `schema.sql`

## Deployment to Render

1. Create a new Web Service on [Render](https://render.com)

2. Connect your GitHub repository

3. Configure the service:
   - Name: `habit-tracker-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. Add a PostgreSQL database:
   - Create a new PostgreSQL database in Render
   - Copy the Internal Database URL

5. Add environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=<your_postgres_url>`

6. Deploy and run the schema:
   - Connect to your database via the Render dashboard
   - Run the SQL from `schema.sql`

## Database Schema

### habits
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(255))
- `created_at` (TIMESTAMP)

### habit_completions
- `id` (SERIAL PRIMARY KEY)
- `habit_id` (INTEGER, FOREIGN KEY)
- `completion_date` (DATE)
- `completed` (BOOLEAN)
- `created_at` (TIMESTAMP)
