--##############################
-- Adding new fields
--##############################

ALTER TABLE cards
  ADD added_date TIMESTAMP,
  ADD edited_date TIMESTAMP,
  ADD observed_date TIMESTAMP;

--##############################
-- Updating fields by current timestamp
--##############################

UPDATE cards
SET added_date = CURRENT_TIMESTAMP;
UPDATE cards
SET edited_date = CURRENT_TIMESTAMP;

--##############################
-- Making date from existing data fields
--##############################

-- For PostgreSQL >= 9.4
UPDATE cards
SET observed_date = make_date(year, month, day)
WHERE cards.year IS NOT NULL AND
      cards.month IS NOT NULL AND
      cards.day IS NOT NULL AND
      (cards.year <> 2015 AND cards.month <> 6 AND cards.day <> 31);

-- For PostgreSQL <= 9.4
-- UPDATE cards
-- SET observed_date = (concat(year::text, '-', month::text, '-', day::text, ' 00:00:00'))::TIMESTAMP
-- WHERE cards.year IS NOT NULL AND
--       cards.month IS NOT NULL AND
--       cards.day IS NOT NULL AND
--       (cards.year <> 2015 AND cards.month <> 6 AND cards.day <> 31);