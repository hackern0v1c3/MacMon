

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
<<<<<<< HEAD

}
=======
}

//For sorting text boxes in datatable
$.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
{
    return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
        return $('input', td).val();
    } );
}

$(document).ready( function () {
  $('#assetTable').DataTable({
    "order": [1, 'asc'],
    "columnDefs": [
      { "orderable": false, "targets": 0 },
      { "searchable": false, "targets": 0 },
      { "orderDataType": "dom-text", "targets": 2 }
    ],
    "fixedHeader": {
      header: true
    },
    "scrollY": "575px",
    "scrollCollapse": true,
    "lengthMenu": [ 5, 10, 25, 50, 75, 100 ],
    
  });
});
>>>>>>> node_branch
