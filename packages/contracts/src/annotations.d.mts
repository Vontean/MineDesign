// annotations.mjs 的类型声明。
export type AnnotationStatus = 'draft' | 'sent' | 'resolved';

/** 一条批注：目标（anchor）、文字与状态；其余字段由外壳和编辑器写入并原样保留。 */
export interface Annotation {
  id: string;
  text: string;
  status: AnnotationStatus;
  anchor?: string;
  label?: string;
  detail?: string;
  section?: string;
  createdAt?: string;
  sentAt?: string;
  resolvedAt?: string;
  sourceVersion?: string;
  [key: string]: unknown;
}

/** 存储中的批注可能没有状态（旧数据）。 */
export type StoredAnnotation = Omit<Annotation, 'status'> & { status?: unknown };

export const ANNOTATION_STATES: readonly AnnotationStatus[];
export function normalizeAnnotation(note: StoredAnnotation): Annotation;
export function normalizeAnnotations(notes: readonly StoredAnnotation[] | null | undefined): Annotation[];
export function editAnnotation(notes: readonly StoredAnnotation[], id: string, text: string): Annotation[];
export function markAnnotationsSent(notes: readonly StoredAnnotation[], ids: Iterable<string>, at: string): Annotation[];
export function markAnnotationsResolved(notes: readonly StoredAnnotation[], ids: Iterable<string>, at: string): Annotation[];
export function draftAnnotations(notes: readonly StoredAnnotation[] | null | undefined): Annotation[];
export function visibleAnnotations(notes: readonly StoredAnnotation[] | null | undefined): Annotation[];
export function canSendFeedback(notes: readonly StoredAnnotation[] | null | undefined, message: unknown): boolean;
export function feedbackContent(input: { document: string; editor: string; annotations: readonly StoredAnnotation[]; message: string }): string;
