const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const savingTotalEl = document.getElementById("savingTotal");
const emergencyTotalEl = document.getElementById("emergencyTotal");
const investmentTotalEl = document.getElementById("investmentTotal");

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

const emergencyTargetInput = document.getElementById("emergencyTargetInput");
const saveEmergencyTargetBtn = document.getElementById("saveEmergencyTarget");
const emergencyTargetText = document.getElementById("emergencyTargetText");
const emergencyProgress = document.getElementById("emergencyProgress");
const emergencyPercentage = document.getElementById("emergencyPercentage");
const emergencyEstimate = document.getElementById("emergencyEstimate");

const investmentTargetInput = document.getElementById("investmentTargetInput");
const saveInvestmentTargetBtn = document.getElementById("saveInvestmentTarget");
const investmentTargetText = document.getElementById("investmentTargetText");
const investmentProgress = document.getElementById("investmentProgress");
const investmentPercentage = document.getElementById("investmentPercentage");
const investmentEstimate = document.getElementById("investmentEstimate");

const debtForm = document.getElementById("debtForm");
const debtList = document.getElementById("debtList");
const debtTitleInput = document.getElementById("debtTitle");
const debtPartnerInput = document.getElementById("debtPartner");
const debtAmountInput = document.getElementById("debtAmount");
const debtTypeInput = document.getElementById("debtType");
const debtDateInput = document.getElementById("debtDate");
const debtStatusInput = document.getElementById("debtStatus");
const debtSubmitBtn = debtForm.querySelector("button[type='submit']");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let debts = JSON.parse(localStorage.getItem("debts")) || [];
let budget = JSON.parse(localStorage.getItem("budget")) || 0;
let savingTarget = JSON.parse(localStorage.getItem("savingTarget")) || 0;
let emergencyTarget = JSON.parse(localStorage.getItem("emergencyTarget")) || 0;
let investmentTarget =
  JSON.parse(localStorage.getItem("investmentTarget")) || 0;

let editId = null;
let debtEditId = null;

const ctx = document.getElementById("financeChart");

const financeChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: [
      "Pemasukan",
      "Pengeluaran",
      "Tabungan",
      "Dana Darurat",
      "Investasi",
    ],
    datasets: [
      {
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          "#16a34a",
          "#dc2626",
          "#2563eb",
          "#0ea5e9",
          "#8b5cf6",
        ],
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

function saveDebtLocalStorage() {
  localStorage.setItem("debts", JSON.stringify(debts));
}

function formatRupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number);
}

function getBadgeClass(type) {
  if (type === "income") return "badge-income";
  if (type === "expense") return "badge-expense";
  if (type === "saving") return "badge-saving";
  if (type === "emergency") return "badge-emergency";
  if (type === "investment") return "badge-investment";
  return "badge-saving";
}

