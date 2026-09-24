ALTER TABLE users ADD COLUMN disabled INTEGER NOT NULL DEFAULT 0 CHECK(disabled IN (0,1));
CREATE TRIGGER protect_last_master BEFORE UPDATE OF role, disabled ON users
WHEN OLD.role = 'master' AND OLD.disabled = 0 AND (NEW.role != 'master' OR NEW.disabled = 1)
AND (SELECT COUNT(*) FROM users WHERE role = 'master' AND disabled = 0) <= 1
BEGIN SELECT RAISE(ABORT, 'LAST_MASTER'); END;
CREATE TRIGGER revoke_disabled_sessions AFTER UPDATE OF disabled ON users
WHEN NEW.disabled = 1
BEGIN DELETE FROM sessions WHERE user_id = NEW.id; END;
