import { HOST, DOCTOR_SCHEDULE_EXPORT } from './constant.js';
let allDoctors = [];
let currentDoctors = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
async function fetchAndDisplayDoctor() {
    console.log("fetchAndDisplayDoctor called");
    const fixedToken = localStorage.getItem("refresh_token");
    if (!fixedToken) {
        alert('Vui lòng đăng nhập để xem trang này.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${HOST}/core/users/doctors`, {
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
            allDoctors = data.data;
            allDoctors.sort((a, b) => a.id - b.id);
            currentDoctors = allDoctors;
            updateDisplay();
        } else {
            console.error("Error message:", data.message);
        }
    } catch (error) {
        console.error('Error fetching doctors:', error);
    }
}

function displayDoctors(doctors) {
    const tableBody = document.getElementById("bodyDoctorsTable");
    tableBody.innerHTML = ""; 

    doctors.forEach(doctor => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td id="doctorId">${doctor.id || 'NULL'}</td>
            <td id="doctorName">${doctor.first_name || 'N/A'} ${doctor.last_name || ''}</td>
            <td id="doctorAddress">${doctor.account?.email || 'N/A'}</td>
            <td id="doctorRating">${doctor.doctor_profile?.rating || 'N/A'}</td>
            <td id="doctorExperience">${doctor.doctor_profile?.experience || 'N/A'}</td>
            <td id="doctorSpecialization">${doctor.doctor_profile?.specialization || 'N/A'}</td>
            <td><button class="btn btn-success btn-sm export-doctor-btn" data-id="${doctor.id}" data-name="${doctor.first_name} ${doctor.last_name}"><i class="fas fa-file-export"></i> Export</button></td>
        `;

        tableBody.appendChild(row);
    });

    
    document.querySelectorAll('.export-doctor-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            
            const doctorId = this.getAttribute('data-id');
            const doctorName = this.getAttribute('data-name');
            const modal = new bootstrap.Modal(document.getElementById('exportDoctorModal'));
            document.getElementById('exportDoctorModal').setAttribute('data-doctor-id', doctorId);
            document.getElementById('exportDoctorModal').setAttribute('data-doctor-name', doctorName);
            
            document.getElementById('exportDoctorForm').reset();
            modal.show();
        });
    });

    
    document.getElementById('exportDoctorSubmitBtn').onclick = async function() {
        const modalEl = document.getElementById('exportDoctorModal');
        const doctorId = modalEl.getAttribute('data-doctor-id');
        const doctorName = modalEl.getAttribute('data-doctor-name');
        const token = localStorage.getItem("refresh_token");
        if (!token) {
            alert('Vui lòng đăng nhập để export.');
            return;
        }
        const appendString = "T00:00:00"
        let startDate = document.getElementById('exportStartDate').value + appendString;
        let endDate = document.getElementById('exportEndDate').value;
        if (!startDate) {
            alert('Vui lòng chọn ngày bắt đầu!');
            return;
        }
    
        let url = `${DOCTOR_SCHEDULE_EXPORT}${doctorId}?startDate=${startDate}`;
        if (endDate) {
            endDate = endDate + appendString;
            if(endDate < startDate) {
                alert('Ngày kết thúc phải lớn hơn ngày bắt đầu!');
                return;
            }

            if(endDate > new Date().toISOString().split('T')[0]) {
                alert('Ngày kết thúc không được lớn hơn ngày hiện tại!');
                return;
            }
            url += `&endDate=${endDate}`;
        }
        try {
            const response = await fetch(url, {
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
            const urlBlob = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = urlBlob;
            
            const disposition = response.headers.get('Content-Disposition');
            let filename = `doctor_schedule_${doctorName}.xlsx`;
            if (disposition && disposition.indexOf('filename=') !== -1) {
                filename = disposition.split('filename=')[1].replace(/['"]/g, '');
            }
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(urlBlob);
            
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
        } catch (err) {
            alert('Có lỗi khi export!');
        }
    };
}


function updatePagination() {
    const totalPages = Math.ceil(currentDoctors.length / ITEMS_PER_PAGE);
    const pagination = document.getElementById('doctorPagination');

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
    const pageDoctors = currentDoctors.slice(startIndex, endIndex);

    displayDoctors(pageDoctors);
    updatePagination();
}


function filterDoctors() {
    const ratingFilter = document.getElementById("ratingFilter").value;
    if (ratingFilter === "ALL") {
        currentDoctors = allDoctors;
    } else {
        currentDoctors = allDoctors.filter(doctor => parseInt(doctor.doctor_profile?.rating) === parseInt(ratingFilter));
    }
    updateDisplay();
}

function searchDoctors() {
    const searchValue = document.querySelector("#doctor_search input").value.trim();
    currentDoctors = allDoctors.filter(doctor =>
        doctor.first_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        doctor.last_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        doctor.account?.email?.toLowerCase().includes(searchValue.toLowerCase())
    );
    updateDisplay();
}

function openModal() {
    const modal = new bootstrap.Modal(document.getElementById('doctorModal'));
    modal.show();
}

function addDoctor() {
    const email = document.getElementById("doctorEmailInput").value.trim();
    const password = document.getElementById("doctorPasswordInput").value.trim();
    const username = document.getElementById("doctorUsernameInput").value.trim();
    const role = 'DOCTOR';

    
    if (!email || !password || !username) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    handleAddDoctor(email, password, username, role);

    
    const modal = bootstrap.Modal.getInstance(document.getElementById('doctorModal'));
    modal.hide();

    
    
}

function handleAddDoctor(email, password, username, role) {
    
    fetch(`${HOST}/core/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, username, role })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Something went wrong');
    })
    .then(data => {
        if (data.code === 200) {
            alert("Thêm bác sĩ thành công");
            fetchAndDisplayDoctor();
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

document.getElementById("ratingFilter").addEventListener('change', filterDoctors);
document.addEventListener('DOMContentLoaded', fetchAndDisplayDoctor);
document.querySelector("#doctor_search input").addEventListener('input', searchDoctors);
document.getElementById("addDoctorBtn").addEventListener('click', openModal);
document.getElementById("createDoctorBtn").addEventListener('click', addDoctor);