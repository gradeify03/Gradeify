# Backend Setup for Google Sheets Integration

This guide will help you set up the backend server to handle Google Sheets API functionality.

## Prerequisites

1. **Google Cloud Project** with Google Drive API and Google Sheets API enabled
2. **Service Account** with appropriate permissions
3. **Template Google Sheet** with two tabs: `StudentData` and `Data`

## Step 1: Google Cloud Setup

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Drive API
   - Google Sheets API

### 1.2 Create a Service Account
1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Give it a name like "gradeify-sheets-service"
4. Grant the following roles:
   - Drive API > Drive File Stream
   - Sheets API > Sheets Editor
5. Create and download the JSON key file

### 1.3 Create Template Sheet
1. Create a Google Sheet with two tabs:
   - `StudentData` (for student information)
   - `Data` (for uploaded data)
2. Share the sheet with your service account email (with Editor permissions)
3. Copy the Sheet ID from the URL

## Step 2: Environment Variables

Create a `.env` file in the root directory:

```env
# Google Service Account Credentials
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"

# Template Google Sheet ID (the sheet that will be copied)
TEMPLATE_SHEET_ID=your-template-sheet-id-here

# Server Configuration
PORT=3001
NODE_ENV=development
```

## Step 3: Install Dependencies

```bash
npm install express cors dotenv googleapis
npm install --save-dev @types/express @types/cors
```

## Step 4: Start the Backend Server

```bash
npm run server
```

The server will start on `http://localhost:3001`

## Step 5: Test the API

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Create New Sheet
```bash
curl -X POST http://localhost:3001/api/create-sheet
```

## API Endpoints

### POST /api/create-sheet
Creates a new Google Sheet by copying the template.

**Response:**
```json
{
  "spreadsheetUrl": "https://docs.google.com/spreadsheets/d/...",
  "spreadsheetId": "sheet-id-here",
  "spreadsheetName": "Student Data - 2024-01-15"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Frontend Integration

The frontend is already configured to call the backend API. The "Create New Sheet" button will:

1. Call the `/api/create-sheet` endpoint
2. Update the embedded Google Sheet with the new URL
3. Show success/error messages to the user

## Troubleshooting

### Common Issues:

1. **403 Forbidden**: Check service account permissions
2. **404 Not Found**: Verify TEMPLATE_SHEET_ID is correct
3. **CORS Issues**: The server includes CORS headers for localhost:8080
4. **Private Key Format**: Make sure the private key includes `\n` characters

### Debug Mode:
Set `NODE_ENV=development` to see detailed error messages.

## Security Notes

- Never commit your `.env` file to version control
- Use environment variables in production
- Consider using Google Cloud Secret Manager for production deployments 