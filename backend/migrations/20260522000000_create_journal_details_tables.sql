-- Journal Emotions Table
CREATE TABLE IF NOT EXISTS journal_emotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    journal_id INT NOT NULL,
    emotion VARCHAR(255) NOT NULL,
    probability DECIMAL(5,4) NOT NULL,
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
);

-- Journal Motivations Table
CREATE TABLE IF NOT EXISTS journal_motivations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    journal_id INT NOT NULL,
    message TEXT NOT NULL,
    emotion VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
);
