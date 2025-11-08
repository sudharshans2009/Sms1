// Database connection using SQLite with Prisma - Optimized for Vercel and local development
import { PrismaClient } from '@prisma/client';

// Lazily initialize Prisma Client to avoid side-effects during module
// evaluation (e.g. when Next.js inspects server modules at build time).
// We keep the same default import shape so existing code like
// `import prisma from '@/lib/prisma'` continues to work.

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  console.log('🔄 Initializing Prisma client...');
  
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  console.log('✅ Prisma client initialized successfully');
  return client;
}

// Lazy proxy that constructs the real PrismaClient on first property access.
// This prevents constructor-time errors during build-time module evaluation.
const prismaProxy = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (!globalForPrisma.prisma) {
      try {
        globalForPrisma.prisma = createPrismaClient();
      } catch (err) {
        // Log and rethrow on first attempt to create so it's visible,
        // but avoid throwing during mere module import if possible.
        console.error('❌ Prisma client initialization failed:', err);
        throw err;
      }
    }
    const actual = globalForPrisma.prisma as any;
    const value = Reflect.get(actual, prop, receiver);
    return typeof value === 'function' ? value.bind(actual) : value;
  },
  // also support setting properties
  set(_target, prop, value) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    (globalForPrisma.prisma as any)[prop as any] = value;
    return true;
  },
});

// Connection test function
export async function testConnection() {
  try {
    console.log('🧪 Testing database connection...');
    // ensure client is created and connected
    const client = (globalForPrisma.prisma ?? createPrismaClient()) as PrismaClient;
    globalForPrisma.prisma = client;
    
    await client.$connect();
    console.log('✅ Database connected successfully');
    
    // Test with a simple query
    const userCount = await client.user.count();
    console.log(`📊 Database test query successful. Found ${userCount} users.`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectDB() {
  if (globalForPrisma.prisma) {
    console.log('🔌 Gracefully disconnecting from database...');
    await globalForPrisma.prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  }
}

// Initialize connection on import (but don't fail if it doesn't work)
if (process.env.NODE_ENV !== 'test') {
  testConnection().catch((error) => {
    console.error('⚠️ Initial database connection test failed:', error.message);
  });
}

export default prismaProxy;
// Keep a named export for backwards compatibility
export const prisma = prismaProxy;
