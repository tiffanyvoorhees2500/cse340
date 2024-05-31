const { check } = require("express-validator")
const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
// async function getClassifications(){
//   return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
// }

async function getApprovedClassificationsWithInventory(){
  try{
    const data = await pool.query(
      `SELECT c.classification_id, c.classification_name, COUNT(i.inv_id) AS inventory_count
      FROM classification AS c
      JOIN inventory AS i
        ON i.classification_id = c.classification_id
      WHERE c.classification_approved = $1
        AND i.inv_approved = $1
      GROUP BY c.classification_id, c.classification_name
      HAVING COUNT(i.inv_id) > $2
      `, 
      [
        true,
        0
      ]
    )

    return data
  } catch(error){
    console.error("getApprovedClassificationsWithInventory error " + error);
  }
}

async function getApprovedClassifications(){
  try{
    const data = await pool.query(
      `SELECT * 
      FROM classification
      WHERE classification_approved = $1
      `, 
      [
        true
      ]
    )

    return data
  } catch(error){
    console.error("getApprovedClassificationsWithInventory error " + error);
  }
}

/* ***************************
 *  Get classification by classification ID
 * ************************** */
async function getClassificationById(classification_id){
  try {
    const data = await pool.query(
      `SELECT * FROM public.classification 
      WHERE classification_id = $1`,
      [classification_id]
    )
    //Only 1 row of data should be returned
    return data.rows[0]
  } catch (error) {
    console.error("getClassificationById error " + error)
  }
}

/* **********************************
* Approve Classification and mark in database *
********************************* */
async function approveClassification(account_id, classification_id){
  try {
    const sql = 
    "UPDATE public.classification SET classification_approved = $1, account_id = $2, classification_approval_date = $3 WHERE classification_id = $4 RETURNING *"
  
    const data = await pool.query(sql, [
      true,
      account_id,
      new Date(new Date().toISOString()),
      classification_id
    ])
    return data.rows[0] //Only 1 row should be returned
  } catch (error) {
    console.error("approveClassification Error: " + error) 
  }
}

/* *****************************
*   Delete Classification
* *************************** */
async function deleteClassification(classification_id){
  try {
    const sql =
      "DELETE FROM classification WHERE classification_id = $1";
    const data = await pool.query(sql, [
      classification_id
    ])
    return data
  } catch (error) {
    new Error("Delete Classification Error")
  }
}

/* ***************************
 *  Get all inventory items join classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error)
  }
}
async function getApprovedInventoryByClassificationId(classification_id){
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1 
      AND i.inv_approved = $2`,
      [classification_id,
        true
      ]
    )
    return data.rows
  } catch (error) {
    console.error("getApprovedInventoryByClassificationId error " + error)
  }
}

/* ***************************
 *  Get inventory item by inv_id
 * ************************** */
async function getInventoryByInventoryId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory 
      WHERE inv_id = $1`,
      [inv_id]
    )
    //Only 1 row of data should be returned
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryByInventoryId error " + error)
  }
}

/* *****************************
*   Add new Classification
* *************************** */
async function addClassification(classification_name){
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Check if classification Name already exists
* *************************** */
async function checkExistingClassificationName(classification_name){
  try{
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const classification = await pool.query(sql, [classification_name])
    return classification.rowCount
  } catch (error){
    return error.message
  }
}

/* *****************************
*   Add new Inventory
* *************************** */
async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id){
  try {
    const sql = "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    return await pool.query(sql, [
      inv_make, 
      inv_model, 
      inv_year, 
      inv_description, 
      inv_image, 
      inv_thumbnail, 
      inv_price, 
      inv_miles, 
      inv_color,
      classification_id
    ])
  } catch (error) {
    return error.message
  }
}

/* *****************************
*   Edit Inventory
* *************************** */
async function editInventory(inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id){
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* *****************************
*   Delete Inventory
* *************************** */
async function deleteInventory(inv_id){
  try {
    const sql =
      "DELETE FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [
      inv_id
    ])
    return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

/* **********************************
* Select and return all inventory and classification that need review *
********************************* */
async function getItemsForReview(){
  try{
    const sql = 
      `SELECT 'classification' AS type,
      classification_id AS item_id,
      classification_name AS description 
      FROM classification  
        WHERE classification_approved = $1
     UNION 
    SELECT 'inventory' AS type, 
    inv_id AS item_id,
    CONCAT(inv_make,' ',inv_model) AS description
      FROM inventory WHERE inv_approved = $1
    ORDER BY type`;
    const data = await pool.query(sql, [
      false
    ])
    return data.rows;
  }catch(error){
    return error.message
  }
}  

/* **********************************
* Approve Inventory Item By ID *
********************************* */
async function approveInventory(account_id,inv_id){
  try {
    const sql = 
    "UPDATE public.inventory SET inv_approved = $1, account_id = $2, inv_approved_date = $3 WHERE inv_id = $4 RETURNING *"
  
    const data = await pool.query(sql, [
      true,
      account_id,
      new Date(new Date().toISOString()),
      inv_id
    ])
    return data.rows[0] //Only 1 row should be returned
  } catch (error) {
    console.error("approveInventory Error: " + error) 
  }
}



module.exports = {  
  getApprovedClassificationsWithInventory,
  getApprovedClassifications,
  getInventoryByClassificationId,
  approveClassification,
  deleteClassification,
  getApprovedInventoryByClassificationId, 
  getInventoryByInventoryId, 
  addClassification, 
  checkExistingClassificationName, 
  addInventory,
  getClassificationById,
  editInventory,
  deleteInventory,
  getItemsForReview,
  approveInventory
};