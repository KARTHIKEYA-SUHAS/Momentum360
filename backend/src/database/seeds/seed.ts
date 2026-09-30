import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

const seedDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

async function seed() {
  await seedDataSource.initialize();

  console.log('🌱 Database seed started...');

  const organizationRepository = seedDataSource.getRepository('Organization');

  const organizationCode = process.env.INITIAL_ORG_CODE ?? 'MOM360';

  let organization = await organizationRepository.findOne({
    where: {
      code: organizationCode,
    },
  });

  if (!organization) {
    organization = organizationRepository.create({
      name: process.env.INITIAL_ORG_NAME ?? 'Momentum360',
      code: organizationCode,
      isActive: true,
    });

    await organizationRepository.save(organization);

    console.log(`✅ Organization created: ${organization.name}`);
  } else {
    console.log(`ℹ️ Organization already exists: ${organization.name}`);
  }

  const userRepository = seedDataSource.getRepository('User');

  const adminEmail =
    process.env.INITIAL_ADMIN_EMAIL ?? 'admin@momentum360.local';

  let admin = await userRepository.findOne({
    where: {
      email: adminEmail,
    },
  });

  if (!admin) {
    const passwordHash = await bcrypt.hash(
      process.env.INITIAL_ADMIN_PASSWORD ?? 'ChangeThisPassword123!',
      12,
    );

    admin = userRepository.create({
      organizationId: organization.id,
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    });

    await userRepository.save(admin);

    console.log(`✅ Admin user created: ${admin.email}`);
  } else {
    console.log(`ℹ️ Admin user already exists: ${admin.email}`);
  }

  const departmentRepository = seedDataSource.getRepository('Department');

  const departmentCode = 'ENG';

  let department = await departmentRepository.findOne({
    where: {
      organizationId: organization.id,
      code: departmentCode,
    },
  });

  if (!department) {
    department = departmentRepository.create({
      organizationId: organization.id,
      name: 'Engineering & Technology',
      code: departmentCode,
      description: 'Engineering and technology department',
      isActive: true,
    });

    await departmentRepository.save(department);

    console.log(`✅ Department created: ${department.name}`);
  } else {
    console.log(`ℹ️ Department already exists: ${department.name}`);
  }

  const managerEmail = 'john.doe@momentum360.local';

  let managerUser = await userRepository.findOne({
    where: {
      email: managerEmail,
    },
  });

  if (!managerUser) {
    const passwordHash = await bcrypt.hash('JohnManager123!', 12);

    managerUser = userRepository.create({
      organizationId: organization.id,
      email: managerEmail,
      passwordHash,
      role: 'MANAGER',
      isActive: true,
    });

    await userRepository.save(managerUser);

    console.log(`✅ Manager user created: ${managerUser.email}`);
  } else {
    console.log(`ℹ️ Manager user already exists: ${managerUser.email}`);
  }

  const employeeRepository = seedDataSource.getRepository('Employee');

  let john = await employeeRepository.findOne({
    where: {
      organizationId: organization.id,
      employeeCode: 'EMP001',
    },
  });

  if (!john) {
    john = employeeRepository.create({
      organizationId: organization.id,
      departmentId: department.id,
      userId: managerUser.id,
      employeeCode: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      phone: null,
      dateOfJoining: '2024-01-15',
      designation: 'Senior QA Engineer',
      managerId: null,
      status: 'ACTIVE',
      isActive: true,
    });

    await employeeRepository.save(john);

    console.log(`✅ Employee created: ${john.firstName} ${john.lastName}`);
  } else {
    console.log(
      `ℹ️ Employee already exists: ${john.firstName} ${john.lastName}`,
    );
  }

  const janeEmail = 'jane.smith@momentum360.local';

  let janeUser = await userRepository.findOne({
    where: {
      email: janeEmail,
    },
  });

  if (!janeUser) {
    const passwordHash = await bcrypt.hash('JaneEmployee123!', 12);

    janeUser = userRepository.create({
      organizationId: organization.id,
      email: janeEmail,
      passwordHash,
      role: 'EMPLOYEE',
      isActive: true,
    });

    await userRepository.save(janeUser);

    console.log(`✅ Employee user created: ${janeUser.email}`);
  } else {
    console.log(`ℹ️ Employee user already exists: ${janeUser.email}`);
  }

  let jane = await employeeRepository.findOne({
    where: {
      organizationId: organization.id,
      employeeCode: 'EMP002',
    },
  });

  if (!jane) {
    jane = employeeRepository.create({
      organizationId: organization.id,
      departmentId: department.id,
      userId: janeUser.id,
      employeeCode: 'EMP002',
      firstName: 'Jane',
      lastName: 'Smith',
      phone: null,
      dateOfJoining: '2025-02-10',
      designation: 'QA Engineer',
      managerId: john.id,
      status: 'ACTIVE',
      isActive: true,
    });

    await employeeRepository.save(jane);

    console.log(`✅ Employee created: ${jane.firstName} ${jane.lastName}`);
  } else {
    console.log(
      `ℹ️ Employee already exists: ${jane.firstName} ${jane.lastName}`,
    );
  }

  // Seed data will be added here in the next steps.

  await seedDataSource.destroy();

  console.log('✅ Database seed completed.');
}

seed().catch(async (error) => {
  console.error('❌ Database seed failed:', error);

  if (seedDataSource.isInitialized) {
    await seedDataSource.destroy();
  }

  process.exit(1);
});
