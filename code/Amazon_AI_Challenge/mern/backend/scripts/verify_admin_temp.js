
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); // Note: Models/User vs models/User - check casing. Previous scripts used ../Models/User but list_dir showed 'models' (lowercase). checking file 36 it used ../Models/User. Windows is case insensitive but good to match.
// directory list showed "models" (lowercase). file 36 (listUsers.js) used "../Models/User". 
// file 31 (makeAdmin.js) used "../Models/User".
// list_dir output from Step 6: "models", isDir:true.
// I will use '../models/User' to be safe with standard conventions, or match existing scripts if they work.
// Since existing scripts use Models (cap), and they work, I will use Models (cap) or just rely on Windows case insensitivity.
// But wait, the file system list said "models". I'll use "models".

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'abhiram050904@gmail.com' });
        if (user && user.role === 'admin') {
            console.log('VERIFICATION_SUCCESS');
        } else {
            console.log('VERIFICATION_FAILED: ' + (user ? user.role : 'User not found'));
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
