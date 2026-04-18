// State Management
let habits = [];
let completionData = {}; 
let selectedDate = getTodayString();

const API_BASE = '/api';

// DOM Elements
const yearMonthDisplay = document.getElementById('yearMonthDisplay');
const dateSelector = document.getElementById('dateSelector');
const toggleAddHabitBtn = document.getElementById('toggleAddHabitBtn');
const addHabitContainer = document.getElementById('addHabitContainer');
const habitForm = document.getElementById('habitForm');
const habitInput = document.getElementById('habitInput');
const habitList = document.getElementById('habitList');
const habitCountEl = document.getElementById('habitCount');
const monthlyGridContainer = document.getElementById('monthlyGridContainer');
const achievementChart = document.getElementById('achievementChart');
const chartLoading = document.getElementById('chartLoading');

// Date Helpers
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function updateHeaderDate() {
    const d = new Date(selectedDate);
    yearMonthDisplay.textContent = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// API Helpers
async function fetchData() {
    try {
        const response = await fetch(`${API_BASE}/data`);
        const data = await response.json();
        habits = data.habits || [];
        completionData = data.completionData || {};
        renderAll();
    } catch (err) {
        console.error('Failed to fetch data from server. Falling back to localStorage.', err);
        habits = JSON.parse(localStorage.getItem('habits')) || [];
        completionData = JSON.parse(localStorage.getItem('completionData')) || {};
        renderAll();
    }
}

async function addHabit(name) {
    if (habits.includes(name)) {
        alert('이미 등록된 습관입니다.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/habits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        if (response.ok) {
            const data = await response.json();
            habits = data.habits;
            renderAll();
        }
    } catch (err) {
        habits.push(name);
        localStorage.setItem('habits', JSON.stringify(habits));
        renderAll();
    }
}

async function deleteHabit(name) {
    try {
        const response = await fetch(`${API_BASE}/habits/${encodeURIComponent(name)}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            const data = await response.json();
            habits = data.habits;
            renderAll();
        }
    } catch (err) {
        habits = habits.filter(h => h !== name);
        localStorage.setItem('habits', JSON.stringify(habits));
        renderAll();
    }
}

async function toggleHabit(name, isChecked) {
    try {
        const response = await fetch(`${API_BASE}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: selectedDate, name, isChecked })
        });
        if (response.ok) {
            const data = await response.json();
            completionData = data.completionData;
            renderAll();
        }
    } catch (err) {
        if (!completionData[selectedDate]) completionData[selectedDate] = [];
        if (isChecked) {
            if (!completionData[selectedDate].includes(name)) completionData[selectedDate].push(name);
        } else {
            completionData[selectedDate] = completionData[selectedDate].filter(h => h !== name);
        }
        localStorage.setItem('completionData', JSON.stringify(completionData));
        renderAll();
    }
}

// UI Rendering
function renderAll() {
    updateHeaderDate();
    renderHabitList();
    renderMonthlyGrid();
    renderChart();
}

