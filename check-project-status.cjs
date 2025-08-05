require('dotenv').config();
const { google } = require('googleapis');

async function checkProjectStatus() {
  try {
    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const serviceusage = google.serviceusage({ version: 'v1', auth });

    console.log('🔍 Checking Google Cloud Project Status...');
    console.log('Service Account:', process.env.GOOGLE_CLIENT_EMAIL);

    // Get project ID from service account email
    const projectId = process.env.GOOGLE_CLIENT_EMAIL.split('@')[1].split('.')[0];
    console.log('Project ID:', projectId);

    // Check enabled APIs
    console.log('\n📋 Checking enabled APIs...');
    const apis = await serviceusage.services.list({
      parent: `projects/${projectId}`,
      filter: 'state:ENABLED'
    });

    const enabledApis = apis.data.services || [];
    console.log('✅ Enabled APIs:');
    enabledApis.forEach(api => {
      console.log(`  - ${api.config.name}`);
    });

    // Check if Drive and Sheets APIs are enabled
    const driveEnabled = enabledApis.some(api => api.config.name.includes('drive'));
    const sheetsEnabled = enabledApis.some(api => api.config.name.includes('sheets'));

    console.log('\n📊 API Status:');
    console.log(`  - Google Drive API: ${driveEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`  - Google Sheets API: ${sheetsEnabled ? '✅ Enabled' : '❌ Disabled'}`);

    if (!driveEnabled || !sheetsEnabled) {
      console.log('\n⚠️  Missing required APIs!');
      console.log('Please enable Google Drive API and Google Sheets API in your Google Cloud Console.');
      console.log('Go to: https://console.cloud.google.com/apis/library');
    }

    // Test basic authentication
    console.log('\n🔐 Testing authentication...');
    const drive = google.drive({ version: 'v3', auth });
    
    // Try to list files (this should work even with quota issues)
    const files = await drive.files.list({
      pageSize: 1,
      fields: 'files(id,name)'
    });
    
    console.log('✅ Authentication successful');
    console.log(`📁 Found ${files.data.files.length} files accessible`);

  } catch (error) {
    console.error('❌ Error checking project status:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

checkProjectStatus(); 