export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string
  createdAt: string
}

interface StoredAccount extends User {
  passwordHash: string
}

const USERS_STORAGE_KEY = 'legalsense_users'
const SESSION_STORAGE_KEY = 'legalsense_session'

const DEFAULT_TEST_USER: StoredAccount = {
  id: 'user_test_001',
  name: 'Test User',
  email: 'test@test.com',
  passwordHash: 'test@123',
  role: 'Contract Reviewer & Evaluator',
  avatar: 'TU',
  createdAt: new Date().toISOString(),
}

function getStoredUsers(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([DEFAULT_TEST_USER]))
      return [DEFAULT_TEST_USER]
    }
    const users: StoredAccount[] = JSON.parse(raw)
    if (!users.some(u => u.email.toLowerCase() === DEFAULT_TEST_USER.email.toLowerCase())) {
      users.push(DEFAULT_TEST_USER)
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    }
    return users
  } catch {
    return [DEFAULT_TEST_USER]
  }
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function login(email: string, password: string): { success: boolean; user?: User; error?: string } {
  const users = getStoredUsers()
  const cleanEmail = email.trim().toLowerCase()
  const found = users.find(u => u.email.toLowerCase() === cleanEmail)
  if (!found) {
    return { success: false, error: 'No account found with this email. Try test@test.com' }
  }
  if (found.passwordHash !== password) {
    return { success: false, error: 'Incorrect password. Default test password is test@123' }
  }
  const { passwordHash, ...userSafe } = found
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userSafe))
  return { success: true, user: userSafe }
}

export function register(name: string, email: string, password: string): { success: boolean; user?: User; error?: string } {
  const users = getStoredUsers()
  const cleanEmail = email.trim().toLowerCase()
  if (!name.trim()) return { success: false, error: 'Full name is required.' }
  if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'A valid email is required.' }
  if (!password || password.length < 4) return { success: false, error: 'Password must be at least 4 characters.' }

  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'An account with this email already exists. Please log in.' }
  }

  const initials = name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const newUser: StoredAccount = {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    passwordHash: password,
    role: 'Legal Ops Analyst',
    avatar: initials,
    createdAt: new Date().toISOString(),
  }

  users.push(newUser)
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))

  const { passwordHash, ...userSafe } = newUser
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userSafe))
  return { success: true, user: userSafe }
}

export function logout(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {}
}

export function updateUserProfile(updates: Partial<User>): User | null {
  const current = getCurrentUser()
  if (!current) return null
  const updated: User = { ...current, ...updates }
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated))

  const users = getStoredUsers().map(u => u.id === current.id ? { ...u, ...updates } : u)
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  return updated
}
