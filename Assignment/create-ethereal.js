const nodemailer = require('nodemailer');

nodemailer.createTestAccount((err, account) => {
  if (err) {
    console.error('Failed to create a testing account. ' + err.message);
    return process.exit(1);
  }
  console.log('Ethereal account credentials for your .env:');
  console.log(`EMAIL_HOST=smtp.ethereal.email`);
  console.log(`EMAIL_PORT=587`);
  console.log(`EMAIL_USER=${account.user}`);
  console.log(`EMAIL_PASS=${account.pass}`);
  console.log('\nYou can now use these credentials in your .env file.');
}); 