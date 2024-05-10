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
  const className = data[0].classification_name
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

module.exports = invCont