import { prisma } from '@/lib/prisma';

export class UserService {
  static async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });
  }

  static async updateUser(id: string, data: { name?: string; image?: string }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async softDeleteUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
