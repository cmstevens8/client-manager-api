document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'http://127.0.0.1:5000';

  // Elements
  const authSection = document.getElementById('auth-section');
  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const registerForm = document.getElementById('register-form');
  const registerError = document.getElementById('register-error');
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');

  const appSection = document.getElementById('app-section');
  const logoutBtn = document.getElementById('logout-btn');

  const clientListEl = document.getElementById('client-list');
  const addClientForm = document.getElementById('add-client-form');
  const invoiceListEl = document.getElementById('invoice-list');
  const selectedClientNameEl = document.getElementById('selected-client-name');
  const addInvoiceForm = document.getElementById('add-invoice-form');
  const invoiceDescriptionInput = document.getElementById('invoice-description'); // Added for capitalization

  let accessToken = null;

  // Inactivity logout settings
  const INACTIVITY_TIME = 20 * 60 * 1000; // 20 minutes
  let inactivityTimer;

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      alert("You have been logged out due to inactivity.");
      logout();
    }, INACTIVITY_TIME);
  }

  function setupInactivityTimer() {
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);

    resetInactivityTimer();
  }

  // *** REMOVED this handler to keep token on tab close ***
  // window.addEventListener('beforeunload', () => {
  //   // Clear token when tab/window closes
  //   localStorage.removeItem('accessToken');
  // });

  function capitalizeFirstLetter(string) {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Capitalize registration inputs
  const regFirstNameInput = document.getElementById('reg-first-name');
  const regLastNameInput = document.getElementById('reg-last-name');
  regFirstNameInput.addEventListener('input', (e) => {
    e.target.value = capitalizeFirstLetter(e.target.value);
  });
  regLastNameInput.addEventListener('input', (e) => {
    e.target.value = capitalizeFirstLetter(e.target.value);
  });

  // Capitalize Add Client inputs
  const clientFirstNameInput = document.getElementById('client-first-name');
  const clientLastNameInput = document.getElementById('client-last-name');
  function capitalizeFirstLetterOnInput(e) {
    e.target.value = capitalizeFirstLetter(e.target.value);
  }
  clientFirstNameInput.addEventListener('input', capitalizeFirstLetterOnInput);
  clientLastNameInput.addEventListener('input', capitalizeFirstLetterOnInput);

  // Phone input auto-format
  const clientPhoneInput = document.getElementById('client-phone');
  clientPhoneInput.addEventListener('input', (e) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 10) input = input.slice(0, 10);

    let formatted = '';
    if (input.length > 0) formatted += '(' + input.substring(0, 3);
    if (input.length >= 4) formatted += ')' + input.substring(3, 6);
    if (input.length >= 7) formatted += '-' + input.substring(6, 10);

    e.target.value = formatted;
  });

  // Initialize Cleave.js on invoice amount input for currency formatting
  const cleaveAmount = new Cleave('#invoice-amount', {
    numeral: true,
    numeralThousandsGroupStyle: 'none',
    prefix: '$',
    numeralDecimalScale: 2,
    numeralDecimalMark: '.',
    rawValueTrimPrefix: true
  });

  // Capitalize first letter of invoice description on input
  invoiceDescriptionInput.addEventListener('input', (e) => {
    const val = e.target.value;
    if (val.length > 0) {
      e.target.value = capitalizeFirstLetter(val);
    }
  });

  // Toggle login/register views
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
    loginError.textContent = '';
    registerError.textContent = '';
  });
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
    loginError.textContent = '';
    registerError.textContent = '';
  });

  // On load: check token
  accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    authSection.style.display = 'none';
    appSection.style.display = 'block';
    loadClients();
    setupInactivityTimer();
  } else {
    authSection.style.display = 'block';
    appSection.style.display = 'none';
  }

  // LOGIN
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }
      const data = await res.json();
      accessToken = data.access_token;
      localStorage.setItem('accessToken', accessToken);

      loginSection.style.display = 'none';
      authSection.style.display = 'none';
      appSection.style.display = 'block';
      loadClients();
      setupInactivityTimer();
    } catch (err) {
      loginError.textContent = err.message;
    }
  });

  // REGISTER with auto-login
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.textContent = '';

    const firstName = e.target['reg-first-name'].value.trim();
    const lastName = e.target['reg-last-name'].value.trim();
    const email = e.target['reg-email'].value.trim();
    const password = e.target['reg-password'].value;
    const passwordConfirm = e.target['reg-password-confirm'].value;

    if (password !== passwordConfirm) {
      registerError.textContent = 'Passwords do not match.';
      return;
    }

    try {
      // Register user
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          password
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }

      // Auto login after register
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!loginRes.ok) {
        const data = await loginRes.json();
        throw new Error(data.error || 'Auto login failed');
      }
      const loginData = await loginRes.json();
      accessToken = loginData.access_token;
      localStorage.setItem('accessToken', accessToken);

      registerSection.style.display = 'none';
      authSection.style.display = 'none';
      appSection.style.display = 'block';
      loadClients();
      setupInactivityTimer();

      registerForm.reset();

    } catch (err) {
      registerError.textContent = err.message;
    }
  });

  // LOGOUT
  logoutBtn.addEventListener('click', () => {
    logout();
  });

  function logout() {
    accessToken = null;
    localStorage.removeItem('accessToken');
    clearTimeout(inactivityTimer);

    clientListEl.innerHTML = '';
    invoiceListEl.innerHTML = '';
    selectedClientNameEl.textContent = '';
    addInvoiceForm.style.display = 'none';

    authSection.style.display = 'block';
    appSection.style.display = 'none';
    loginSection.style.display = 'block';
    registerSection.style.display = 'none';
  }

  // CLIENTS
  let clients = [];
  let selectedClientId = null;

  async function loadClients() {
    try {
      const res = await fetch(`${API_BASE}/clients/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load clients');
      clients = await res.json();
      renderClients();
    } catch (err) {
      alert(err.message);
    }
  }

  function renderClients() {
    clientListEl.innerHTML = '';
    clients.forEach(client => {
      const li = document.createElement('li');
      li.textContent = `${client.name} (${client.email})`;
      li.dataset.id = client.id;
      li.addEventListener('click', () => {
        selectClient(client.id);
      });
      if (client.id === selectedClientId) {
        li.classList.add('selected');
      }
      clientListEl.appendChild(li);
    });
  }

  async function selectClient(clientId) {
    selectedClientId = clientId;
    const client = clients.find(c => c.id === clientId);
    selectedClientNameEl.textContent = `Invoices for ${client.name}`;
    addInvoiceForm.style.display = 'block';
    renderClients();
    await loadInvoices(clientId);
  }

  // ADD CLIENT
  addClientForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = e.target['client-first-name'].value.trim();
    const lastName = e.target['client-last-name'].value.trim();
    const email = e.target['client-email'].value.trim();
    const phone = e.target['client-phone'].value.trim();

    const name = `${firstName} ${lastName}`;

    try {
      const res = await fetch(`${API_BASE}/clients/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name, email, phone }),
      });
      if (!res.ok) throw new Error('Failed to add client');
      const newClient = await res.json();
      clients.push(newClient);
      renderClients();
      addClientForm.reset();
      clientPhoneInput.value = '';
    } catch (err) {
      alert(err.message);
    }
  });

  // INVOICES
  async function loadInvoices(clientId) {
    try {
      const res = await fetch(`${API_BASE}/invoices/?client_id=${clientId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error('Failed to load invoices');
      const invoices = await res.json();
      renderInvoices(invoices);
    } catch (err) {
      alert(err.message);
    }
  }

  function renderInvoices(invoices) {
    invoiceListEl.innerHTML = '';
    if (invoices.length === 0) {
      invoiceListEl.textContent = 'No invoices found.';
      return;
    }
    invoices.forEach(inv => {
      const li = document.createElement('li');
      li.textContent = `Amount: $${inv.amount.toFixed(2)}, Due: ${inv.due_date || 'N/A'}, Status: ${inv.status}`;
      invoiceListEl.appendChild(li);
    });
  }

  // ADD INVOICE
  addInvoiceForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedClientId) {
      alert('Select a client first');
      return;
    }

    let amountStr = e.target['invoice-amount'].value.replace(/[$,]/g, '');
    const amount = parseFloat(amountStr);
    let description = e.target['invoice-description'].value.trim();

    // Ensure description first letter capitalized (extra safety)
    description = capitalizeFirstLetter(description);

    const due_date = e.target['invoice-due-date'].value;
    const status = e.target['invoice-status'].value;

    try {
      const res = await fetch(`${API_BASE}/invoices/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          client_id: selectedClientId,
          amount,
          description,
          due_date,
          status
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to add invoice');
        return; // Exit here, NO logout or reload
      }

      addInvoiceForm.reset();
      cleaveAmount.setRawValue(''); // Clear the Cleave input

      await loadInvoices(selectedClientId);
    } catch (err) {
      alert('Network error. Please try again.');
      // NO logout here
    }
  });
});
