import { useState } from 'react';
import {
  updateCompanyEmployeeRole,
  type CompanyEmployeeMembership,
  type UpdateCompanyEmployeeRolePayload,
} from '@/api-client/company';

interface UseUpdateCompanyEmployeeRoleOptions {
  onSuccess?: (data: CompanyEmployeeMembership) => void;
  onError?: (error: unknown) => void;
}

export function useUpdateCompanyEmployeeRole(
  options?: UseUpdateCompanyEmployeeRoleOptions
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<CompanyEmployeeMembership | null>(null);

  const submitUpdateEmployeeRole = async (
    companyId: number,
    payload: UpdateCompanyEmployeeRolePayload
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateCompanyEmployeeRole(companyId, payload);
      setData(result);
      options?.onSuccess?.(result);
      return result;
    } catch (err: unknown) {
      setError(err);
      options?.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitUpdateEmployeeRole, loading, error, data };
}
