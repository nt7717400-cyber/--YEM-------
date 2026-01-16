<?php
/**
 * Auth Service
 * Business logic for authentication operations
 */

require_once __DIR__ . '/BaseService.php';
require_once __DIR__ . '/../utils/AuditLogger.php';
require_once __DIR__ . '/../utils/InputSanitizer.php';

class AuthService extends BaseService {

    /**
     * Authenticate user and return token
     */
    public function login(string $username, string $password): array {
        $username = InputSanitizer::sanitizeString(trim($username));

        if (strlen($username) < 3 || strlen($username) > 50) {
            AuditLogger::logAuth('LOGIN_FAILED', null, ['reason' => 'invalid_username_format']);
            throw new AuthException('اسم المستخدم أو كلمة المرور غير صحيحة');
        }

        $stmt = $this->db->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            AuditLogger::logAuth('LOGIN_FAILED', $user['id'] ?? null, [
                'reason' => 'invalid_credentials',
                'username' => $username
            ]);
            throw new AuthException('اسم المستخدم أو كلمة المرور غير صحيحة');
        }

        $token = AuthMiddleware::generateToken([
            'user_id' => $user['id'],
            'username' => $user['username']
        ]);

        AuditLogger::logAuth('LOGIN_SUCCESS', $user['id'], ['username' => $user['username']]);

        return [
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username']
            ],
            'expiresIn' => AuthMiddleware::getTokenExpiry()
        ];
    }

    /**
     * Verify token and return user data
     */
    public function verifyToken(string $token): ?array {
        $payload = AuthMiddleware::verifyToken($token);

        if (!$payload) {
            return null;
        }

        $newToken = AuthMiddleware::refreshToken($token);

        return [
            'valid' => true,
            'user' => [
                'id' => $payload['user_id'],
                'username' => $payload['username']
            ],
            'token' => $newToken,
            'expiresIn' => AuthMiddleware::getTokenExpiry()
        ];
    }

    /**
     * Change user password
     */
    public function changePassword(int $userId, string $currentPassword, string $newPassword): bool {
        $passwordErrors = $this->validatePasswordStrength($newPassword);
        if (!empty($passwordErrors)) {
            throw new ValidationException($passwordErrors[0]);
        }

        $stmt = $this->db->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            throw new NotFoundException('المستخدم غير موجود');
        }

        if (!password_verify($currentPassword, $user['password_hash'])) {
            AuditLogger::logAuth('PASSWORD_CHANGE_FAILED', $userId, ['reason' => 'wrong_current_password']);
            throw new AuthException('كلمة المرور الحالية غير صحيحة');
        }

        $newHash = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        $stmt = $this->db->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$newHash, $userId]);

        AuditLogger::logAuth('PASSWORD_CHANGED', $userId);

        return true;
    }

    /**
     * Validate password strength
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
}
