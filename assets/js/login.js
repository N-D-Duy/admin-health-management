$(document).ready(function() {
    $('#loginButton').click(function(e) {
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:8080/api/v1/core/auth/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                email: $('input[name="email"]').val(),
                password: $('input[name="password"]').val(),
                notification_key: "stringstringstring"
            }),
            success: function(data, textStatus, xhr) {
                if (xhr.status == 200) {
                    localStorage.setItem("access_token", data.access_token);
                    localStorage.setItem("refresh_token", data.refresh_token);
                    alert('Đăng nhập thành công');
                    window.location.href = 'index.html';
                } else {
                    alert('Đăng nhập thất bại');
                }
            },
            error: function() {
                alert('Có lỗi xảy ra trong quá trình đăng nhập.');
            }
        });
    });
});
