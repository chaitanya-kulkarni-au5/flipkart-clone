$(document).ready(function () {

    $('#cfpassword').on('keyup', function () {
        var name = $('#name').val()
        var lastname = $('#lastname').val()
        var email = $('#email').val()
        var phone = $('#phone').val()
        var pwd = $('#password').val()
        var cpwd = $('#cfpassword').val()
        if (pwd == cpwd) {
            $('#cpmessage').text('Passwords match')
            if (name.length > 3 && email.length > 5 && lastname.length > 3 && phone.length == 10) {
                $('#button').removeAttr('disabled')
            }
            else {
                $('#button').attr('disabled', 'true')
            }
        }
        else{
            $('#cpmessage').text('Passwords do not match')
            $('#button').attr('disabled', 'true')
        }

    })


});