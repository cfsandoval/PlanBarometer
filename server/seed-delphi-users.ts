import bcrypt from 'bcrypt';
import { db } from './db';
import { users, groups, groupMembers, delphiStudies } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export async function seedDelphiUsers() {
  console.log('Seeding Delphi test users...');
  
  try {
    // Create test users
    const testUsers = [
      {
        username: 'experto1',
        email: 'experto1@planbarometro.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'María',
        lastName: 'González',
        role: 'user'
      },
      {
        username: 'experto2',
        email: 'experto2@planbarometro.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        role: 'user'
      },
      {
        username: 'experto3',
        email: 'experto3@planbarometro.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Ana',
        lastName: 'Martínez',
        role: 'user'
      }
    ];

    // Insert users if they don't exist
    const createdUsers = [];
    for (const userData of testUsers) {
      const [existingUser] = await db.select().from(users).where(eq(users.email, userData.email));
      
      if (!existingUser) {
        const [newUser] = await db.insert(users).values(userData).returning();
        createdUsers.push(newUser);
        console.log(`Created user: ${userData.username}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`User already exists: ${userData.username}`);
      }
    }

    // Get the main group (assuming it exists from previous setup)
    const [mainGroup] = await db.select().from(groups).limit(1);
    
    if (mainGroup) {
      // Add users to the main group
      for (const user of createdUsers) {
        const [existingMember] = await db.select()
          .from(groupMembers)
          .where(and(
            eq(groupMembers.groupId, mainGroup.id),
            eq(groupMembers.userId, user.id)
          ));

        if (!existingMember) {
          await db.insert(groupMembers).values({
            groupId: mainGroup.id,
            userId: user.id
          });
          console.log(`Added ${user.username} to group ${mainGroup.name}`);
        }
      }

      // Create a test study for Delphi evaluation
      const [existingStudy] = await db.select().from(delphiStudies).where(eq(delphiStudies.groupId, mainGroup.id)).limit(1);
      
      if (!existingStudy) {
        const [newStudy] = await db.insert(delphiStudies).values({
          title: 'Evaluación de Planificación Estratégica',
          description: 'Estudio Delphi para evaluar capacidades de planificación usando metodología presente/ausente',
          groupId: mainGroup.id,
          createdBy: 1, // Admin user
          status: 'active',
          round: 1,
          isAnonymous: true,
          significanceThreshold: '3.0'
        }).returning();
        console.log(`Created test study: ${newStudy.title}`);
      } else {
        console.log('Test study already exists');
      }
    }

    console.log('Successfully seeded Delphi test users');
    return createdUsers;
  } catch (error) {
    console.error('Error seeding Delphi users:', error);
    throw error;
  }
}