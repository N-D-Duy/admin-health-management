import { host } from './constant.js';
let allArticles = []; // Biến lưu trữ tất cả các bài viết

async function fetchAndDisplayArticles() {
    const fixedToken = localStorage.getItem("refresh_token");
    if (!fixedToken) {
        alert('Vui lòng đăng nhập để xem trang này.');
        window.location.href = 'login.html';
    }

    try {
        const response = await fetch(`${host}/health-articles/get-all`, {
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
            allArticles = data.data; // Lưu tất cả bài viết vào biến
            displayArticles(allArticles); // Hiển thị tất cả bài viết
        } else {
            console.error("Error message:", data.message);
        }
    } catch (error) {
        console.error('Error fetching articles:', error);
    }
}

function displayArticles(articles) {
    const tableBody = document.getElementById("bodyArticlesTable");
    tableBody.innerHTML = ""; // Xóa nội dung hiện có

    articles.forEach(article => {
        const row = document.createElement("tr");

        // Cột Title
        const titleCell = document.createElement("td");
        titleCell.textContent = article.title || 'N/A';
        row.appendChild(titleCell);

        // Cột Content
        const contentCell = document.createElement("td");
        contentCell.textContent = article.content || 'N/A';
        row.appendChild(contentCell);

        // Cột Category
        const categoryCell = document.createElement("td");
        categoryCell.textContent = article.category || 'N/A';
        row.appendChild(categoryCell);

        // Cột ID
        const idCell = document.createElement("td");
        idCell.textContent = article.id || 'NULL';
        row.appendChild(idCell);

        // Cột Username
        const usernameCell = document.createElement("td");
        usernameCell.textContent = article.username || 'N/A';
        row.appendChild(usernameCell);

        // Cột Votes
        const votesCell = document.createElement("td");
        votesCell.textContent = article.votes ? article.votes.length : 0;
        row.appendChild(votesCell);

        tableBody.appendChild(row);
    });
}

// Gọi API khi trang tải xong
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayArticles();
});
