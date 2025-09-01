# 📊 Smart Expense Tracker using OCR & Machine Learning  

## 🚀 Project Overview  
This project is a **smart expense tracking system** that automates financial management. Users can upload receipts, which are scanned using **OCR (Optical Character Recognition)** and processed with **Machine Learning** to categorize expenses into groups like **Food, Travel, Utilities, Shopping**, etc.  

The system provides a **dashboard with insights, charts, and downloadable reports (PDF/CSV)** to help individuals and small businesses manage their spending effectively.  

---

## ✨ Features  
- 📷 **OCR Receipt Scanning** – Extract text from uploaded bills/receipts.  
- 🤖 **ML-Powered Categorization** – Automatically classifies expenses.  
- 📊 **Interactive Dashboard** – Visualize spending with charts & graphs.  
- 🔐 **User Authentication** – Secure login/signup with JWT tokens.  
- 📂 **Report Generation** – Export expenses in **PDF/CSV** formats.  
- ⚡ **Error-Free & Time-Saving** – Reduces manual entry and mistakes.  

---

## 🛠️ Tech Stack  

### **Frontend**
- React.js (UI)  
- Tailwind CSS / Bootstrap (Styling)  
- Chart.js / Recharts (Graphs & Visualizations)  

### **Backend**
- Flask (REST API)  
- Flask-JWT-Extended (Authentication)  
- SQLAlchemy / MongoEngine (Database ORM)  

### **Machine Learning & OCR**
- Python (scikit-learn, pandas, numpy)  
- Tesseract OCR / OpenCV  
- Trained ML Model (`expense_model.pkl`)  

### **Database**
- PostgreSQL / MySQL (Relational)  


---

## 📂 Project Structure  
```yaml
expense-tracker-ocr-ml/
│── backend/ # Flask backend
│ │── app.py # Main application entry point
│ │── config.py # Configuration (DB, JWT, etc.)
│ │── requirements.txt # Python dependencies
│ │
│ ├── models/ # Database models
│ │ └── user.py
│ │ └── expense.py
│ │
│ ├── routes/ # API routes
│ │ └── auth_routes.py
│ │ └── expense_routes.py
│ │
│ ├── services/ # Business logic
│ │ └── ocr_service.py
│ │ └── ml_service.py
│ │
│ ├── utils/ # Helper functions
│ │ └── pdf_exporter.py
│ │ └── csv_exporter.py
│ │
│ ├── ml_models/ # Trained ML models
│ │ └── expense_model.pkl
│ │
│ └── logs/ # Logs for debugging
│ └── app.log
│
│── frontend/ # React frontend
│ │── public/ # Static files
│ │ └── index.html
│ │
│ ├── src/ # Source code
│ │ ├── components/ # Reusable components
│ │ │ └── Navbar.js
│ │ │ └── Dashboard.js
│ │ │ └── UploadForm.js
│ │ │
│ │ ├── pages/ # Page-level components
│ │ │ └── Home.js
│ │ │ └── Reports.js
│ │ │ └── Login.js
│ │ │
│ │ ├── services/ # API calls to backend
│ │ │ └── api.js
│ │ │
│ │ ├── styles/ # CSS / Tailwind configs
│ │ │ └── App.css
│ │ │
│ │ └── App.js # Main React component
│ │ └── index.js # React entry point
│ │
│ ├── package.json # Node dependencies
│ └── tailwind.config.js # Tailwind configuration
│
│── README.md # Project documentation
│── .gitignore # Ignore files
```
---

## ⚙️ Installation & Setup  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/your-username/expense-tracker-ocr-ml.git
cd expense-tracker-ocr-ml
```
### 2️⃣ Backend Setup
```bash

cd backend
python -m venv venv
source venv/bin/activate   # (Linux/Mac)
venv\Scripts\activate      # (Windows)
pip install -r requirements.txt
python app.py
```
Backend will start at 👉 http://localhost:5000/

### 3️⃣ Frontend Setup
```bash

cd frontend
npm install
npm start
```
Frontend will start at 👉 http://localhost:3000/



## 🤝 Contribution Guidelines
- Fork this repo 🍴

- Create a new branch (feature-new) 🌱

- Commit changes (git commit -m "Add new feature") 💡
- Push to branch (git push origin feature-new) 🚀

- Create a Pull Request 🔥

## 📜 License
This project is licensed under the MIT License – free to use and modify.

## 👨‍💻 Team / Contributors
- Ravindran S – ML & Backend

- Thulasiram K – Frontend & UI