function renderHabitList() {
    habitList.innerHTML = '';
    const dayCompletions = completionData[selectedDate] || [];

    habits.forEach(habit => {
        const isChecked = dayCompletions.includes(habit);
        const li = document.createElement('li');
        li.className = 'habit-item';
        li.innerHTML = `
            <label>
                <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleHabit('${habit}', this.checked)">
                <div class="habit-checkbox"></div>
                <span>${habit}</span>
            </label>
            <button class="btn-delete" onclick="deleteHabit('${habit}')" aria-label="삭제">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;
        habitList.appendChild(li);
    });

    habitCountEl.textContent = `${habits.length}개`;
}

function renderMonthlyGrid() {
    if (habits.length === 0) {
        monthlyGridContainer.innerHTML = '<div class="grid-loading">등록된 습관이 없습니다.</div>';
        return;
    }

    const d = new Date(selectedDate);
    const year = d.getFullYear();
    const month = d.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    let tableHTML = '<table class="monthly-table"><thead><tr><th>습관 \\ 일</th>';
    for (let i = 1; i <= lastDay; i++) {
        tableHTML += `<th>${i}</th>`;
    }
    tableHTML += '</tr></thead><tbody>';

    habits.forEach(habit => {
        tableHTML += `<tr><td>${habit}</td>`;
        for (let day = 1; day <= lastDay; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isCompleted = completionData[dateStr] && completionData[dateStr].includes(habit);
            tableHTML += `<td>${isCompleted ? '<span class="grid-check"></span>' : ''}</td>`;
        }
        tableHTML += '</tr>';
    });
    
    tableHTML += '</tbody></table>';
    monthlyGridContainer.innerHTML = tableHTML;
}

function renderChart() {
    chartLoading.style.display = 'none';
    achievementChart.innerHTML = '';

    const d = new Date(selectedDate);
    const year = d.getFullYear();
    const month = d.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    const dataPoints = [];
    let maxChecks = habits.length > 0 ? habits.length : 1; // Default to 1 to avoid division by zero

    for (let day = 1; day <= lastDay; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const completed = completionData[dateStr] ? completionData[dateStr].filter(h => habits.includes(h)).length : 0;
        dataPoints.push({ day, count: completed });
    }

    const width = 800;
    const height = 300;
    const paddingX = 50; // More space for Y-axis labels
    const paddingY = 40; // More space for X-axis labels
    const innerWidth = width - paddingX * 2;
    const innerHeight = height - paddingY * 2;
    
    const xStep = innerWidth / Math.max(lastDay - 1, 1);
    const yScale = innerHeight / maxChecks;

    // Draw Grid Lines & Y-axis Labels
    for (let i = 0; i <= maxChecks; i++) {
        const y = height - paddingY - (i * yScale);

        // Grid Line
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", paddingX);
        line.setAttribute("y1", y);
        line.setAttribute("x2", width - paddingX);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#E5E7EB");
        line.setAttribute("stroke-width", "1");
        achievementChart.appendChild(line);

        // Y-axis Text (Habit Count)
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", paddingX - 5);
        text.setAttribute("y", y + 4);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("font-size", "12");
        text.setAttribute("fill", "#6B7280");
        text.textContent = i;
        achievementChart.appendChild(text);
    }

    // Draw X-axis Labels (Dates)
    const labelDays = [1, 5, 10, 15, 20, 25, lastDay];
    labelDays.forEach(day => {
        const x = paddingX + ((day - 1) * xStep);
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", height - paddingY + 20);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "12");
        text.setAttribute("fill", "#6B7280");
        text.textContent = day;
        achievementChart.appendChild(text);
    });

    // Path
    let dPath = "";
    dataPoints.forEach((point, index) => {
        const x = paddingX + (index * xStep);
        const y = height - paddingY - (point.count * yScale);
        dPath += (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    });

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", dPath);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#000000"); // Black line
    path.setAttribute("stroke-width", "3");
    path.setAttribute("stroke-linejoin", "round");
    achievementChart.appendChild(path);

    // Draw Points
    dataPoints.forEach((point, index) => {
        const x = paddingX + (index * xStep);
        const y = height - paddingY - (point.count * yScale);
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x); 
        circle.setAttribute("cy", y);
        circle.setAttribute("r", "3.6"); // 20% larger (3 * 1.2)
        circle.setAttribute("fill", "#0066FF"); // Main Color (Deep Blue)
        achievementChart.appendChild(circle);
    });
}

// Event Listeners
habitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = habitInput.value.trim();
    if (value) {
        addHabit(value);
        habitInput.value = '';
        addHabitContainer.classList.add('hidden'); // Hide after adding
    }
});

toggleAddHabitBtn.addEventListener('click', () => {
    addHabitContainer.classList.toggle('hidden');
    if (!addHabitContainer.classList.contains('hidden')) {
        habitInput.focus();
    }
});

dateSelector.addEventListener('change', (e) => {
    if (e.target.value) {
        selectedDate = e.target.value;
        renderAll();
    }
});

// Initialization
function init() {
    dateSelector.value = selectedDate;
    fetchData();
}

window.onload = init;
