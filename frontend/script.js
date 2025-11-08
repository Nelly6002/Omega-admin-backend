// ========================
// CONFIGURATION
// ========================
const API_URL = "http://localhost:5000/api";
// ========================
// AUTH CHECK
// ========================
function checkAuth() {
  const token = getToken();
  const user = getUser();
  
  if (token && user) {
    // User is already logged in, redirect to dashboard
    window.location.href = "dashboard.html";
  }
}
// ========================
// AUTH HELPERS
// ========================
function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const u = localStorage.getItem("user");
  try {
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "";
}

// ========================
// REGISTER FUNCTION (USING YOUR BACKEND)
// ========================
async function register(event) {
  event.preventDefault();
  
  // Use FormData to get values by name attribute
  const formData = new FormData(event.target);
  const name = formData.get('name').trim();
  const email = formData.get('email').trim();
  const password = formData.get('password').trim();
  
  const msg = document.getElementById("msg");
  const registerButton = document.querySelector('button[type="submit"]');

  console.log("Registering:", { name, email, password });

  if (password.length < 6) {
    msg.className = "message error";
    msg.innerText = "Password must be at least 6 characters long";
    return;
  }

  try {
    // Show loading state
    registerButton.disabled = true;
    registerButton.textContent = "Creating Account...";
    msg.className = "message info";
    msg.innerText = "Creating your account...";

    // Call YOUR BACKEND API, not Supabase directly
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();
    console.log("Registration response:", result);

    if (!result.success) {
      throw new Error(result.message || "Registration failed");
    }

    msg.className = "message success";
    msg.innerText = "Registration successful! Redirecting to login...";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);

  } catch (err) {
    console.error("Registration error:", err);
    msg.className = "message error";
    msg.innerText = err.message || "An error occurred. Please try again.";
  } finally {
    // Reset button state
    registerButton.disabled = false;
    registerButton.textContent = "Register";
  }
}
// ========================
// LOGIN FUNCTION (USING YOUR BACKEND)
// ========================
async function login(event) {
  event.preventDefault();
  
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");
  const loginButton = document.querySelector('button[type="submit"]');

  try {
    // Show loading state
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";
    msg.className = "message info";
    msg.innerText = "Logging in...";

    // Call YOUR BACKEND API, not Supabase directly
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    console.log("Login response:", result);

    if (!result.success) {
      throw new Error(result.message || "Login failed");
    }

    // Store the token and user data from YOUR BACKEND
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.data));

    msg.className = "message success";
    msg.innerText = "Login successful! Redirecting...";

    setTimeout(() => {
      // Redirect to dashboard
      window.location.href = "dashboard.html";
    }, 1000);

  } catch (err) {
    console.error("Login error:", err);
    msg.className = "message error";
    msg.innerText = err.message || "An error occurred. Please try again.";
  } finally {
    // Reset button state
    loginButton.disabled = false;
    loginButton.textContent = "Login";
  }
}
// ========================
// BUSINESS MANAGEMENT FUNCTIONS - UPDATED
// ========================

