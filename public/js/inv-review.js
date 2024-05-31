'use strict'

document.addEventListener("DOMContentLoaded", function(){
    const approveButton = document.getElementById("approve-btn")
    const rejectButton = document.getElementById("reject-btn")
    const inv_id = document.getElementById("inv_id").value

    if(approveButton){
      approveButton.addEventListener("click", function() {
        let classIdURL = "/inv/approve/"+inv_id 
        fetch(classIdURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({inv_id})
        })
        .then(function (response) { 
            if (response.ok) { 
                return response.json(); 
            } 
            throw Error("Network response was not OK"); 
        }) 
        .then(data => {
          console.log("Everything was successful", data)
          window.location.href = "/inv"
        })
        .catch((error) => {
          console.log("Error:", error);
        })
      });
    }
    
    if(rejectButton){
      rejectButton.addEventListener("click", function() {
        console.log("Reject button clicked")

        let classIdURL = "/inv/reject/"+inv_id 
        fetch(classIdURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({inv_id})
        })
        .then(function (response) { 
            if (response.ok) { 
                return response.json(); 
            } 
            throw Error("Delete failed."); 
        }) 
        .then(data => {
          console.log("Delete was successful", data)
          window.location.href = "/inv"
        })
        .catch((error) => {
          console.log("Error:", error);
        })
      });
    }
  })