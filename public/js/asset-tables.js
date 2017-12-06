

function Approve(mac) {
  $.ajax({url:'/assets/approve/' + mac}).done(function() {
    var rowid = $(document.getElementById(mac));
    rowid.fadeOut();  
  });
}

function Delete(mac){
  $.ajax({url:'/assets/delete/' + mac}).done(function() {
    var rowid = $(document.getElementById(mac));
    rowid.fadeOut();  
  });
}

function Update(mac){
  //{MAC: 'abc', Name: 'abc', Description: 'fgh', AssetType: 2}
  var rowid = $(document.getElementById(mac));

  var assetToBeSaved = {}
  assetToBeSaved.MAC = mac
  assetToBeSaved.Name = $($(rowid).find(".nameInput")).val();
  assetToBeSaved.Description = $($(rowid).find(".descriptionInput")).val();
  assetToBeSaved.AssetType = $($(rowid).find(".assetTypeSelector")).val();

  $.post('/assets/update/', assetToBeSaved, function(){

  });
}

$(document).ready( function () {
  $('#assetTable').DataTable({
    "order": [1, 'asc'],
    "columnDefs": [
      { "orderable": false, "targets": 0 }
    ],
    "fixedHeader": {
      header: true
    },
    "scrollY": "575px",
    "scrollCollapse": true,
    "lengthMenu": [ 5, 10, 25, 50, 75, 100 ],
    
  });
});