function getTypeLabel(type) {
  if (type === "income") return "Pemasukan";
  if (type === "expense") return "Pengeluaran";
  if (type === "saving") return "Tabungan";
  if (type === "emergency") return "Dana Darurat";
  if (type === "investment") return "Investasi";
  return type;
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
    const badgeClass = getBadgeClass(transaction.type);
    const typeLabel = getTypeLabel(transaction.type);

    row.innerHTML = `
      <td>${transaction.title}${transaction.auto ? " <small style='opacity:.65;'>[Otomatis]</small>" : ""}</td>
      <td>${transaction.category}</td>
      <td>${transaction.date}</td>
      <td>
        <span class="badge ${badgeClass}">
          ${typeLabel}
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

function calculateTotal(type) {
  return transactions
    .filter((t) => t.type === type)
    .reduce((acc, item) => acc + item.amount, 0);
}

function createAutomaticAllocations(incomeTransaction) {
  const allocations = [
    {
      suffix: "auto-emergency",
      title: "Alokasi Dana Darurat Otomatis",
      type: "emergency",
      rate: 0.1,
    },
    {
      suffix: "auto-investment",
      title: "Alokasi Investasi Otomatis",
      type: "investment",
      rate: 0.15,
    },
    {
      suffix: "auto-saving",
      title: "Alokasi Tabungan Otomatis",
      type: "saving",
      rate: 0.15,
    },
  ];

  return allocations.map((allocation) => ({
    id: `${incomeTransaction.id}-${allocation.suffix}`,
    parentId: incomeTransaction.id,
    title: allocation.title,
    amount: Math.round(incomeTransaction.amount * allocation.rate),
    category: "Alokasi Otomatis",
    date: incomeTransaction.date,
    type: allocation.type,
    auto: true,
  }));
}

function ensureAutomaticAllocations(incomeTransaction) {
  const automaticItems = createAutomaticAllocations(incomeTransaction);

  automaticItems.forEach((autoItem) => {
    const existingIndex = transactions.findIndex(
      (item) => item.id === autoItem.id,
    );

    if (existingIndex >= 0) {
      transactions[existingIndex] = autoItem;
    } else {
      transactions.push(autoItem);
    }
  });
}

function updateDashboard() {
  const income = calculateTotal("income");
  const expense = calculateTotal("expense");
  const saving = calculateTotal("saving");
  const emergency = calculateTotal("emergency");
  const investment = calculateTotal("investment");

  const balance = income - expense - saving - emergency - investment;

  balanceEl.textContent = formatRupiah(balance);
  incomeEl.textContent = formatRupiah(income);
  expenseEl.textContent = formatRupiah(expense);
  savingTotalEl.textContent = formatRupiah(saving);
  emergencyTotalEl.textContent = formatRupiah(emergency);
  investmentTotalEl.textContent = formatRupiah(investment);

  financeChart.data.datasets[0].data = [
    income,
    expense,
    saving,
    emergency,
    investment,
  ];
  financeChart.update();

  renderRecentTransactions();
  updateBudget(expense);
  updateSavingProgress(saving);
  updateEmergencyProgress(emergency);
  updateInvestmentProgress(investment);
}

function renderRecentTransactions() {
  recentTransactions.innerHTML = "";

  const latest = [...transactions].reverse().slice(0, 5);

  latest.forEach((item) => {
    const div = document.createElement("div");
    const sign =
      item.type === "expense" ||
      item.type === "saving" ||
      item.type === "emergency" ||
      item.type === "investment"
        ? "-"
        : "+";

    div.classList.add("recent-item");

    div.innerHTML = `
      <div>
        <h4>${item.title}</h4>
        <small>${item.date}</small>
      </div>

      <strong>
        ${sign} ${formatRupiah(item.amount)}
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

  const originalTransaction = editId
    ? transactions.find((item) => item.id === editId)
    : null;

  if (originalTransaction?.auto) {
    transactionData.auto = true;
  }

  if (originalTransaction?.parentId) {
    transactionData.parentId = originalTransaction.parentId;
  }

  if (editId) {
    transactions = transactions.map((item) =>
      item.id === editId ? transactionData : item,
    );

    if (
      originalTransaction &&
      originalTransaction.type === "income" &&
      type !== "income"
    ) {
      transactions = transactions.filter(
        (item) => item.id !== editId && item.parentId !== editId,
      );
    }
  } else {
    transactions.push(transactionData);
  }

  if (type === "income") {
    ensureAutomaticAllocations(transactionData);
  }

  saveLocalStorage();
  renderTransactions();
  updateDashboard();

  editId = null;
  transactionForm.reset();
});

function deleteTransaction(id) {
  const confirmDelete = confirm("Hapus transaksi ini?");

  if (!confirmDelete) return;

  transactions = transactions.filter(
    (item) => item.id !== id && item.parentId !== id,
  );

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
    currentSaving = calculateTotal("saving");
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

  if (currentSaving <= 0) {
    savingEstimate.textContent = "Estimasi belum tersedia";
    return;
  }

  const remain = savingTarget - currentSaving;
  const estimateMonth = Math.ceil(remain / currentSaving);

  if (percentage >= 100) {
    savingEstimate.textContent = "🎉 Target tabungan tercapai!";
  } else {
    savingEstimate.textContent = `Estimasi tercapai ${estimateMonth} bulan lagi`;
  }
}

/* EMERGENCY TARGET */

saveEmergencyTargetBtn.addEventListener("click", () => {
  emergencyTarget = +emergencyTargetInput.value;

  localStorage.setItem("emergencyTarget", JSON.stringify(emergencyTarget));

  updateEmergencyProgress();

  emergencyTargetInput.value = "";
});

function updateEmergencyProgress(currentEmergency = null) {
  if (currentEmergency === null) {
    currentEmergency = calculateTotal("emergency");
  }

  emergencyTargetText.textContent = `Target: ${formatRupiah(emergencyTarget)}`;

  if (emergencyTarget <= 0) {
    emergencyProgress.style.width = "0%";
    emergencyPercentage.textContent = "0%";
    emergencyEstimate.textContent = "Belum ada target";
    return;
  }

  const percentage = Math.min((currentEmergency / emergencyTarget) * 100, 100);

  emergencyProgress.style.width = `${percentage}%`;
  emergencyPercentage.textContent = `${percentage.toFixed(0)}% tercapai`;

  if (currentEmergency <= 0) {
    emergencyEstimate.textContent = "Estimasi belum tersedia";
    return;
  }

  const remain = emergencyTarget - currentEmergency;
  const estimateMonth = Math.ceil(remain / currentEmergency);

  if (percentage >= 100) {
    emergencyEstimate.textContent = "🎉 Target dana darurat tercapai!";
  } else {
    emergencyEstimate.textContent = `Estimasi tercapai ${estimateMonth} bulan lagi`;
  }
}

