window.addEventListener("DOMContentLoaded",(event) => {
    const pswdBtn = document.getElementById("pswdBtn");
    
    if(pswdBtn){
        pswdBtn.addEventListener("click", function(){
            const account_password = document.getElementById("account_password");
            const type = account_password.getAttribute("type");
            if(type == "password"){
                account_password.setAttribute("type","text");
                pswdBtn.innerHTML = "Hide";
            }else{
                account_password.setAttribute("type","password");
                pswdBtn.innerHTML = "Show";
            }
        });
    }
});
