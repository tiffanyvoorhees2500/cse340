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
    hashedPassword = bcrypt.hashSync(account_password, 10)
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
        managementSection += `<p class="menu-item"><a href="../../inv">Access Inventory Manager</a></p>`
      managementSection += `</section>`
    }

    res.render("account/management",{
        title: "Account Management",
        nav,
        accountTool,
        errors: null,
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        managementSection
    })
}

/* ***************************
 *  Deliver Edit Account View
 * ************************** */
async function buildEditByAccountId(req, res, next){
  const account_id = parseInt(req.params.accountId)
  const account = await accountModel.getAccountById(account_id)
  let nav = await utilities.getNav()
    
  const accountData = res.locals.accountData
  let accountTool = await utilities.getAccountTool(accountData)

  res.render("./account/edit-account", {
    title: "Edit Account Information",
    nav,
    accountTool,
    errors: null,
    account_id: account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

/* ****************************************
*  Process Update User Information
* *************************************** */
async function editUser(req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const updateResult = await accountModel.editNameByAccountId(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )

  if (updateResult) {
    // Delete password
    const accountData = updateResult
    delete accountData.account_password
    // Sign new cookie
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    req.flash("notice", "Your data has been updated.")
    return res.redirect("/account")

  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/edit-account", {
      title: "Edit User Information",
      nav,
      accountTool,
      errors,
      account_id,
      account_firstname,
      account_lastname,
    })
  }
}

/* ****************************************
*  Process Update User Information
* *************************************** */
async function editPassword(req, res) {
  const { account_id, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error updating your password.')
    res.status(500).render("account/edit-account", {
      title: "Edit Account Information",
      nav,
      accountTool,
      errors: null,
      account_id
    })
  }

  const updateResult = await accountModel.editPasswordByAccountId(
    account_id,
    hashedPassword
  )
  if (updateResult) {
    // Delete password
    const accountData = updateResult
    delete accountData.account_password
    // Sign new cookie
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }

    req.flash("notice", "Your password was changed successfully.")
    return res.redirect("/account")

  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/edit-account", {
      title: "Edit User Information",
      nav,
      accountTool,
      errors: null,
      account_id,
    })
  }
}

/* ****************************************
*  Process Update User Information
* *************************************** */
async function logout(req, res) {
    if(process.env.NODE_ENV === 'development') {
      res.clearCookie("jwt", { httpOnly: true })
    } else {
      res.clearCookie("jwt", { httpOnly: true, secure: true })
    }

    req.flash("notice", "You are logged out")
    return res.redirect("/account/login")
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin, 
  buildAccountManagement, 
  buildEditByAccountId,
  editUser,
  editPassword,
  logout
}