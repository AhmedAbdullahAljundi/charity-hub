/**
 * Authentication Controller
 * 
 * HTTP request handlers for authentication
 */

const authService = require('./auth.service')
const { validateLogin } = require('./auth.validator')
const { AppError } = require('../../utils/errors')

const authController = {
  /**
   * Login endpoint handler
   * POST /api/v1/auth/login
   */
  login: async (req, res, next) => {
    try {
      // Validate input
      const validation = validateLogin(req.body)

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'خطأ في التحقق من البيانات',
          errors: validation.errors,
        })
      }

      const { email, password } = validation.value

      // Authenticate user
      const result = await authService.login(email, password)

      // Return success response
      res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  getMe: async (req, res, next) => {
    try {
      // User is attached by requireAuth middleware
      const userId = req.user.userId

      const user = await authService.getUserById(userId)

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Logout endpoint (client-side token removal)
   * POST /api/v1/auth/logout
   */
  logout: async (req, res, next) => {
    try {
      // Since we're using stateless JWT, logout is handled client-side
      // This endpoint is for consistency and potential future token blacklisting
      res.json({
        success: true,
        message: 'تم تسجيل الخروج بنجاح',
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = authController
