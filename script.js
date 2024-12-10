const startBtn = document.getElementById('start-btn');
const status = document.getElementById('status');
const output = document.getElementById('output');
const todoList = document.getElementById('todo-list');
const weatherInfo = document.getElementById('weather-info');

const openPopupBtn = document.getElementById('open-popup-btn');
const popupContainer = document.getElementById('popup-container');
const closePopupBtn = document.getElementById('close-popup-btn');


let todos = JSON.parse(localStorage.getItem('todos')) || [];

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    status.textContent = "Web Speech API desteklenmiyor.";
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // 'tr-TR'
    recognition.interimResults = false;

    startBtn.addEventListener('click', () => {
        recognition.start();
        status.textContent = "Listening...";
        startBtn.classList.add('listening');
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        processCommand(transcript);
        status.textContent = "Press the button and speak...";
    };

    recognition.onerror = (event) => {
        status.textContent = `Error: ${event.error}`;
    };

    recognition.onend = () => {
        status.textContent = "Press the button and speak...";
        startBtn.classList.remove('listening');
    };
}


function processCommand(command) {
    if (command.includes("time")) {
        const currentTime = new Date().toLocaleTimeString();
        output.textContent = `Current time is: ${currentTime}`;
    } else if (command.includes("weather")) {
        getWeather();
    } else if (command.includes("add to do")) {
        const todoItem = command.replace("add to do", "").trim();
        if (todoItem) {
            todos.push(todoItem);
            saveToLocalStorage();
            updateTodoList();
            output.textContent = `Added to your to-do list: "${todoItem}"`;
        } else {
            output.textContent = "Please specify what to add to your to-do list.";
        }
    } else if (command.includes("show to do")) {
        if (todos.length === 0) {
            output.textContent = "Your to-do list is empty.";
        } else {
            output.textContent = `Your to-do list: ${todos.join(", ")}`;
        }
    } else if (command.includes("open google")) {
        window.open("https://www.google.com", "_blank");
        output.textContent = "Opening Google...";
    } else if (command.includes("tell me a joke")) {
        getRandomJoke();
    }
    else if (command.includes("play music")) {
        playBackgroundMusic();
    }else if (command.includes("stop music")) {
        stopBackgroundMusic();
    }else if (command.includes("translate")) {
        const text = command.replace("translate", "").trim();
        translateText(text);
    }else {
        output.textContent = `I didn't understand: "${command}"`;
    }
}

// Çeviri fonksiyonu
async function translateText(text) {
    const apiKey = 'YOUR_GOOGLE_TRANSLATE_API_KEY';
    const targetLang = 'tr';

    try {
        const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                target: targetLang
            })
        });

        const data = await response.json();
        if (data.data && data.data.translations) {
            output.textContent = `Çeviri: ${data.data.translations[0].translatedText}`;
        } else {
            output.textContent = "Çeviri yapılırken bir hata oluştu.";
        }
    } catch (error) {
        output.textContent = "Çeviri servisi şu anda kullanılamıyor.";
    }
}

// Müzik çalma fonksiyonu
let audioPlayer = null;

function playBackgroundMusic() {
    if (audioPlayer) {
        audioPlayer.pause();
    }
    
    audioPlayer = new Audio();
    audioPlayer.src = 'path/music/Ivi Adamou, Na Ti Xerese.mp3';
    
    try {
        audioPlayer.play();
        output.textContent = "Music is playing...";
    } catch (error) {
        output.textContent = "An error occurred while playing music";
    }

    audioPlayer.addEventListener('ended', () => {
        output.textContent = "Music is ended.";
        audioPlayer = null;
    });
}
// durdurma fonksiyonu
function stopBackgroundMusic() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer = null;
        output.textContent = "Music is stopped.";
    } else {
        output.textContent = "There is no music playing.";
    }
}


// hava durumu
function getWeather() {
    const apiKey = "374eb7695f9f5710f8b899cd73a49e46";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        if (data.cod === 200) {
                            const temperature = data.main.temp;
                            const description = data.weather[0].description;
                            const cityName = data.name;
                            weatherInfo.textContent = `Weather in ${cityName} is ${description} with temperature of ${temperature}°C`;
                        } else {
                            weatherInfo.textContent = "Hava durumu verileri alınamadı.";
                        }
                    })
            }
        );
    }
}


// şaka fonksiyonu
async function getRandomJoke() {
    try {
        const response = await fetch('https://v2.jokeapi.dev/joke/Programming?safe-mode');
        const data = await response.json();
        output.textContent = data.type === 'single' ? data.joke : `${data.setup} ... ${data.delivery}`;
    } catch (error) {
        output.textContent = "Üzgünüm, şu anda şaka anlatamıyorum.";
    }
}

// todo
function updateTodoList() {
    todoList.innerHTML = "";
    todos.forEach((todo, index) => {
        const li = document.createElement('li');

        const todoText = document.createElement('span');
        todoText.textContent = todo;

        // Düzenle butonu
        const editButton = document.createElement('button');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.onclick = () => editTodo(index);

        // Sil butonu
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.onclick = () => deleteTodo(index, li);

        li.appendChild(todoText);
        li.appendChild(editButton);
        li.appendChild(deleteButton);

        todoList.appendChild(li);
    });
}

// Düzenle
function editTodo(index) {
    const newTodo = prompt("Edit your to-do:", todos[index]);
    if (newTodo !== null && newTodo.trim() !== "") {
        todos[index] = newTodo.trim();
        saveToLocalStorage();
        updateTodoList();
        output.textContent = `Updated your to-do: "${newTodo}"`;
    }
}

// Sil
function deleteTodo(index, listItem) {
    listItem.classList.add('fade-out');
    setTimeout(() => {
        todos.splice(index, 1);
        saveToLocalStorage();
        updateTodoList();
        output.textContent = "To-do deleted!";
    }, 500);
}


function saveToLocalStorage() {
    localStorage.setItem('todos', JSON.stringify(todos));
}


updateTodoList();

// Pop-up aç
openPopupBtn.addEventListener('click', () => {
    popupContainer.classList.add('show');
});

// Pop-up kapat
closePopupBtn.addEventListener('click', () => {
    popupContainer.classList.remove('show');
});

// Dışarıya tıklayınca kapatma
popupContainer.addEventListener('click', (event) => {
    if (event.target === popupContainer) {
        popupContainer.classList.remove('show');
    }
});


const themeBtn = document.getElementById('theme-btn');
const themeIcon = themeBtn.querySelector('i');

themeBtn.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        document.body.removeAttribute('data-theme');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    } else {

        document.body.setAttribute('data-theme', 'dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
});