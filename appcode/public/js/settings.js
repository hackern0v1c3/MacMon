function Update(){
  
  var newConfig = {}
  newConfig.dbUser = $('#dbUserInput').val();
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
  
  //Used to display the database password reset modal
  $("#editDatabasePasswordButton").click(function () {
    $('#databasePassword1').val('');
    $('#databasePassword2').val('');
    $('#databasePasswordResetSubmitButton').prop('disabled', true);
    $('#databasePasswordResetModal').modal('show');
  });

  $('#databasePassword1').keyup(validateDatabsePasswordInputFields);
  $('#databasePassword2').keyup(validateDatabsePasswordInputFields);

  $("#databasePasswordResetSubmitButton").click( function() {
    UpdateDbPassword();
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

  //Used to display the cookie signing secret reset modal
  $("#editCookieSecretButton").click(function () {
    $('#cookieSecret1').val('');
    $('#cookieSecret2').val('');
    $('#cookieSecretResetSubmitButton').prop('disabled', true);
    $('#cookieSecretResetModal').modal('show');
  });

  $('#cookieSecret1').keyup(validateCookieSecretInputFields);
  $('#cookieSecret2').keyup(validateCookieSecretInputFields);

  $("#cookieSecretResetSubmitButton").click( function() {
    UpdateCookieSecret();
  });
});

//Used to validate the database password input fields
function validateDatabsePasswordInputFields(){
  if (testComplexity($('#databasePassword1').val()) && $('#databasePassword1').val() === $('#databasePassword2').val()) {
    $('#databasePasswordResetSubmitButton').prop('disabled', false);
  } else {
    $('#databasePasswordResetSubmitButton').prop('disabled', true);
  }
}

//Used to validate the email password input fields
function validateEmailPasswordInputFields(){
  if (testComplexity($('#emailPassword1').val()) && $('#emailPassword1').val() === $('#emailPassword2').val()) {
    $('#emailPasswordResetSubmitButton').prop('disabled', false);
  } else {
    $('#emailPasswordResetSubmitButton').prop('disabled', true);
  }
}

//Used to validate the cookie signing secret input fields
function validateCookieSecretInputFields(){
  if (testComplexity($('#cookieSecret1').val()) && $('#cookieSecret1').val() === $('#cookieSecret2').val()) {
    $('#cookieSecretResetSubmitButton').prop('disabled', false);
  } else {
    $('#cookieSecretResetSubmitButton').prop('disabled', true);
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

function UpdateDbPassword(){
  var conf = {}
  conf.dbPassword = $('#databasePassword1').val();

  $.post('/settings/dbPassword/', conf, function(){
    $('#databasePasswordResetModal').modal('hide');
  });
}

function UpdateEmailPassword(){
  var conf = {}
  conf.emailSenderPassword = $('#emailPassword1').val();

  $.post('/settings/emailPassword/', conf, function(){
    $('#emailPasswordResetModal').modal('hide');
  });
}

function UpdateCookieSecret(){
  var conf = {}
  conf.cookieSecret = $('#cookieSecret1').val();

  $.post('/settings/cookieSecret/', conf, function(){
    $('#cookieSecretResetModal').modal('hide');
  });
}