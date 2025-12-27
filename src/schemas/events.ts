import { z } from 'zod';

export enum EventStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export const createEventSchema = z.object({
  title: z.string().min(3, 'Informe pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descreva melhor o evento'),
  date: z.string().min(1, 'Data obrigatória'),
  location: z.string().min(3, 'Local obrigatório')
});

export const updateEventSchema = createEventSchema.partial();

export const eventResponseSchema = createEventSchema.extend({
  id: z.string(),
  status: z.nativeEnum(EventStatus),
  coverImage: z.string().url().optional(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional()
});

export type EventResponse = z.infer<typeof eventResponseSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export type EventSummary = Pick<EventResponse, 'id' | 'title' | 'description' | 'date' | 'location'>;
