const fs = require('fs');
const path = require('path');

const dirs = [
  '.next/server/pages',
  '.next/server/app',
  '.next/server/app/[tab]',
  '.next/server/app/login',
  '.next/server/app/offline',
  '.next/server/app/api',
  '.next/server/app/api/students',
  '.next/server/app/api/staff',
  '.next/server/app/api/fees',
  '.next/server/app/api/exams',
  '.next/server/app/api/attendance',
  '.next/server/app/api/init',
  '.next/server/app/api/settings',
  '.next/server/app/api/auth',
  '.next/server/app/api/auth/[...nextauth]',
  '.next/static/chunks/pages',
  '.next/static/chunks/app',
  '.next/static/chunks/app/[tab]',
  '.next/static/chunks/app/login',
  '.next/static/chunks/app/offline',
  '.next/static/css',
  '.next/types/pages',
  '.next/types/app',
  '.next/types/app/[tab]',
  '.next/types/app/login',
  '.next/types/app/offline',
  '.next/types/app/api/students',
  '.next/types/app/api/staff',
  '.next/types/app/api/fees',
  '.next/types/app/api/exams',
  '.next/types/app/api/attendance',
  '.next/types/app/api/init',
  '.next/types/app/api/settings',
  '.next/types/app/api/auth',
  '.next/types/app/api/auth/[...nextauth]'
];

for (const d of dirs) {
  try {
    fs.mkdirSync(path.resolve(d), { recursive: true });
  } catch (e) {
    // ignore
  }
}
