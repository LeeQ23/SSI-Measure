# 📏 SSI Measure - Smart Inspection System

**SSI Measure** is a desktop-wrapped web application designed for smart quality control, weight measurement, and dimension inspection. It seamlessly connects with hardware devices (such as ESP32 and serial sensors) to capture real-time measurements, perform pass/fail (OK/NG) evaluations, and log session data into a database.

---

## ✨ Features

- 🖥️ **Native Desktop Experience**: Runs as an Electron desktop app with zero complex terminal configuration required for operators.
- 🔌 **Hardware Connection & Simulation**: Supports serial communication with hardware (ESP32 / load cells / sensors) via COM ports, as well as a built-in **MOCK (Simulation)** mode for testing.
- 🎯 **High Precision**: Live measurements displayed up to 3 decimal places for maximum accuracy.
- 📊 **Real-time Pass/Fail Logic**: Automated OK/NG determination based on defined tolerance criteria.
- 💾 **Database & Fallback Persistence**: Stores complete session logs in MySQL (via XAMPP) with fallback handling.
- 📖 **User-Friendly Documentation**: Includes step-by-step guides tailored for non-technical operators.

---

## 🏗️ Tech Stack

- **Frontend**: React (Vite), TailwindCSS / Custom Styling, Lucide Icons, Socket.io-client
- **Backend**: Node.js, Express.js, Socket.io, `serialport`
- **Desktop Application**: Electron.js
- **Database**: MySQL (XAMPP) / Memory Fallback

---

## 📁 Project Structure

```
SSI Measure/
├── backend/                  # Express.js backend server & SerialPort interface
│   ├── server.js             # Main server logic & Socket.io handler
│   └── schema.sql            # Database schema for MySQL
├── frontend/                 # React Vite frontend application
│   ├── src/                  # Components, pages, assets
│   └── index.html            # Main HTML entry point
├── firmware/                 # Microcontroller (ESP32/Arduino) code snippets
├── main.js                   # Electron main process entry point
├── Buka-SSI-Measure.vbs      # Quiet desktop launcher script (Windows)
├── SSI-Measure.bat           # Batch launcher script with auto port cleanup
├── Panduan_Pengoperasian_SSI_Measure.md  # Detailed Indonesian User Guide
└── package.json              # Root dependencies & Electron config
```

---

## 🚀 Quick Start (For Operators)

### Prerequisites
1. **Node.js**: Install Node.js LTS from [nodejs.org](https://nodejs.org).
2. **XAMPP**: Install XAMPP from [apachefriends.org](https://www.apachefriends.org) (Start Apache & MySQL).

### Launching the Application
1. Double-click **`Buka-SSI-Measure.vbs`** (or `SSI-Measure.bat`).
2. The desktop window will open automatically and connect to the backend service.

> 📄 For complete step-by-step instructions in Bahasa Indonesia, please refer to [Panduan Pengoperasian SSI Measure](Panduan_Pengoperasian_SSI_Measure.md).

---

## 🛠️ Development Setup

If you want to run or modify the source code:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/LeeQ23/SSI-Measure.git
   cd SSI-Measure
   ```

2. **Install dependencies**:
   ```bash
   # Install root dependencies (Electron, etc.)
   npm install

   # Install backend dependencies
   cd backend && npm install && cd ..

   # Install frontend dependencies
   cd frontend && npm install && cd ..
   ```

3. **Build Frontend**:
   ```bash
   npm run build:frontend
   ```

4. **Run Desktop App**:
   ```bash
   npm start
   ```

---

## 📄 License

Internal / Educational & Internship Project for SSI Smart Manufacturing.
