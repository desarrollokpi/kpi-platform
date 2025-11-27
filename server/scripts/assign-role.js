/**
 * Role Assignment Script
 * Assigns roles to existing users for multi-tenant system
 *
 * Usage:
 *   node scripts/assign-role.js <userId> <roleName>
 *   node scripts/assign-role.js 1 root_admin
 */

require('dotenv').config({ path: './config/.env.dev' });
const rolesService = require('../src/roles/roles.services');
const { ROLE_NAMES } = require('./seed-utils');

async function assignRole(userId, roleName) {
  try {
    console.log(`\nAssigning role '${roleName}' to user ${userId}...`);

    // Validate role name
    const validRoles = Object.values(ROLE_NAMES);
    if (!validRoles.includes(roleName)) {
      throw new Error(`Invalid role name. Must be one of: ${validRoles.join(', ')}`);
    }

    // Assign role
    const result = await rolesService.assignRoleToUser(userId, roleName);

    if (result.message) {
      console.log(`ℹ ${result.message}`);
    } else {
      console.log(`✓ Successfully assigned role '${roleName}' to user ${userId}`);
    }

    // Show user's current roles
    const userRoles = await rolesService.getUserRoles(userId);
    console.log(`\nUser ${userId} current roles:`);
    userRoles.forEach(role => {
      console.log(`  - ${role.name}`);
    });

    console.log('\n✓ Done\n');
    process.exit(0);
  } catch (error) {
    console.error(`\n✗ Error: ${error.message}\n`);
    process.exit(1);
  }
}

function showUsage() {
  console.log('\nUsage: node scripts/assign-role.js <userId> <roleName>\n');
  console.log('Available roles:');
  Object.entries(ROLE_NAMES).forEach(([key, value]) => {
    console.log(`  - ${value.padEnd(15)} (${key})`);
  });
  console.log('\nExamples:');
  console.log('  node scripts/assign-role.js 1 root_admin');
  console.log('  node scripts/assign-role.js 5 tenant_admin');
  console.log('  node scripts/assign-role.js 10 user\n');
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  showUsage();
  process.exit(1);
}

const [userId, roleName] = args;

if (isNaN(userId)) {
  console.error('\n✗ Error: userId must be a number\n');
  showUsage();
  process.exit(1);
}

assignRole(parseInt(userId), roleName);
