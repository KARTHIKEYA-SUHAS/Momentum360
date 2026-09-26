import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';

import { Organization } from '../../modules/organizations/entities/organization.entity.js';
import { User, UserRole } from '../../modules/users/entities/user.entity.js';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Organization, User],
  });

  await dataSource.initialize();

  try {
    const organizationRepository = dataSource.getRepository(Organization);

    const userRepository = dataSource.getRepository(User);

    const organizationName = process.env.INITIAL_ORG_NAME;
    const organizationCode = process.env.INITIAL_ORG_CODE;
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (
      !organizationName ||
      !organizationCode ||
      !adminEmail ||
      !adminPassword
    ) {
      throw new Error(
        'Initial organization/admin environment variables are missing.',
      );
    }

    let organization = await organizationRepository.findOne({
      where: { code: organizationCode },
    });

    if (!organization) {
      organization = organizationRepository.create({
        name: organizationName,
        code: organizationCode,
        isActive: true,
      });

      organization = await organizationRepository.save(organization);

      console.log(`Organization created: ${organization.code}`);
    } else {
      console.log(`Organization already exists: ${organization.code}`);
    }

    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);

      const admin = userRepository.create({
        organizationId: organization.id,
        email: adminEmail,
        passwordHash,
        role: UserRole.ADMIN,
        isActive: true,
      });

      await userRepository.save(admin);

      console.log(`Admin user created: ${admin.email}`);
    } else {
      console.log(`Admin user already exists: ${existingAdmin.email}`);
    }
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Initial seed failed:', error);
  process.exit(1);
});
