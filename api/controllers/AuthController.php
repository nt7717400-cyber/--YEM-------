<?php
/**
 * Authentication Controller
 * Login, logout, and token verification
 * Requirements: 6.1, 6.2, 6.3
 * SECURITY: Enhanced with audit logging and input sanitization
 */

require_once __DIR__ . '/../utils/AuditLogger.php';
require_once __DIR__ . '/../utils/InputSanitizer.php';

class AuthController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Admin login
     * Requirements: 6.1, 6.2
     * POST /api/auth/login
     */
    public function login() {
        $data = Response::getJsonInput();

        // Validate input
        if (empty($data['username']) || empty($data['password'])) {
            AuditLogger::logAuth('LOGIN_FAILED', null, ['reason' => 'missing_credentials']);
            Response::error('يرجى إدخال اسم المستخدم وكلمة المرور', 400, 'VAL_001');
        }

        // Sanitize username (password should not be sanitized)
        $username = InputSanitizer::sanitizeString(trim($data['username']));
        $password = $data['password'];

        // Validate username format
        if (strlen($username) < 3 || strlen($username) > 50) {
            AuditLogger::logAuth('LOGIN_FAILED', null, ['reason' => 'invalid_username_format', 'username' => $username]);
            Response::error('اسم المستخدم أو كلمة المرور غير صحيحة', 401, 'AUTH_001');
        }

        try {
            // Find user by username
            $stmt = $this->db->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            // Verify credentials
            // Requirements: 6.3
            if (!$user || !password_verify($password, $user['password_hash'])) {
                AuditLogger::logAuth('LOGIN_FAILED', $user['id'] ?? null, [
                    'reason' => 'invalid_credentials',
                    'username' => $username
                ]);
                Response::error('اسم المستخدم أو كلمة المرور غير صحيحة', 401, 'AUTH_001');
            }

            // Generate JWT token
            $token = AuthMiddleware::generateToken([
                'user_id' => $user['id'],
                'username' => $user['username']
            ]);

            // Log successful login
            AuditLogger::logAuth('LOGIN_SUCCESS', $user['id'], ['username' => $user['username']]);

            Response::success([
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username']
                ],
                'expiresIn' => AuthMiddleware::getTokenExpiry()
            ]);

        } catch (PDOException $e) {
            AuditLogger::logAuth('LOGIN_ERROR', null, ['error' => $e->getMessage()]);
            Response::error('حدث خطأ في تسجيل الدخول', 500, 'SRV_001');
        }
    }

    /**
     * Admin logout
     * POST /api/auth/logout
     */
    public function logout() {
        // Log logout
        AuditLogger::logAuth('LOGOUT', AuthMiddleware::getUserId());
        
        // JWT is stateless, so logout is handled client-side
        // Server just confirms the logout request
        Response::success([
            'message' => 'تم تسجيل الخروج بنجاح'
        ]);
    }

    /**
     * Verify token validity
     * Requirements: 6.2
     * GET /api/auth/verify
     */
    public function verify() {
        $headers = $this->getAuthorizationHeader();
        
        if (!$headers) {
            Response::success([
                'valid' => false,
                'message' => 'لم يتم توفير رمز المصادقة'
            ]);
        }

        $token = null;
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            $token = $matches[1];
        }

        if (!$token) {
            Response::success([
                'valid' => false,
                'message' => 'رمز المصادقة غير صالح'
            ]);
        }

        $payload = AuthMiddleware::verifyToken($token);

        if (!$payload) {
            Response::success([
                'valid' => false,
                'message' => 'انتهت صلاحية الجلسة'
            ]);
        }

        // Optionally refresh token
        $newToken = AuthMiddleware::refreshToken($token);

        Response::success([
            'valid' => true,
            'user' => [
                'id' => $payload['user_id'],
                'username' => $payload['username']
            ],
            'token' => $newToken,
            'expiresIn' => AuthMiddleware::getTokenExpiry()
        ]);
    }

    /**
     * Change password
     * Requirements: 13.1, 13.2, 13.3
     * PUT /api/auth/password
     */
    public function changePassword() {
        $data = Response::getJsonInput();

        // Validate input
        if (empty($data['currentPassword']) || empty($data['newPassword'])) {
            Response::error('يرجى إدخال كلمة المرور الحالية والجديدة', 400, 'VAL_001');
        }

        $userId = AuthMiddleware::getUserId();
        $currentPassword = $data['currentPassword'];
        $newPassword = $data['newPassword'];

        // Validate new password strength
        $passwordErrors = $this->validatePasswordStrength($newPassword);
        if (!empty($passwordErrors)) {
            Response::error($passwordErrors[0], 400, 'VAL_001');
        }

        try {
            // Get current user
            $stmt = $this->db->prepare("SELECT password_hash FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            if (!$user) {
                Response::error('المستخدم غير موجود', 404, 'AUTH_003');
            }

            // Verify current password
            // Requirements: 13.3
            if (!password_verify($currentPassword, $user['password_hash'])) {
                AuditLogger::logAuth('PASSWORD_CHANGE_FAILED', $userId, ['reason' => 'wrong_current_password']);
                Response::error('كلمة المرور الحالية غير صحيحة', 400, 'AUTH_001');
            }

            // Update password
            // Requirements: 13.2
            $newHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
            $stmt = $this->db->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
            $stmt->execute([$newHash, $userId]);

            AuditLogger::logAuth('PASSWORD_CHANGED', $userId);

            Response::success([
                'message' => 'تم تغيير كلمة المرور بنجاح'
            ]);

        } catch (PDOException $e) {
            AuditLogger::logAuth('PASSWORD_CHANGE_ERROR', $userId, ['error' => $e->getMessage()]);
            Response::error('حدث خطأ في تغيير كلمة المرور', 500, 'SRV_001');
        }
    }

    /**
     * Validate password strength
     * @param string $password The password to validate
     * @return array Array of error messages (empty if valid)
     */
    private function validatePasswordStrength(string $password): array {
        $errors = [];
        
        if (strlen($password) < 8) {
            $errors[] = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
        }
        
        if (strlen($password) > 128) {
            $errors[] = 'كلمة المرور طويلة جداً';
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل';
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل';
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل';
        }
        
        return $errors;
    }

    /**
     * Get Authorization header
     * @return string|null
     */
    private function getAuthorizationHeader() {
        $headers = null;
        
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER['Authorization']);
        } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(
                array_map('ucwords', array_keys($requestHeaders)),
                array_values($requestHeaders)
            );
            
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        return $headers;
    }
}
