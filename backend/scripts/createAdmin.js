const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../model/admin');
const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '../.env')
});

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URL);

        console.log('Connected to mongo database');

        const existingAdmin = await Admin.findOne({ email: 'admin@medicare.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 12);
        const admin = new Admin({
            name: "System Administrator",
            email: 'admin@medicare.com',
            password: hashedPassword,
            role: 'super-admin',
            isActive: true,
            permissions: {
                userManagement: true,
                doctorManagement: true,
                paymentManagement: true,
                analytics: true,
            },
        });

        await admin.save();
        console.log('Admin user created successfully');
        console.log('Email:', admin.email);

    } catch (error) {
        console.error('Error creating admin user', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdmin();