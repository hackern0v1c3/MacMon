function Approve(mac) {
  $.ajax({url:'/assets/approve/' + mac}).done(function() {
    //make row disapear
  });
}

function Delete(){
  console.log('deleted');
}