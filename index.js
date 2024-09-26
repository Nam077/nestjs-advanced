/**
 *
 * @param username
 * @param email
 * @param password
 */
async function login(email, password) {
    const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Đảm bảo gửi cookie cùng request
    });

    const data = await response.json();

    console.log(data);
}

/**
 *
 */
async function refreshToken() {
    const response = await fetch('http://localhost:3000/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Cookie tự động gửi cùng request
    });

    const data = await response.json();

    console.log('Token refreshed:', data);
}

(async () => {
    await login('user@example.com', 'P@ssw0rd!');
    await refreshToken();
})();
