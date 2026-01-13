<?php
/**
 * Input Sanitizer Utility
 * Sanitizes and validates user input to prevent XSS and injection attacks
 * SECURITY: Critical for protecting against XSS, SQL injection, and other attacks
 */

class InputSanitizer {
    
    /**
     * Sanitize a string for safe output (XSS prevention)
     * @param string|null $input The input string
     * @param bool $allowHtml Whether to allow safe HTML tags
     * @return string Sanitized string
     */
    public static function sanitizeString(?string $input, bool $allowHtml = false): string {
        if ($input === null) {
            return '';
        }
        
        // Remove null bytes
        $input = str_replace("\0", '', $input);
        
        // Trim whitespace
        $input = trim($input);
        
        if ($allowHtml) {
            // Allow only safe HTML tags
            $allowedTags = '<p><br><b><i><u><strong><em><ul><ol><li><a><span>';
            $input = strip_tags($input, $allowedTags);
            
            // Remove dangerous attributes
            $input = preg_replace('/\s*on\w+\s*=\s*["\'][^"\']*["\']/i', '', $input);
            $input = preg_replace('/\s*javascript\s*:/i', '', $input);
        } else {
            // Escape all HTML
            $input = htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        }
        
        return $input;
    }
    
    /**
     * Sanitize an integer
     * @param mixed $input The input value
     * @param int|null $min Minimum allowed value
     * @param int|null $max Maximum allowed value
     * @return int|null Sanitized integer or null if invalid
     */
    public static function sanitizeInt($input, ?int $min = null, ?int $max = null): ?int {
        if ($input === null || $input === '') {
            return null;
        }
        
        $value = filter_var($input, FILTER_VALIDATE_INT);
        
        if ($value === false) {
            return null;
        }
        
        if ($min !== null && $value < $min) {
            return $min;
        }
        
        if ($max !== null && $value > $max) {
            return $max;
        }
        
        return $value;
    }
    
    /**
     * Sanitize a float
     * @param mixed $input The input value
     * @param float|null $min Minimum allowed value
     * @param float|null $max Maximum allowed value
     * @return float|null Sanitized float or null if invalid
     */
    public static function sanitizeFloat($input, ?float $min = null, ?float $max = null): ?float {
        if ($input === null || $input === '') {
            return null;
        }
        
        $value = filter_var($input, FILTER_VALIDATE_FLOAT);
        
        if ($value === false) {
            return null;
        }
        
        if ($min !== null && $value < $min) {
            return $min;
        }
        
        if ($max !== null && $value > $max) {
            return $max;
        }
        
        return $value;
    }
    
    /**
     * Sanitize an email address
     * @param string|null $input The input email
     * @return string|null Sanitized email or null if invalid
     */
    public static function sanitizeEmail(?string $input): ?string {
        if ($input === null || $input === '') {
            return null;
        }
        
        $email = filter_var(trim($input), FILTER_SANITIZE_EMAIL);
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return null;
        }
        
