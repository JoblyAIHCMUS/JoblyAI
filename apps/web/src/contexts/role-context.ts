'use client';

import { createContext, useContext } from 'react';

export type AppRole = 'guest' | 'candidate' | 'employer' | 'admin';

const RoleContext = createContext<AppRole>('guest');

export const useRole = () => useContext(RoleContext);

export default RoleContext;
