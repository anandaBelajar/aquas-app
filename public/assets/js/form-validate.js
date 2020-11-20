// Wait for the DOM to be ready
$(function() {
    /**Start add administrator form avalidation */
    $.validator.addMethod("gmail", function(value, element) {
        return this.optional(element) || /^.+@gmail.com$/.test(value)
    }, 'Email harus menggunakan Gmail');

    $("#add_admin_form").validate({
        // Specify validation rules
        rules: {
            name: {
                required: true,
                maxlength: 100,
            },
            email: {
                required: true,
                maxlength: 100,
                gmail: true
            },
            password: {
                required: true,
                maxlength: 50,
                minlength: 6
            }
        },
        // Specify validation error messages
        messages: {
            name: {
                required: "Nama harus diisi",
                maxlength: "Nama maksimal 100 karakter",
            },
            email: {
                required: "Email harus diisi",
                maxlength: "Email maksimal 100 karakter",
            },
            password: {
                required: "Password harus diisi",
                minlength: "Password minimal 6 karakter",
                maxlength: "Password maksimal 50 karakter",
            },
            //email: "Email ynag anda masukkan tidak valid"
        },
        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function(form) {
            form.submit();
        }
    });

    $("#edit_admin_form").validate({
        // Specify validation rules
        rules: {
            name: {
                required: true,
                maxlength: 100,
            },
            email: {
                required: true,
                gmail: true,
                maxlength: 100,
            },
            password: {
                required: true,
                minlength: 6,
                maxlength: 50,
            }
        },
        // Specify validation error messages
        messages: {
            name: {
                required: "Nama harus diisi",
                maxlength: "Nama maksimal 100 karakter",
            },
            email: {
                required: "Email harus diisi",
                maxlength: "Email maksimal 100 karakter",
            },
            password: {
                required: "Password harus diisi",
                minlength: "Password minimal 6 karakter",
                maxlength: "Email maksimal 50 karakter",
            },
            //email: "Email ynag anda masukkan tidak valid"
        },
        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function(form) {
            form.submit();
        }
    });

    /**Start image form*/
    $("#upload_image_form").validate({
        // Specify validation rules
        rules: {
            picture: "required",
            maxlength: 500
        },
        // Specify validation error messages
        messages: {
            picture: "Foto belum dipilih",
            maxlength: "Path foto terlalu panjang"
        },
        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function(form) {
            form.submit();
        }
    });
    /**End image form*/

    /**Start login form*/
    $("#login_form").validate({
        // Specify validation rules
        rules: {
            email: {
                required: true,
            },
            password: {
                required: true,
            }
        },
        // Specify validation error messages
        messages: {
            email: {
                required: "Email harus diisi",
            },
            password: {
                required: "Password harus diisi",
            },
            //email: "Email ynag anda masukkan tidak valid"
        },
        // Make sure the form is submitted to the destination defined
        // in the "action" attribute of the form when valid
        submitHandler: function(form) {
            form.submit();
        }
    });
    /**End login form*/






});