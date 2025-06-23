import { HOST, APPOINTMENT_EXPORT } from './constant.js';

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
        const response = await fetch(`${HOST}/core/appointments/all`, {
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
            <td><button class="btn btn-success btn-sm export-appointment-btn" data-id="${appointment.id}"><i class="fas fa-file-export"></i> Export</button></td>
        `;
        tableBody.appendChild(row);
    });
    
    document.querySelectorAll('.export-appointment-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const appointmentId = this.getAttribute('data-id');
            const token = localStorage.getItem("refresh_token");
            if (!token) {
                alert('Vui lòng đăng nhập để export.');
                return;
            }
            
            let lang = prompt("Chọn ngôn ngữ file export: 'vie' (Tiếng Việt) hoặc 'en' (English)", "en");
            if (!lang || (lang !== 'vie' && lang !== 'en')) {
                alert('Vui lòng nhập \"vie\" hoặc \"en\".');
                return;
            }
            try {
                const response = await fetch(`${APPOINTMENT_EXPORT}${appointmentId}?lang=${lang}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    alert('Export thất bại!');
                    return;
                }
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `appointment_${appointmentId}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } catch (err) {
                alert('Có lỗi khi export!');
            }
        });
    });
}


function updatePagination() {
    const totalPages = Math.ceil(currentAppointments.length / ITEMS_PER_PAGE);
    const pagination = document.getElementById('appointmentPagination');
    
    pagination.innerHTML = '';
    

    
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

    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    
    if (startPage > 1) {
        pagination.appendChild(createPageItem(1));
        if (startPage > 2) {
            pagination.appendChild(createEllipsis());
        }
    }

    
    for (let i = startPage; i <= endPage; i++) {
        pagination.appendChild(createPageItem(i));
    }

    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            pagination.appendChild(createEllipsis());
        }
        pagination.appendChild(createPageItem(totalPages));
    }

    
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


function createEllipsis() {
    const li = document.createElement('li');
    li.className = 'page-item disabled';
    li.innerHTML = '<a class="page-link" href="#">...</a>';
    return li;
}


function changePage(newPage) {
    currentPage = newPage;
    updateDisplay();
}


function updateDisplay() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageAppointment = currentAppointments.slice(startIndex, endIndex);
    
    displayAppointments(pageAppointment);
    updatePagination();
}


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


document.getElementById("statusFilter").addEventListener("change", filterTableByStatus);


document.addEventListener('DOMContentLoaded', filterTableByStatus);


document.querySelector("#appointment_search input").addEventListener("input", appointmentSearch);


document.addEventListener('DOMContentLoaded', fetchAndDisplayAppointments);