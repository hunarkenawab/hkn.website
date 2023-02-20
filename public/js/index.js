function hideShow() {
  let g = document.querySelector(".input").name;
  let len = document.querySelectorAll(".hidden").length;
 if(g=="fullread"){
   document.querySelector(".user-feed-caption").classList.add("fullread-caption-prewrap")
 }
  for (let i = 0; i < len; i++) {
    if (g == "all") {
      document.querySelectorAll(".hidden")[i].classList.add("hide");
      document.querySelectorAll(".hidden")[i].classList.remove("show");
    } else if (g == "fullread") {
      document.querySelectorAll(".hidden")[i].classList.add("show");
      document.querySelectorAll(".hidden")[i].classList.remove("hide");
    }
  }
}

function disableFooterInSmallScreens(){
  const page = document.querySelector(".disable-footer").name;
  if(page=="user-page-disable-footer"){
    document.querySelector("#footer-section").classList.add("hide-footer");
  }
}


function formInputToggle(){
  
  const g = document.querySelector("#inlineRadio3").checked;
  console.log(g);
  if(g===true){
    for(let i=0;i<document.querySelectorAll("#showit").length;i++){
      document.querySelectorAll("#showit")[i].classList.add("show");
      document.querySelectorAll("#showit")[i].classList.remove("hide");
    }
    for (let i = 0; i < document.querySelectorAll("#hideit").length; i++) {
      document.querySelectorAll("#hideit")[i].classList.add("hide");
      document.querySelectorAll("#hideit")[i].classList.remove("show");
    }
    
  }else{
    for (let i = 0; i < document.querySelectorAll("#showit").length; i++) {
      document.querySelectorAll("#showit")[i].classList.add("hide");
      document.querySelectorAll("#showit")[i].classList.remove("show");
    }
    for (let i = 0; i < document.querySelectorAll("#hideit").length; i++) {
      document.querySelectorAll("#hideit")[i].classList.add("show");
      document.querySelectorAll("#hideit")[i].classList.remove("hide");
    }
    
  }
}