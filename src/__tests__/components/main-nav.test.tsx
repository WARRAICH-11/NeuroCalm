import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { MainNav } from '@/components/main-nav';
import { useAuth } from '@/lib/firebase/auth-provider';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

// Mock auth provider
jest.mock('@/lib/firebase/auth-provider', () => ({
  useAuth: jest.fn()
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('MainNav', () => {
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('renders navigation items for unauthenticated users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      signOut: mockSignOut,
      loading: false
    });

    render(<MainNav />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('renders navigation items for authenticated users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      isAuthenticated: true,
      signOut: mockSignOut,
      loading: false
    });

    render(<MainNav />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
    expect(screen.queryByText('Log In')).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      signOut: mockSignOut,
      loading: true
    });

    render(<MainNav />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('handles mobile menu toggle', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      signOut: mockSignOut,
      loading: false
    });

    render(<MainNav />);

    // Mobile menu should be closed initially
    const mobileMenuItems = screen.queryByText('Home');
    expect(mobileMenuItems).toBeInTheDocument(); // Desktop nav is visible

    // Find and click the mobile menu button (hamburger)
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);

    // Menu should now be open
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument();
  });

  it('calls signOut when sign out button is clicked', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      isAuthenticated: true,
      signOut: mockSignOut,
      loading: false
    });

    render(<MainNav />);

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('highlights active navigation item', () => {
    (usePathname as jest.Mock).mockReturnValue('/dashboard');
    (useAuth as jest.Mock).mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      isAuthenticated: true,
      signOut: mockSignOut,
      loading: false
    });

    render(<MainNav />);

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink?.parentElement).toHaveClass('bg-secondary');
  });
});
