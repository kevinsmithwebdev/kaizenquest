-- Consolidate legacy goal category slugs into the lean 10-category set.

UPDATE "Goal" SET category = 'health' WHERE category = 'fitness';

UPDATE "Goal"
SET category = 'learning'
WHERE category IN ('education', 'reading', 'writing', 'language', 'cognitive');

UPDATE "Goal"
SET category = 'creative'
WHERE category IN ('art', 'music');

UPDATE "Goal" SET category = 'work' WHERE category = 'career';
