/**
 * 서비스의 상태를 관리하는 변수들입니다.
 * habits: 사용자가 등록한 습관 리스트 (배열)
 * completionData: 날짜별 습관 완료 여부 (객체)
 * selectedDate: 현재 선택된 날짜 (YYYY-MM-DD 형식)
 */
let habits = [];
let completionData = {}; 
let selectedDate = getTodayString();

const API_BASE = '/api';

// DOM Elements
const serviceTitle = document.getElementById('serviceTitle');
const yearMonthDisplay = document.getElementById('yearMonthDisplay');
const dateSelector = document.getElementById('dateSelector');
const openModalBtn = document.getElementById('openModalBtn'); // 습관 관리 모달 열기 버튼
const habitModal = document.getElementById('habitModal'); // 모달 컨테이너
const closeModalBtn = document.getElementById('closeModalBtn'); // 모달 닫기 버튼
const modalHabitForm = document.getElementById('modalHabitForm'); // 모달 내 추가 폼
const modalHabitInput = document.getElementById('modalHabitInput'); // 모달 내 추가 입력창
const modalHabitList = document.getElementById('modalHabitList'); // 모달 내 습관 리스트

const habitList = document.getElementById('habitList');
const habitCountEl = document.getElementById('habitCount');
const monthlyGridContainer = document.getElementById('monthlyGridContainer');
const achievementChart = document.getElementById('achievementChart');
const chartLoading = document.getElementById('chartLoading');

// 날짜 관련 도우미 함수들
/**
 * 오늘 날짜를 YYYY-MM-DD 형식의 문자열로 반환합니다.
 */
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 헤더의 연도와 월 표시를 업데이트합니다.
 */
function updateHeaderDate() {
    const d = new Date(selectedDate);
    yearMonthDisplay.textContent = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// API Helpers
/**
 * 서버 또는 로컬 저장소에서 데이터를 불러옵니다.
 */
async function fetchData() {
    try {
        const response = await fetch(`${API_BASE}/data`);
        const data = await response.json();
        habits = data.habits || [];
        completionData = data.completionData || {};

        // 제목 로드 (서버 연동은 예시로 로컬 저장소 우선 활용)
        const savedTitle = localStorage.getItem('serviceTitle');
        if (savedTitle) serviceTitle.textContent = savedTitle;

        renderAll();
    } catch (err) {
        console.error('Failed to fetch data from server. Falling back to localStorage.', err);
        habits = JSON.parse(localStorage.getItem('habits')) || [];
        completionData = JSON.parse(localStorage.getItem('completionData')) || {};

        // 로컬 저장소에서 제목 불러오기
        const savedTitle = localStorage.getItem('serviceTitle');
        if (savedTitle) serviceTitle.textContent = savedTitle;

        renderAll();
    }
}

/**
 * 습관을 추가합니다.
 */
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
            renderManageHabits(); // 모달 내 리스트도 업데이트
        }
    } catch (err) {
        habits.push(name);
        localStorage.setItem('habits', JSON.stringify(habits));
        renderAll();
        renderManageHabits(); // 모달 내 리스트도 업데이트
    }
}

/**
 * 습관을 삭제합니다.
 */
