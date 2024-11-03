import { host } from './constant.js';

$(document).ready(function () {
    $('#loginButton').click(function (e) {
        e.preventDefault();

        // Lấy giá trị email và password mỗi lần người dùng nhấn nút login
        let email = document.getElementById('exampleInputEmail').value;
        let password = document.getElementById('exampleInputPassword').value;

        $.ajax({
            url: `${host}/auth/login`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                email: email,
                password: password,
                notification_key: "stringstringstring"
            }),
            success: function (data) {
                if (data && data.access_token && data.refresh_token) {
                    checkPrivilege(data.access_token, data.refresh_token, email);
                } else {
                    alert('Đăng nhập thất bại');
                }
            },
            error: function () {
                alert('Có lỗi xảy ra trong quá trình đăng nhập.');
            }
        });
    });

    function checkPrivilege(access_token, refresh_token, email) {
        $.ajax({
            url: `${host}/users/email`,
            type: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
            data: {
                email: email
            }
        }).done(function (data) {
            if (data.data.role !== 'ADMIN') {
                alert('Bạn không có quyền truy cập trang này.');
                window.location.href = 'login.html';
            } else {
                localStorage.setItem("access_token", access_token);
                localStorage.setItem("refresh_token", refresh_token);
                localStorage.setItem("userId", data.data.id);
                window.location.href = 'index.html';
            }
        }).fail(function () {
            alert('Bạn không có quyền truy cập trang này.');
            window.location.href = 'login.html';
        });
    }
});
