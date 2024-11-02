import { host } from './constant.js';
let allDoctors = []; // Biến lưu trữ tất cả bác sĩ

async function fetchAndDisplayDoctor() {
    console.log("fetchAndDisplayDoctor called");
    const fixedToken = localStorage.getItem("refresh_token");
    if (!fixedToken) {
        alert('Vui lòng đăng nhập để xem trang này.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${host}/users/doctors`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${fixedToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data từ API:", data);

        if (data.code === 200) {
            allDoctors = data.data; // Lưu tất cả bác sĩ vào biến
            displayDoctors(allDoctors); // Hiển thị tất cả bác sĩ
        } else {
            console.error("Error message:", data.message);
        }
    } catch (error) {
        console.error('Error fetching appointment records:', error);
    }
}

function displayDoctors(doctors) {
    console.log("displayDoctors called with doctors:", doctors);
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = ""; // Xóa nội dung hiện có

    doctors.forEach(doctor => {
        const row = document.createElement("tr");

        const doctorCell = document.createElement("td");
        doctorCell.textContent = `${doctor.first_name || 'N/A'} ${doctor.last_name || 'N/A'}`;
        row.appendChild(doctorCell);

        const addressCell = document.createElement("td");
        addressCell.textContent = (doctor.addresses.length > 0) ? doctor.addresses[0] : 'N/A';
        row.appendChild(addressCell);

        const idDoctorCell = document.createElement("td");
        idDoctorCell.textContent = doctor.id || 'NULL';
        row.appendChild(idDoctorCell);

        const ratingDateCell = document.createElement("td");
        ratingDateCell.textContent = doctor.doctor_profile.rating || 'N/A';
        row.appendChild(ratingDateCell);

        const experienceCell = document.createElement("td");
        experienceCell.textContent = doctor.doctor_profile.experience || 'N/A'
        row.appendChild(experienceCell);

        const specializationCell = document.createElement("td");
        specializationCell.textContent = doctor.doctor_profile.specialization || 'N/A';
        row.appendChild(specializationCell);

        tableBody.appendChild(row);
    });
}

function filterDoctors() {
    console.log("filterDoctors called");
    const ratingFilter = document.getElementById("ratingFilter").value;
    const filteredDoctors = ratingFilter
        ? allDoctors.filter(doctor => doctor.doctor_profile.rating >= ratingFilter)
        : allDoctors;

    displayDoctors(filteredDoctors);
}

document.getElementById("ratingFilter").addEventListener('change', filterDoctors);
document.addEventListener('DOMContentLoaded', fetchAndDisplayDoctor);