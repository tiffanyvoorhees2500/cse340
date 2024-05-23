const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

// Dealing with classifications
/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = parseInt(req.params.classificationId)
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  const classificationObj = await invModel.getClassificationById(classification_id)
  const className = classificationObj.classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    accountTool,
    grid,
  })
}

/* ****************************************
*  Deliver Add Classification View
* *************************************** */
invCont.buildAddClassification = async function(req, res, next){
  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  res.render("./inventory/add-classification",{
      title: "Add New Classification",
      nav,
      accountTool,
      errors: null,
  })
}

/* ****************************************
*  Add New Classification
* *************************************** */
invCont.addClassification = async function(req, res){
  const { classification_name } = req.body

  const invResult = await invModel.addClassification(
    classification_name
  )
  
  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  if (invResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve added ${classification_name} as a new classification.`
    )
    res.status(201).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      accountTool,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, classification could not be added. Try again.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      accountTool
    })
  }
}

// Dealing with Inventory
/* ***************************
 *  Build inventory by inventory detail view
 * ************************** */
invCont.buildDetailByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inventoryId
  const item = await invModel.getInventoryByInventoryId(inv_id)
  const detail = await utilities.buildDetailView(item)
  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  const itemName = item.inv_year + " " + item.inv_make + " " + item.inv_model
  res.render("./inventory/detail", {
    title: itemName,
    nav,
    accountTool,
    detail,
  })
}

/* ****************************************
*  Deliver Inventory Manager view
* *************************************** */
invCont.buildInventoryManager = async function(req, res, next){
  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  const classificationSelect = await utilities.buildClassificationSelect()
  res.render("inventory/management",{
      title: "Vehicle Management",
      nav,
      accountTool,
      classificationSelect,
  })
}

/* ****************************************
*  Deliver Add Inventory View
* *************************************** */
invCont.buildAddInventory = async function(req, res, next){
  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  let classificationSelect = await utilities.buildClassificationSelect()

  res.render("inventory/add-inventory",{
      title: "Add New Inventory",
      nav,
      accountTool,
      classificationSelect,
      errors: null,
  })
}

/* ****************************************
*  Add New Inventory
* *************************************** */
invCont.addInventory = async function(req, res){
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  const invResult = await invModel.addInventory(
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
  )

  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  if (invResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve added a new car to the inventory.`
    )
    
    let classificationSelect = await utilities.buildClassificationSelect()
    
    res.status(201).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      accountTool,
      classificationSelect,
      errors: null,
    })
  } else {
    let classificationSelect = await utilities.buildClassificationSelect(classification_id)

    req.flash("notice", "Sorry, inventory could not be added. Try again.")
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      accountTool,
      classificationSelect
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Deliver Edit Inventory View
 * ************************** */
invCont.buildEditByInventoryId = async function(req, res, next){
  const inv_id = parseInt(req.params.inventoryId)
  const item = await invModel.getInventoryByInventoryId(inv_id)
  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  const itemName = item.inv_make + " " + item.inv_model
  let classificationSelect = await utilities.buildClassificationSelect(item.classification_id)
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    accountTool,
    classificationSelect,
    errors: null,
    inv_id: item.inv_id,
    inv_make: item.inv_make,
    inv_model: item.inv_model,
    inv_year: item.inv_year,
    inv_description: item.inv_description,
    inv_image: item.inv_image,
    inv_thumbnail: item.inv_thumbnail,
    inv_price: item.inv_price,
    inv_miles: item.inv_miles,
    inv_color: item.inv_color,
    classification_id: item.classification_id
  })
}

/* ****************************************
*  Edit Inventory
* *************************************** */
invCont.editInventory = async function(req, res){
  const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  const updateResult = await invModel.editInventory(
    inv_id,
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
  )

  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash(
      "notice",
      `The ${itemName} was successfully updated.`
    )
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationSelect(classification_id)
    const itemName = `${inv_make} ${inv_model}`

    req.flash("notice", "Sorry, inventory could not be updated. Try again.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + inv_make + " " + inv_model,
      nav,
      accountTool,
      classificationSelect,
      errors: null,
      inv_id,
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
    })
  }
}

/* ***************************
 *  Deliver Delete Inventory View
 * ************************** */
invCont.buildDeleteByInventoryId = async function(req, res, next){
  const inv_id = parseInt(req.params.inventoryId)
  const item = await invModel.getInventoryByInventoryId(inv_id)
  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  const itemName = item.inv_make + " " + item.inv_model
  res.render("./inventory/delete-inventory", {
    title: "Delete " + itemName,
    nav,
    accountTool,
    errors: null,
    inv_id: item.inv_id,
    inv_make: item.inv_make,
    inv_model: item.inv_model,
    inv_year: item.inv_year,
    inv_price: item.inv_price
  })
}

/* ****************************************
*  Delete Inventory
* *************************************** */
invCont.deleteInventory = async function(req, res){
  const { inv_id, inv_make, inv_model, inv_year } = req.body
  const deleteResult = await invModel.deleteInventory(
    inv_id,
    inv_make, 
    inv_model, 
    inv_year
  )

  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  if (deleteResult) {
    const itemName = inv_make + " " + inv_model
    req.flash(
      "notice",
      `The ${itemName} was successfully deleted.`
    )
    res.redirect("/inv/")
  } else {
    const itemName = `${inv_make} ${inv_model}`

    req.flash("notice", "Sorry, inventory could not be deleted. Try again.")
    res.status(501).render("inventory/delete-inventory", {
      title: "Delete " + itemName,
      nav,
      accountTool,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year
    })
  }
}

module.exports = invCont