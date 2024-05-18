const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")

const validate = {}

/*  **********************************
*  Classifcation Data Validation Rules
* ********************************* */
validate.classificationRules = () => {
    return [
        // valid classification name is required and cannot already exist in the DB
        body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isLength({min: 2})
        .isAlpha()
        .withMessage("A classification name is required.")
        .custom(async (classification_name) => {
            const classificationExists = await invModel.checkExistingClassificationName(classification_name)
            if (classificationExists){
                throw new Error("Classification Name already exists. Please try a different name.")
            }
        }),
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
        errors,
        title: "New Classification",
        nav,
        classification_name,
        })
        return
    }
    next()
}

/*  **********************************
*  Classifcation Data Validation Rules
* ********************************* */
validate.inventoryRules = () => {
    return [
        // make is required and must be string
        body("inv_make")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Please provide a valid make of the car."), // on error this message is sent.


        // model is required and must be string
        body("inv_model")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 3 })
        .withMessage("Please provide a valid model of the car."), // on error this message is sent.

        // year is required and must be string, and 4 characters
        body("inv_year")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 4, max: 4 })
        .isNumeric({ no_symbols: true })
        .withMessage("Please provide a valid year of the car."), // on error this message is sent.

        
        // description is required and must be string
        body("inv_description")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a valid description of the car."), // on error this message is sent.
        
        
        // price is required and must be numerical
        body("inv_price")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .isCurrency({ symbol: '$', require_symbol: false, allow_negatives: false, thousands_separator: ',', decimal_separator: '.', digits_after_decimal: [2] })
        .withMessage("Please provide a valid price for the car."), // on error this message is sent.
        
        
        // mileage is required and must be string
        body("inv_miles")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a valid mileage for the car."), // on error this message is sent.

        
        // Color is required and must be string
        body("inv_color")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a valid color for the car."), // on error this message is sent.

    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationSelect = await utilities.buildClassificationSelect(classification_id)

        res.render("inventory/add-inventory", {
        errors,
        title: "New Inventory",
        nav,
        classificationSelect,
        inv_make, 
        inv_model, 
        inv_year, 
        inv_description, 
        inv_image, 
        inv_thumbnail, 
        inv_price, 
        inv_miles, 
        inv_color,
        })
        return
    }
    next()
}

module.exports = validate;