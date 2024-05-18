const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul class='navigation wrap'>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}



/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
          grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
            + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
            + 'details"><img src="' + vehicle.inv_thumbnail 
            +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
            +' on CSE Motors">'
          + '</a>'
          grid += '<div class="namePrice">'
            grid += '<hr>'
            grid += '<h2>'
              grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
              + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
              + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$' 
              + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
          grid += '</div>'
        grid += '</li>'
      })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the inventory item detail view HTML
* ************************************ */
Util.buildDetailView = async function(item){
  let detail

  detail = '<div class="info-container">'
    detail += '<picture  id="itemImage">'
      detail += '<img src="' + item.inv_image +'" alt="Image of '+ item.inv_make + ' ' + item.inv_model +' on CSE Motors">'
    detail += '</picture>'
    
    detail += '<p id="price">' + Intl.NumberFormat("en-US",{style: "currency", currency: "USD",}).format(item.inv_price) + '</p>'
    
    detail += '<div class="detail-section">'
      detail += '<p><span class="detail-heading">Year: </span><span class="detail">' + item.inv_year + '</span></p>'
      detail += '<p><span class="detail-heading">Make: </span><span class="detail">' + item.inv_make + '</span></p>'
      detail += '<p><span class="detail-heading">Model: </span><span class="detail">' + item.inv_model + '</span></p>'
      detail += '<p><span class="detail-heading">Mileage: </span><span class="detail">' + Intl.NumberFormat("en-US").format(item.inv_miles) + '</span></p>'
      detail += '<p><span class="detail-heading">Color: </span><span class="detail">' + item.inv_color + '</span></p>'
      
      detail += '<p class="item-description">' + item.inv_description + '</p>'
    detail += '</div>'

  detail += '</div>'

  return detail
}

/* **************************************
* Build the classification select element on the add-inventory view HTML
* ************************************ */
Util.buildClassificationSelect = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList

  classificationList = `<select id="classification_id" name="classification_id" required>`
    classificationList += `<option value="">Choose a classification</option>`
    data.rows.forEach(element => {
      classificationList += `<option value="` + element.classification_id + `"`
      if(classification_id != null && element.classification_id == classification_id){
        classificationList += ` selected`
      }
      classificationList += `>` + element.classification_name + `</option>`
    });
  classificationList += `</select>`

  return classificationList
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util