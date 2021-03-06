var myAssetTable;

function FilterDates() {
  myAssetTable.draw();
}

function Block(mac, ipAddress) {
  $.ajax({url:'/assets/block/' + ipAddress})
    .done(function(){
      var rowid = $(document.getElementById(mac));
      rowid.toggleClass('blocked-row');
      toggleBlockButtonText(ipAddress);
    })
    .fail(function(error){
      alert('Error blocking asset: ' + error.responseText);
    });
}

function toggleBlockButtonText(blockButtonId) {
  var buttonid = $(document.getElementById(blockButtonId));
  if (buttonid.text() === 'Block') {
    buttonid.html('Unblock');
  } else {
    buttonid.html('Block');
  }
}

function Edit(mac) {
  $.ajax({url:'/assettypes/'})
    .done(function(assetTypes) {
      $.ajax({url:'/assets/' + mac})
        .done(function(asset) {
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
        })
        .fail(function(error){
          alert('Error fetching asset: ' + error.responseText);
        });
    })
    .fail(function(error){
      alert('Error fetching asset types: ' + error.responseText);
    });
}

function Approve(mac) {
  $.ajax({url:'/assets/approve/' + mac})
    .done(function() {
      var rowid = $(document.getElementById(mac));
      rowid.fadeOut();  
    })
    .fail(function(error){
      alert('Error approving asset: ' + error.responseText);
    });
}

function Delete(mac){
  $.ajax({url:'/assets/delete/' + mac})
    .done(function() {
      var rowid = $(document.getElementById(mac));
      rowid.fadeOut();  
    })
    .fail(function(error){
      alert('Error deleting asset: ' + error.responseText);
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

  $.post('/assets/update/', assetToBeSaved)
    .done(function(){
      var rowid = $(document.getElementById(assetToBeSaved.MAC));
      $($(rowid).find(".nameColumn")).text(assetToBeSaved.Name);
      $($(rowid).find(".descriptionColumn")).text(assetToBeSaved.Description);
      $($(rowid).find(".assetTypeColumn")).text(assetToBeSaved.AssetTypeName);
    })
    .fail(function(error){
      alert('Error updating asset: ' + error.responseText);
    });
}

function Scan(mac, ip){
  var assetToScan = {}
  assetToScan.MAC = mac;
  assetToScan.IP = ip;
  $.post('/assets/scan/', assetToScan)
    .done(function(){
      $('#nmapBody').text('A scan has begun for MAC ' + mac + ' IP ' + ip + '.\nThe scan can take 5-10 minutes to complete.\nWhen it finishes the results should appear in the table.\nPlease be patient.');
      $('#nmapModal').modal('show');
    })
    .fail(function(error){
      alert('Error starting scan: ' + error.responseText);
    });
}

function ScanResults(mac, ip){
  $.ajax({url:'/assets/' + mac})
    .done(function(asset) {
      $('#nmapBody').text('Port scan results for MAC ' + mac + ' IP ' + ip  + '\n' + asset.Nmap);
      $('#nmapModal').modal('show');
    })
    .fail(function(error){
      alert('Error fetching scan results: ' + error.responseText);
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
  //Setup csrf for ajax
  var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  $.ajaxSetup({
    headers: {
      'CSRF-Token': token
    }
  });

  //Get current timezone in browser
  if (!sessionStorage.getItem('timezone')) {
    var tz = jstz.determine() || 'UTC';
    sessionStorage.setItem('timezone', tz.name());
  }
  var currTz = sessionStorage.getItem('timezone');

  //Adjust times in table for timezone
  $("#assetTable tr td.timezoneChange").each(function(){
    var dateParts = this.innerHTML.split(" ");
    var adjustableDateTime = dateParts[0]+'T'+dateParts[1]+'Z';
    var momentTime = moment(adjustableDateTime);
    var tzTime = momentTime.tz(currTz);

    this.innerHTML = tzTime.format('YYYY-MM-DD HH:mm:ss');
  });

  //Format table with jquery datatable options
  myAssetTable = $('#assetTable').DataTable({
    //dom: 'Bfrtip',
    "order": [1, 'asc'],
    "columnDefs": [
      { "orderable": false, "targets": 0 },
      { "searchable": false, "targets": 0 }
    ],
    "fixedHeader": {
      header: false
    },
    "scrollY": "565px",
    "lengthMenu": [ 5, 10, 25, 50, 75, 100 ],
    "responsive": true,
    buttons: [
      'copy', 'excel', 'csv'
    ]
  });

  myAssetTable.buttons().container().appendTo( '#buttonContainer' );

  $("#editAssetSubmitButton").click( function() {
    Update();
  });

  $("#datePickerStart").datepicker();
  $("#datePickerEnd").datepicker();

  $.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {
      var min = Date.parse( $('#datePickerStart').datepicker("getDate") );
      var max = Date.parse( $('#datePickerEnd').datepicker("getDate") );
      var date = Date.parse( data[8] ) || 0;
     
       if ( ( isNaN( min ) && isNaN( max ) ) ||
            ( isNaN( min ) && date <= max ) ||
            ( min <= date   && isNaN( max ) ) ||
            ( min <= date   && date <= max ) )
       {
         return true;
       }
       return false;
   }
  );

});
