<?php
/**
 * Production Database Configuration for Hostinger
 * معرض وحدة اليمن للسيارات
 * 
 * Domain: fazaacaetg.com
 * 
 * ⚠️ IMPORTANT: Rename this file to database.php before uploading to Hostinger
 */

return [
    // Database Host - Always 'localhost' on Hostinger shared hosting
    'host' => 'localhost',
    
    // Database Name
    'database' => 'u879102301_galal2',
    
    // Database Username
    'username' => 'u879102301_galal2',
    
    // Database Password
    'password' => 'Aa900800@@',
    
    // Character Set
    'charset' => 'utf8mb4',
    
    // Collation
    'collation' => 'utf8mb4_unicode_ci',
    
    // Table Prefix (optional)
    'prefix' => '',
    
    // PDO Options
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ],
];
