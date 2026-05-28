CREATE DATABASE IF NOT EXISTS ssi_measure;
USE ssi_measure;

CREATE TABLE IF NOT EXISTS inspection_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operator_name VARCHAR(255) NOT NULL,
    operator_nim VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    inspection_type ENUM('weight', 'dimension') NOT NULL,
    criteria VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    total_ok INT DEFAULT 0,
    total_ng INT DEFAULT 0,
    status ENUM('active', 'completed') DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS inspection_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    timestamp DATETIME NOT NULL,
    status ENUM('OK', 'NG') NOT NULL,
    measured_value VARCHAR(255) NULL,
    FOREIGN KEY (session_id) REFERENCES inspection_sessions(id) ON DELETE CASCADE
);
