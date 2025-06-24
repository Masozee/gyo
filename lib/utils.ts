import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { User } from "./schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function omitPassword(user: User): Omit<User, 'password'> {
  const result = { ...user }
  delete (result as Record<string, unknown>).password
  return result as Omit<User, 'password'>
}
