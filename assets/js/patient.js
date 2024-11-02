import { host } from './constant.js';
let allPatients = []; // Biến lưu trữ tất cả bệnh nhân

async function fetchAndDisplayPatients() {
    const fixedToken = localStorage.getItem("refresh_token");
    if (!fixedToken) {
        alert('Vui lòng đăng nhập để xem trang này.');
        window.location.href = 'login.html';
    }

    try {
        const response = await fetch(`${host}/users/patients`, {
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
            allPatients = data.data; // Lưu tất cả bệnh nhân vào biến
            displayPatients(allPatients); // Hiển thị tất cả bệnh nhân
        } else {
            console.error("Error message:", data.message);
        }
    } catch (error) {
        console.error('Error fetching patient records:', error);
    }
}

function displayPatients(patients) {
    const tableBody = document.getElementById("bodyPatientsTable");
    tableBody.innerHTML = ""; // Xóa nội dung hiện có

    patients.forEach(patient => {
        const row = document.createElement("tr");

        // Cột Name
        const nameCell = document.createElement("td");
        nameCell.textContent = `${patient.first_name || 'N/A'} ${patient.last_name || 'N/A'}`;
        row.appendChild(nameCell);

        // Cột Address
        const addressCell = document.createElement("td");
        addressCell.textContent = (patient.addresses.length > 0) ? patient.addresses[0].city : 'N/A';
        row.appendChild(addressCell);

        // Cột Email
        const emailCell = document.createElement("td");
        emailCell.textContent = patient.account ? patient.account.email : 'N/A';
        row.appendChild(emailCell);

        // Cột ID
        const idCell = document.createElement("td");
        idCell.textContent = patient.id || 'NULL';
        row.appendChild(idCell);

        // Cột Gender
        const genderCell = document.createElement("td");
        genderCell.textContent = patient.gender || 'N/A';
        row.appendChild(genderCell);

        // Cột Status
        const statusCell = document.createElement("td");
        statusCell.textContent = patient.account ? patient.account.status : 'N/A';
        row.appendChild(statusCell);

        tableBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayPatients);