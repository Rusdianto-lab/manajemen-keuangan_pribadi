const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const savingTotalEl = document.getElementById("savingTotal");

const recentTransactions = document.getElementById("recentTransactions");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const filterDate = document.getElementById("filterDate");
const sortTransaction = document.getElementById("sortTransaction");

const budgetInput = document.getElementById("budgetInput");
const saveBudgetBtn = document.getElementById("saveBudget");

const budgetAmount = document.getElementById("budgetAmount");
const budgetStatus = document.getElementById("budgetStatus");
const budgetProgress = document.getElementById("budgetProgress");
const budgetPercentage = document.getElementById("budgetPercentage");

const savingTargetInput = document.getElementById("savingTargetInput");
const saveTargetBtn = document.getElementById("saveTarget");

const savingTargetText = document.getElementById("savingTargetText");
const savingProgress = document.getElementById("savingProgress");
const savingPercentage = document.getElementById("savingPercentage");
const savingEstimate = document.getElementById("savingEstimate");

const themeToggle = document.getElementById("themeToggle");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let budget = JSON.parse(localStorage.getItem("budget")) || 0;
let savingTarget = JSON.parse(localStorage.getItem("savingTarget")) || 0;

let editId = null;

const ctx = document.getElementById("financeChart");

const financeChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Pemasukan", "Pengeluaran", "Tabungan"],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ["#16a34a", "#dc2626", "#2563eb"],
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: getComputedStyle(document.body).getPropertyValue("--text"),
        },
      },
    },
  },
});

function saveLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function renderTransactions(data = transactions) {
  transactionList.innerHTML = "";

  if (data.length === 0) {
    transactionList.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;">
          Belum ada transaksi
        </td>
      </tr>
    `;
    return;
  }

  data.forEach((transaction) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${transaction.title}</td>
      <td>${transaction.category}</td>
      <td>${transaction.date}</td>
      <td>
        <span class="badge badge-${transaction.type}">
          ${transaction.type}
        </span>
      </td>
      <td>${formatRupiah(transaction.amount)}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editTransaction('${transaction.id}')">
          <i class="fa-solid fa-pen"></i>
        </button>

        <button class="action-btn delete-btn" onclick="deleteTransaction('${transaction.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;

    transactionList.appendChild(row);
  });
}

function updateDashboard() {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, item) => acc + item.amount, 0);

  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, item) => acc + item.amount, 0);

  const saving = transactions
    .filter((t) => t.type === "saving")
    .reduce((acc, item) => acc + item.amount, 0);

  const balance = income - expense - saving;

  balanceEl.textContent = formatRupiah(balance);
  incomeEl.textContent = formatRupiah(income);
  expenseEl.textContent = formatRupiah(expense);
  savingTotalEl.textContent = formatRupiah(saving);

  financeChart.data.datasets[0].data = [income, expense, saving];

  financeChart.update();

  renderRecentTransactions();
  updateBudget(expense);
  updateSavingProgress(saving);
}

function renderRecentTransactions() {
  recentTransactions.innerHTML = "";

  const latest = [...transactions].reverse().slice(0, 5);

  latest.forEach((item) => {
    const div = document.createElement("div");

    div.classList.add("recent-item");

    div.innerHTML = `
      <div>
        <h4>${item.title}</h4>
        <small>${item.date}</small>
      </div>

      <strong>
        ${item.type === "expense" ? "-" : "+"}
        ${formatRupiah(item.amount)}
      </strong>
    `;

    recentTransactions.appendChild(div);
  });
}

transactionForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const amount = +document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  const type = document.getElementById("type").value;

  if (!title || !amount || !category || !date || !type) {
    alert("Semua field wajib diisi!");
    return;
  }

  const transactionData = {
    id: editId || Date.now().toString(),
    title,
    amount,
    category,
    date,
    type,
  };

  if (editId) {
    transactions = transactions.map((item) =>
      item.id === editId ? transactionData : item,
    );

    editId = null;
  } else {
    transactions.push(transactionData);
  }

  saveLocalStorage();
  renderTransactions();
  updateDashboard();

  transactionForm.reset();
});

function deleteTransaction(id) {
  const confirmDelete = confirm("Hapus transaksi ini?");

  if (!confirmDelete) return;

  transactions = transactions.filter((item) => item.id !== id);

  saveLocalStorage();
  renderTransactions();
  updateDashboard();
}

function editTransaction(id) {
  const transaction = transactions.find((item) => item.id === id);

  document.getElementById("title").value = transaction.title;
  document.getElementById("amount").value = transaction.amount;
  document.getElementById("category").value = transaction.category;
  document.getElementById("date").value = transaction.date;
  document.getElementById("type").value = transaction.type;

  editId = id;

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function filterTransactions() {
  let filtered = [...transactions];

  const search = searchInput.value.toLowerCase();
  const category = filterCategory.value;
  const date = filterDate.value;
  const sort = sortTransaction.value;

  if (search) {
    filtered = filtered.filter((item) =>
      item.title.toLowerCase().includes(search),
    );
  }

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (date) {
    filtered = filtered.filter((item) => item.date === date);
  }

  if (sort === "latest") {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else {
    filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  renderTransactions(filtered);
}

searchInput.addEventListener("input", filterTransactions);
filterCategory.addEventListener("change", filterTransactions);
filterDate.addEventListener("change", filterTransactions);
sortTransaction.addEventListener("change", filterTransactions);

/* BUDGET */

saveBudgetBtn.addEventListener("click", () => {
  budget = +budgetInput.value;

  localStorage.setItem("budget", JSON.stringify(budget));

  updateBudget();

  budgetInput.value = "";
});

function updateBudget(currentExpense = null) {
  if (currentExpense === null) {
    currentExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, item) => acc + item.amount, 0);
  }

  budgetAmount.textContent = formatRupiah(budget);

  if (budget <= 0) {
    budgetStatus.textContent = "Belum ada budget";
    budgetProgress.style.width = "0%";
    budgetPercentage.textContent = "0%";
    return;
  }

  const percentage = Math.min((currentExpense / budget) * 100, 100);

  budgetProgress.style.width = `${percentage}%`;
  budgetPercentage.textContent = `${percentage.toFixed(0)}% digunakan`;

  if (percentage >= 90) {
    budgetStatus.textContent = "⚠️ Budget hampir habis!";
    budgetProgress.style.background = "#dc2626";
  } else if (percentage >= 70) {
    budgetStatus.textContent = "Budget mulai menipis";
    budgetProgress.style.background = "#f59e0b";
  } else {
    budgetStatus.textContent = "Budget aman";
    budgetProgress.style.background = "linear-gradient(90deg,#2563eb,#60a5fa)";
  }
}

/* SAVING TARGET */

saveTargetBtn.addEventListener("click", () => {
  savingTarget = +savingTargetInput.value;

  localStorage.setItem("savingTarget", JSON.stringify(savingTarget));

  updateSavingProgress();

  savingTargetInput.value = "";
});

function updateSavingProgress(currentSaving = null) {
  if (currentSaving === null) {
    currentSaving = transactions
      .filter((t) => t.type === "saving")
      .reduce((acc, item) => acc + item.amount, 0);
  }

  savingTargetText.textContent = `Target: ${formatRupiah(savingTarget)}`;

  if (savingTarget <= 0) {
    savingProgress.style.width = "0%";
    savingPercentage.textContent = "0%";
    savingEstimate.textContent = "Belum ada target";
    return;
  }

  const percentage = Math.min((currentSaving / savingTarget) * 100, 100);

  savingProgress.style.width = `${percentage}%`;
  savingPercentage.textContent = `${percentage.toFixed(0)}% tercapai`;

  const monthlySaving = currentSaving || 1;

  const remain = savingTarget - currentSaving;

  const estimateMonth = Math.ceil(remain / monthlySaving);

  if (percentage >= 100) {
    savingEstimate.textContent = "🎉 Target tabungan tercapai!";
  } else {
    savingEstimate.textContent = `Estimasi tercapai ${estimateMonth} bulan lagi`;
  }
}

/* DARK MODE */

function loadTheme() {
  const darkMode = localStorage.getItem("theme");

  if (darkMode === "dark") {
    document.body.classList.add("dark");
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

/* INIT */

loadTheme();
renderTransactions();
updateDashboard();
updateBudget();
updateSavingProgress();
