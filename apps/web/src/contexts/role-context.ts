'use client';

import { createContext, useContext } from 'react';

export type AppRole = 'guest' | 'candidate' | 'employer';

const RoleContext = createContext<AppRole>('guest');

export const useRole = () => useContext(RoleContext);

export default RoleContext;
