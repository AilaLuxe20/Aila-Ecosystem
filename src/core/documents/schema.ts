import { z } from "zod";

export const DOCUMENTS_LIST_LIMIT = 80;
export const DOCUMENT_TITLE_MAX = 160;
export const DOCUMENT_NOTES_MAX = 20_000;

export const updateDocumentNotesSchema = z
  .object({
    notes: z.string().max(DOCUMENT_NOTES_MAX).nullable(),
  })
  .strict();

export const listDocumentsQuerySchema = z
  .object({
    q: z.string().trim().max(120).optional(),
    limit: z.coerce.number().int().min(1).max(DOCUMENTS_LIST_LIMIT).optional(),
  })
  .strict();

export const documentIdSchema = z.string().trim().min(1).max(64);

export const uploadDocumentFieldsSchema = z
  .object({
    title: z.string().trim().min(1).max(DOCUMENT_TITLE_MAX).optional(),
    notes: z.string().max(DOCUMENT_NOTES_MAX).optional().nullable(),
  })
  .strict();

export type UpdateDocumentNotesBody = z.infer<typeof updateDocumentNotesSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
export type UploadDocumentFields = z.infer<typeof uploadDocumentFieldsSchema>;
