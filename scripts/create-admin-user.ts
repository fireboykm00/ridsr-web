import mongoose from "mongoose";
import { User } from "../src/lib/models";
import { hashPassword } from "@/lib/utils/auth";
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://dbDeveloper:mongodbOlivier10@atlascluster.vexzvpl.mongodb.net/ridsr?retryWrites=true&w=majority";

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      $or: [{ email: "admin@ridsr.rw" }, { role: "admin" }],
    });

    if (existingAdmin) {
      console.log("Admin user already exists. Updating...");

      // Hash the password
      const password = "Admin@123456";

      // Update the existing admin user
      const updatedAdmin = await User.findOneAndUpdate(
        { email: "admin@ridsr.rw" },
        {
          password: await hashPassword(password),
        },
        { new: true, upsert: false },
      );

      console.log("✅ Admin user updated successfully");
      console.log("Email: admin@ridsr.rw");
      console.log("Default password: Admin@123456");
      await mongoose.disconnect();
      return;
    }

    // Hash the password
    const password = "Admin@123456";

    // Create the admin user
    const adminUser = new User({
      email: "admin@ridsr.rw",
      password: await hashPassword(password),
      name: "System Administrator",
      role: "admin", // Use lowercase as defined in USER_ROLES
      isActive: true,
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully");
    console.log("Email: admin@ridsr.rw");
    console.log("Password: Admin@123456");

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

// Run the function
createAdminUser();
