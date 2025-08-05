import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Google Sheets API setup
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
});

const drive = google.drive({ version: 'v3', auth });
const sheets = google.sheets({ version: 'v4', auth });

// API Routes
app.post('/api/create-sheet', async (req, res) => {
  try {
    const templateId = process.env.TEMPLATE_SHEET_ID;
    
    if (!templateId) {
      return res.status(500).json({ 
        error: 'Template Sheet ID not configured. Please set TEMPLATE_SHEET_ID in your environment variables.' 
      });
    }

    // Generate timestamp for unique naming
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const newSheetName = `Student Data - ${timestamp}`;

    // Copy the template spreadsheet
    const copyResponse = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: newSheetName,
      },
    });

    const newSheetId = copyResponse.data.id;
    const newSheetUrl = `https://docs.google.com/spreadsheets/d/${newSheetId}/edit`;

    console.log(`Created new sheet: ${newSheetName} with ID: ${newSheetId}`);

    res.json({ 
      spreadsheetUrl: newSheetUrl,
      spreadsheetId: newSheetId,
      spreadsheetName: newSheetName
    });

  } catch (error) {
    console.error('Error creating sheet:', error);
    
    let errorMessage = 'Failed to create new sheet';
    
    if (error.code === 403) {
      errorMessage = 'Access denied. Please check your Google service account permissions.';
    } else if (error.code === 404) {
      errorMessage = 'Template sheet not found. Please check your TEMPLATE_SHEET_ID.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Create sheet endpoint: http://localhost:${PORT}/api/create-sheet`);
}); 