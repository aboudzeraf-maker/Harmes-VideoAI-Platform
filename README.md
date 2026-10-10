# Harmes AI Video Platform

منصة متكاملة لإنشاء وإدارة الفيديوهات باستخدام الذكاء الاصطناعي، مع دعم جدولة النشر التلقائي على YouTube و TikTok.

## ما الذي يحتويه المشروع

- نظام إدارة محتوى فيديو (Campaigns / Jobs / Assets)
- محرك إنشاء فيديو من النص أو الصور
- دعم FFmpeg لمعالجة الفيديو
- واجهة Android (Kotlin + Compose)
- واجهة Backend Node.js + Express
- قاعدة بيانات بسيطة JSON/SQLite جاهزة للتوسع
- مكونات نشر تلقائي إلى YouTube و TikTok
- واجهات API جاهزة للتكامل

## العمارة

- `backend/` : خادم API
- `android/` : تطبيق Android
- `docs/` : توثيق إضافي

## التشغيل السريع

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 2) Android

```bash
cd android
./gradlew assembleDebug
```

## الروابط

- API health: `http://localhost:3000/api/health`
- Swagger/Docs: سيتم إضافته لاحقاً

## ملاحظات

هذا هو إصدار MVP/Starter قابل للتوسع. يتضمن:
- هيكل مشروع قابل للتنفيذ
- API أساسية
- واجهة Android أولية
- خدمات FFmpeg و YouTube/TikTok كواجهات قابلة للتوسيع

## المتطلبات

- Node.js 18+
- Java 17+
- Android Studio
- ffmpeg (للخادم)

## الترخيص

MIT
