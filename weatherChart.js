function dateToString(date) {
    return date.getDate()  + "-" + (date.getMonth()+1) + "-" + date.getFullYear();
}

function stringToDate(date) {
    const splitDate = date.split("-");
    const day = parseFloat(splitDate[0]);
    const month = parseFloat(splitDate[1]) - 1;
    const year = parseFloat(splitDate[2]);

    return new Date(day, month, year);
}

//replace the chart data completely
function setChartData(dayData) {
    chart.data.labels = dayData.labels;
    chart.data.datasets[0].data = dayData.data
    chart.update();
}


//add new record to today's data 
//(I could check whether a new day hasn't started and if yes then create new dayData,
//but I think it's fine to include all searches before a page refresh in today's data)
function addRecord(label, value) {
    todayData.labels.push(label);
    todayData.data.push(value);
    localStorage.setItem(today, JSON.stringify(todayData));

    chart.update();
}

//artifical dayData for testing
//
var yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday = dateToString(yesterday);
var yesterdayData = {
    data: [8, 7],
    labels: ['Tokyo', 'Paris'],
    date: yesterday
};
localStorage.setItem(yesterday, JSON.stringify(yesterdayData));
//

//retrieve today's data or make an item in localStorage for today
const today = dateToString(new Date());
var todayData = JSON.parse(localStorage.getItem(today));
if (todayData == null) {
    todayData = {
        data: [],
        labels: [],
        date: today
    };
    localStorage.setItem(today, JSON.stringify(todayData));
}

//retrieve data for previous days from localStorage and then sort it by date
var daysData = {}; //dayData mapped by dayDataTime
var daysDataTimes = []; //array of millis since 1970, will be sorted
for(let i = 0; i < localStorage.length; i++) {
    let dayData = JSON.parse(localStorage.getItem(localStorage.key(i)));
    let dayDataTime = stringToDate(dayData.date).getTime();
    daysData[dayDataTime] = dayData;
    daysDataTimes.push(dayDataTime);
}
//sort descendingly so more recent days will come first
daysDataTimes.sort((a, b) => -(a - b));

//fill the weatherHistory with the retrieved days in the order given by daysDataTimes
const weatherHistory = document.querySelector("#weather-history");
for (let i = 0; i < daysDataTimes.length; i++) {
    const listItem = document.createElement('button');
    listItem.classList.add("list-group-item", "list-group-item-action");

    let dayData = daysData[daysDataTimes[i]];
    const text = document.createTextNode(dayData.date);
    if(dayData.date === todayData.date) {
        dayData = todayData; //so that the click listener works with the same data as other functions
        listItem.classList.add("active"); 

        //add "today" badge
        const badge = document.createElement('span');
        badge.classList.add("badge", "bg-secondary");
        badge.innerHTML = 'Today';
        text.nodeValue += ' ';
        listItem.appendChild(text);
        listItem.appendChild(badge);
    }
    else {
        listItem.appendChild(text);
    }
    console.log(dayData);
    //dayData.data = dayData.data.map(Number); //convert data back to number

    listItem.addEventListener('click', function(e) {
        console.log(dayData);
        setChartData(dayData);
        document.querySelector('#weather-history .active').classList.remove('active');
        listItem.classList.add('active');
    })

    weatherHistory.appendChild(listItem);
}




const ctx = document.querySelector("#weather-chart").getContext('2d');
const chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: todayData.labels,
        datasets: [{
            label: 'Temperature',
            data: todayData.data,
            backgroundColor: [
                '#fec90120',
            ],
            borderColor: [
                '#fec901',
            ],
            borderWidth: 1
        }]
    },
    options: {
    }
});

export {addRecord};