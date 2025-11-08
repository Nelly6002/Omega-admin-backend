// ========================
// CONFIGURATION
// ========================
const API_URL = "http://localhost:5000/api";
// ========================
// AUTH HELPERS
// ========================
function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const u = localStorage.getItem("user");
  try {
    const user = u ? JSON.parse(u) : null;
    // Return role from user object if available, otherwise check user_metadata
    if (user && !user.role && user.user_metadata) {
      user.role = user.user_metadata.role;
    }
    return user;
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  supabase.auth.signOut();
  window.location.href = "login.html";
}

// ========================
// REGISTER FUNCTION
// ========================
async function register(event) {
  event.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  console.log(name, email, password);

  if (password.length < 6) {
    msg.className = "message error";
    msg.innerText = "Password must be at least 6 characters long";
    return;
  }

  try {
    msg.className = "message info";
    msg.innerText = "Creating account...";

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, role: "user" } },
    });

    console.log("data: ", data, "error: ", error);

    if (error) {
      msg.className = "message error";
      msg.innerText = error.message || "Registration failed";
      return;
    }

    msg.className = "message success";
    msg.innerText =
      "Registration successful! Check your email to confirm your account.";

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  } catch (err) {
    console.error("Registration error:", err);
    msg.className = "message error";
    msg.innerText = "An error occurred. Please try again.";
  }
}

// ========================
// LOGIN FUNCTION
// ========================
async function login(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("msg");

  try {
    msg.className = "message info";
    msg.innerText = "Logging in...";

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      msg.className = "message error";
      msg.innerText = error.message || "Login failed";
      return;
    }

    localStorage.setItem("token", data.session.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    msg.className = "message success";
    msg.innerText = "Login successful!";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 600);
  } catch (err) {
    msg.className = "message error";
    msg.innerText = "An error occurred. Please try again.";
  }
}

// ========================
// BUSINESS MANAGEMENT
// ========================
function showAddBusinessForm() {
  document.getElementById("add-business-form").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function hideAddBusinessForm() {
  document.getElementById("add-business-form").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  document.getElementById("business-name").value = "";
  document.getElementById("business-description").value = "";
}

async function addBusiness(event) {
  event.preventDefault();
  const name = document.getElementById("business-name").value.trim();
  const description = document
    .getElementById("business-description")
    .value.trim();
  const msg = document.getElementById("form-msg");

  try {
    const res = await fetch(`${API_URL}/businesses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ name, description }),
    });

    const data = await res.json();
    if (!data.success)
      throw new Error(data.message || "Failed to add business");

    hideAddBusinessForm();
    await fetchBusinesses();
    showSuccessMessage("Business created successfully");
  } catch (err) {
    msg.className = "message error";
    msg.innerText = err.message;
  }
}

async function fetchBusinesses() {
  try {
    const res = await fetch(`${API_URL}/businesses`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success)
      throw new Error(data.message || "Failed to load businesses");

    const businessList = document.getElementById("business-list");
    if (!businessList) return;

    businessList.innerHTML = data.data
      .map((business) => {
        const approveButton =
          business.status !== "approved"
            ? `<button onclick="approveBusiness(${business.id})">Approve</button>`
            : "";
        const rejectButton =
          business.status !== "rejected"
            ? `<button onclick="rejectBusiness(${business.id})">Reject</button>`
            : "";

        return `
          <div class="business-card ${business.status || "pending"}">
            <h3>${business.name}</h3>
            <p>${business.description || ""}</p>
            <p>Status: ${business.status || "Pending"}</p>
            ${
              getUser()?.role === "admin"
                ? `<div class="actions">${approveButton}${rejectButton}</div>`
                : ""
            }
          </div>`;
      })
      .join("");
  } catch (err) {
    showError(err.message);
  }
}

async function approveBusiness(id) {
  try {
    const res = await fetch(`${API_URL}/admin/businesses/${id}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!data.success)
      throw new Error(data.message || "Failed to approve business");

    await fetchBusinesses();
    showSuccessMessage("Business approved successfully");
  } catch (err) {
    showError(err.message);
  }
}

async function rejectBusiness(id) {
  const reason = prompt("Please provide a reason for rejection:");
  if (!reason) return;

  try {
    const res = await fetch(`${API_URL}/admin/businesses/${id}/reject`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!data.success)
      throw new Error(data.message || "Failed to reject business");

    await fetchBusinesses();
    showSuccessMessage("Business rejected successfully");
  } catch (err) {
    showError(err.message);
  }
}

// ========================
// USER MANAGEMENT (ADMIN)
// ========================
async function fetchUsers() {
  try {
    const token = getToken();
    if (!token) {
      showError("No authentication token found. Please login again.");
      return;
    }

    const res = await fetch(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message || `Failed to load users: ${res.status} ${res.statusText}`
      );
    }

    if (!data.success) {
      throw new Error(data.message || "Failed to load users");
    }

    const userList = document.getElementById("user-list");
    if (!userList) return;

    if (!data.data || data.data.length === 0) {
      userList.innerHTML = "<p>No users found.</p>";
      return;
    }

    userList.innerHTML = data.data
      .map(
        (user) => `
        <div class="user-card">
          <h3>${user.name}</h3>
          <p>Email: ${user.email}</p>
          <p>Role: ${user.role}</p>
          <div class="actions">
            <button onclick="editUser(${user.id})">Edit</button>
            <button onclick="deleteUser(${user.id})">Delete</button>
          </div>
        </div>`
      )
      .join("");
  } catch (err) {
    console.error("Error fetching users:", err);
    showError(
      err.message ||
        "Failed to load users. Please check your connection and try again."
    );
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
  setTimeout(() => msg.remove(), 3000);
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
      window.location.href = "login.html";
      return null;
    }

    const res = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        logout();
        return null;
      }
      throw new Error("Failed to fetch user info");
    }

    const data = await res.json();
    if (data.success && data.data) {
      // Update localStorage with role info
      const currentUser = getUser();
      if (currentUser) {
        currentUser.role = data.data.role;
        currentUser.name = data.data.name;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
      return data.data;
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

  if (window.location.pathname.includes("dashboard.html")) {
    if (!token) {
      window.location.href = "login.html";
      return;
    }

    // Fetch current user info to get the latest role from database
    const userInfo = await fetchCurrentUser();
    const userRole = userInfo?.role || user?.user_metadata?.role || "user";

    const welcome = document.getElementById("welcome-text");
    if (welcome) {
      const displayName =
        userInfo?.name || user?.user_metadata?.full_name || user?.email || "";
      welcome.innerText = `Welcome${displayName ? " " + displayName : ""}!`;
    }

    if (userRole === "admin") {
      document.getElementById("admin-section").style.display = "block";
      fetchUsers();
      fetchBusinesses();
    } else {
      document.getElementById("user-section").style.display = "block";
      fetchBusinesses();
    }
  }
});
