-- Modify the date column in transactions table to use BIGINT
ALTER TABLE transactions 
ALTER COLUMN date TYPE BIGINT USING EXTRACT(EPOCH FROM date) * 1000; 