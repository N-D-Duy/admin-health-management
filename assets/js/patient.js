import { host } from './constant.js';
let allPatients = []; // Biến lưu trữ tất cả bệnh nhân
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

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
            allPatients = data.data; 
            //sort by id
            allPatients.sort((a, b) => a.id - b.id);
            updateDisplay();
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

        row.innerHTML = `
            <td id="patientId">${patient.id || 'NULL'}</td>
            <td id="patientName">${patient.first_name || 'N/A'} ${patient.last_name || ''}</td>
            <td id="patientEmail">${patient.account?.email || 'N/A'}</td>
            <td id="patientGender">${patient.gender || 'N/A'}</td>
            <td id="patientStatus">${patient.account?.status || 'N/A'}</td>
        `;

        tableBody.appendChild(row);
    });
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(allPatients.length / ITEMS_PER_PAGE);
    const pagination = document.getElementById('patientPagination');
    
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
    const pagePatients = allPatients.slice(startIndex, endIndex);
    
    displayPatients(pagePatients);
    updatePagination();
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayPatients);