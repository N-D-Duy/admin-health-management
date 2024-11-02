import { host } from './constant.js';
// Hàm gọi API và hiển thị dữ liệu trong bảng
async function fetchAndDisplayAppointments() {
    const token = localStorage.getItem("refresh_token");
    if (!token) {
        alert('Vui lòng đăng nhập để xem trang này.');
        window.location.href = 'login.html';
    }
    try {
        const response = await fetch(`${host}/appointment-record/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.code === 200) {
            const appointments = data.data;
            const tableBody = document.getElementById("tableBody");

            // Xóa nội dung hiện có trong tbody
            tableBody.innerHTML = "";

            // Tạo các hàng từ dữ liệu API và thêm vào tbody
            appointments.forEach(appointment => {
                const row = document.createElement("tr");

                // Cột tên bác sĩ 
                const doctorCell = document.createElement("td");
                doctorCell.textContent = `${appointment.doctor.first_name || ''} ${appointment.doctor.last_name || ''}`;
                row.appendChild(doctorCell);

                // Cột tên bệnh nhân
                const patientCell = document.createElement("td");
                patientCell.textContent = `${appointment.user.first_name || ''} ${appointment.user.last_name || ''}`;
                row.appendChild(patientCell);

                // Cột nhà cung cấp dịch vụ y tế
                const providerCell = document.createElement("td");
                providerCell.textContent = appointment.health_provider.name || 'N/A';
                row.appendChild(providerCell);

                // Cột ID
                const idCell = document.createElement("td");
                idCell.textContent = appointment.id;
                row.appendChild(idCell);

                // Cột loại cuộc hẹn
                const appointmentTypeCell = document.createElement("td");
                appointmentTypeCell.textContent = appointment.appointment_type;
                row.appendChild(appointmentTypeCell);

                // Cột trạng thái
                const statusCell = document.createElement("td");
                statusCell.textContent = appointment.status;
                row.appendChild(statusCell);

                // Thêm hàng vào tbody
                tableBody.appendChild(row);
            });
        } else {
            console.error("Error message:", data.message);
        }
    } catch (error) {
        console.error('Error fetching appointment records:', error);
    }
}
// Function to filter table rows based on selected status
function filterTableByStatus() {
    const filterValue = document.getElementById("statusFilter").value;
    const tableRows = document.querySelectorAll("#tableBody tr");

    tableRows.forEach(row => {
        const statusCell = row.cells[5].textContent || row.cells[5].innerText;

        // Show row if status matches selected value
        if (statusCell === filterValue) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// Add event listener to select element to filter table when value changes
document.getElementById("statusFilter").addEventListener("change", filterTableByStatus);

// Initial filter to display only selected status on page load
document.addEventListener('DOMContentLoaded', filterTableByStatus);



// Đảm bảo dữ liệu được đổ sau khi trang render
document.addEventListener('DOMContentLoaded', fetchAndDisplayAppointments);