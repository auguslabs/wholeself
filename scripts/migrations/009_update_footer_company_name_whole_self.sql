-- Update footer company name to "Whole Self" (with space) for both locales.
-- Run this if the table was already created with "WholeSelf Counseling".

UPDATE page_shared_footer
SET company_name = 'Whole Self Counseling'
WHERE company_name = 'WholeSelf Counseling';
