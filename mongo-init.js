db = db.getSiblingDB('seenotify');

// Create collections
db.createCollection('users');
db.createCollection('notifications');
db.createCollection('spam_reports');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.notifications.createIndex({ "userId": 1, "createdAt": -1 });
db.spam_reports.createIndex({ "notificationId": 1 });

print('MongoDB initialization completed'); 