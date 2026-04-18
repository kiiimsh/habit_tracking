// State Management
let habits = [];
let completionData = {}; 

const API_BASE = '/api';

// DOM Elements
const currentDateEl = document.getElementById('currentDate');
const habitForm = document.getElementById('habitForm');
const habitInput = document.getElementById('habitInput');
const habitList = document.getElementById('habitList');
const habitCountEl = document.getElementById('habitCount');
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

function formatDateDisplay() {
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    currentDateEl.textContent = new Date().toLocaleDateString('ko-KR', options);
}

// API Helpers
async function fetchData() {
    try {
        const response = await fetch(`${API_BASE}/data`);
        const data = await response.json();
        habits = data.habits || [];
        completionData = data.completionData || {};
        renderHabitList();
        renderChart();
    } catch (err) {
        console.error('Failed to fetch data from server. Falling back to localStorage.', err);
        // Fallback for demo purposes if server isn't running
        habits = JSON.parse(localStorage.getItem('habits')) || [];
        completionData = JSON.parse(localStorage.getItem('completionData')) || {};
        renderHabitList();
        renderChart();
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
            renderHabitList();
            renderChart();
        }
    } catch (err) {
        console.error('API Error:', err);
        // Local fallback
        habits.push(name);
        localStorage.setItem('habits', JSON.stringify(habits));
        renderHabitList();
        renderChart();
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
            renderHabitList();
            renderChart();
        }
    } catch (err) {
        console.error('API Error:', err);
        habits = habits.filter(h => h !== name);
        localStorage.setItem('habits', JSON.stringify(habits));
        renderHabitList();
        renderChart();
    }
}

async function toggleHabit(name, isChecked) {
    const today = getTodayString();
    
    try {
        const response = await fetch(`${API_BASE}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: today, name, isChecked })
        });
        if (response.ok) {
            const data = await response.json();
            completionData = data.completionData;
            renderHabitList();
            renderChart();
        }
    } catch (err) {
        console.error('API Error:', err);
        if (!completionData[today]) completionData[today] = [];
        if (isChecked) {
            if (!completionData[today].includes(name)) completionData[today].push(name);
        } else {
            completionData[today] = completionData[today].filter(h => h !== name);
        }
        localStorage.setItem('completionData', JSON.stringify(completionData));
        renderHabitList();
        renderChart();
    }
}

// UI Rendering
function renderHabitList() {
    habitList.innerHTML = '';
    const today = getTodayString();
    const todayCompletions = completionData[today] || [];

    habits.forEach(habit => {
        const isChecked = todayCompletions.includes(habit);
        const li = document.createElement('li');
        li.className = 'habit-item';
        li.innerHTML = `
            <label>
                <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleHabit('${habit}', this.checked)">
                <div class="habit-checkbox"></div>
                <span>${habit}</span>
            </label>
            <button class="btn-delete" onclick="deleteHabit('${habit}')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;
        habitList.appendChild(li);
    });

    habitCountEl.textContent = `${habits.length}개`;
}

// Chart Visualization (Same as before but uses global state)
function renderChart() {
    chartLoading.style.display = 'none';
    achievementChart.innerHTML = '';

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();

    const dataPoints = [];
    for (let day = 1; day <= lastDay; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const total = habits.length;
        const completed = completionData[dateStr] ? completionData[dateStr].filter(h => habits.includes(h)).length : 0;
        const rate = total === 0 ? 0 : (completed / total) * 100;
        dataPoints.push({ day, rate });
    }

    const width = 800;
    const height = 300;
    const padding = 40;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;
    const xStep = innerWidth / (lastDay - 1);
    const yScale = innerHeight / 100;

    // Y-axis grid
    for (let i = 0; i <= 4; i++) {
        const y = padding + innerHeight - (i * 25 * yScale);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", padding); line.setAttribute("y1", y);
        line.setAttribute("x2", width - padding); line.setAttribute("y2", y);
        line.setAttribute("stroke", "#E5E7EB");
        achievementChart.appendChild(line);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", padding - 10); text.setAttribute("y", y + 4);
        text.setAttribute("text-anchor", "end"); text.setAttribute("font-size", "10");
        text.setAttribute("fill", "#9CA3AF");
        text.textContent = `${i * 25}%`;
        achievementChart.appendChild(text);
    }

    // X-axis labels
    for (let day = 1; day <= lastDay; day++) {
        if (day === 1 || day === lastDay || day % 5 === 0) {
            const x = padding + (day - 1) * xStep;
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x); text.setAttribute("y", height - padding + 20);
            text.setAttribute("text-anchor", "middle"); text.setAttribute("font-size", "10");
            text.setAttribute("fill", "#9CA3AF");
            text.textContent = day;
            achievementChart.appendChild(text);
        }
    }

    // Path
    let d = "";
    dataPoints.forEach((point, index) => {
        const x = padding + (index * xStep);
        const y = padding + innerHeight - (point.rate * yScale);
        d += (index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    });

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#0066FF");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("stroke-linejoin", "round");
    achievementChart.appendChild(path);

    // Area
    const areaD = d + ` L ${padding + innerWidth} ${padding + innerHeight} L ${padding} ${padding + innerHeight} Z`;
    const area = document.createElementNS("http://www.w3.org/2000/svg", "path");
    area.setAttribute("d", areaD);
    area.setAttribute("fill", "url(#chartGradient)");
    area.setAttribute("opacity", "0.2");
    achievementChart.appendChild(area);

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", "chartGradient"); gradient.setAttribute("x1", "0%"); gradient.setAttribute("y1", "0%"); gradient.setAttribute("x2", "0%"); gradient.setAttribute("y2", "100%");
    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "0%"); stop1.setAttribute("stop-color", "#0066FF");
    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "100%"); stop2.setAttribute("stop-color", "white");
    gradient.appendChild(stop1); gradient.appendChild(stop2);
    defs.appendChild(gradient);
    achievementChart.appendChild(defs);

    // Current day points
    const currentDay = today.getDate();
    dataPoints.forEach((point, index) => {
        if (point.day <= currentDay) {
            const x = padding + (index * xStep);
            const y = padding + innerHeight - (point.rate * yScale);
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x); circle.setAttribute("cy", y);
            circle.setAttribute("r", point.day === currentDay ? "4" : "2");
            circle.setAttribute("fill", "#0066FF");
            achievementChart.appendChild(circle);
        }
    });
}

// Event Listeners
habitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = habitInput.value.trim();
    if (value) {
        addHabit(value);
        habitInput.value = '';
    }
});

// Initialization
function init() {
    formatDateDisplay();
    fetchData();
}

window.onload = init;
