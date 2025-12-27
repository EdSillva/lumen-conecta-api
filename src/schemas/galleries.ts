import { z } from 'zod';

export const createGallerySchema = z.object({
  eventId: z.string(),
  title: z.string().min(3, 'Informe pelo menos 3 caracteres')
});

export const galleryPhotoSchema = z.object({
  imageUrl: z.string().url(),
  order: z.number().int().min(0)
});

export const galleryResponseSchema = createGallerySchema.extend({
  id: z.string(),
  createdBy: z.string(),
  createdAt: z.string()
});

export type GalleryResponse = z.infer<typeof galleryResponseSchema>;
export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type GallerySummary = Pick<GalleryResponse, 'id' | 'eventId' | 'title'>;
