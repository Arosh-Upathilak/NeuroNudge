import { PrismaClient,Prisma } from "@prisma/client";
import {
  CreateMemoryInput,
  UpdateMemoryInput,
  UpsertMemoryImageInput,
} from "../types/memory.types";

const prisma = new PrismaClient();

/**
 * MEMORY SERVICE
 */
export const MemoryService = {
  /**
   * CREATE MEMORY
   */
  createMemory: async (data: CreateMemoryInput) => {
    return await prisma.memory.create({
      data: {
        userId: data.userId,
        title: data.title,
        description: data.description,

        image: data.imageUrl
          ? {
              create: {
                imageUrl: data.imageUrl,
                publicId: data.publicId,
              },
            }
          : undefined,

        location:
          data.latitude !== undefined && data.longitude !== undefined
            ? {
                create: {
                 latitude: Number(data.latitude),
                 longitude: Number(data.longitude),
                },
              }
            : undefined,
      },
      include: {
        image: true,
        location: true,
      },
    });
  },

  /**
   * GET ALL MEMORIES BY USER
   */
  getMemoriesByUser: async (userId: string) => {
    return await prisma.memory.findMany({
      where: { userId },
      include: {
        image: true,
        location: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * GET MEMORY BY ID (USER SCOPED)
   */
  getMemoryById: async (memoryId: string, userId: string) => {
    return await prisma.memory.findFirst({
      where: {
        memoryId,
        userId,
      },
      include: {
        image: true,
        location: true,
        messages: true,
      },
    });
  },

  /**
   * UPDATE MEMORY
   */
updateMemory: async (
  memoryId: string,
  userId: string,
  data: UpdateMemoryInput
) => {
  const updateData: Prisma.MemoryUpdateInput = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.latitude !== undefined && data.longitude !== undefined) {
    updateData.location = {
      upsert: {
        create: {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        },
        update: {
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
        },
      },
    };
  }

  return await prisma.memory.update({
    where: {
      memoryId,
      userId,
    },
    data: updateData,
    include: {
      location: true,
      image: true,
    },
  });
},
  /**
   * DELETE MEMORY
   */
  deleteMemory: async (memoryId: string, userId: string) => {
    return await prisma.memory.deleteMany({
      where: {
        memoryId,
        userId,
      },
    });
  },

  /**
   * UPSERT MEMORY IMAGE
   */
  upsertMemoryImage: async (data: UpsertMemoryImageInput) => {
    return await prisma.image.upsert({
      where: {
        memoryId: data.memoryId,
      },
      update: {
        imageUrl: data.imageUrl,
        publicId: data.publicId,
      },
      create: {
        memoryId: data.memoryId,
        imageUrl: data.imageUrl,
        publicId: data.publicId,
      },
    });
  },

  /**
   * DELETE MEMORY IMAGE
   */
  deleteMemoryImage: async (memoryId: string) => {
    return await prisma.image.delete({
      where: { memoryId },
    });
  },
};