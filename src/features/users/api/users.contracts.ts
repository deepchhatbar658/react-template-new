import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'member', 'viewer']);
export const userStatusSchema = z.enum(['active', 'invited', 'suspended']);

const userDtoSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  name: z.string().min(1),
  role: userRoleSchema,
  status: userStatusSchema,
  created_at: z.iso.datetime(),
});

export const userSchema = userDtoSchema.transform((dto) => ({
  id: dto.id,
  email: dto.email,
  name: dto.name,
  role: dto.role,
  status: dto.status,
  createdAt: dto.created_at,
}));

const paginationSchema = z.object({
  page: z.int().positive(),
  pageSize: z.int().positive(),
  total: z.int().nonnegative(),
  totalPages: z.int().nonnegative(),
});

export const userListResponseSchema = z.object({
  data: z.array(userSchema),
  pagination: paginationSchema,
});

export const userFormSchema = z.object({
  email: z.email('Enter a valid email address.'),
  name: z.string().trim().min(2, 'Name must contain at least 2 characters.'),
  role: userRoleSchema,
  status: userStatusSchema,
});

export interface UserListParams {
  page?: number;
  pageSize?: number;
  role?: UserRole;
  search?: string;
  status?: UserStatus;
}

export interface NormalizedUserListParams {
  page: number;
  pageSize: number;
  role: UserRole | null;
  search: string;
  status: UserStatus | null;
}

export const normalizeUserListParams = (
  params: UserListParams,
): NormalizedUserListParams => ({
  page: Math.max(1, params.page ?? 1),
  pageSize: Math.min(100, Math.max(1, params.pageSize ?? 5)),
  role: params.role ?? null,
  search: params.search?.trim() ?? '',
  status: params.status ?? null,
});

export type User = z.infer<typeof userSchema>;
export type UserListResponse = z.infer<typeof userListResponseSchema>;
type UserRole = z.infer<typeof userRoleSchema>;
type UserStatus = z.infer<typeof userStatusSchema>;
export type UserFormInput = z.infer<typeof userFormSchema>;
export type CreateUserInput = UserFormInput;
export type UpdateUserInput = Partial<UserFormInput>;
