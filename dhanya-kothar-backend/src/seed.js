const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Material = require('./models/Material');
const Setting = require('./models/Setting');
const { DEFAULT_MATERIALS } = require('./config/constants');

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to: ${mongoose.connection.host}/${mongoose.connection.name}`);

  const username = (process.env.SEED_ADMIN_USERNAME || 'admin').toLowerCase();
  if (!(await User.findOne({ username }))) {
    await User.create({
      name: process.env.SEED_ADMIN_NAME || 'Administrator',
      username,
      password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345',
      role: 'admin',
    });
    console.log(`Admin created -> username: ${username}`);
  } else console.log('Admin already exists');

  for (const [name, unit] of DEFAULT_MATERIALS) {
    await Material.updateOne({ name }, { $setOnInsert: { name, unit } }, { upsert: true });
  }
  console.log(`Materials ensured: ${DEFAULT_MATERIALS.length}`);

  await Setting.get();
  console.log('Default settings ensured');

  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});