async function deleteHabit(name) {
    if (!confirm(`'${name}' 습관을 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.`)) return;

    try {
        const response = await fetch(`${API_BASE}/habits/${encodeURIComponent(name)}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            const data = await response.json();
            habits = data.habits;
            renderAll();
            renderManageHabits();
        }
    } catch (err) {
        habits = habits.filter(h => h !== name);
        localStorage.setItem('habits', JSON.stringify(habits));
        renderAll();
        renderManageHabits();
    }
}

/**
 * 습관명을 수정합니다.
 */
async function updateHabit(oldName, newName) {
    if (oldName === newName) return;
    if (habits.includes(newName)) {
        alert('이미 존재하는 습관 이름입니다.');
        renderManageHabits();
        return;
    }

    try {
        // 서버 API가 아직 구현되지 않았을 수 있으므로 try-catch 활용
        const response = await fetch(`${API_BASE}/habits/${encodeURIComponent(oldName)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newName })
        });
        if (response.ok) {
            const data = await response.json();
            habits = data.habits;
            completionData = data.completionData;
            renderAll();
            renderManageHabits();
        } else {
            throw new Error('Server update failed');
        }
    } catch (err) {
        // 로컬 로직: 배열에서 이름 교체 및 완료 데이터 키 교체
        const index = habits.indexOf(oldName);
        if (index !== -1) {
            habits[index] = newName;

            // 모든 날짜의 완료 데이터에서 이름 변경
            Object.keys(completionData).forEach(date => {
                completionData[date] = completionData[date].map(h => h === oldName ? newName : h);
            });

            localStorage.setItem('habits', JSON.stringify(habits));
            localStorage.setItem('completionData', JSON.stringify(completionData));
            renderAll();
            renderManageHabits();
        }
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

// 화면 렌더링 (UI Rendering)
/**
 * 모든 UI 요소를 다시 그립니다.
 */
function renderAll() {
    updateHeaderDate();
    renderHabitList();
    renderMonthlyGrid();
    renderChart();
}

/**
 * 모달 내 습관 관리 리스트를 렌더링합니다.
 */
function renderManageHabits() {
    modalHabitList.innerHTML = '';
    habits.forEach(habit => {
        const li = document.createElement('li');
        li.className = 'manage-habit-item';
        li.innerHTML = `
            <input type="text" value="${habit}" data-old-value="${habit}">
            <button class="btn-delete btn-modal-delete" aria-label="삭제">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        `;

        const input = li.querySelector('input');
        const deleteBtn = li.querySelector('.btn-modal-delete');

        // 수정 완료 (Enter 또는 Blur)
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                updateHabit(habit, input.value.trim());
            }
        });
        input.addEventListener('blur', () => {
            updateHabit(habit, input.value.trim());
        });

        // 삭제 버튼 클릭
        deleteBtn.addEventListener('click', () => {
            deleteHabit(habit);
        });

        modalHabitList.appendChild(li);
    });
}

/**
 * 메인 화면의 습관 리스트를 렌더링합니다.
 * 이 함수는 사용자가 습관을 체크하거나 날짜를 바꿀 때 호출됩니다.
 */
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
        `;
        habitList.appendChild(li);
    });

    habitCountEl.textContent = `${habits.length}개`;
}

/**
 * 월간 달성 현황 표를 생성합니다.
 */
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

/**
 * 월간 달성률 그래프를 SVG로 렌더링합니다.
 */
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
    const paddingX = 10;
    const paddingY = 20;
    const innerWidth = width - paddingX * 2;
    const innerHeight = height - paddingY * 2;
    
    const xStep = innerWidth / Math.max(lastDay - 1, 1);
    const yScale = innerHeight / maxChecks;

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
    path.setAttribute("stroke", "#111827"); // Dark line for sketch feel
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
        circle.setAttribute("r", "3");
        circle.setAttribute("fill", "#111827");
        achievementChart.appendChild(circle);
    });
}

// Event Listeners

/**
 * 모달 열기 및 닫기 이벤트
 */
openModalBtn.addEventListener('click', () => {
    habitModal.classList.remove('hidden');
    renderManageHabits(); // 모달이 열릴 때 편집 리스트 렌더링
});

closeModalBtn.addEventListener('click', () => {
    habitModal.classList.add('hidden');
});

// 모달 바깥 영역 클릭 시 닫기
window.addEventListener('click', (e) => {
    if (e.target === habitModal) {
        habitModal.classList.add('hidden');
    }
});

// 모달 내 습관 추가 폼 이벤트
modalHabitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = modalHabitInput.value.trim();
    if (value) {
        addHabit(value);
        modalHabitInput.value = '';
    }
});

dateSelector.addEventListener('change', (e) => {
    if (e.target.value) {
        selectedDate = e.target.value;
        renderAll();
    }
});

// 제목 수정 시 로컬 저장소에 저장
serviceTitle.addEventListener('blur', () => {
    localStorage.setItem('serviceTitle', serviceTitle.textContent);
});

// 엔터 키 입력 시 포커스 해제 (저장 트리거)
serviceTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        serviceTitle.blur();
    }
});

// Initialization
function init() {
    dateSelector.value = selectedDate;
    fetchData();
}

window.onload = init;
