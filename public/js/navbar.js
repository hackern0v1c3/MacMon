$(document).ready(function() {
  //Used to display the password reset modal
  $("#changePassword").click(function () {
    $('#password1').val('');
    $('#password2').val('');
    togglePasswordSubmitButton(false);
    $('#passwordResetModal').modal('show');
  });

  $('#password1').keyup(validatePasswordInputFields);
  $('#password2').keyup(validatePasswordInputFields);
});

//used to make the password reset button clickable or not.
function togglePasswordSubmitButton(clickable) {
  if (clickable) {
    $('#passwordResetSubmitButton').prop('disabled', false);
  } else {
    $('#passwordResetSubmitButton').prop('disabled', true);
  }
}

//Used to validate the password input fields
function validatePasswordInputFields(){
  if (testComplexity($('#password2').val()) && $('#password1').val() === $('#password2').val()) {
    togglePasswordSubmitButton(true);
  } else {
    togglePasswordSubmitButton(false);
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