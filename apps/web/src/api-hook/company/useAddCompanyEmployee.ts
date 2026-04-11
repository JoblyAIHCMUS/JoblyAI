import { useState } from 'react';
import {
  addCompanyEmployee,
  type AddCompanyEmployeePayload,
  type CompanyEmployeeMembership,
} from '@/api-client/company';

interface UseAddCompanyEmployeeOptions {
  onSuccess?: (data: CompanyEmployeeMembership) => void;
  onError?: (error: unknown) => void;
}

export function useAddCompanyEmployee(options?: UseAddCompanyEmployeeOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [data, setData] = useState<CompanyEmployeeMembership | null>(null);

  const submitAddEmployee = async (
    companyId: number,
    payload: AddCompanyEmployeePayload
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await addCompanyEmployee(companyId, payload);
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

  return { submitAddEmployee, loading, error, data };
}
