import { storage } from "./storage";
import { hashPassword } from "./auth";

export async function seedAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const hashedPassword = await hashPassword("admin123");
    const adminUser = await storage.createUser({
      username: "admin",
      email: "admin@planbarometro.com",
      password: hashedPassword,
      role: "admin",
      firstName: "Sistema",
      lastName: "Administrador",
    });

    console.log("Admin user created successfully:", adminUser.username);
    console.log("Login credentials: admin / admin123");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}