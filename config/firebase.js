const admin = require('firebase-admin');
const serviceAccount = require('./taskflow-eefe0-firebase-adminsdk-fbsvc-345984db87.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;