/* INVESTMENT TARGET */

saveInvestmentTargetBtn.addEventListener("click", () => {
  investmentTarget = +investmentTargetInput.value;

  localStorage.setItem("investmentTarget", JSON.stringify(investmentTarget));

  updateInvestmentProgress();

  investmentTargetInput.value = "";
});

function updateInvestmentProgress(currentInvestment = null) {
  if (currentInvestment === null) {
    currentInvestment = calculateTotal("investment");
  }

  investmentTargetText.textContent = `Target: ${formatRupiah(investmentTarget)}`;

  if (investmentTarget <= 0) {
    investmentProgress.style.width = "0%";
    investmentPercentage.textContent = "0%";
    investmentEstimate.textContent = "Belum ada target";
    return;
  }

  const percentage = Math.min(
    (currentInvestment / investmentTarget) * 100,
    100,
  );

  investmentProgress.style.width = `${percentage}%`;
  investmentPercentage.textContent = `${percentage.toFixed(0)}% tercapai`;

  if (currentInvestment <= 0) {
    investmentEstimate.textContent = "Estimasi belum tersedia";
    return;
  }

  const remain = investmentTarget - currentInvestment;
  const estimateMonth = Math.ceil(remain / currentInvestment);

  if (percentage >= 100) {
    investmentEstimate.textContent = "🎉 Target investasi tercapai!";
  } else {
    investmentEstimate.textContent = `Estimasi tercapai ${estimateMonth} bulan lagi`;
  }
}

/* DEBT AND PAWN TRACKING */

debtForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = debtTitleInput.value.trim();
  const partner = debtPartnerInput.value.trim();
  const amount = +debtAmountInput.value;
  const type = debtTypeInput.value;
  const date = debtDateInput.value;
  const status = debtStatusInput.value;

  if (!title || !partner || !amount || !type || !date) {
    alert("Semua field hutang/gadai wajib diisi!");
    return;
  }

  if (debtEditId) {
    debts = debts.map((item) =>
      item.id === debtEditId
        ? { ...item, title, partner, amount, type, date, status }
        : item,
    );
    debtEditId = null;
    debtSubmitBtn.innerHTML =
      '<i class="fa-solid fa-plus"></i> Simpan Hutang/Gadai';
  } else {
    debts.push({
      id: Date.now().toString(),
      title,
      partner,
      amount,
      type,
      date,
      status,
    });
  }

  saveDebtLocalStorage();
  renderDebtList();

  debtForm.reset();
});

function renderDebtList() {
  debtList.innerHTML = "";

  if (debts.length === 0) {
    debtList.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">Belum ada pencatatan hutang atau gadai</td>
      </tr>
    `;
    return;
  }

  debts.forEach((debt) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${debt.title}</td>
      <td>${debt.partner}</td>
      <td>${debt.type === "hutang" ? "Hutang" : "Gadai"}</td>
      <td>${debt.date}</td>
      <td><span class="badge badge-${debt.type}">${debt.status}</span></td>
      <td>${formatRupiah(debt.amount)}</td>
      <td>
        <button class="action-btn edit-btn" onclick="editDebt('${debt.id}')">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="action-btn delete-btn" onclick="deleteDebt('${debt.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    `;

    debtList.appendChild(row);
  });
}

function editDebt(id) {
  const debt = debts.find((item) => item.id === id);

  if (!debt) return;

  debtTitleInput.value = debt.title;
  debtPartnerInput.value = debt.partner;
  debtAmountInput.value = debt.amount;
  debtTypeInput.value = debt.type;
  debtDateInput.value = debt.date;
  debtStatusInput.value = debt.status;

  debtEditId = id;
  debtSubmitBtn.innerHTML =
    '<i class="fa-solid fa-pen"></i> Perbarui Hutang/Gadai';
  window.scrollTo({
    top: document.getElementById("debt-section").offsetTop,
    behavior: "smooth",
  });
}

function deleteDebt(id) {
  const confirmDelete = confirm("Hapus catatan hutang/gadai ini?");

  if (!confirmDelete) return;

  debts = debts.filter((item) => item.id !== id);

  saveDebtLocalStorage();
  renderDebtList();
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
updateEmergencyProgress();
updateInvestmentProgress();
renderDebtList();
