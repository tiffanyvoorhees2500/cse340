const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver Login view
* *************************************** */
async function buildLogin(req, res, next){
    let nav = await utilities.getNav()
    
    const accountData = res.locals.accountData
    let accountTool = await utilities.getAccountTool(accountData)
    
    res.render("account/login",{
        title: "Login",
        nav,
        accountTool,
        errors: null,
    })
}

/* ****************************************
*  Deliver Registration view
* *************************************** */
async function buildRegister(req, res, next){
    let nav = await utilities.getNav()
    
    const accountData = res.locals.accountData
    let accountTool = await utilities.getAccountTool(accountData)
    
    res.render("account/register",{
        title: "Register",
        nav,
        accountTool,
        errors: null,
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      accountTool,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      accountTool,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      accountTool,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    
    const accountData = await accountModel.getAccountByEmail(account_email)
    let accountTool = await utilities.getAccountTool(accountData)

    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        accountTool,
        errors: null,
        account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
  } catch (error) {
    return new Error('Access Forbidden')
  }
 }

 /* ****************************************
 *  Deliver Account Management View
 * ************************************ */
async function buildAccountManagement(req, res, next){
    let nav = await utilities.getNav()

    const accountData = res.locals.accountData
    let accountTool = await utilities.getAccountTool(accountData)

    let managementSection
    if(accountData.account_type != "Client"){
      managementSection = `<section id="managmentSection">`
        managementSection += `<h3>Inventory Management</h3>`
        managementSection += `<p><a href="../../inv">Access Inventory Manager</a></p>`
      managementSection += `</section>`
    }

    res.render("account/management",{
        title: "Account Management",
        nav,
        accountTool,
        errors: null,
        firstName: accountData.account_firstname,
        managementSection
    })
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement }