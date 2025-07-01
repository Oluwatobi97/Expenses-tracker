-- 1. Remove the default value
ALTER TABLE transactions ALTER COLUMN date DROP DEFAULT;

-- 2. Change the column type to BIGINT (milliseconds since epoch)
ALTER TABLE transactions
ALTER COLUMN date TYPE BIGINT USING (EXTRACT(EPOCH FROM date) * 1000)::BIGINT;

-- 3. (Optional) Set a new default value for BIGINT date column
ALTER TABLE transactions
ALTER COLUMN date SET DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT; 