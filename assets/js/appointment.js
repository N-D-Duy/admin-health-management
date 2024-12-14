import { host } from './constant.js';
// Hàm gọi API và hiển thị dữ liệu trong bảng
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let appointments = [];
let currentAppointments = [];

async function fetchAndDisplayAppointments() {
    const token = localStorage.getItem("refresh_token");
    if (!token) {
        alert('Vui lòng đăng nhập để xem trang này.');
        window.location.href = 'login.html';
    }
    try {
        const response = await fetch(`${host}/core/appointment-record/all`, {
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
            appointments = data.data;
            appointments.sort((a, b) => a.id - b.id);
            currentAppointments = appointments;
            updateDisplay();
        } else {
            console.error("Error message:", data.message);
        }
    } catch (error) {
        console.error('Error fetching appointment records:', error);
    }
}

function displayAppointments(appointments) {
    const tableBody = document.getElementById("bodyAppointmentsTable");
    tableBody.innerHTML = "";

    appointments.forEach(appointment => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td id="appointmentId">${appointment.id || 'N/A'}</td>
            <td id="appointmentDoctor">${appointment.doctor.first_name || ''} ${appointment.doctor.last_name || ''}</td>
            <td id="appointmentPatient">${appointment.user.first_name || ''} ${appointment.user.last_name || ''}</td>
            <td id="appointmentProvider">${appointment.health_provider.name || 'N/A'}</td>
            <td id="appointmentType">${appointment.appointment_type || 'N/A'}</td>
            <td id="appointmentStatus">${appointment.status || 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(currentAppointments.length / ITEMS_PER_PAGE);
    const pagination = document.getElementById('appointmentPagination');
    
    pagination.innerHTML = '';
    

    // Previous button
    const prevButton = document.createElement('li');
    prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    if (currentPage > 1) {
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            changePage(currentPage - 1);
        });
    }
    pagination.appendChild(prevButton);

    // Page numbers
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Always show first page
    if (startPage > 1) {
        pagination.appendChild(createPageItem(1));
        if (startPage > 2) {
            pagination.appendChild(createEllipsis());
        }
    }

    // Show current pages
    for (let i = startPage; i <= endPage; i++) {
        pagination.appendChild(createPageItem(i));
    }

    // Always show last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagination.appendChild(createEllipsis());
        }
        pagination.appendChild(createPageItem(totalPages));
    }

    // Next button
    const nextButton = document.createElement('li');
    nextButton.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = `
        <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    if (currentPage < totalPages) {
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            changePage(currentPage + 1);
        });
    }
    pagination.appendChild(nextButton);
}

// Create a page number item
function createPageItem(pageNumber) {
    const li = document.createElement('li');
    li.className = `page-item ${currentPage === pageNumber ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${pageNumber}</a>`;
    li.addEventListener('click', (e) => {
        e.preventDefault();
        changePage(pageNumber);
    });
    return li;
}

// Create ellipsis item
function createEllipsis() {
    const li = document.createElement('li');
    li.className = 'page-item disabled';
    li.innerHTML = '<a class="page-link" href="#">...</a>';
    return li;
}

// Change page
function changePage(newPage) {
    currentPage = newPage;
    updateDisplay();
}

// Update display (both articles and pagination)
function updateDisplay() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageAppointment = currentAppointments.slice(startIndex, endIndex);
    
    displayAppointments(pageAppointment);
    updatePagination();
}

// Function to filter table rows based on selected status
function filterTableByStatus() {
    const filterValue = document.getElementById("statusFilter").value;
    if(filterValue === "ALL") {
        currentAppointments = appointments;
    } else{
        currentAppointments = appointments.filter(appointment => appointment.status === filterValue);
    }
    updateDisplay();
}

function appointmentSearch(){
    const searchValue = document.querySelector("#appointment_search input").value.toLowerCase().trim();
    console.log(searchValue);
    currentAppointments = appointments.filter(appointment => {
        return appointment.id.toString().includes(searchValue) ||
            appointment.doctor.first_name?.toLowerCase().includes(searchValue) ||
            appointment.doctor.last_name?.toLowerCase().includes(searchValue) ||
            appointment.user.first_name?.toLowerCase().includes(searchValue) ||
            appointment.user.last_name?.toLowerCase().includes(searchValue) ||
            appointment.health_provider?.name?.toLowerCase().includes(searchValue) ||
            appointment.appointment_type?.toLowerCase().includes(searchValue) ||
            appointment.status?.toLowerCase().includes(searchValue);
    });
    updateDisplay();
}

// Add event listener to select element to filter table when value changes
document.getElementById("statusFilter").addEventListener("change", filterTableByStatus);

// Initial filter to display only selected status on page load
document.addEventListener('DOMContentLoaded', filterTableByStatus);

// Add event listener to search input to filter table when value changes
document.querySelector("#appointment_search input").addEventListener("input", appointmentSearch);


document.addEventListener('DOMContentLoaded', fetchAndDisplayAppointments);