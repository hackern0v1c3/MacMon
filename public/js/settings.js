function Update(){
  
  var newConfig = {}
  newConfig.dbAddress = $('#dbAddressInput').val();
  newConfig.dbPort = parseInt($('#dbPortInput').val());
  newConfig.dbUser = $('#dbUserInput').val();
  newConfig.dbName = $('#dbNameInput').val();
  newConfig.hashStrength = parseInt($('#hashStrengthInput').val());
  newConfig.serverPort = parseInt($('#serverPortInput').val());

  var CidrArray = JSON.parse($('#CidrRangesInput').val());
  newConfig.CidrRanges = CidrArray;

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
  
  $.ajax({
    url: '/settings', 
    type: 'POST', 
    contentType: 'application/json', 
    data: JSON.stringify(newConfig)
  });
}

$(document).ready( function () {
  $("#editSettingsSubmitButton").click( function() {
    Update();
  });
});