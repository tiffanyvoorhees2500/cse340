'use strict'

document.addEventListener("DOMContentLoaded", function(){
    const approveButtons = document.querySelectorAll(".approve-btn")
    const rejectButtons = document.querySelectorAll(".reject-btn")

    approveButtons.forEach(approveButton => {
        approveButton.addEventListener("click", function() {
            const row = this.closest("tr")
            const classification_id = row.querySelector(".hidden").textContent

            let classIdURL = "/inv/approve-classification/"+classification_id 
            fetch(classIdURL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({classification_id})
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
    });
    
    rejectButtons.forEach(rejectButton => {
      rejectButton.addEventListener("click", function() {
        const row = this.closest("tr")
        const classification_id = row.querySelector(".hidden").textContent

        let classIdURL = "/inv/reject-classification/"+classification_id 
        fetch(classIdURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({classification_id})
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
  })
})