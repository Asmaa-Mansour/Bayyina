# بيّنة – مساعدك الذكي الإسلامي / Bayyina - Your Islamic Smart Assistant

*(English version is available below)*

مشروع كامل (Backend + Frontend) يعرض أقوال المذاهب الأربعة من مصادرها الأصلية.

## المصادر الفقهية المعتمدة
- **المذهب الحنفي:** الاختيار لتعليل المختار (المؤلف: عبد الله بن محمود بن مودود الموصلي الحنفي. الطبعة: مطبعة الحلبي - القاهرة)
- **المذهب المالكي:** الكافي في فقه أهل المدينة (المؤلف: أبو عمر يوسف بن عبد البر النمري القرطبي. الطبعة: مكتبة الرياض الحديثة، الرياض، ط2، 1400هـ)
- **المذهب الشافعي:** منهاج الطالبين وعمدة المفتين في الفقه (المؤلف: أبو زكريا يحيى بن شرف النووي. الطبعة: دار الفكر، ط1، 1425هـ)
- **المذهب الحنبلي:** زاد المستقنع في اختصار المقنع (المؤلف: موسى بن أحمد الحجاوي المقدسي. الطبعة: دار الوطن للنشر - الرياض)

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

## المتطلبات الأساسية

قبل البدء، تأكد من تثبيت البرامج التالية على جهازك:
- [Git](https://git-scm.com/downloads)
- [Python 3.9+](https://www.python.org/downloads/)
- [Node.js & npm](https://nodejs.org/en/download/)
- الحصول على مفتاح API  من [Google Gemini](https://aistudio.google.com/app/apikey)

## التثبيت والتشغيل المحلي (من GitHub)

### 1. استنساخ المشروع (Clone)

افتح موجه الأوامر (Terminal) ونفذ الأمر التالي لتحميل المشروع إلى جهازك:

```powershell
git clone https://github.com/Asmaa-Mansour/Bayyina.git
cd Bayyina
```

### 2. إعداد المتغيرات البيئية (Environment Variables)

قم بإنشاء ملف `.env` في المسار الرئيسي للمشروع (أو داخل مجلد `backend`) وأضف فيه مفتاح Gemini API الخاص بك كالتالي:

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. إعداد وتشغيل الـ Backend

افتح نافذة موجه أوامر ونفذ الأوامر التالية لتثبيت المكتبات وبناء قاعدة البيانات:

```powershell
cd backend
# تثبيت المكتبات المطلوبة للـ Python
pip install -r requirements.txt

# تشغيل خادم الـ API
uvicorn main:app --reload --port 8000
```

سيبدأ الخادم على: **http://localhost:8000**

### 4. إعداد وتشغيل الـ Frontend

افتح نافذة PowerShell جديدة لتشغيل الواجهة الأمامية:

```powershell
cd frontend
# تثبيت حزم Node.js المطلوبة
npm install

# تشغيل خادم الواجهة
npm run dev
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



---

# Bayyina - Your Islamic Smart Assistant

A full-stack project (Backend + Frontend) that presents the jurisprudential rulings of the four Islamic Madhhabs directly from their original sources.

## Adopted Fiqh Sources
- **Hanafi Madhhab:** Al-Ikhtiyar li-Ta'lil al-Mukhtar (Author: Abdullah bin Mahmud Al-Mawsili. Edition: Al-Halabi Press - Cairo)
- **Maliki Madhhab:** Al-Kafi fi Fiqh Ahl al-Madina (Author: Abu Umar Yusuf bin Abd al-Barr. Edition: Modern Riyadh Library, 2nd ed., 1400 AH)
- **Shafi'i Madhhab:** Minhaj al-Talibin wa 'Umdat al-Muftin fi al-Fiqh (Author: Abu Zakariya Yahya bin Sharaf al-Nawawi. Edition: Dar Al-Fikr, 1st ed., 1425 AH)
- **Hanbali Madhhab:** Zad al-Mustaqni' fi Ikhtisar al-Muqni' (Author: Musa bin Ahmad Al-Hajjawi. Edition: Dar Al-Watan - Riyadh)

## Project Structure

```
bayyina-app/
├── backend/
│   ├── main.py          ← FastAPI + Streaming SSE
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx      ← Main Interface
│   │   ├── api.js       ← SSE streaming helper
│   │   ├── icons.jsx    ← SVG icons
│   │   └── index.css    ← Design System
│   └── index.html
├── start-backend.ps1
└── start-frontend.ps1
```

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Git](https://git-scm.com/downloads)
- [Python 3.9+](https://www.python.org/downloads/)
- [Node.js & npm](https://nodejs.org/en/download/)
- An API key from [Google Gemini](https://aistudio.google.com/app/apikey)

## Local Installation & Running (from GitHub)

### 1. Clone the Repository

Open your terminal and run the following command to download the project:

```powershell
git clone https://github.com/Asmaa-Mansour/Bayyina.git
cd Bayyina
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory (or inside the `backend` folder) and add your Gemini API key like this:

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Set Up and Run the Backend

Open a terminal and run the following commands to install dependencies and build the database:

```powershell
cd backend
# Install required Python packages
pip install -r requirements.txt

# Run the API server
uvicorn main:app --reload --port 8000
```

The server will start at: **http://localhost:8000**

### 4. Set Up and Run the Frontend

Open a new PowerShell window to run the frontend:

```powershell
cd frontend
# Install required Node.js packages
npm install

# Start the frontend development server
npm run dev
```

The website will be available at: **http://localhost:5173**

## API Endpoints

| Method | Endpoint    | Description                         |
|--------|-------------|-------------------------------------|
| GET    | `/health`   | Check server status                 |
| POST   | `/ask`      | Ask a single Madhhab (SSE stream)   |
| POST   | `/ask-all`  | Ask all four Madhhabs (SSE stream)  |

### Example Request for `/ask-all`

```json
POST /ask-all
{
  "question": "ما فرائض الوضوء؟",
  "madhhab": "hanafi"
}
```

