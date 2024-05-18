const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const classificationObj = await invModel.getClassificationById(classification_id)
  const className = classificationObj.classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory by inventory detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.inventoryId
  const item = await invModel.getInventoryByInventoryId(inv_id)
  const detail = await utilities.buildDetailView(item)
  let nav = await utilities.getNav()
  const itemName = item.inv_year + " " + item.inv_make + " " + item.inv_model
  res.render("./inventory/detail", {
    title: itemName,
    nav,
    detail,
  })
}

/* ****************************************
*  Deliver Inventory Manager view
* *************************************** */
invCont.buildInventoryManager = async function(req, res, next){
  let nav = await utilities.getNav()
  res.render("inventory/management",{
      title: "Vehicle Management",
      nav,
  })
}

/* ****************************************
*  Deliver Manager Add Classification View
* *************************************** */
invCont.buildAddClassification = async function(req, res, next){
  let nav = await utilities.getNav()
  res.render("inventory/add-classification",{
      title: "Add New Classification",
      nav,
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

  if (invResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve added ${classification_name} as a new classification.`
    )
    res.status(201).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, classification could not be added. Try again.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
    })
  }
}

/* ****************************************
*  Deliver Manager Add Inventory View
* *************************************** */
invCont.buildAddInventory = async function(req, res, next){
  let nav = await utilities.getNav()
  let classificationSelect = await utilities.buildClassificationSelect()

  res.render("inventory/add-inventory",{
      title: "Add New Inventory",
      nav,
      classificationSelect,
      errors: null,
  })
}

/* ****************************************
*  Add New Classification
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

  if (invResult) {
    req.flash(
      "notice",
      `Congratulations, you\'ve added a new car to the inventory.`
    )
    
    let classificationSelect = await utilities.buildClassificationSelect()
    
    res.status(201).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect,
      errors: null,
    })
  } else {
    let classificationSelect = await utilities.buildClassificationSelect(classification_id)

    req.flash("notice", "Sorry, inventory could not be added. Try again.")
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationSelect
    })
  }
}

module.exports = invCont