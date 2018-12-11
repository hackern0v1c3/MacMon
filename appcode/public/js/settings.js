function Update(){
  
  var newConfig = {}
  newConfig.hashStrength = parseInt($('#hashStrengthInput').val());

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

  //Used to display the email password reset modal
  $("#editEmailAccountButton").click(function () {
    $('#emailPassword1').val('');
    $('#emailPassword2').val('');
    $('#emailPasswordResetSubmitButton').prop('disabled', true);
    $('#emailPasswordResetModal').modal('show');
  });

  $('#emailPassword1').keyup(validateEmailPasswordInputFields);
  $('#emailPassword2').keyup(validateEmailPasswordInputFields);

  $("#emailPasswordResetSubmitButton").click( function() {
    UpdateEmailPassword();
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