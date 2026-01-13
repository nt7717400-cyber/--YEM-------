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
);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, password_hash)
VALUES ('admin', '$2y$10$KHHTnwEmd4iP2w0wbFZnP.Y35qM6UWh2rlBCr5WYXT3.bjW8Cs.Bu');

-- Sample cars data
INSERT INTO cars (name, brand, model, year, price, car_condition, kilometers, description, specifications, status, is_featured, view_count)
VALUES
    ('تويوتا كامري 2024', 'Toyota', 'Camry', 2024, 35000.00, 'NEW', NULL, 
     'سيارة تويوتا كامري موديل 2024 جديدة بالكامل، فل كامل مع جميع الإضافات.',
     'المحرك: 2.5 لتر 4 سلندر\nالقوة: 203 حصان\nناقل الحركة: أوتوماتيك 8 سرعات\nنظام الدفع: أمامي',
     'AVAILABLE', 1, 150),
    
    ('هوندا أكورد 2023', 'Honda', 'Accord', 2023, 32000.00, 'NEW', NULL,
     'هوندا أكورد 2023 سبورت، تصميم أنيق وأداء متميز.',
     'المحرك: 1.5 لتر تيربو\nالقوة: 192 حصان\nناقل الحركة: CVT\nنظام الدفع: أمامي',
     'AVAILABLE', 1, 120),
    
    ('نيسان التيما 2022', 'Nissan', 'Altima', 2022, 25000.00, 'USED', 35000,
     'نيسان التيما 2022 مستخدمة بحالة ممتازة، صيانة دورية في الوكالة.',
     'المحرك: 2.5 لتر 4 سلندر\nالقوة: 188 حصان\nناقل الحركة: CVT\nنظام الدفع: أمامي',
     'AVAILABLE', 0, 85),
    
    ('هيونداي سوناتا 2023', 'Hyundai', 'Sonata', 2023, 28000.00, 'NEW', NULL,
     'هيونداي سوناتا 2023 فل كامل مع نظام ملاحة وكاميرا خلفية.',
     'المحرك: 2.5 لتر 4 سلندر\nالقوة: 191 حصان\nناقل الحركة: أوتوماتيك 8 سرعات\nنظام الدفع: أمامي',
     'AVAILABLE', 1, 95),
    
    ('كيا K5 2024', 'Kia', 'K5', 2024, 30000.00, 'NEW', NULL,
     'كيا K5 موديل 2024 GT-Line، تصميم رياضي وتقنيات متقدمة.',
     'المحرك: 1.6 لتر تيربو\nالقوة: 180 حصان\nناقل الحركة: أوتوماتيك 8 سرعات\nنظام الدفع: أمامي',
     'AVAILABLE', 0, 70),
    
    ('تويوتا لاندكروزر 2023', 'Toyota', 'Land Cruiser', 2023, 85000.00, 'NEW', NULL,
     'تويوتا لاندكروزر 2023 VXR، سيارة دفع رباعي فاخرة.',
     'المحرك: 3.5 لتر V6 تيربو\nالقوة: 409 حصان\nناقل الحركة: أوتوماتيك 10 سرعات\nنظام الدفع: رباعي',
     'AVAILABLE', 1, 200);
