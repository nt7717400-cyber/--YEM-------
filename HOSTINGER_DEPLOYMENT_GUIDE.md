# 📚 دليل نشر مشروع معرض وحدة اليمن للسيارات على Hostinger
# Yemen Unity Car Showroom - Complete Hostinger Deployment Guide

---

## 📋 جدول المحتويات

1. [نظرة عامة على المشروع](#1-نظرة-عامة-على-المشروع)
2. [تحضير المشروع محلياً](#2-تحضير-المشروع-محلياً)
3. [الوصول إلى Hostinger](#3-الوصول-إلى-hostinger)
4. [رفع الملفات](#4-رفع-الملفات)
5. [إعداد قاعدة البيانات](#5-إعداد-قاعدة-البيانات)
6. [إعداد الدومين والروابط](#6-إعداد-الدومين-والروابط)
7. [إعداد DNS](#7-إعداد-dns)
8. [قائمة التحقق النهائية](#8-قائمة-التحقق-النهائية)
9. [الأخطاء الشائعة وحلولها](#9-الأخطاء-الشائعة-وحلولها)
10. [الصيانة والتحديثات](#10-الصيانة-والتحديثات)

---

## 🔐 بيانات الاعتماد (Credentials)

```
🌐 Domain: fazaacaetg.com
🗄️ Database Name: u879102301_galal2
👤 Database User: u879102301_galal2
🔑 Database Password: Aa900800@@
🖥️ Host: localhost
```

---

## 1. نظرة عامة على المشروع

### 1.1 وصف المشروع
معرض وحدة اليمن للسيارات - تطبيق ويب لعرض وإدارة السيارات والمزادات.

### 1.2 مكونات المشروع

| المكون | التقنية | الوصف |
|--------|---------|-------|
| Backend API | PHP 8.x | واجهة برمجة التطبيقات |
| Frontend | Next.js (Static Export) | واجهة المستخدم |
| Database | MySQL | قاعدة البيانات |
| Mobile | Flutter | تطبيق الجوال |

### 1.3 بيئة الإنتاج vs المحلية

| الإعداد | محلي (Local) | إنتاج (Production) |
|---------|--------------|-------------------|
| API URL | http://localhost:8000 | https://fazaacaetg.com/api |
| DB Host | localhost | localhost |
| Debug | true | false |
| HTTPS | لا | نعم |

---

## 2. تحضير المشروع محلياً

### 2.1 هيكل المجلدات المطلوب للرفع

```
fazaacaetg.com/
├── public_html/                    # المجلد الرئيسي للموقع
│   ├── api/                        # ملفات PHP API
│   │   ├── index.php              # نقطة الدخول الرئيسية
│   │   ├── router.php             # موجه الطلبات
│   │   ├── .htaccess              # إعدادات Apache
│   │   ├── config/                # ملفات الإعدادات
│   │   │   └── database.php       # إعدادات قاعدة البيانات
│   │   ├── controllers/           # المتحكمات
│   │   ├── middleware/            # الوسيطات
│   │   ├── database/              # ملفات قاعدة البيانات
│   │   ├── utils/                 # الأدوات المساعدة
│   │   ├── uploads/               # مجلد الملفات المرفوعة
│   │   │   ├── images/
│   │   │   ├── videos/
│   │   │   └── banners/
│   │   └── vendor/                # مكتبات Composer
│   │
│   ├── _next/                     # ملفات Next.js المبنية
│   ├── index.html                 # الصفحة الرئيسية
│   ├── cars/                      # صفحات السيارات
│   ├── auctions/                  # صفحات المزادات
│   ├── admin/                     # لوحة التحكم
│   └── .htaccess                  # إعدادات الموقع الرئيسي
```

### 2.2 بناء Frontend (Next.js)

```bash
# الانتقال لمجلد Frontend
cd frontend

# تثبيت المكتبات
npm install

# تعديل ملف .env.local للإنتاج
# NEXT_PUBLIC_API_URL=https://fazaacaetg.com/api

# بناء المشروع للإنتاج (Static Export)
npm run build
```

### 2.3 تحضير Backend (PHP API)

```bash
# الانتقال لمجلد API
cd api

# تثبيت مكتبات Composer
composer install --no-dev --optimize-autoloader
```

### 2.4 ملفات الإعدادات المطلوب تعديلها

#### ملف `api/config/database.php`:
```php
<?php
return [
    'host' => 'localhost',
    'database' => 'u879102301_galal2',
    'username' => 'u879102301_galal2',
    'password' => 'Aa900800@@',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
];
```

#### ملف `api/.env`:
```env
DB_HOST=localhost
DB_DATABASE=u879102301_galal2
DB_USERNAME=u879102301_galal2
DB_PASSWORD=Aa900800@@

APP_ENV=production
APP_DEBUG=false
APP_URL=https://fazaacaetg.com
```

---

## 3. الوصول إلى Hostinger

### 3.1 تسجيل الدخول إلى hPanel

1. افتح المتصفح وانتقل إلى: `https://hpanel.hostinger.com`
2. أدخل بيانات حسابك
3. اختر الموقع: `fazaacaetg.com`

### 3.2 الوصول إلى File Manager

1. من لوحة التحكم hPanel
2. انقر على **"File Manager"** أو **"مدير الملفات"**
3. ستفتح نافذة جديدة تعرض ملفات الموقع
4. المجلد الرئيسي: `/public_html`

### 3.3 الوصول عبر FTP (اختياري)

```
Host: ftp.fazaacaetg.com
Username: (من hPanel → FTP Accounts)
Password: (كلمة المرور التي أنشأتها)
Port: 21
```

**برامج FTP الموصى بها:**
- FileZilla (مجاني)
- WinSCP (Windows)
- Cyberduck (Mac)

---

## 4. رفع الملفات

### 4.1 الملفات المطلوب رفعها ✅

```
✅ api/index.php
✅ api/router.php
✅ api/.htaccess
✅ api/config/ (المجلد بالكامل)
✅ api/controllers/ (المجلد بالكامل)
✅ api/middleware/ (المجلد بالكامل)
✅ api/database/ (المجلد بالكامل)
✅ api/utils/ (المجلد بالكامل)
✅ api/vendor/ (المجلد بالكامل)
✅ api/uploads/ (مجلد فارغ مع الصلاحيات)

✅ frontend/out/* (جميع ملفات البناء)
✅ _next/
✅ index.html
✅ جميع صفحات HTML
```

### 4.2 الملفات التي يجب عدم رفعها ❌

```
❌ .git/
❌ node_modules/
❌ .env.example
❌ .env.local
❌ frontend/src/ (ملفات المصدر)
❌ mobile/ (تطبيق Flutter)
❌ *.log
❌ .DS_Store
❌ Thumbs.db
❌ api/tests/
❌ api/.phpunit.cache/
```

### 4.3 خطوات الرفع

#### الخطوة 1: رفع ملفات API
1. افتح File Manager
2. انتقل إلى `/public_html`
3. أنشئ مجلد `api`
4. ارفع جميع ملفات API داخله

#### الخطوة 2: رفع ملفات Frontend
1. من مجلد `frontend/out/`
2. ارفع جميع المحتويات إلى `/public_html`

#### الخطوة 3: ضبط الصلاحيات

```
📁 المجلدات: 755
📄 الملفات: 644
📁 uploads/: 755 (للكتابة)
```

**من File Manager:**
1. انقر بزر الماوس الأيمن على المجلد/الملف
2. اختر "Permissions" أو "Change Permissions"
3. أدخل القيمة المطلوبة

---

## 5. إعداد قاعدة البيانات

### 5.1 إنشاء قاعدة البيانات (إذا لم تكن موجودة)

1. من hPanel → **Databases** → **MySQL Databases**
2. قاعدة البيانات موجودة مسبقاً: `u879102301_galal2`

### 5.2 بيانات الاتصال

```php
<?php
// api/config/database.php

return [
    'host'      => 'localhost',
    'database'  => 'u879102301_galal2',
    'username'  => 'u879102301_galal2',
    'password'  => 'Aa900800@@',
    'charset'   => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix'    => '',
];
```

### 5.3 استيراد قاعدة البيانات

#### الطريقة 1: من phpMyAdmin
1. من hPanel → **Databases** → **phpMyAdmin**
2. اختر قاعدة البيانات: `u879102301_galal2`
3. انقر على **Import**
4. اختر ملف SQL من جهازك
5. انقر **Go**

#### الطريقة 2: تشغيل Migration
```
https://fazaacaetg.com/api/run_migration.php
```

### 5.4 اختبار الاتصال

أنشئ ملف `api/check_db.php`:
```php
<?php
$config = require __DIR__ . '/config/database.php';

try {
    $pdo = new PDO(
        "mysql:host={$config['host']};dbname={$config['database']};charset={$config['charset']}",
        $config['username'],
        $config['password']
    );
    echo "✅ Database connection successful!";
} catch (PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage();
}
```

افتح: `https://fazaacaetg.com/api/check_db.php`

**⚠️ مهم: احذف هذا الملف بعد التأكد من الاتصال!**

---

## 6. إعداد الدومين والروابط

### 6.1 ملف .htaccess الرئيسي

أنشئ ملف `/public_html/.htaccess`:
```apache
# Enable Rewrite Engine
RewriteEngine On
RewriteBase /

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Remove www
RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

# API Routing - Forward /api requests to api folder
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ /api/index.php [L,QSA]

# Frontend - Handle Next.js static files
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Gzip Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css
    AddOutputFilterByType DEFLATE application/javascript application/json
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 6.2 ملف .htaccess للـ API

أنشئ ملف `/public_html/api/.htaccess`:
```apache
RewriteEngine On
RewriteBase /api/

# Handle API requests
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [L,QSA]

# CORS Headers
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Protect sensitive files
<FilesMatch "\.(env|log|sql)$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

### 6.3 تحديث روابط API في Frontend

تأكد من أن ملف `frontend/.env.local` يحتوي على:
```env
NEXT_PUBLIC_API_URL=https://fazaacaetg.com/api
```

---

## 7. إعداد DNS

### 7.1 Nameservers (إذا كان الدومين من مزود آخر)

إذا اشتريت الدومين من مكان آخر، عدّل Nameservers إلى:
```
ns1.hostinger.com
ns2.hostinger.com
```

### 7.2 سجلات DNS (إذا كان الدومين في Hostinger)

| النوع | الاسم | القيمة | TTL |
|-------|-------|--------|-----|
| A | @ | (IP من hPanel) | 14400 |
| A | www | (IP من hPanel) | 14400 |
| CNAME | www | fazaacaetg.com | 14400 |

### 7.3 التحقق من DNS

```bash
# من Terminal أو CMD
nslookup fazaacaetg.com
ping fazaacaetg.com
```

### 7.4 وقت الانتشار (Propagation)

- عادةً: 15 دقيقة - 4 ساعات
- أقصى حد: 24-48 ساعة

### 7.5 تفعيل SSL (HTTPS)

1. من hPanel → **SSL**
2. انقر **Install SSL** أو **Setup**
3. اختر **Let's Encrypt** (مجاني)
4. انقر **Install**
5. فعّل **Force HTTPS**

---

## 8. قائمة التحقق النهائية

### ✅ قبل الإطلاق

- [ ] جميع الملفات مرفوعة
- [ ] قاعدة البيانات متصلة
- [ ] ملفات .htaccess موجودة
- [ ] SSL مفعّل
- [ ] صلاحيات المجلدات صحيحة

### ✅ اختبار الموقع

- [ ] الصفحة الرئيسية تعمل: `https://fazaacaetg.com`
- [ ] API يعمل: `https://fazaacaetg.com/api/settings`
- [ ] صفحة السيارات: `https://fazaacaetg.com/cars`
- [ ] لوحة التحكم: `https://fazaacaetg.com/admin`
- [ ] الصور تظهر بشكل صحيح
- [ ] لا توجد أخطاء في Console

### ✅ الأمان

- [ ] حذف ملفات الاختبار (check_db.php)
- [ ] APP_DEBUG = false
- [ ] ملفات .env محمية
- [ ] كلمات المرور قوية

---

## 9. الأخطاء الشائعة وحلولها

### 🔴 خطأ 403 Forbidden

**الأسباب:**
- صلاحيات خاطئة
- ملف .htaccess تالف
- index.php غير موجود

**الحل:**
```bash
# تعديل الصلاحيات
chmod 755 /public_html
chmod 644 /public_html/index.html
chmod 755 /public_html/api
```

### 🔴 خطأ 404 Not Found

**الأسباب:**
- الملف غير موجود
- مسار خاطئ
- .htaccess لا يعمل

**الحل:**
1. تأكد من وجود الملف
2. تحقق من .htaccess
3. تأكد من تفعيل mod_rewrite

### 🔴 خطأ 500 Internal Server Error

**الأسباب:**
- خطأ في PHP
- .htaccess تالف
- صلاحيات خاطئة

**الحل:**
1. تحقق من error_log
2. راجع .htaccess
3. تأكد من إصدار PHP (8.x)

### 🔴 خطأ اتصال قاعدة البيانات

**الأسباب:**
- بيانات خاطئة
- قاعدة البيانات غير موجودة
- المستخدم ليس له صلاحيات

**الحل:**
```php
// تأكد من البيانات
'host' => 'localhost',  // ليس 127.0.0.1
'database' => 'u879102301_galal2',
'username' => 'u879102301_galal2',
'password' => 'Aa900800@@',
```

### 🔴 شاشة بيضاء

**الأسباب:**
- خطأ PHP مخفي
- ذاكرة غير كافية

**الحل:**
```php
// أضف في بداية index.php مؤقتاً
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

---

## 10. الصيانة والتحديثات

### 10.1 تحديث الملفات بأمان

1. **قبل التحديث:**
   - خذ نسخة احتياطية
   - اختبر محلياً أولاً

2. **أثناء التحديث:**
   - ارفع الملفات الجديدة
   - لا تحذف uploads/

3. **بعد التحديث:**
   - امسح الكاش
   - اختبر الموقع

### 10.2 النسخ الاحتياطي

#### نسخ قاعدة البيانات:
1. من hPanel → phpMyAdmin
2. اختر قاعدة البيانات
3. انقر **Export**
4. اختر **SQL**
5. انقر **Go**

#### نسخ الملفات:
1. من hPanel → File Manager
2. اختر public_html
3. انقر **Compress**
4. حمّل الملف المضغوط

### 10.3 جدول النسخ الاحتياطي

| النوع | التكرار | الاحتفاظ |
|-------|---------|----------|
| قاعدة البيانات | يومياً | 7 أيام |
| الملفات | أسبوعياً | 4 أسابيع |
| كامل | شهرياً | 3 أشهر |

### 10.4 أفضل ممارسات الأمان

1. **كلمات المرور:**
   - غيّرها كل 3 أشهر
   - استخدم كلمات قوية

2. **التحديثات:**
   - حدّث PHP بانتظام
   - حدّث المكتبات

3. **المراقبة:**
   - راقب error_log
   - استخدم أدوات مراقبة

4. **الحماية:**
   - فعّل 2FA في hPanel
   - احمِ مجلد admin

---

## 📞 الدعم والمساعدة

### Hostinger Support
- Live Chat: متاح 24/7
- Email: support@hostinger.com

### روابط مفيدة
- [Hostinger Knowledge Base](https://support.hostinger.com)
- [PHP Documentation](https://php.net/docs.php)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## 📝 سجل التغييرات

| التاريخ | الإصدار | التغييرات |
|---------|---------|-----------|
| 2026-01-10 | 1.0.0 | الإصدار الأولي |

---

**تم إعداد هذا الدليل بواسطة فريق التطوير**
**معرض وحدة اليمن للسيارات © 2026**
