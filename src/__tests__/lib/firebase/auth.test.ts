import { doSignInWithGoogle, doSignOut } from '@/lib/firebase/auth'
import { signInWithPopup, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'

// Mock Firebase auth
jest.mock('firebase/auth')
jest.mock('@/lib/firebase/config', () => ({
  auth: {},
}))

const mockSignInWithPopup = signInWithPopup as jest.MockedFunction<typeof signInWithPopup>
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>

describe('Firebase Auth Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('doSignInWithGoogle', () => {
    it('should sign in with Google successfully', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' }
      mockSignInWithPopup.mockResolvedValueOnce({
        user: mockUser,
      } as any)

      const result = await doSignInWithGoogle()

      expect(mockSignInWithPopup).toHaveBeenCalledWith(auth, expect.any(Object))
      expect(result).toEqual(mockUser)
    })

    it('should handle sign in errors', async () => {
      const error = new Error('Sign in failed')
      mockSignInWithPopup.mockRejectedValueOnce(error)

      await expect(doSignInWithGoogle()).rejects.toThrow('Sign in failed')
    })

    it('should return null on server side', async () => {
      // Mock window as undefined (server side)
      const originalWindow = global.window
      delete (global as any).window

      const result = await doSignInWithGoogle()

      expect(result).toBeNull()

      // Restore window
      global.window = originalWindow
    })
  })

  describe('doSignOut', () => {
    it('should sign out successfully', async () => {
      mockSignOut.mockResolvedValueOnce(undefined)

      await doSignOut()

      expect(mockSignOut).toHaveBeenCalledWith(auth)
    })

    it('should handle sign out errors', async () => {
      const error = new Error('Sign out failed')
      mockSignOut.mockRejectedValueOnce(error)

      await expect(doSignOut()).rejects.toThrow('Sign out failed')
    })
  })
})