        return strtolower($email);
    }
    
    /**
     * Sanitize a URL
     * @param string|null $input The input URL
     * @param array $allowedSchemes Allowed URL schemes
     * @return string|null Sanitized URL or null if invalid
     */
    public static function sanitizeUrl(?string $input, array $allowedSchemes = ['http', 'https']): ?string {
        if ($input === null || $input === '') {
            return null;
        }
        
        $url = filter_var(trim($input), FILTER_SANITIZE_URL);
        
        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            // Allow relative URLs starting with /
            if (preg_match('/^\/[a-zA-Z0-9\-_\/\.]*$/', $input)) {
                return $input;
            }
            return null;
        }
        
        // Check scheme
        $scheme = parse_url($url, PHP_URL_SCHEME);
        if (!in_array(strtolower($scheme), $allowedSchemes)) {
            return null;
        }
        
        return $url;
    }
    
    /**
     * Sanitize a phone number
     * @param string|null $input The input phone number
     * @return string|null Sanitized phone number
     */
    public static function sanitizePhone(?string $input): ?string {
        if ($input === null || $input === '') {
            return null;
        }
        
        // Remove all non-numeric characters except + at the start
        $phone = preg_replace('/[^\d+]/', '', $input);
        
        // Ensure + is only at the start
        if (strpos($phone, '+') !== false && strpos($phone, '+') !== 0) {
            $phone = str_replace('+', '', $phone);
        }
        
        // Validate length (7-15 digits)
        $digits = preg_replace('/\D/', '', $phone);
        if (strlen($digits) < 7 || strlen($digits) > 15) {
            return null;
        }
        
        return $phone;
    }
    
    /**
     * Sanitize a filename
     * @param string|null $input The input filename
     * @return string Sanitized filename
     */
    public static function sanitizeFilename(?string $input): string {
        if ($input === null || $input === '') {
            return 'unnamed';
        }
        
        // Remove path components
        $filename = basename($input);
        
        // Remove dangerous characters
        $filename = preg_replace('/[^a-zA-Z0-9\-_\.]/', '_', $filename);
        
        // Remove multiple dots (prevent extension spoofing)
        $filename = preg_replace('/\.+/', '.', $filename);
        
        // Limit length
        if (strlen($filename) > 255) {
            $ext = pathinfo($filename, PATHINFO_EXTENSION);
            $name = pathinfo($filename, PATHINFO_FILENAME);
            $filename = substr($name, 0, 250 - strlen($ext)) . '.' . $ext;
        }
        
        return $filename ?: 'unnamed';
    }
    
    /**
     * Sanitize an array of values
     * @param array $input The input array
     * @param string $type The type of sanitization (string, int, float, email, url)
     * @return array Sanitized array
     */
    public static function sanitizeArray(array $input, string $type = 'string'): array {
        $result = [];
        
        foreach ($input as $key => $value) {
            $sanitizedKey = self::sanitizeString((string)$key);
            
            switch ($type) {
                case 'int':
                    $result[$sanitizedKey] = self::sanitizeInt($value);
                    break;
                case 'float':
                    $result[$sanitizedKey] = self::sanitizeFloat($value);
                    break;
                case 'email':
                    $result[$sanitizedKey] = self::sanitizeEmail($value);
                    break;
                case 'url':
                    $result[$sanitizedKey] = self::sanitizeUrl($value);
                    break;
                default:
                    $result[$sanitizedKey] = self::sanitizeString($value);
            }
        }
        
        return $result;
    }
    
    /**
     * Validate and sanitize JSON input
     * @param string|null $json The JSON string
     * @return array|null Decoded and sanitized array or null if invalid
     */
    public static function sanitizeJson(?string $json): ?array {
        if ($json === null || $json === '') {
            return null;
        }
        
        $data = json_decode($json, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }
        
        return self::sanitizeArrayRecursive($data);
    }
    
    /**
     * Recursively sanitize an array
     * @param mixed $data The data to sanitize
     * @return mixed Sanitized data
     */
    private static function sanitizeArrayRecursive($data) {
        if (is_array($data)) {
            $result = [];
            foreach ($data as $key => $value) {
                $sanitizedKey = is_string($key) ? self::sanitizeString($key) : $key;
                $result[$sanitizedKey] = self::sanitizeArrayRecursive($value);
            }
            return $result;
        }
        
        if (is_string($data)) {
            return self::sanitizeString($data);
        }
        
        return $data;
    }
    
    /**
     * Check if a value is in an allowed list (whitelist validation)
     * @param mixed $value The value to check
     * @param array $allowed The allowed values
     * @param bool $caseSensitive Whether comparison is case-sensitive
     * @return bool True if value is allowed
     */
    public static function isAllowed($value, array $allowed, bool $caseSensitive = true): bool {
        if (!$caseSensitive && is_string($value)) {
            $value = strtolower($value);
            $allowed = array_map('strtolower', $allowed);
        }
        
        return in_array($value, $allowed, true);
    }
    
    /**
     * Validate a date string
     * @param string|null $input The date string
     * @param string $format Expected format (default: Y-m-d H:i:s)
     * @return string|null Validated date string or null if invalid
     */
    public static function sanitizeDate(?string $input, string $format = 'Y-m-d H:i:s'): ?string {
        if ($input === null || $input === '') {
            return null;
        }
        
        $date = \DateTime::createFromFormat($format, $input);
        
        if (!$date || $date->format($format) !== $input) {
            // Try ISO 8601 format
            $date = \DateTime::createFromFormat(\DateTime::ATOM, $input);
            if (!$date) {
                // Try common formats
                $formats = ['Y-m-d', 'Y-m-d\TH:i:s', 'Y-m-d\TH:i:sP', 'd/m/Y', 'd-m-Y'];
                foreach ($formats as $fmt) {
                    $date = \DateTime::createFromFormat($fmt, $input);
                    if ($date) break;
                }
            }
        }
        
        if (!$date) {
            return null;
        }
        
        return $date->format($format);
    }
}
