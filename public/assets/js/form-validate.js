$(function() {
    //Start add admnistrator form validation
    $.validator.addMethod("gmail", function(value, element) {
        return this.optional(element) || /^.+@gmail.com$/.test(value)
    }, 'Email harus menggunakan Gmail');

    //add admin form validation rule
    $("#add_admin_form").validate({
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
        //add admin form error validation message
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
        },
        submitHandler: function(form) {
            form.submit();
        }
    });
    //End add administartor validation form

    //Start edit admin form validation form
    $("#edit_admin_form").validate({
        //edit admin form validation rule
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
        //edit admin form validation error message
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
        },
        submitHandler: function(form) {
            form.submit();
        }
    });

    //Start admin image profile form validation
    $("#upload_image_form").validate({
        //admin image profile validation rule
        rules: {
            picture: "required",
            maxlength: 500
        },
        //admin image profile validation error message
        messages: {
            picture: "Foto belum dipilih",
            maxlength: "Path foto terlalu panjang"
        },
        submitHandler: function(form) {
            form.submit();
        }
    });
    //End admin image profile form validation

    //Start login form validation 
    $("#login_form").validate({
        //login form validation error message
        rules: {
            email: {
                required: true,
            },
            password: {
                required: true,
            }
        },
        //login form validation error message
        messages: {
            email: {
                required: "Email harus diisi",
            },
            password: {
                required: "Password harus diisi",
            },
        },
        submitHandler: function(form) {
            form.submit();
        }
    });
    //end login form validation






});