import {
  type NextRequest,
  NextResponse,
} from 'next/server'

// This is a mock API route. Replace with your actual backend call.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Mock validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Mock users database
    const mockUsers: Record<
      string,
      {
        id: string
        name: string
        email: string
        role: 'ADMIN' | 'SUPERVISOR' | 'WORKER' | 'VIEWER'
        password: string
        preferredLocale: 'en' | 'ar'
      }
    > = {
      'admin@charityhub.org': {
        id: '1',
        name: 'محمد علي',
        email: 'admin@charityhub.org',
        role: 'ADMIN',
        password: 'Admin@1234',
        preferredLocale: 'ar',
      },
      'supervisor@charityhub.org': {
        id: '2',
        name: 'فاطمة أحمد',
        email: 'supervisor@charityhub.org',
        role: 'SUPERVISOR',
        password: 'Super@1234',
        preferredLocale: 'ar',
      },
      'worker@charityhub.org': {
        id: '3',
        name: 'عمر سالم',
        email: 'worker@charityhub.org',
        role: 'WORKER',
        password: 'Worker@1234',
        preferredLocale: 'ar',
      },
      'viewer@charityhub.org': {
        id: '4',
        name: 'سارة محمود',
        email: 'viewer@charityhub.org',
        role: 'VIEWER',
        password: 'View@1234',
        preferredLocale: 'ar',
      },
    }

    const user = mockUsers[email.toLowerCase()]

    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: 'البريد أو كلمة المرور غير صحيحة' },
        { status: 401 }
      )
    }

    // Mock JWT token (replace with real token from backend)
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`

    return NextResponse.json(
      {
        accessToken: mockToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferredLocale: user.preferredLocale,
          active: true,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
