require('dotenv').config();
const { google } = require('googleapis');

async function createMinimalTemplate() {
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

    console.log('Creating minimal template...');

    // Create a new spreadsheet
    const createResponse = await drive.files.create({
      requestBody: {
        name: 'Minimal Student Data Template',
        mimeType: 'application/vnd.google-apps.spreadsheet',
      },
    });

    const spreadsheetId = createResponse.data.id;
    console.log('✅ Created new spreadsheet:', spreadsheetId);

    // Add basic data to StudentData sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'StudentData!A1:E1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Sr.no', 'Roll No', 'Student Name', 'Email', 'Department']]
      }
    });

    // Add some sample data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'StudentData!A2:E4',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['1', '21EC01', 'Sample Student 1', 'student1@example.com', 'ECE'],
          ['2', '21EC02', 'Sample Student 2', 'student2@example.com', 'ECE'],
          ['3', '21EC03', 'Sample Student 3', 'student3@example.com', 'ECE']
        ]
      }
    });

    // Create Data sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Data',
                gridProperties: {
                  rowCount: 10,
                  columnCount: 5
                }
              }
            }
          }
        ]
      }
    });

    // Add headers to Data sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Data!A1:C1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Data Owner', 'Date', 'Notes']]
      }
    });

    console.log('✅ Minimal template created successfully!');
    console.log('📋 Template URL:', `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
    console.log('📋 Template ID:', spreadsheetId);

    // Test copying this minimal template
    console.log('\n🧪 Testing copy of minimal template...');
    const timestamp = new Date().toISOString().split('T')[0];
    const copyResponse = await drive.files.copy({
      requestBody: {
        name: `Test Copy - ${timestamp}`
      },
      fileId: spreadsheetId
    });
    console.log('✅ Copy test successful:', copyResponse.data.id);

    // Clean up test copy
    await drive.files.delete({
      fileId: copyResponse.data.id
    });
    console.log('✅ Test copy cleaned up');

    console.log('\n🎉 Minimal template works! Update your .env file with:');
    console.log(`TEMPLATE_SHEET_ID=${spreadsheetId}`);

  } catch (error) {
    console.error('❌ Error creating minimal template:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

createMinimalTemplate(); 