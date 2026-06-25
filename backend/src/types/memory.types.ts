export interface CreateMemoryInput {
  userId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  publicId?: string;
  latitude?: number;
  longitude?: number;
  memoryId?: string;
}

export interface UpdateMemoryInput {
  title?: string;
  description?: string;
  memoryId: string;
  latitude?: number;
  longitude?: number;
}

export interface UpsertMemoryImageInput {
  memoryId: string;
  imageUrl: string;
  publicId?: string;

}

export interface GetandDeleteMemoryInput {
    memoryId: string;
}

