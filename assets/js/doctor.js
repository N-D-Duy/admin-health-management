import { host } from './constant.js';
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
        const response = await fetch(`${host}/core/users/doctors`, {
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
    tableBody.innerHTML = ""; // Xóa nội dung hiện có

    doctors.forEach(doctor => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td id="doctorId">${doctor.id || 'NULL'}</td>
            <td id="doctorName">${doctor.first_name || 'N/A'} ${doctor.last_name || ''}</td>
            <td id="doctorAddress">${doctor.account?.email || 'N/A'}</td>
            <td id="doctorRating">${doctor.doctor_profile?.rating || 'N/A'}</td>
            <td id="doctorExperience">${doctor.doctor_profile?.experience || 'N/A'}</td>
            <td id="doctorSpecialization">${doctor.doctor_profile?.specialization || 'N/A'}</td>
        `;

        tableBody.appendChild(row);
    });
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(currentDoctors.length / ITEMS_PER_PAGE);
    const pagination = document.getElementById('doctorPagination');

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

    // Validate input fields
    if (!email || !password || !username) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    handleAddDoctor(email, password, username, role);

    // Close the modal after successful submission
    const modal = bootstrap.Modal.getInstance(document.getElementById('doctorModal'));
    modal.hide();

    
    
}

function handleAddDoctor(email, password, username, role) {
    // Make the fetch request to register the doctor
    fetch(`${host}/core/auth/register`, {
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