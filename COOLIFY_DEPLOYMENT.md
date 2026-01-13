# دليل نشر المشروع على Coolify
## معرض وحدة اليمن للسيارات

---

## الخطوة 1: إعداد قاعدة البيانات MySQL

### في Coolify:
1. اذهب إلى **Resources** → **+ New** → **Database** → **MySQL**
2. أدخل الإعدادات:
   - **Name**: `yemen-cars-db`
   - **Database**: `yemen_cars`
   - **Username**: `yemen_user`
   - **Password**: `Zz900800##@@`
   - **Root Password**: `Zz900800##@@`

3. بعد إنشاء قاعدة البيانات، انسخ **Internal Host** (مثل: `mysql-xxxxx`)

### استيراد Schema:
```bash
# من داخل السيرفر عبر SSH
docker exec -i <mysql-container-name> mysql -u yemen_user -p'Zz900800##@@' yemen_cars < schema.sql
```

---

## الخطوة 2: نشر API (PHP)

### في Coolify:
1. **Resources** → **+ New** → **Application**
2. اختر **GitHub** واختر المستودع `yemen-cars`
3. الإعدادات:
   - **Build Pack**: Dockerfile
   - **Dockerfile Location**: `api/Dockerfile`
   - **Base Directory**: `api`
   - **Port**: `80`

### Environment Variables:
```
DB_HOST=<mysql-internal-host>
DB_DATABASE=yemen_cars
DB_USERNAME=yemen_user
DB_PASSWORD=Zz900800##@@
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.fazaacaetg.com
ALLOWED_ORIGINS=https://fazaacaetg.com,https://www.fazaacaetg.com
JWT_SECRET=your-secure-random-secret-key-here
```

### Domain:
- **Domain**: `api.fazaacaetg.com`
- **SSL**: Let's Encrypt (Auto)

---

## الخطوة 3: نشر Frontend (Next.js)

### في Coolify:
1. **Resources** → **+ New** → **Application**
2. اختر **GitHub** واختر المستودع `yemen-cars`
3. الإعدادات:
   - **Build Pack**: Dockerfile
   - **Dockerfile Location**: `frontend/Dockerfile`
   - **Base Directory**: `frontend`
   - **Port**: `3000`

### Environment Variables:
```
NEXT_PUBLIC_API_URL=https://api.fazaacaetg.com
```

### Domain:
- **Domain**: `fazaacaetg.com,www.fazaacaetg.com`
- **SSL**: Let's Encrypt (Auto)

---

## الخطوة 4: إعدادات DNS في Hostinger

في لوحة تحكم Hostinger DNS:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 72.61.187.159 | 14400 |
| A | www | 72.61.187.159 | 14400 |
| A | api | 72.61.187.159 | 14400 |

---

## الخطوة 5: التحقق من النشر

### اختبار API:
```bash
curl https://api.fazaacaetg.com/health
```

### اختبار Frontend:
افتح https://fazaacaetg.com في المتصفح

---

## حل المشاكل الشائعة

### مشكلة اتصال قاعدة البيانات:
1. تأكد من أن `DB_HOST` هو الاسم الداخلي لـ MySQL container
2. تأكد من أن كلمة المرور صحيحة
3. تحقق من أن قاعدة البيانات والمستخدم موجودان

### للتحقق من داخل container:
```bash
docker exec -it <api-container> bash
php -r "echo getenv('DB_HOST');"
```

### مشكلة CORS:
تأكد من أن `ALLOWED_ORIGINS` يحتوي على الدومين الصحيح

---

## بيانات الدخول الافتراضية

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **مهم**: غيّر كلمة المرور فوراً بعد أول تسجيل دخول!
