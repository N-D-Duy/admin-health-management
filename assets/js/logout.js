async function logout(){
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    window.location.href = 'login.html';
}