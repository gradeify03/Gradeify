require('dotenv').config();
const { google } = require('googleapis');

async function testSheetAccess() {
  try {
    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
    });

    const drive = google.drive({ version: 'v3', auth });
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('Testing service account access...');
    console.log('Template Sheet ID:', process.env.TEMPLATE_SHEET_ID);
    console.log('Service Account Email:', process.env.GOOGLE_CLIENT_EMAIL);

    // Test 1: Try to get file metadata
    console.log('\n1. Testing file metadata access...');
    const fileMetadata = await drive.files.get({
      fileId: process.env.TEMPLATE_SHEET_ID,
      fields: 'id,name,size,mimeType'
    });
    console.log('✅ File metadata access successful:', fileMetadata.data);

    // Test 2: Try to read sheet data
    console.log('\n2. Testing sheet data access...');
    const sheetData = await sheets.spreadsheets.get({
      spreadsheetId: process.env.TEMPLATE_SHEET_ID,
      ranges: ['StudentData!A1:E5']
    });
    console.log('✅ Sheet data access successful');

    // Test 3: Try to copy the file
    console.log('\n3. Testing file copy...');
    const timestamp = new Date().toISOString().split('T')[0];
    const copyResponse = await drive.files.copy({
      requestBody: {
        name: `Test Copy - ${timestamp}`
      },
      fileId: process.env.TEMPLATE_SHEET_ID
    });
    console.log('✅ File copy successful:', copyResponse.data.id);

    // Clean up: Delete the test copy
    await drive.files.delete({
      fileId: copyResponse.data.id
    });
    console.log('✅ Test copy cleaned up');

    console.log('\n🎉 All tests passed! The service account has proper access.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testSheetAccess(); 