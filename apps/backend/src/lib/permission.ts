import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

// -----PRIVILEGES------
export const statement = {
  ...defaultStatements,

  // User account management
  user: ['read', 'ban', 'delete', 'create', 'update'],

  // User profile management
  profile: ['read', 'update'],

  // Job Postings
  job: [
    'create',
    'read',
    'update_own',
    'update_any',
    'delete_own',
    'delete_any',
    'promote',
  ], // 'promote' = paying to boost

  // Job Applications
  application: [
    'create',
    'read_own',
    'read_all',
    'update_status',
    'withdraw',
    'delete',
  ],

  // Organizations (Company Pages)
  organization: [
    'create',
    'read',
    'update_own',
    'update_any',
    'delete_own',
    'delete_any',
  ], // TODO: realign with actual use cases, do we allow users
  //  to create orgs? maybe just admins can do that and users can request to join? Also do we allow org at all?
  //  Maybe we just have a "company" field on job posts and not have actual org entities?

  // AI Resume Scanner
  ai_scan: ['run_personal', 'run_candidate', 'read_result'], // TODO: refactor this later
} as const;

export const accessControl = createAccessControl(statement);

// -----ROLES------
export const candidate = accessControl.newRole({
  user: ['create', 'read', 'update', 'delete'], // Can manage their own user account
  profile: ['read', 'update'], // Can view and edit their profile and delete their account
  job: ['read'], // Can view jobs
  organization: ['read'], // Can view company pages
  application: ['create', 'read_own', 'withdraw'], // Can apply to jobs, view their applications, and withdraw
  ai_scan: ['run_personal', 'read_result'], // Can run AI resume scan on their own resume and view results
});

export const employer = accessControl.newRole({
  user: ['create', 'read', 'update', 'delete'], // Can manage their own user account
  profile: ['read', 'update'], // Can view and edit their profile and delete their account
  job: ['create', 'read', 'update_own', 'delete_own', 'promote'], // Can post jobs, edit them, delete them, and promote them
  organization: ['create', 'read', 'update_own', 'delete_own'], // Can create a company page, edit it, and delete it
  application: ['read_all', 'update_status'], // Can view organization's job applications and update status
  ai_scan: ['run_candidate', 'read_result'], // Can run AI resume scan on candidate resumes and view results
});

export const admin = accessControl.newRole({
  ...adminAc.statements,
  user: ['create', 'read', 'update', 'delete', 'ban'], // Can manage user accounts
  profile: ['read', 'update'], // Can view and edit their profile and delete their account
  job: ['create', 'read', 'update_any', 'delete_any', 'promote'], // Can post jobs, edit them, delete them, and promote them
  organization: ['create', 'read', 'update_any', 'delete_any'], // Can create a company page, edit it, and delete it
  application: ['read_all', 'update_status', 'delete'], // Can view all job applications, update status, and delete when necessary
  ai_scan: ['run_candidate', 'read_result'], // Can run AI resume scan on candidate resumes and view results
});

export const superAdmin = accessControl.newRole({
  ...adminAc.statements,
  user: ['create', 'read', 'update', 'delete', 'ban'], // Can manage user accounts
  profile: ['read', 'update'], // Can view and edit their profile and delete their account
  job: ['create', 'read', 'update_any', 'delete_any', 'promote'], // Can post jobs, edit them, delete them, and promote them
  organization: ['create', 'read', 'update_any', 'delete_any'], // Can create a company page, edit it, and delete it
  application: ['read_all', 'update_status', 'delete'], // Can view all job applications, update status, and delete when necessary
  ai_scan: ['run_candidate', 'read_result'], // Can run AI resume scan on candidate resumes and view results
});

// BASICALLY, FOR NOW, ADMIN AND SUPER-ADMIN HAVE THE SAME PERMISSIONS. BUT IN THE FUTURE, MAYBE WE CAN
// GIVE SUPER-ADMIN SOME EXTRA PERMISSIONS LIKE ABILITY TO MANAGE OTHER ADMINS,
// VIEW SENSITIVE ANALYTICS DATA, ETC. FOR NOW THOUGH THIS IS GOOD ENOUGH.
