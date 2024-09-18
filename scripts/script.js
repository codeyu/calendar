function getUniqueHolidaysForYear(year) {
    const startDate = new Date(year, 0, 1);  // 1月1日
    const endDate = new Date(year, 11, 31);  // 12月31日
    const holidays = holiday_jp.between(startDate, endDate);
    
    // 使用 Map 来存储唯一的祝日名称，键为空格前的部分
    const uniqueHolidayMap = new Map();
    
    holidays.forEach(holiday => {
        const name = holiday.name;
        const key = name.split(' ')[0]; // 获取空格前的部分作为键
        const month = new Date(holiday.date).getMonth() + 1; // 月份从1开始
        const date = new Date(holiday.date);
        
        // 如果这个键还不存在，或者新的名称比已存在的长，则更新
        if (!uniqueHolidayMap.has(key)) {
            uniqueHolidayMap.set(key, { name, month, date });
        }
    });
    
    // 将 Map 的值转换为数组，按月份排序，然后只返回名称
    return Array.from(uniqueHolidayMap.values())
        .sort((a, b) => a.month - b.month)
}
const getJapaneseHolidayInfo = (function() {
    const cache = new Map();
    
    return function(date) {
        const key = date.getTime();
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const formattedDate = memoFormatDate(date);
        const name = holiday_jp.holidays?.[formattedDate]?.name;
        const result = {
            isHoliday: !!name,
            name: name || null
        };
        
        cache.set(key, result);
        return result;
    };
})();

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const memoFormatDate = (function() {
    const cache = new Map();
    return function(date) {
        const key = date.getTime();
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = formatDate(date);
        cache.set(key, result);
        return result;
    };
})();
// 获取日本年号
function getJapaneseEra(year) {
    let era, startYear;

    if (year >= 2019) {
        era = '令和';
        startYear = 2019;
    } else if (year >= 1989) {
        era = '平成';
        startYear = 1989;
    } else if (year >= 1926) {
        era = '昭和';
        startYear = 1926;
    } else if (year >= 1912) {
        era = '大正';
        startYear = 1912;
    } else {
        era = '明治';
        startYear = 1868;
    }

    const eraYear = year - startYear + 1;
    return `${era}${eraYear}年`;
}

// 判断是否为日本节假日
function isJapaneseHoliday(date) {
    return holiday_jp.isHoliday(date);
}

// 获取六曜
function getSixWeekday(date) {
    const sixWeekdays = ['大安', '赤口', '先勝', '友引', '先負', '仏滅'];
    
    // 使用 solar2lunar 函数获取农历日期
    const lunarDate = calendar.solar2lunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
    
    // 计算六曜索引
    const sixWeekdayIndex = (lunarDate.lMonth + lunarDate.lDay) % 6;
    
    return sixWeekdays[sixWeekdayIndex];
}
function updateHolidayDropdown(year) {
    const uniqueHolidays = getUniqueHolidaysForYear(year);
    const holidaySelect = document.getElementById('holiday');
    
    // 清空现有选项
    holidaySelect.innerHTML = '<option value="">祝日</option>';
    
    // 添加新的选项
    uniqueHolidays.forEach((holiday, index) => {
        const option = document.createElement('option');
        option.value = holiday.month;
        option.textContent = holiday.name;
        holidaySelect.appendChild(option);
    });
}

