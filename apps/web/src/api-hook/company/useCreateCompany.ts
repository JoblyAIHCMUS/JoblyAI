import { useState } from 'react';
import {
	Company,
	CreateCompanyPayload,
	createCompany,
} from '@/api-client/company';

interface UseCreateCompanyOptions {
	onSuccess?: (data: Company) => void;
	onError?: (error: unknown) => void;
}

export function useCreateCompany(options?: UseCreateCompanyOptions) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<unknown>(null);
	const [data, setData] = useState<Company | null>(null);

	const submitCompany = async (payload: CreateCompanyPayload) => {
		setLoading(true);
		setError(null);

		try {
			const result = await createCompany(payload);
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

	return { submitCompany, loading, error, data };
}
