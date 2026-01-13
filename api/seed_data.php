<?php
/**
 * Seed database with Arabic data
 */

require_once __DIR__ . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

// Clear existing data
$db->exec("DELETE FROM car_images");
$db->exec("DELETE FROM cars");
$db->exec("DELETE FROM settings");
$db->exec("DELETE FROM users");

// Insert settings
$stmt = $db->prepare("INSERT INTO settings (id, name, description, address, phone, whatsapp, working_hours) VALUES (?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([
    'main',
    'معرض وحدة اليمن للسيارات',
    'معرض متخصص في بيع السيارات الجديدة والمستعملة بأفضل الأسعار وأعلى جودة. نقدم خدمات متميزة لعملائنا مع ضمان الجودة والمصداقية.',
    'صنعاء - شارع الستين',
    '+967777123456',
    '+967777123456',
    'السبت - الخميس: 8:00 صباحاً - 8:00 مساءً'
]);

// Insert admin user
$stmt = $db->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
$stmt->execute(['admin', '$2y$10$KHHTnwEmd4iP2w0wbFZnP.Y35qM6UWh2rlBCr5WYXT3.bjW8Cs.Bu']);

// Insert sample cars
$cars = [
    ['تويوتا كامري 2024', 'Toyota', 'Camry', 2024, 35000.00, 'NEW', null, 'سيارة تويوتا كامري موديل 2024 جديدة بالكامل، فل كامل مع جميع الإضافات.', 'المحرك: 2.5 لتر 4 سلندر - القوة: 203 حصان - ناقل الحركة: أوتوماتيك 8 سرعات', 'AVAILABLE', 1, 150],
    ['هوندا أكورد 2023', 'Honda', 'Accord', 2023, 32000.00, 'NEW', null, 'هوندا أكورد 2023 سبورت، تصميم أنيق وأداء متميز.', 'المحرك: 1.5 لتر تيربو - القوة: 192 حصان - ناقل الحركة: CVT', 'AVAILABLE', 1, 120],
    ['نيسان التيما 2022', 'Nissan', 'Altima', 2022, 25000.00, 'USED', 35000, 'نيسان التيما 2022 مستخدمة بحالة ممتازة، صيانة دورية في الوكالة.', 'المحرك: 2.5 لتر 4 سلندر - القوة: 188 حصان - ناقل الحركة: CVT', 'AVAILABLE', 0, 85],
    ['هيونداي سوناتا 2023', 'Hyundai', 'Sonata', 2023, 28000.00, 'NEW', null, 'هيونداي سوناتا 2023 فل كامل مع نظام ملاحة وكاميرا خلفية.', 'المحرك: 2.5 لتر 4 سلندر - القوة: 191 حصان - ناقل الحركة: أوتوماتيك 8 سرعات', 'AVAILABLE', 1, 95],
    ['تويوتا لاندكروزر 2023', 'Toyota', 'Land Cruiser', 2023, 85000.00, 'NEW', null, 'تويوتا لاندكروزر 2023 VXR، سيارة دفع رباعي فاخرة.', 'المحرك: 3.5 لتر V6 تيربو - القوة: 409 حصان - ناقل الحركة: أوتوماتيك 10 سرعات', 'AVAILABLE', 1, 200],
];

$stmt = $db->prepare("INSERT INTO cars (name, brand, model, year, price, car_condition, kilometers, description, specifications, status, is_featured, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

foreach ($cars as $car) {
    $stmt->execute($car);
}

echo json_encode(['success' => true, 'message' => 'Data seeded successfully'], JSON_UNESCAPED_UNICODE);
