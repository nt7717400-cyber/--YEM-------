<?php
/**
 * Phone Masking Utility
 * Masks phone numbers for privacy protection
 * Requirements: 5.1, 5.3
 */

class PhoneMasking {
    /**
     * Mask a phone number showing only first 3 and last 3 digits
     * Example: 777123456 → 777***456
     * 
     * @param string $phoneNumber The phone number to mask
     * @return string The masked phone number
     */
    public static function mask(string $phoneNumber): string {
        // Remove any non-digit characters for processing
        $digits = preg_replace('/[^0-9]/', '', $phoneNumber);
        
        $length = strlen($digits);
        
        // If phone number is too short (6 or less digits), mask middle portion
        if ($length <= 6) {
            if ($length <= 3) {
                return str_repeat('*', $length);
            }
            // For 4-6 digits, show first 2 and last 1
            $first = substr($digits, 0, 2);
            $last = substr($digits, -1);
            $middleLength = $length - 3;
            return $first . str_repeat('*', max(1, $middleLength)) . $last;
        }
        
        // Standard masking: first 3 + asterisks + last 3
        $first = substr($digits, 0, 3);
        $last = substr($digits, -3);
        $middleLength = $length - 6;
        
        return $first . str_repeat('*', max(3, $middleLength)) . $last;
    }
    
    /**
     * Validate phone number format
     * Accepts Yemeni phone numbers (9 digits starting with 7)
     * Also accepts international format with country code
     * 
     * @param string $phoneNumber The phone number to validate
     * @return bool True if valid, false otherwise
     */
    public static function isValid(string $phoneNumber): bool {
        // Remove any non-digit characters
        $digits = preg_replace('/[^0-9]/', '', $phoneNumber);
        
        // Check for valid Yemeni phone number patterns:
        // - 9 digits starting with 7 (local format: 777123456)
        // - 12 digits starting with 967 (international: 967777123456)
        if (strlen($digits) === 9 && $digits[0] === '7') {
            return true;
        }
        
        if (strlen($digits) === 12 && substr($digits, 0, 3) === '967') {
            return true;
        }
        
        // Also accept general phone numbers (7-15 digits)
        if (strlen($digits) >= 7 && strlen($digits) <= 15) {
            return true;
        }
        
        return false;
    }
}
