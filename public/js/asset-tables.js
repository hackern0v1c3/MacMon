function Approve(mac) {
  $.ajax({url:'/assets/approve/' + mac}).done(function() {

  });
}

function Delete(){
  console.log('deleted');
}