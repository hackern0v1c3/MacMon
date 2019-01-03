//User to update the config.js file
function Update(){
  
  var newConfig = {}
  newConfig.hashStrength = parseInt($('#hashStrengthInput').val());

  var CidrArray = [];
  $('#cidrTable tbody tr td:first-child').each( function(){
    CidrArray.push( $(this).text() );       
  });

  CidrArray.splice(-1,1)

  newConfig.CidrRanges = CidrArray;
  console.log(newConfig.CidrRanges);

  newConfig.scanInterval = parseInt($('#scanIntervalInput').val());
  newConfig.emailServer = $('#emailServerInput').val();
  newConfig.smtpPort = parseInt($('#smtpPortInput').val());
  newConfig.emailSender = $('#emailSenderInput').val();
  newConfig.emailSenderUsername = $('#emailSenderUsernameInput').val();
  newConfig.emailRecipient = $('#emailRecipientInput').val();
  if ($('#emailTlsInput').prop('checked')) {
    newConfig.emailTls = "True";
  } else {
    newConfig.emailTls = "False";
  }
  if ($('#emailNotificationsInput').prop('checked')) {
    newConfig.emailNotifications = "True";
  } else {
    newConfig.emailNotifications = "False";
  }
  
  $.ajax({
    url: '/settings', 
    type: 'POST', 
    contentType: 'application/json', 
    data: JSON.stringify(newConfig),
    success: function(data) {
      $('#saveConfirmModal').modal('show');
    },
    error: function(error){
      alert("save failed " + error);
    }
  });
}

//Used to request a database backup
function BackupDb(){
  $.ajax({
    url: '/dbbackup', 
    type: 'POST', 
    contentType: 'application/json', 
    data: JSON.stringify({"action":"backup"}),
    success: function(data) {
      alert("backup success");
    },
    error: function(error){
      alert("backup failed " + error);
    }
  });
}

//Used to request a database restore from filename
function RestoreDatabase(filename){
  $.ajax({
    url: '/dbbackup', 
    type: 'POST', 
    contentType: 'application/json', 
    data: JSON.stringify({"action":"restore", "filename":filename}),
    success: function(data) {
      alert("restore requested");
    },
    error: function(error){
      alert("restore error " + error);
    }
  });
}

//Used to retrieve a list of backup files on the server
function GetBackupFiles(cb){
  $.ajax({
    url: '/dbbackup', 
    type: 'POST', 
    contentType: 'application/json', 
    data: JSON.stringify({"action":"getfilelist"}),
    success: function(data) {
      cb(null, data);
    },
    error: function(error){
      cb(error, null);
    }
  });
}

//Used to add a new Cidr range to the scanner settings table
function AddRange(){
  var range = $('#newCidrInput').val();
  $('#cidrTable tr:last').before('<tr><td>'+range+'</td><td align="right"><button type="button" class="btn btn-danger removeCidrButton">X</button></td></tr>');
  $('#newCidrInput').val('');
}

$(document).ready( function () {
  $("#editSettingsSubmitButton").click( function() {
    Update();
  });

  $("#newCidrButton").click( function() {
    AddRange();
  });

  //Used to remove a Cidr tange from the scanner settings table
  $('#cidrTable').on('click', '.removeCidrButton', function() {
    $(this).closest("tr").remove();
  });
  
  //Used to display the email password reset modal
  $("#editEmailAccountButton").click(function () {
    $('#emailPassword1').val('');
    $('#emailPassword2').val('');
    $('#emailPasswordResetSubmitButton').prop('disabled', true);
    $('#emailPasswordResetModal').modal('show');
  });

  //Used to display the database restore modal
  $("#restoreDatabaseButton").click(function () {
    GetBackupFiles(function(err, data){
      if (!err){
        $('#databaseRestoreSelection').empty();

        $.each(data, function(val, text) {
          $('#databaseRestoreSelection').append($('<option></option>').val(val).html(text));
        });
        $('#databaseRestoreModal').modal('show');
      } 
    });  
  });

  $('#emailPassword1').keyup(validateEmailPasswordInputFields);
  $('#emailPassword2').keyup(validateEmailPasswordInputFields);

  $("#emailPasswordResetSubmitButton").click( function() {
    UpdateEmailPassword();
  });

  $("#databaseRestoreSubmitButton").click( function() {  
    RestoreDatabase($("#databaseRestoreSelection option:selected").text());
  });

  //Called when backup database button is pressed
  $("#backupDatabaseButton").click( function() {
    BackupDb();
  });
  
});

//Used to validate the email password input fields
function validateEmailPasswordInputFields(){
  if (testComplexity($('#emailPassword1').val()) && $('#emailPassword1').val() === $('#emailPassword2').val()) {
    $('#emailPasswordResetSubmitButton').prop('disabled', false);
  } else {
    $('#emailPasswordResetSubmitButton').prop('disabled', true);
  }
}

//Used to test the complexity of a potential password
function testComplexity(potentialPassword) {
  if (potentialPassword.length > 0) {
    return true;
  } else {
    return false;
  }
}

function UpdateEmailPassword(){
  var conf = {}
  conf.emailSenderPassword = $('#emailPassword1').val();

  $.post('/settings/emailPassword/', conf, function(){
    $('#emailPasswordResetModal').modal('hide');
  });
}