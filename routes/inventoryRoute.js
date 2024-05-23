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

/* ----------------- Dealing with inventory ------------------------ */
// Route to build inventory by inventory detail view
router.get("/detail/:inventoryId",utilities.handleErrors(invController.buildDetailByInventoryId));

// Route to edit inventory by inventory_id
router.get("/edit/:inventoryId",utilities.handleErrors(invController.buildEditByInventoryId));
router.post("/edit/",
    invValidate.inventoryRules(),
    invValidate.checkEditInventoryData,
    utilities.handleErrors(invController.editInventory)
)

// Route to delete inventory by inventory_id
router.get("/delete/:inventoryId",utilities.handleErrors(invController.buildDeleteByInventoryId));
router.post("/delete/",
    utilities.handleErrors(invController.deleteInventory)
)

// Route to add inventory view
router.get("/add-inventory",utilities.handleErrors(invController.buildAddInventory));
router.post("/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
);

// Route to display inventory on management screen
router.get("/getInventory/:classification_id",utilities.handleErrors(invController.getInventoryJSON));

module.exports = router;