const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

// Dealing with classifications
/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = parseInt(req.params.classificationId)
  const data = await invModel.getApprovedInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  if(data.length > 0){
    console.log(data)
    const className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      accountTool,
      grid,
    })
  }else{
    throw new Error("Classification not approved with ID:" + classification_id)
  }
  
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
 *  Build detail view by inventory id
 * ************************** */
invCont.buildDetailByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inventoryId
  const item = await invModel.getInventoryByInventoryId(inv_id)
  const detail = await utilities.buildDetailView(item)
  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  // Check if item has been approved
  let adminMenu
  if(accountData.account_type !== "Client"){
    adminMenu = await utilities.getAdminButtons(item, accountData)
  }

  const itemName = item.inv_year + " " + item.inv_make + " " + item.inv_model
  res.render("./inventory/detail", {
    title: itemName,
    nav,
    accountTool,
    errors: null,
    detail,
    adminMenu
  })
}

/* ****************************************
*  Deliver Inventory Manager view
* *************************************** */
invCont.buildInventoryManager = async function(req, res, next){
  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  let adminReviewSection = await utilities.buildAdminReviewSection(accountData)

  const classificationSelect = await utilities.buildClassificationSelect()
  res.render("inventory/management",{
      title: "Vehicle Management",
      nav,
      accountTool,
      classificationSelect,
      adminReviewSection,
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

/* **********************************
* Update Approval Return Inventory by ID AS JSON *
********************************* */
invCont.approveInventoryJSON = async(req, res, next) => {
  const accountData = res.locals.accountData
  const inv_id = parseInt(req.params.inv_id)
  const approveResult = await invModel.approveInventory(
    accountData.account_id,
    inv_id
  )
  
  if(approveResult){
    console.log(approveResult);
    req.flash("notice",approveResult.inv_make + " " + approveResult.inv_model + " has been approved")
    return res.json(approveResult)
  }else{
    next(new Error("Approve Failed"))
  }
}

/* **********************************
* Reject Approval Return Inventory by ID AS JSON *
********************************* */
invCont.rejectInventoryJSON = async(req, res, next) => {
  const inv_id = parseInt(req.params.inv_id)
  const deleteResult = await invModel.deleteInventory(
    inv_id
  )
  if(deleteResult){
    req.flash("notice","Inventory Item has been deleted")
    return res.json(deleteResult)
  }else{
    next(new Error("Deletion Failed"))
  }
}

/* **********************************
* Update Classification Approval Return Inventory by ID AS JSON *
********************************* */
invCont.approveClassificationJSON = async(req, res, next) => {
  const accountData = res.locals.accountData
  const classification_id = parseInt(req.params.classification_id)
  const approveResult = await invModel.approveClassification(
    accountData.account_id,
    classification_id
  )
  
  if(approveResult){
    console.log(approveResult);
    req.flash("notice",approveResult.classification_name + " classification has been approved")
    return res.json(approveResult)
  }else{
    next(new Error("Approve Failed"))
  }
}

/* **********************************
* Reject Classification Approval Return Inventory by ID AS JSON *
********************************* */
invCont.rejectClassificationJSON = async(req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const deleteResult = await invModel.deleteClassification(
    classification_id
  )
  if(deleteResult){
    req.flash("notice","Classification Item has been deleted")
    return res.json(deleteResult)
  }else{
    next(new Error("Deletion Failed"))
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
  if(item.inv_approved === false){
    req.flash("notice","Item is still pending approval by admin")
  }
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
    classification_id: item.classification_id,
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
      title: "Edit " + itemName,
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