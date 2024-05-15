// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')
const baseController = require("../controllers/baseController")

// Route to build login screen
router.get("/login", utilities.handleErrors(accountController.buildLogin));
// Route to build regsitration screen
router.get("/register", utilities.handleErrors(accountController.buildRegister));
// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(), 
    regValidate.checkRegData, 
    utilities.handleErrors(accountController.registerAccount)
);
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(baseController.buildHome)
);

module.exports = router;