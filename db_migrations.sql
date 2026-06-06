-- ============================================
-- 创客社数据库迁移脚本
-- ============================================
-- 说明：本文件包含对初始 schema 的补充约束
-- 对于已存在的数据库，请在初始化新数据库时一并应用
-- 或者在已有数据库上单独执行以下语句：

-- ============================================
-- 1. accounts 表：添加唯一约束
-- ============================================
ALTER TABLE accounts ADD CONSTRAINT accounts_email_unique UNIQUE (email);
ALTER TABLE accounts ADD CONSTRAINT accounts_username_unique UNIQUE (username);

-- ============================================
-- 2. announcements 表：添加 updated_at
-- ============================================
ALTER TABLE announcements ADD COLUMN updated_at timestamp;

-- ============================================
-- 3. images 表：添加 created_at 索引
-- ============================================
ALTER TABLE images ADD COLUMN created_at timestamp DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX IF NOT EXISTS images_created_at_idx ON images (created_at DESC);

-- ============================================
-- 4. docs 表：cover_image_url 添加 URL 长度与格式约束
-- ============================================
-- (业务层校验)
-- ============================================
