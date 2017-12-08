function Edit(mac) {
  $.ajax({url:'/assettypes/'}).done(function(assetTypes) {
    $.ajax({url:'/assets/' + mac}).done(function(asset) {
      $('#editAssetMac').val(mac);
      $('#editAssetModalLabel').text('Edit ' + mac);  
      $('#editAssetName').val(asset.Name);
      $('#editAssetDescription').val(asset.Description);
      $('#assetType').empty();

      $.each(assetTypes, function() {
        $('#assetType').append($("<option/>", {
            value: this.ID,
            text: this.Name
        }));
      });
      
      $('#assetType option[value=' + asset.AssetType + ']').prop('selected', 'selected').change();

      $('#editAsset').modal('show');
    });
  });
}

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

function Update(){
  //{MAC: 'abc', Name: 'abc', Description: 'fgh', AssetType: 2}
  var assetToBeSaved = {}
  assetToBeSaved.MAC = $('#editAssetMac').val();
  assetToBeSaved.Name = $('#editAssetName').val();
  assetToBeSaved.Description = $('#editAssetDescription').val();
  assetToBeSaved.AssetType = $('#assetType').val();
  assetToBeSaved.AssetTypeName = $('#assetType option:selected').text();

  $.post('/assets/update/', assetToBeSaved, function(){
    var rowid = $(document.getElementById(assetToBeSaved.MAC));
    $($(rowid).find(".nameColumn")).text(assetToBeSaved.Name);
    $($(rowid).find(".descriptionColumn")).text(assetToBeSaved.Description);
    $($(rowid).find(".assetTypeColumn")).text(assetToBeSaved.AssetTypeName);
  });
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
      { "width": "100%", "targets": 3 }
    ],
    "fixedHeader": {
      header: false
    },
    "scrollY": "565px",
    "lengthMenu": [ 5, 10, 25, 50, 75, 100 ],
    "responsive": true
  });

  $("#editAssetSubmitButton").click( function() {
    Update();
  });
});