// For regular users - get their own businesses (all statuses)
async function fetchUserBusinesses() {
  try {
    const token = getToken();
    if (!token) {
      showError("Please login again");
      return;
    }

    console.log("Fetching user businesses...");
    
    const response = await fetch(`${API_URL}/businesses/my-businesses`, {
      headers: { 
        "Authorization": `Bearer ${token}` 
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to load businesses");
    }

    const businessList = document.getElementById("business-list");
    if (!businessList) return;

    if (!result.data || result.data.length === 0) {
      businessList.innerHTML = "<p>No businesses found. Create your first business!</p>";
      return;
    }

    console.log("User businesses loaded:", result.data);
    
    businessList.innerHTML = result.data
      .map((business) => {
        const status = business.status || "pending";
        const statusClass = status.toLowerCase();
        const statusText = status === 'approved' ? '✅ Approved' : 
                          status === 'rejected' ? '❌ Rejected' : '⏳ Pending';

        return `
          <div class="business-card ${statusClass}">
            <h3>${business.name}</h3>
            <p>${business.description || "No description"}</p>
            <div class="business-meta">
              <span class="status ${statusClass}">${statusText}</span>
              ${business.created_at ? `<span class="date">Created: ${new Date(business.created_at).toLocaleDateString()}</span>` : ""}
              ${business.rejection_reason ? `<p class="rejection-reason">Reason: ${business.rejection_reason}</p>` : ""}
            </div>
          </div>`;
      })
      .join("");
  } catch (err) {
    console.error("Error fetching user businesses:", err);
    showError(err.message || "Failed to load businesses");
  }
}

// For admin - get all businesses
async function fetchAllBusinesses() {
  try {
    const token = getToken();
    if (!token) {
      showError("Please login again");
      return;
    }

    console.log("Fetching all businesses for admin...");
    
    const response = await fetch(`${API_URL}/businesses/admin/all`, {
      headers: { 
        "Authorization": `Bearer ${token}` 
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to load businesses");
    }

    const businessList = document.getElementById("admin-business-list");
    if (!businessList) return;

    if (!result.data || result.data.length === 0) {
      businessList.innerHTML = "<p>No businesses found.</p>";
      return;
    }

    console.log("All businesses loaded for admin:", result.data);
    
    businessList.innerHTML = result.data
      .map((business) => {
        const status = business.status || "pending";
        const statusClass = status.toLowerCase();
        const ownerName = business.users?.name || "Unknown";
        
        const approveButton = status !== "approved" 
          ? `<button class="btn-approve" onclick="approveBusiness('${business.id}')">Approve</button>`
          : `<span class="status-badge approved">Approved</span>`;
        
        const rejectButton = status !== "rejected" 
          ? `<button class="btn-reject" onclick="rejectBusiness('${business.id}')">Reject</button>`
          : `<span class="status-badge rejected">Rejected</span>`;

        return `
          <div class="business-card ${statusClass}">
            <h3>${business.name}</h3>
            <p>${business.description || "No description"}</p>
            <div class="business-meta">
              <span class="status ${statusClass}">Status: ${status}</span>
              <span class="owner">Owner: ${ownerName}</span>
              ${business.created_at ? `<span class="date">Created: ${new Date(business.created_at).toLocaleDateString()}</span>` : ""}
            </div>
            <div class="admin-actions">
              ${approveButton}
              ${rejectButton}
              ${business.rejection_reason ? `<p class="rejection-reason">Reason: ${business.rejection_reason}</p>` : ""}
            </div>
          </div>`;
      })
      .join("");
  } catch (err) {
    console.error("Error fetching all businesses:", err);
    showError(err.message || "Failed to load businesses");
  }
}

// Keep the old fetchBusinesses for backward compatibility (redirects to correct function)
async function fetchBusinesses() {
  const user = getUser();
  if (user?.role === 'admin') {
    await fetchAllBusinesses();
  } else {
    await fetchUserBusinesses();
  }
}
// ========================
// USER MANAGEMENT (ADMIN)
// ========================
async function fetchUsers() {
  try {
    const token = getToken();
    if (!token) {
      showError("Please login again");
      return;
    }

    const response = await fetch(`${API_URL}/admin/users`, {
      headers: { 
        "Authorization": `Bearer ${token}` 
      },
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to load users");
    }

    const userList = document.getElementById("user-list");
    if (!userList) return;

    if (!result.data || result.data.length === 0) {
      userList.innerHTML = "<p>No users found.</p>";
      return;
    }

    userList.innerHTML = result.data
      .map((user) => `
        <div class="user-card">
          <h3>${user.name}</h3>
          <p>Email: ${user.email}</p>
          <p>Role: <span class="role ${user.role}">${user.role}</span></p>
          <p>Joined: ${user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}</p>
          <div class="actions">
            <button class="btn-edit" onclick="editUser('${user.id}')">Edit</button>
            <button class="btn-delete" onclick="deleteUser('${user.id}')">Delete</button>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    console.error("Error fetching users:", err);
    showError(err.message || "Failed to load users");
  }
}

// ========================
// UI HELPERS
// ========================
function showError(message) {
  const msg = document.createElement("div");
  msg.className = "message error";
  msg.innerText = message;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 5000);
}

function showSuccessMessage(message) {
  const msg = document.createElement("div");
  msg.className = "message success";
  msg.innerText = message;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 3000);
}

// ========================
// FETCH CURRENT USER INFO
// ========================
async function fetchCurrentUser() {
  try {
    const token = getToken();
    if (!token) {
      window.location.href = "index.html";
      return null;
    }

    const response = await fetch(`${API_URL}/users/me`, {
      headers: { 
        "Authorization": `Bearer ${token}` 
      },
    });

    if (response.status === 401) {
      logout();
      return null;
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      // Update localStorage with fresh user data
      localStorage.setItem("user", JSON.stringify(result.data));
      return result.data;
    }
    
    return null;
  } catch (err) {
    console.error("Error fetching user info:", err);
    return null;
  }
}

// ========================
// INITIALIZE DASHBOARD
// ========================
document.addEventListener("DOMContentLoaded", async () => {
  const token = getToken();
  const user = getUser();

  console.log("Dashboard loading...", { token, user });

  // Redirect to login if no token on protected pages
  if (window.location.pathname.includes("dashboard.html")) {
    if (!token || !user) {
      console.log("No token or user, redirecting to login");
      window.location.href = "index.html";
      return;
    }

    // Fetch fresh user data
    const userInfo = await fetchCurrentUser();
    console.log("Fetched user info:", userInfo);
    
    if (!userInfo) {
      console.log("No user info, logging out");
      logout();
      return;
    }

    // Update welcome message
    const welcome = document.getElementById("welcome-text");
    if (welcome) {
      welcome.innerText = `Welcome, ${userInfo.name || userInfo.email}!`;
    }

    // Show appropriate sections based on role
    console.log("User role:", userInfo.role);
    
    // 🔥 THIS IS WHERE YOU PUT THE CODE 🔥
    if (userInfo.role === "admin") {
      console.log("Showing admin section");
      document.getElementById("admin-section").style.display = "block";
      document.getElementById("user-section").style.display = "none";
      await fetchUsers();
      await fetchAllBusinesses(); // Admin sees all businesses
    } else {
      console.log("Showing user section");
      document.getElementById("admin-section").style.display = "none";
      document.getElementById("user-section").style.display = "block";
      await fetchBusinesses(); // User sees their own businesses (ALL statuses)
    }
  }

  // Check if already logged in on login/register pages
  if ((window.location.pathname.includes("index.html") || 
       window.location.pathname.includes("register.html")) && 
      token) {
    window.location.href = "dashboard.html";
  }
});

// ========================
// ADMIN BUSINESS MANAGEMENT
// ========================
async function fetchAllBusinesses() {
  try {
    const token = getToken();
    if (!token) {
      showError("Please login again");
      return;
    }

    const response = await fetch(`${API_URL}/admin/businesses`, {
      headers: { 
        "Authorization": `Bearer ${token}` 
      },
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to load businesses");
    }

    const businessList = document.getElementById("admin-business-list");
    if (!businessList) return;

    if (!result.data || result.data.length === 0) {
      businessList.innerHTML = "<p>No businesses found.</p>";
      return;
    }

    businessList.innerHTML = result.data
      .map((business) => {
        const status = business.status || "pending";
        const statusClass = status.toLowerCase();
        const ownerName = business.owner_name || business.users?.name || "Unknown";
        
        const approveButton = status !== "approved" 
          ? `<button class="btn-approve" onclick="approveBusiness('${business.id}')">Approve</button>`
          : `<span class="status-badge approved">Approved</span>`;
        
        const rejectButton = status !== "rejected" 
          ? `<button class="btn-reject" onclick="rejectBusiness('${business.id}')">Reject</button>`
          : `<span class="status-badge rejected">Rejected</span>`;

        return `
          <div class="business-card ${statusClass}">
            <h3>${business.name}</h3>
            <p>${business.description || "No description"}</p>
            <div class="business-meta">
              <span class="status ${statusClass}">Status: ${status}</span>
              <span class="owner">Owner: ${ownerName}</span>
              ${business.created_at ? `<span class="date">Created: ${new Date(business.created_at).toLocaleDateString()}</span>` : ""}
            </div>
            <div class="admin-actions">
              ${approveButton}
              ${rejectButton}
              ${business.rejection_reason ? `<p class="rejection-reason">Reason: ${business.rejection_reason}</p>` : ""}
            </div>
          </div>`;
      })
      .join("");
  } catch (err) {
    console.error("Error fetching all businesses:", err);
    showError(err.message || "Failed to load businesses");
  }
}

// Update the existing fetchBusinesses for regular users
async function fetchBusinesses() {
  try {
    const token = getToken();
    if (!token) {
      showError("Please login again");
      return;
    }

    const response = await fetch(`${API_URL}/businesses`, {
      headers: { 
        "Authorization": `Bearer ${token}` 
      },
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to load businesses");
    }

    const businessList = document.getElementById("business-list");
    if (!businessList) return;

    if (!result.data || result.data.length === 0) {
      businessList.innerHTML = "<p>No businesses found. Create your first business!</p>";
      return;
    }

    businessList.innerHTML = result.data
      .map((business) => {
        const status = business.status || "pending";
        const statusClass = status.toLowerCase();

        return `
          <div class="business-card ${statusClass}">
            <h3>${business.name}</h3>
            <p>${business.description || "No description"}</p>
            <div class="business-meta">
              <span class="status ${statusClass}">Status: ${status}</span>
              ${business.created_at ? `<span class="date">Created: ${new Date(business.created_at).toLocaleDateString()}</span>` : ""}
              ${business.rejection_reason ? `<p class="rejection-reason">Reason: ${business.rejection_reason}</p>` : ""}
            </div>
          </div>`;
      })
      .join("");
  } catch (err) {
    console.error("Error fetching businesses:", err);
    showError(err.message || "Failed to load businesses");
  }
}

async function addBusiness(event) {
  event.preventDefault();
  console.log("Adding business...");
  
  const name = document.getElementById("business-name").value.trim();
  const description = document.getElementById("business-description").value.trim();
  const msg = document.getElementById("form-msg");

  if (!name) {
    msg.className = "message error";
    msg.innerText = "Business name is required";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ name, description }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || "Failed to add business");
    }

    hideAddBusinessForm();
    await fetchUserBusinesses(); // Refresh the user's business list
    showSuccessMessage("Business created successfully! Waiting for admin approval.");
  } catch (err) {
    console.error("Add business error:", err);
    msg.className = "message error";
    msg.innerText = err.message || "Failed to create business";
  }
}