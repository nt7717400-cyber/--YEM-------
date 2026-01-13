<?php
require_once __DIR__ . '/config/database.php';

$db = (new Database())->getConnection();
$stmt = $db->query('SELECT id, username, password_hash FROM users LIMIT 1');
$user = $stmt->fetch();

echo "User: " . $user['username'] . "\n";
echo "Hash: " . substr($user['password_hash'], 0, 30) . "...\n";

// Test password
$testPasswords = ['admin123', 'admin', 'password', '123456', 'Admin123'];
foreach ($testPasswords as $pass) {
    if (password_verify($pass, $user['password_hash'])) {
        echo "✓ Password is: {$pass}\n";
        break;
    }
}
