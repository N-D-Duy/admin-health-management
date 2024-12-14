import { host } from './constant.js';
// Hàm để gọi API và cập nhật thông tin người dùng
async function fetchAnalytics() {
    try {
        const fixedToken = localStorage.getItem("refresh_token");
        if (!fixedToken) {
            alert('Vui lòng đăng nhập để xem trang này.');
            window.location.href = 'login.html';
        }
        const response = await fetch(`${host}/core/analytics?startDate=2024-10-01&endDate=2025-01-05`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${fixedToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Kiểm tra xem phản hồi có thành công không
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Chuyển đổi phản hồi thành JSON
        const data = await response.json();

        // Kiểm tra mã phản hồi từ server
        if (data.code === 200) {
            // Cập nhật giá trị Total User trong card body
            const totalUsers = data.data.total_users;
            const totalArticles = data.data.articles_created;
            const totalPatient = data.data.total_patients;
            const totalDoctors = data.data.total_doctors;
            const totalAppointmentScheduled = data.data.appointments_scheduled;
            const totalAppointmentCompleted = data.data.appointments_completed;
            const totalAppointmentCancelled = data.data.appointments_cancelled;
            
            const totalAppointment = totalAppointmentScheduled + totalAppointmentCompleted + totalAppointmentCancelled;
            
            // Thay đổi selector để chính xác hơn
            document.querySelector('.card-body .text-dark.h5 span').textContent = totalUsers;
             const articlesCreated = data.data.articles_created;
            const articlesCountSpan = document.getElementById('articlesCount');
            articlesCountSpan.textContent = articlesCreated;
            const patientCount = document.getElementById('totalPatient');
            patientCount.textContent = totalPatient;
            const doctorsCount = document.getElementById('totalDoctor');
            doctorsCount.textContent = totalDoctors;
            const AppointmentCount = document.getElementById('totalAppointment');
            AppointmentCount.textContent = totalAppointment;
        } else {
            console.error(data.message); // Hiển thị thông báo lỗi
        }
    } catch (error) {
        console.error('Error fetching analytics:', error);
   } 
}

// Gọi hàm khi trang được tải
window.addEventListener('load', fetchAnalytics);
