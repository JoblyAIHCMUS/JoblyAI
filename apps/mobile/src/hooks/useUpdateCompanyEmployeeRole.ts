import { useState } from 'react';
import {
  updateCompanyEmployeeRole,
  type UpdateCompanyEmployeeRolePayload,
  type CompanyEmployeeMembership,
} from '../api/company';

interface UseUpdateCompanyEmployeeRoleOptions {
  onSuccess?: (data: CompanyEmployeeMembership) => void;
  onError?: (error: unknown) => void;
}

export function useUpdateCompanyEmployeeRole(
  options: UseUpdateCompanyEmployeeRoleOptions = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<CompanyEmployeeMembership | null>(null);

  const submitRoleUpdate = async (
    companyId: number,
    payload: UpdateCompanyEmployeeRolePayload
  ): Promise<CompanyEmployeeMembership> => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateCompanyEmployeeRole(companyId, payload);
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { submitRoleUpdate, loading, error, data };
}
