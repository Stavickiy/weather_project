let latitude, longitude, city;

    document.getElementById('city-search').addEventListener('input', function() {
        document.getElementById('find-button').disabled = true;
        document.getElementById('find-button').classList.add('disabled');
    });

    document.getElementById('location-form').addEventListener('submit', function(event) {
        event.preventDefault();
        if (city) {
            sendCityData(city, latitude, longitude);
        } else {
            alert("Пожалуйста, выберите город из списка.");
        }
    });

    function initAutocomplete() {
        var input = document.getElementById('city-search');
        var options = {
            types: ['(cities)']
        };

        var autocomplete = new google.maps.places.Autocomplete(input, options);

        autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                console.log("Нет данных для: '" + place.name + "'");
                return;
            }
            latitude = place.geometry.location.lat();
            longitude = place.geometry.location.lng();
            city = getCityFromAddressComponents(place.address_components);
            console.log("Широта: " + latitude + ", Долгота: " + longitude);
            console.log("Город: " + city);

            document.getElementById('find-button').disabled = false;
            document.getElementById('find-button').classList.remove('disabled');
        });
    }

    function getCityFromAddressComponents(components) {
        for (var i = 0; i < components.length; i++) {
            var component = components[i];
            if (component.types.includes("locality")) {
                return component.long_name;
            }
        }
        return null;
    }

    function sendCityData(city, latitude, longitude) {
        var url = `api_v1/weather/`;
        var data = {
            city: city,
            latitude: latitude,
            longitude: longitude
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                updateForecastTable(data.data.weather_data, data.data.default_city);
                updateSearchHistoryDisplay(data.data.search_history);
            } else {
                console.error('Ошибка в данных ответа:', data.message);
            }
        })
        .catch((error) => {
            console.error('Ошибка:', error);
        });
    }

    function updateForecastTable(weather_data, default_city) {
        var forecastTable = document.querySelector('.forecast-table .forecast-container');
        var todayHtml = `
            <div class="today forecast">
                <div class="forecast-header">
                    <div class="day">${unixToDatetime(weather_data.current.dt, "%A")}</div>
                    <div class="date">${unixToDatetime(weather_data.current.dt, "%d")} ${unixToDatetime(weather_data.current.dt, "%b")}</div>
                </div>
                <div class="forecast-content">
                    <div class="location">${default_city}</div>
                    <div class="forecast-icon">
                        <img src="http://openweathermap.org/img/wn/${weather_data.current.weather[0].icon}@4x.png" alt="" width=90>
                    </div>
                    <span>${weather_data.current.weather[0].description}</span>
                    <div class="degree">
                        <div class="num">${weather_data.current.temp.toFixed(0)}<sup>o</sup>C</div>
                    </div>
                    <span><img src="{% static 'images/icon-umberella.png' %}" alt="">${(weather_data.daily[0].pop * 100).toFixed(0)}%</span>
                    <span><img src="{% static 'images/icon-wind.png' %}" alt="">${weather_data.current.wind_speed.toFixed(0)}m/s</span>
                    <span><img src="{% static 'images/icon-compass.png' %}" alt="">${weather_data.current.wind_deg}</span>
                </div>
            </div>`;

        var forecastHtml = '';
        for (var i = 1; i < 7; i++) {
            forecastHtml += `
                <div class="forecast">
                    <div class="forecast-header">
                        <div class="day">${unixToDatetime(weather_data.daily[i].dt, "%A")}<br>${unixToDatetime(weather_data.daily[i].dt, "%d")} ${unixToDatetime(weather_data.daily[i].dt, "%b")}</div>
                    </div>
                    <div class="forecast-content">
                        <div class="forecast-icon">
                            <img src="http://openweathermap.org/img/wn/${weather_data.daily[i].weather[0].icon}@4x.png" alt="" width=70>
                        </div>
                        <div class="degree">${weather_data.daily[i].temp.max.toFixed(0)}<sup>o</sup>C</div>
                        <small>${weather_data.daily[i].temp.min.toFixed(0)}<sup>o</sup></small><br><br>
                        <span><img src="{% static 'images/icon-umberella.png' %}" alt="">${(weather_data.daily[i].pop * 100).toFixed(0)}%</span>
                    </div>
                </div>`;
        }

        forecastTable.innerHTML = todayHtml + forecastHtml;
    }

    function unixToDatetime(unixTime, format) {
        var date = new Date(unixTime * 1000);
        var options = {};

        if (format.includes("%A")) options.weekday = 'long';
        if (format.includes("%d")) options.day = '2-digit';
        if (format.includes("%b")) options.month = 'short';

        return date.toLocaleDateString('en-US', options);
    }

    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    document.addEventListener('DOMContentLoaded', (event) => {
        addSearchHistoryClickListener();
    });

    function addSearchHistoryClickListener() {
        const historyLinks = document.querySelectorAll('#search-history-list .search-history-item');
        historyLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault(); // Предотвращает переход по ссылке
                const city = this.querySelector('.history_city').textContent;
                const latitude = this.nextElementSibling.textContent;
                const longitude = this.nextElementSibling.nextElementSibling.textContent;

                // Обновляем значение в поле поиска
                document.getElementById('city-search').value = city;

                // Вызываем функцию отправки данных
                sendCityData(city, latitude, longitude);
            });
        });
    }

    function updateSearchHistoryDisplay(search_history) {
        var historyList = document.getElementById('search-history-list');
        historyList.innerHTML = '';
        search_history.forEach(item => {
            var link = document.createElement('a');
            link.href = '#'; // Место назначения при клике на город
            link.innerHTML = `<u class="history_city">${item.city}</u> `; // Подчёркивание города
            link.className = 'search-history-item';

            // Добавляем скрытые элементы для широты и долготы
            var latitudeSpan = document.createElement('span');
            latitudeSpan.hidden = true;
            latitudeSpan.textContent = item.latitude;

            var longitudeSpan = document.createElement('span');
            longitudeSpan.hidden = true;
            longitudeSpan.textContent = item.longitude;

            historyList.appendChild(link);
            historyList.appendChild(latitudeSpan);
            historyList.appendChild(longitudeSpan);
        });

        // Повторно вызываем функцию для добавления обработчиков кликов к новым элементам
        addSearchHistoryClickListener();
    }

    // Инициализация обработчиков кликов при загрузке страницы
    document.addEventListener('DOMContentLoaded', (event) => {
        addSearchHistoryClickListener();
    });

    google.maps.event.addDomListener(window, 'load', function() {
        initAutocomplete();
    });