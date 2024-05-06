-- Adding person Tony Stark into 'account' table
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES(
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- Update Tony Stake account type from 'Client' to 'Admin'
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;
--DELETE Tony Stark
DELETE FROM public.account
WHERE account_id = 1;
-- Modify 'GM Hummer' record in 'Inventory' table
-- to read 'a huge interior' instead of 'small interiors'
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'huge interior'
    )
WHERE inv_make = 'GM'
    AND inv_model = 'Hummer';
-- Use an inner join to select the make and model fields 
-- from the inventory table and the classification name field 
-- from the classification table for inventory items that belong to the "Sport" category.
SELECT inv_make, inv_model, classification_name
FROM public.classification
INNER JOIN public.inventory
	ON public.inventory.classification_id = public.classification.classification_id
WHERE classification_name = 'Sport';
-- Update all records in the inventory table to 
-- add "/vehicles" to the middle of the file path 
-- in the inv_image and inv_thumbnail columns using a single query.
UPDATE public.inventory
SET inv_image = REPLACE(
	inv_image,
	'/images/',
	'/images/vehicles/'
), inv_thumbnail = REPLACE(
	inv_thumbnail,
	'/images/',
	'/images/vehicles/'
);
