<?php
/**
 * Custom Application Exceptions
 * Used by Service Layer for proper error handling
 */

/**
 * Validation Exception - for input validation errors
 */
class ValidationException extends Exception {
    private $errors;

    public function __construct(string $message, array $errors = []) {
        parent::__construct($message);
        $this->errors = $errors;
    }

    public function getErrors(): array {
        return $this->errors;
    }
}

/**
 * Not Found Exception - for missing resources
 */
class NotFoundException extends Exception {
    public function __construct(string $message = 'المورد غير موجود') {
        parent::__construct($message);
    }
}

/**
 * Auth Exception - for authentication errors
 */
class AuthException extends Exception {
    public function __construct(string $message = 'خطأ في المصادقة') {
        parent::__construct($message);
    }
}

/**
 * Forbidden Exception - for authorization errors
 */
class ForbiddenException extends Exception {
    public function __construct(string $message = 'غير مصرح لك بهذا الإجراء') {
        parent::__construct($message);
    }
}
