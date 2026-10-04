# بيّنة – مساعدك الذكي الإسلامي

مشروع كامل (Backend + Frontend) يعرض أقوال المذاهب الأربعة من مصادرها الأصلية.

## هيكل المشروع

```
bayyina-app/
├── backend/
│   ├── main.py          ← FastAPI + Streaming SSE
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx      ← الواجهة الرئيسية
│   │   ├── api.js       ← SSE streaming helper
│   │   ├── icons.jsx    ← SVG icons
│   │   └── index.css    ← Design System
│   └── index.html
├── start-backend.ps1
└── start-frontend.ps1
```

## تشغيل المشروع

### 1. تثبيت متطلبات الـ Backend

```powershell
cd backend
pip install -r requirements.txt
```

### 2. تشغيل الـ Backend

```powershell
.\start-backend.ps1
# OR:
cd backend && uvicorn main:app --reload --port 8000
```

سيبدأ الخادم على: **http://localhost:8000**

### 3. تشغيل الـ Frontend

في نافذة PowerShell جديدة:

```powershell
.\start-frontend.ps1
# OR:
cd frontend && npm run dev
```

سيفتح الموقع على: **http://localhost:5173**

## الـ API Endpoints

| Method | Endpoint    | Description                         |
|--------|-------------|-------------------------------------|
| GET    | `/health`   | فحص حالة الخادم                     |
| POST   | `/ask`      | سؤال مذهب واحد (SSE stream)         |
| POST   | `/ask-all`  | سؤال المذاهب الأربعة (SSE stream)   |

### مثال على طلب `/ask-all`

```json
POST /ask-all
{
  "question": "ما فرائض الوضوء؟",
  "madhhab": "hanafi"
}
```

## ملاحظة
- الـ Backend يقرأ ملفات JSON من المجلد الأب (`../..` نسبةً إلى backend/main.py)
- قاعدة البيانات `fiqh_chroma_db` تُبنى تلقائياً في أول تشغيل
