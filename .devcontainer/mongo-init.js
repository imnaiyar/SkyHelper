db = db.getSiblingDB("skyhelper");

// Create development user
db.createUser({
  user: "devuser",
  pwd: "devpassword",
  roles: [
    {
      role: "readWrite",
      db: "skyhelper",
    },
  ],
});

db.createCollection("users");
db.createCollection("guilds");
db.createCollection("reminders");

print("MongoDB development database initialized successfully!");
