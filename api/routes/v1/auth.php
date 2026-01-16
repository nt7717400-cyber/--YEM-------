<?php
/**
 * Auth Routes - API v1
 * Authentication endpoints
 */

return function($uri, $method, $db, $authService) {
    
    // POST /auth/login
    if (preg_match('#^/auth/login$#', $uri) && $method === 'POST') {
        if (!RateLimiter::check('login')) exit;
        
        $data = Response::getJsonInput();
        
        if (empty($data['username']) || empty($data['password'])) {
            AuditLogger::logAuth('LOGIN_FAILED', null, ['reason' => 'missing_credentials']);
            Response::error('يرجى إدخال اسم المستخدم وكلمة المرور', 400, 'VAL_001');
        }

        try {
            $result = $authService->login($data['username'], $data['password']);
            Response::success($result);
        } catch (AuthException $e) {
            Response::error($e->getMessage(), 401, 'AUTH_001');
        } catch (PDOException $e) {
            AuditLogger::logAuth('LOGIN_ERROR', null, ['error' => $e->getMessage()]);
            Response::error('حدث خطأ في تسجيل الدخول', 500, 'SRV_001');
        }
        return true;
    }

    // POST /auth/logout
    if (preg_match('#^/auth/logout$#', $uri) && $method === 'POST') {
        AuthMiddleware::authenticate();
        AuditLogger::logAuth('LOGOUT', AuthMiddleware::getUserId());
        Response::success(['message' => 'تم تسجيل الخروج بنجاح']);
        return true;
    }

    // GET /auth/verify
    if (preg_match('#^/auth/verify$#', $uri) && $method === 'GET') {
        $headers = getAuthorizationHeader();
        
        if (!$headers) {
            Response::success(['valid' => false, 'message' => 'لم يتم توفير رمز المصادقة']);
        }

        $token = null;
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            $token = $matches[1];
        }

        if (!$token) {
            Response::success(['valid' => false, 'message' => 'رمز المصادقة غير صالح']);
        }

        try {
            $result = $authService->verifyToken($token);
            if (!$result) {
                Response::success(['valid' => false, 'message' => 'انتهت صلاحية الجلسة']);
            }
            Response::success($result);
        } catch (Exception $e) {
            Response::success(['valid' => false, 'message' => 'خطأ في التحقق']);
        }
        return true;
    }

    // PUT /auth/password
    if (preg_match('#^/auth/password$#', $uri) && $method === 'PUT') {
        AuthMiddleware::authenticate();
        
        $data = Response::getJsonInput();
        
        if (empty($data['currentPassword']) || empty($data['newPassword'])) {
            Response::error('يرجى إدخال كلمة المرور الحالية والجديدة', 400, 'VAL_001');
        }

        try {
            $userId = AuthMiddleware::getUserId();
            $authService->changePassword($userId, $data['currentPassword'], $data['newPassword']);
            Response::success(['message' => 'تم تغيير كلمة المرور بنجاح']);
        } catch (ValidationException $e) {
            Response::error($e->getMessage(), 400, 'VAL_001');
        } catch (AuthException $e) {
            Response::error($e->getMessage(), 400, 'AUTH_001');
        } catch (NotFoundException $e) {
            Response::error($e->getMessage(), 404, 'AUTH_003');
        } catch (PDOException $e) {
            Response::error('حدث خطأ في تغيير كلمة المرور', 500, 'SRV_001');
        }
        return true;
    }

    return false;
};

/**
 * Get Authorization header helper
 */
function getAuthorizationHeader() {
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
