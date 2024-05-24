// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')

// Route to build the account screen
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// Route to build/process login screen
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.post("/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
);

// Route to build/process regsitration screen
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.post("/register",
    regValidate.registationRules(), 
    regValidate.checkRegData, 
    utilities.handleErrors(accountController.registerAccount)
);

// Route to build/process edit account view
router.get("/edit/:accountId", utilities.handleErrors(accountController.buildEditByAccountId));
router.post("/edit-user",
    regValidate.editRules(),
    regValidate.checkEditData,
    utilities.handleErrors(accountController.editUser)
);
router.post("/edit-password",
    regValidate.passwordRules(),
    regValidate.checkEditData,
    utilities.handleErrors(accountController.editPassword)
);

// Route to process Logout
router.get("/logout", utilities.handleErrors(accountController.logout));

module.exports = router;