function updateDateDetails(date) {
    const fullDateElement = document.getElementById('full-date');
    const combinedInfoElement = document.getElementById('combined-info');
    const eventsListElement = document.getElementById('events-list');

    const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    const japaneseLunarMonths = [
        '睦月', '如月', '弥生', '卯月', '皐月', '水無月',
        '文月', '葉月', '長月', '神無月', '霜月', '師走'
    ];
    
    // 1. 使用日本的星期表示
    fullDateElement.textContent = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${weekdays[date.getDay()]}`;
    
   // 2. 获取日本和历月份
   const lunarMonth = japaneseLunarMonths[date.getMonth()];
    
   // 3. 获取日本天皇年号和年数
   const japaneseEra = getJapaneseEra(date.getFullYear());
   
   // 4. 获取节气
   const lunarInfo = calendar.solar2lunar(date.getFullYear(), date.getMonth() + 1, date.getDate());
   const solarTerm = lunarInfo.Term || ''; // 如果没有节气，则为空字符串

    combinedInfoElement.textContent = `${japaneseEra} ${lunarMonth} ${solarTerm}`;

    // 清空事件列表
    eventsListElement.innerHTML = '';
}

function updateCurrentTime() {
    const currentTimeElement = document.getElementById('current-time');
    
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // 立即更新一次时间
    updateTime();

    // 每秒更新一次时间
    setInterval(updateTime, 1000);
}

document.addEventListener('DOMContentLoaded', function() {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const todayButton = document.getElementById('todayBtn');
    const daysContainer = document.querySelector('.days');
    const holidaySelect = document.getElementById('holiday');

    // 生成年份选项
    for (let year = 1970; year <= 2050; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}年`;
        yearSelect.appendChild(option);
    }

    // 设置当前日期
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    yearSelect.value = currentYear;
    monthSelect.value = currentMonth;

    function formatHolidayName(name) {
        const nameParts = name.split(' ');
        if (nameParts.length === 1) {
            return nameParts[0];
        } else if (nameParts.length >= 2) {
            return nameParts[1];
        }
        // 如果 name 是空字符串，返回空字符串
        return '';
    }

    // 生成日历
    function generateCalendar(year, month) {
        daysContainer.innerHTML = '';
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();

        // 更新祝日下拉框
        updateHolidayDropdown(year);

        // 添加空白天数
        for (let i = 0; i < firstDay.getDay(); i++) {
            daysContainer.innerHTML += '<div></div>';
        }

        // 添加日期
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month - 1, i);
            const dayDiv = document.createElement('div');
            const holidayInfo = getJapaneseHolidayInfo(date);
            const sixWeekday = getSixWeekday(date);

            let lunarDateContent = holidayInfo.isHoliday ? formatHolidayName(holidayInfo.name) : sixWeekday;

            dayDiv.innerHTML = `
            <span class="solar-date">${i}</span>
            <div class="lunar-date">${lunarDateContent}</div>
            `;

            if (holidayInfo.isHoliday) {
                dayDiv.classList.add('holiday');
            }

            if (i === today.getDate() && year === currentYear && month === currentMonth) {
                dayDiv.classList.add('today');
            }

            daysContainer.appendChild(dayDiv);
            dayDiv.addEventListener('click', () => {
                updateDateDetails(new Date(year, month - 1, i));
            });
        }

        // 更新年份和月份选择框
        yearSelect.value = year;
        monthSelect.value = month;
        // 初始化日期详情为当前日期
        updateDateDetails(new Date());
    }

    // 初始生成当前月份的日历
    generateCalendar(currentYear, currentMonth);

    // 月份切换函数
    function changeMonth(delta) {
        let year = parseInt(yearSelect.value);
        let month = parseInt(monthSelect.value);
        
        month += delta;
        
        if (month > 12) {
            month = 1;
            year++;
        } else if (month < 1) {
            month = 12;
            year--;
        }
        
        // 确保年份不小于1970
        if (year < 1970) {
            year = 1970;
            month = 1;
        }
        
        generateCalendar(year, month);
    }

    // 上一个月按钮事件
    prevMonthBtn.addEventListener('click', function() {
        changeMonth(-1);
    });

    // 下一个月按钮事件
    nextMonthBtn.addEventListener('click', function() {
        changeMonth(1);
    });

    // 年份选择事件
    yearSelect.addEventListener('change', function() {
        generateCalendar(parseInt(this.value), parseInt(monthSelect.value));
    });

    // 月份选择事件
    monthSelect.addEventListener('change', function() {
        generateCalendar(parseInt(yearSelect.value), parseInt(this.value));
    });
    
    // 今天按钮事件
    todayButton.addEventListener('click', function() {
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        generateCalendar(currentYear, currentMonth);
    });

    holidaySelect.addEventListener('change', function() {
        const selectedMonth = parseInt(this.value);
        if (selectedMonth) {
            const currentYear = parseInt(document.getElementById('year').value);
            generateCalendar(currentYear, selectedMonth);
            document.getElementById('month').value = selectedMonth;
        }
    });
    updateCurrentTime();
});