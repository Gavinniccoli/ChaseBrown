import { z } from 'zod';

export const projectionAvailabilityValues = [
  'ACTIVE',
  'QUESTIONABLE',
  'DOUBTFUL',
  'OUT',
  'IR',
  'BYE',
  'SUSPENDED',
  'UNKNOWN',
] as const;

export const projectionAvailabilitySchema = z.enum(
  projectionAvailabilityValues,
);

export type ProjectionAvailability = z.infer<
  typeof projectionAvailabilitySchema
>;

export const weeklyProjectionSchema = z
  .object({
    playerId: z.string().trim().min(1),
    season: z.number().int().positive(),
    week: z.number().int().positive(),
    expectedPoints: z.number().finite(),
    lowPoints: z.number().finite(),
    highPoints: z.number().finite(),
    availability: projectionAvailabilitySchema,
    modelVersion: z.string().trim().min(1),
    generatedAt: z.iso.datetime(),
  })
  .superRefine((projection, context) => {
    if (projection.lowPoints > projection.expectedPoints) {
      context.addIssue({
        code: 'custom',
        message: 'lowPoints must be less than or equal to expectedPoints',
        path: ['lowPoints'],
      });
    }

    if (projection.expectedPoints > projection.highPoints) {
      context.addIssue({
        code: 'custom',
        message: 'expectedPoints must be less than or equal to highPoints',
        path: ['highPoints'],
      });
    }
  });

export type WeeklyProjection = Readonly<z.infer<typeof weeklyProjectionSchema>>;
