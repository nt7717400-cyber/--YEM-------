-- Seed data with proper UTF-8 encoding
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

USE yemen_cars;

-- Insert default settings
INSERT INTO settings (id, name, description, address, phone, whatsapp, working_hours)
VALUES (
    'main',
    'معرض وحدة اليمن للسيارات',
    'معرض متخصص في بيع السيارات الجديدة والمستعملة بأفضل الأسعار وأعلى جودة. نقدم خدمات متميزة لعملائنا مع ضمان الجودة والمصداقية.',
    'صنعاء - شارع الستين',
    '+967777123456',
    '+967777123456',
    'السبت - الخميس: 8:00 صباحاً - 8:00 مساءً'
) ON DUPLICATE KEY UPDATE id = id;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash)
VALUES ('admin', '$2y$10$KHHTnwEmd4iP2w0wbFZnP.Y35qM6UWh2rlBCr5WYXT3.bjW8Cs.Bu')
ON DUPLICATE KEY UPDATE username = username;

-- No sample cars - add real data through admin panel
