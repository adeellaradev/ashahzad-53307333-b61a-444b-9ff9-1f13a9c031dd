import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  Role,
  Permission,
  User,
  Organization,
  Task,
  AuditLog,
  UserRole,
} from '@ashahzad-task-manager/data';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'task_manager',
  entities: [User, Organization, Role, Permission, Task, AuditLog],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('Database connected');

  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);
  const organizationRepository = dataSource.getRepository(Organization);
  const userRepository = dataSource.getRepository(User);

  const existingRoles = await roleRepository.count();
  if (existingRoles > 0) {
    console.log('Database already seeded');
    await dataSource.destroy();
    return;
  }

  const ownerRole = roleRepository.create({
    name: UserRole.OWNER,
    description: 'Full system access including organization management',
    level: 3,
  });

  const adminRole = roleRepository.create({
    name: UserRole.ADMIN,
    description: 'Can manage tasks and users within organization',
    level: 2,
  });

  const viewerRole = roleRepository.create({
    name: UserRole.VIEWER,
    description: 'Read-only access to tasks',
    level: 1,
  });

  await roleRepository.save([ownerRole, adminRole, viewerRole]);
  console.log('Roles created');

  const permissions = [
    { resource: 'tasks', action: 'create', description: 'Create new tasks' },
    { resource: 'tasks', action: 'read', description: 'View tasks' },
    { resource: 'tasks', action: 'update', description: 'Update tasks' },
    { resource: 'tasks', action: 'delete', description: 'Delete tasks' },
    {
      resource: 'organizations',
      action: 'create',
      description: 'Create organizations',
    },
    {
      resource: 'organizations',
      action: 'read',
      description: 'View organizations',
    },
    {
      resource: 'organizations',
      action: 'update',
      description: 'Update organizations',
    },
    {
      resource: 'organizations',
      action: 'delete',
      description: 'Delete organizations',
    },
    { resource: 'users', action: 'create', description: 'Create users' },
    { resource: 'users', action: 'read', description: 'View users' },
    { resource: 'users', action: 'update', description: 'Update users' },
    { resource: 'users', action: 'delete', description: 'Delete users' },
  ];

  const createdPermissions = await permissionRepository.save(
    permissions.map((p) => permissionRepository.create(p))
  );
  console.log('Permissions created');

  const permissionMap = Object.fromEntries(
    createdPermissions.map((p) => [`${p.resource}:${p.action}`, p])
  );

  ownerRole.permissions = [
    permissionMap['tasks:create'],
    permissionMap['tasks:read'],
    permissionMap['tasks:update'],
    permissionMap['tasks:delete'],
    permissionMap['organizations:create'],
    permissionMap['organizations:read'],
    permissionMap['organizations:update'],
    permissionMap['organizations:delete'],
    permissionMap['users:create'],
    permissionMap['users:read'],
    permissionMap['users:update'],
    permissionMap['users:delete'],
  ];

  adminRole.permissions = [
    permissionMap['tasks:create'],
    permissionMap['tasks:read'],
    permissionMap['tasks:update'],
    permissionMap['tasks:delete'],
    permissionMap['users:create'],
    permissionMap['users:read'],
    permissionMap['users:update'],
  ];

  viewerRole.permissions = [permissionMap['tasks:read']];

  await roleRepository.save([ownerRole, adminRole, viewerRole]);
  console.log('Role permissions assigned');

  const rootOrg = organizationRepository.create({
    name: 'Root Organization',
    description: 'Default root organization',
  });
  await organizationRepository.save(rootOrg);
  console.log('Root organization created');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = userRepository.create({
    email: 'admin@example.com',
    password: hashedPassword,
    firstName: 'Admin',
    lastName: 'User',
    roleId: ownerRole.id,
    organizationId: rootOrg.id,
  });
  await userRepository.save(adminUser);
  console.log('Admin user created: admin@example.com / admin123');

  await dataSource.destroy();
  console.log('Seeding completed successfully');
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
