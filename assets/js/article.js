import { HOST } from './constant.js';

let allArticles = [];
let currentArticles = [];
let currentArticle = null;
let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let fixedToken = localStorage.getItem("refresh_token");
let userId = localStorage.getItem("userId");


async function fetchAndDisplayArticles() {
    if (!fixedToken) {
        alert('Vui lòng đăng nhập để xem trang này.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${HOST}/core/articles/get-all`, {
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
        
        if (data.code === 200) {
            allArticles = data.data.sort((a, b) => a.id - b.id);
            currentArticles = allArticles;
            updateDisplay();
        } else {
            console.error("Error message:", data.message);
        }
    } catch (error) {
        console.error('Error fetching articles:', error);
    }
}

function searchArticle() {
    const searchValue = document.querySelector("#article_search input").value.trim();
    console.log("Search value:", searchValue);
    currentArticles = allArticles.filter(article => {
        return article.title?.toLowerCase().includes(searchValue.toLowerCase()) || 
               article.content?.toLowerCase().includes(searchValue.toLowerCase());
    });
    updateDisplay();
}

function categoryFilter() {
    const category = document.getElementById("categoryFilter").value;
    console.log("Category filter:", category);
    if (category === "ALL") {
        currentArticles = allArticles;
    } else {
        currentArticles = allArticles.filter(article => article.category === category);
    }
    updateDisplay();
}


function displayArticles(articles) {
    const tableBody = document.getElementById("bodyArticlesTable");
    tableBody.innerHTML = "";

    articles.forEach(article => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td id="articleId">${article.id || 'NULL'}</td>
            <td id="articleAuthor">${article.username || 'N/A'}</td>
            <td id="articleTitle">${article.title || 'N/A'}</td>
            <td id="articleContent">${article.content || 'N/A'}</td>
            <td id="articleCategory">${article.category || 'N/A'}</td>
            <td id="articleVote">${article.votes ? article.votes.length : 0}</td>
        `;
        row.addEventListener("click", () => {
            openBootstrapModal(article);
        });
        tableBody.appendChild(row);
    });
}

function openBootstrapModal(article) {
    currentArticle = article; 
    document.getElementById("articleTitleInput").value = article.title || "";
    document.getElementById("articleContentInput").value = article.content || "";

    const modal = new bootstrap.Modal(document.getElementById('articleModal'));
    modal.show();
}

function updateArticle() {
    
    const updatedTitle = document.getElementById("articleTitleInput").value;
    const updatedContent = document.getElementById("articleContentInput").value;

    
    if (currentArticle) {
        currentArticle.title = updatedTitle;
        currentArticle.content = updatedContent;
        
        
        handleUpdateArticle(currentArticle);

        
        const modal = bootstrap.Modal.getInstance(document.getElementById('articleModal'));
        modal.hide();
    }
}

function handleUpdateArticle(article) {
    
    fetch(`${HOST}/core/articles/update?userId=${userId}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${fixedToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(article)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Update article response:', data);
        if (data.code === 200) {
            
            const index = allArticles.findIndex(a => a.id === article.id);
            if (index !== -1) {
                allArticles[index] = article;
                currentArticles = allArticles;
                updateDisplay();
            }
        } else {
            console.error("Error message:", data.message);
        }
    })
    .catch(error => {
        console.error('Error updating article:', error);
    });
}


function updatePagination(articles) {
    const totalPages = Math.ceil(articles.length / ITEMS_PER_PAGE);
    const pagination = document.getElementById('pagination');
    
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
    const pageArticles = currentArticles.slice(startIndex, endIndex);
    
    displayArticles(pageArticles);
    updatePagination(currentArticles);
}


document.addEventListener('DOMContentLoaded', fetchAndDisplayArticles);
document.getElementById("categoryFilter").addEventListener("change", categoryFilter);
document.getElementById("article_search").addEventListener("input", searchArticle);
document.getElementById("updateArticleBtn").addEventListener("click", updateArticle);
