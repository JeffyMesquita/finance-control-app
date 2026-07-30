import { useQuery } from "@tanstack/react-query";
import { apiPaginatedRequest } from "@/lib/api/client";
import { isNestDomainEnabled } from "@/lib/api/rollout";
import { adminQueryKeys } from "./useAdminStatsQuery";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  phone?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminUsersData {
  pagination: { page: number; limit: number; total: number; pages: number };
  users: AdminUser[];
}

async function fetchAdminUsers(page: number, limit: number): Promise<AdminUsersData> {
  if (isNestDomainEnabled("admin")) {
    const offset = (page - 1) * limit;
    const result = await apiPaginatedRequest<AdminUser>(
      `/admin/users?limit=${limit}&offset=${offset}`
    );
    const total = result.total ?? 0;
    return {
      users: result.data ?? [],
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  const { getAdminUsers } = await import("@/app/actions/admin");
  const result = await getAdminUsers(page, limit);
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch admin users");
  }
  return result.data as unknown as AdminUsersData;
}

export function useAdminUsersQuery(page = 1, limit = 20) {
  return useQuery({
    queryKey: adminQueryKeys.users(page, limit),
    queryFn: () => fetchAdminUsers(page, limit),
    staleTime: 1000 * 60 * 2,
  });
}
