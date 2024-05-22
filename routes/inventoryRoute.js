// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate= require("../utilities/inventory-validation")


// Default inventory route
router.get("/", utilities.handleErrors(invController.buildInventoryManager));

/* ----------------- Dealing with classifications ------------------------ */
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// Route to build add-classification view
router.get("/add-classification",utilities.handleErrors(invController.buildAddClassification));
router.post("/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
);

/* ----------------- Dealing with classifications ------------------------ */
// Route to build inventory by inventory detail view
router.get("/detail/:inventoryId",utilities.handleErrors(invController.buildByInventoryId));
// Route to build add-inventory view
router.get("/add-inventory",utilities.handleErrors(invController.buildAddInventory));
router.post("/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
);
router.get("/getInventory/:classification_id",utilities.handleErrors(invController.getInventoryJSON));

module.exports = router;