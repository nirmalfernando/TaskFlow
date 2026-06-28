-- Expand enum to include both old and new values
ALTER TABLE `tasks` MODIFY COLUMN `status` ENUM('OPEN', 'IN_PROGRESS', 'TESTING', 'DONE', 'TODO', 'IN_QA', 'COMPLETED') NOT NULL DEFAULT 'OPEN';

-- Migrate existing data
UPDATE `tasks` SET `status` = 'TODO' WHERE `status` = 'OPEN';
UPDATE `tasks` SET `status` = 'IN_QA' WHERE `status` = 'TESTING';
UPDATE `tasks` SET `status` = 'COMPLETED' WHERE `status` = 'DONE';

-- Narrow enum to new values only
ALTER TABLE `tasks` MODIFY COLUMN `status` ENUM('TODO', 'IN_PROGRESS', 'IN_QA', 'COMPLETED') NOT NULL DEFAULT 'TODO';
