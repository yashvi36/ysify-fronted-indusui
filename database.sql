-- ============================================================
-- INDUS UI — AI Features Database Schema
-- Run this in MySQL to set up the database
-- ============================================================

CREATE DATABASE IF NOT EXISTS indusui_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE indusui_db;

-- ── Leads table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
    id           INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(120),
    email        VARCHAR(120),
    phone        VARCHAR(30),
    company      VARCHAR(120),
    service      VARCHAR(200),
    budget       VARCHAR(80),
    requirements TEXT,
    score        CHAR(1)       COMMENT 'A=Hot, B=Warm, C=Cold',
    score_reason TEXT,
    session_id   VARCHAR(64),
    created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_score      (score),
    INDEX idx_session    (session_id),
    INDEX idx_created    (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Chat messages table ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
    id         INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    lead_id    INT,
    session_id VARCHAR(64) NOT NULL,
    role       VARCHAR(20) NOT NULL COMMENT 'user or assistant',
    content    TEXT        NOT NULL,
    created_at DATETIME    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
    INDEX idx_session (session_id),
    INDEX idx_lead    (lead_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Sample leads (for testing the admin dashboard) ───────────
INSERT INTO leads (name, email, phone, company, service, budget, requirements, score, score_reason, session_id) VALUES
('Priya Sharma',    'priya@technovate.in',  '+91-9876543210', 'TechNovate',    'Web Development',         '$5k-$10k',  'Need a modern SaaS dashboard with React', 'A', 'Clear budget, specific tech stack, valid contact', 'demo-session-001'),
('Rahul Mehta',     'rahul@startup.io',     '+91-9123456789', 'StartupIO',     'Mobile App Development',  '$10k-$20k', 'iOS and Android app for food delivery',   'A', 'High budget, detailed requirements',               'demo-session-002'),
('Ananya Patel',    'ananya@retailx.com',   NULL,             'RetailX',       'E-commerce Solutions',    '$3k-$5k',   'Online store with payment gateway',       'B', 'Moderate budget, missing phone',                   'demo-session-003'),
('Vikram Singh',    'vikram@consulting.co', '+91-9988776655', 'VS Consulting', 'Branding & Identity',     NULL,        'Logo and brand guidelines',               'C', 'No budget specified',                              'demo-session-004'),
('Neha Joshi',      'neha@fintech.io',      '+91-8877665544', 'FinTech Inc',   'AI Integration',          '$20k+',     'AI chatbot for customer support',         'A', 'High budget, clear requirement, valid contact',    'demo-session-005');
