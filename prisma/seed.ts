import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  try {
    await prisma.user.createMany({
      data: [
        { email: "admin@example.com", age: 18 },
        { email: "user@example.com", age: 72 },
        { email: "troll42@example.com", age: 40 }
      ]
    })
  }
  finally {
    await prisma.$disconnect()
  }
}

main()
