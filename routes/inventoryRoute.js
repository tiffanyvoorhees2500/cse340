// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate= require("../utilities/inventory-validation")


// Manually entered route to build inventory management view
router.get("/", utilities.handleErrors(invController.buildInventoryManager));
// Route to build add-classification view
router.get("/add-classification",utilities.handleErrors(invController.buildAddClassification));
router.post(
    "/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
);
// Route to build add-inventory view
router.get("/add-inventory",utilities.handleErrors(invController.buildAddInventory));
router.post(
    "/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
);
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// Route to build inventory by inventory detail view
router.get("/detail/:inventoryId",utilities.handleErrors(invController.buildByInventoryId));
router.get("/getInventory/:classification_id",utilities.handleErrors(invController.getInventoryJSON));

module.exports = router;