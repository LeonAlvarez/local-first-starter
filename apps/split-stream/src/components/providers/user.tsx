'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';
import { use } from 'react';
import { type User } from 'db/schemas/users';
import { redirect } from 'next/navigation';

type UserContextType = {
  user: User;
  setUser: (user: User) => void;
};

const UserContext = createContext<UserContextType>({} as UserContextType);

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}

export function UserProvider({
  children,
  userPromise,
}: {
  children: ReactNode;
  userPromise: Promise<User | null>;
}) {
  const initialUser = use(userPromise);
  if (!initialUser) {
    redirect('/')
  }
  const [user, setUser] = useState<User>(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}