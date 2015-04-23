//console.log('Sart at my-app');
// Initialize your app
var myApp = new Framework7({
  modalTitle: 'Personal trainer',
  init: false
});
// Export selectors engine
var $$ = Framework7.$;
var lang = 'en';
var fLang;
if (lang === 'ru') {
  //console.log('Готовимся грузить языковой файл');
  fLang = './ru.json';
  //langData = JSON.parse(fRu);
  console.log('Загрузили русский язык!');
} else if (lang === 'en') {
  fLang = './en.json';
  console.log('Загрузили английский язык!');
}
$$.getJSON(fLang, function(response) {
  console.log('Загрузили языковой файл!');
  i18n = new Jed(response);
  Template7.registerHelper('_', function(msgid) {
    //console.log('Внутри хелпера: ' + msgid);
    return i18n.gettext(msgid);
  });
  Template7.registerHelper('ngettext', function(msgid, plural, count) {
    //var i18n = new Jed(langData);
    //return i18n.ngettext(msgid, plural, count);
    return msgid + '222';
  });
  //myApp.init();
});
// Функция для приведения дат в нужный вид
Date.prototype.toDateInputValue = (function() {
  var local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0,10);
});

var messageDelay = 3000; // Задержка показа уведомлений в миллисекундах
/*
document.addEventListener( 'touchstart', function(e){ onStart(e); }, false );
    function onStart ( touchEvent ) {
      if( navigator.userAgent.match(/Android/i) ) {
        touchEvent.preventDefault();
      }
    }
    
document.ontouchmove = function(event) {
    event.preventDefault();
};*/

//var server;
//indexedDB.deleteDatabase('my-app');

/*
var view1 = myApp.addView('#view-1'); // Заглавная страница
var view2 = myApp.addView('#view-2'); // Настройки
var view3 = myApp.addView('#view-3'); // Клиенты
var view4 = myApp.addView('#view-4'); // Ссылка на регистрацию
var view5 = myApp.addView('#view-5'); // Группы упражнений
var view7 = myApp.addView('#view-7'); // Управление списком упражнений
var view8 = myApp.addView('#view-8'); // Страница настроек упражнения
var view10 = myApp.addView('#view-10'); // Добавление клиента
var view13 = myApp.addView('#view-13'); // Удаление клиентов из базы
*/

var bdSchema = '';

/*function getJSON(url) {
return new Promise(function(resolve, reject){
  var xhr = new XMLHttpRequest();

  xhr.open('GET', url);
  xhr.onreadystatechange = handler;
  xhr.responseType = 'json';
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.send();

  function handler() {
    if (this.readyState === this.DONE) {
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
      }
    }
  };
});
}*/

$$.getJSON('default/bd-schema.json', function(data) {
  //console.log(data);
//getJSON('default/bd-schema.json').then(function(data) {
  bdSchema = data;
  //console.log("Схема БД: " + JSON.stringify(bdSchema));
  db.open(bdSchema).then(function(serverData) {
  	//console.log('Получили схему БД, открыли базу');
    server = serverData;
    console.log('JSON.stringify(server)' + JSON.stringify(server));
    console.log('Инициализируем страницу index-2');
    myApp.onPageInit('index-2', function (page) {
      // Перед инициализацией страницы с настройками, нужно получить некоторые настройки из БД
      server.settings.query()
        .all()
        .execute()
        .then(function(results) {
          console.log('Получили список настроек');
          if(results.length) { // Установим значения настроек из БД
          	console.log('Устанавливаем настройки по данным базы: results[0].units = ' + results[0].units + '; results[0].language = ' + results[0].language);
          	$$('#selectUnits').val(results[0].units);
          	$$('#selectLang').val(results[0].language);
          	$$('#selectColorThemes').val(results[0].colorTheme);
          	$$('#selectLayoutThemes').val(results[0].layoutTheme);
          	$$('body').addClass('theme-' + results[0].colorTheme);
          	$$('body').addClass('layout-' + results[0].layoutTheme);
          } else {
          	// Настроек в базе никаких не было (значит в первый раз открыли программу). Допишем их туда.
          	// По-умолчанию язык будет - english, система единиц измерения - metric
          	server.settings.add({
              'units': 'metric',
              'language': 'english',
              'colorTheme': 'orange',
              'layoutTheme': 'dark'
            }).then(function(item) {
              console.log('Записали настройки по-умолчанию в базу: ' + JSON.stringify(item));
          	  $$('#selectUnits').val("metric");
              $$('#selectLang').val("english");
          	  $$('#selectColorThemes').val("orange");
          	  $$('#selectLayoutThemes').val("dark");
          	  $$('body').addClass('theme-orange');
          	  $$('body').addClass('layout-dark');
            });
          }
        });
    });
    console.log('Инициализируем страницу index-3');
    myApp.onPageInit('index-3', function (page) {
      // Перед инициализацией страницы со списком клиентов, нужно подготовить этот список
      server.customers.query('name')
        .all()
        .execute()
        .then(function(results) {
          console.log('Формируем список клиентов');
          //console.log('Список клиентов: ' + JSON.stringify(results));
          updateListCustomers(results);
        });
    });
    console.log('Инициализируем страницу index-5');
    myApp.onPageInit('index-5', function (page) {
      // Перед инициализацией страницы со списком групп упражнений, нужно подготовить этот список
      server.exerciseType.query('name')
        .all()
        .execute()
        .then(function(results) {
          console.log('Формируем список групп упражнений');
          //console.log('Список групп упражнений: ' + JSON.stringify(results));
          updateListExerciseType(results);
        });
      });
    // Инициализация страницы добавления клиента
    myApp.onPageInit('index-10', function (page) {
      // Устанавливаем дату начала занятий на текущую дату
      $$('#inputDateStartClasses').val(new Date().toDateInputValue());
    });
    myApp.init();
    console.log('Инициализирования приложение myApp');
    // Переводим все шаблоны текстов в html на нужный язык
    var template = $$('.app-text').each(function() {
      console.log('Переводим очередную строку');
      var compiledTemplate = Template7.compile($$( this ).text());
      var htmlText = compiledTemplate();
      $$( this ).text(htmlText);
    });
  });
});
// Функция изменения системы единиц измерения в настройках
$$('#selectUnits').on('change', function() {
  console.log('Зашли в изменение настроек единиц измерения: ' + JSON.stringify($$(this).val()));
  // Сначала найдём то, что уже есть в базе
  server.settings.query()
    .all()
    .execute()
    .then(function(results) {
      console.log('Обрабатываем изменения системы измерений');
      var setLang = results[0].language;
      var setUnits = $$('#selectUnits').val();
      var setColorTheme = results[0].colorTheme;
      var setLayoutTheme = results[0].layoutTheme;
      console.log('Новая система измерений: ' + setUnits);
      // Т.к. запись с настройками может быть только одна, то смело обновляем найденную запись
	  server.settings.update({
	    'id': parseInt(results[0].id),
        'units': setUnits, // Ставим новое значение
        'language': setLang,
        'colorTheme': setColorTheme,
        'layoutTheme': setLayoutTheme
	  }).then(function(item) {
        console.log('Записали новые настройки в базу: ' + JSON.stringify(item));
      });
    });
});
// Функция изменения языка приложения в настройках
$$('#selectLang').on('change', function() {
  console.log('Зашли в изменение настроек языка');
  // Сначала найдём то, что уже есть в базе
  server.settings.query()
    .all()
    .execute()
    .then(function(results) {
      //console.log('Обрабатываем изменения языка интерфейса: ' + JSON.stringify($$(this).val()));
      var setLang = $$('#selectLang').val();
      console.log('Новый язык интерфейса: ' + setLang);
      var setUnits = results[0].units;
      var setColorTheme = results[0].colorTheme;
      var setLayoutTheme = results[0].layoutTheme;
      // Т.к. запись с настройками может быть только одна, то смело обновляем найденную запись
      server.settings.update({
	    'id': parseInt(results[0].id),
        'units': setUnits,
        'language': setLang,
        'colorTheme': setColorTheme,
        'layoutTheme': setLayoutTheme
      }).then(function(item) {
        console.log('Записали новые настройки в базу: ' + JSON.stringify(item));
      });
    });
});
// Функция изменения цвета темы оформления в настройках
$$('#selectColorThemes').on('change', function() {
  console.log('Зашли в изменение настроек цвета темы оформления: ' + JSON.stringify($$(this).val()));
  // Сначала найдём то, что уже есть в базе
  server.settings.query()
    .all()
    .execute()
    .then(function(results) {
      console.log('Обрабатываем изменение цвета оформления');
      var setLang = results[0].language;
      var setUnits = results[0].units;
      var setColorTheme = $$('#selectColorThemes').val();
      var setLayoutTheme = results[0].layoutTheme;
      if ($$('body').hasClass('theme-gray')) {
        $$('body').removeClass('theme-gray');
      } else if ($$('body').hasClass('theme-white')) {
        $$('body').removeClass('theme-white');
      } else if ($$('body').hasClass('theme-black')) {
        $$('body').removeClass('theme-black');
      } else if ($$('body').hasClass('theme-lightblue')) {
        $$('body').removeClass('theme-lightblue');
      } else if ($$('body').hasClass('theme-yellow')) {
        $$('body').removeClass('theme-yellow');
      } else if ($$('body').hasClass('theme-orange')) {
        $$('body').removeClass('theme-orange');
      } else if ($$('body').hasClass('theme-pink')) {
        $$('body').removeClass('theme-pink');
      } else if ($$('body').hasClass('theme-blue')) {
        $$('body').removeClass('theme-blue');
      } else if ($$('body').hasClass('theme-green')) {
        $$('body').removeClass('theme-green');
      } else if ($$('body').hasClass('theme-red')) {
        $$('body').removeClass('theme-red');
      }
      $$('body').addClass('theme-' + setColorTheme);
      console.log('Новый цвет оформления: ' + setColorTheme);
      // Т.к. запись с настройками может быть только одна, то смело обновляем найденную запись
	  server.settings.update({
	    'id': parseInt(results[0].id),
        'units': setUnits,
        'language': setLang,
        'colorTheme': setColorTheme,
        'layoutTheme': setLayoutTheme
	  }).then(function(item) {
        console.log('Записали новые настройки в базу: ' + JSON.stringify(item));
      });
    });
});
// Функция изменения стиля темы оформления в настройках
$$('#selectLayoutThemes').on('change', function() {
  console.log('Зашли в изменение настроек стиля темы оформления: ' + JSON.stringify($$(this).val()));
  // Сначала найдём то, что уже есть в базе
  server.settings.query()
    .all()
    .execute()
    .then(function(results) {
      console.log('Обрабатываем изменения стиля темы оформления');
      var setLang = results[0].language;
      var setUnits = results[0].units;
      var setColorTheme = results[0].colorTheme;
      var setLayoutTheme = $$('#selectLayoutThemes').val();
      if ($$('body').hasClass('layout-dark')) {
        $$('body').removeClass('layout-dark');
      } else if ($$('body').hasClass('layout-white')) {
        $$('body').removeClass('layout-white');
      }
      $$('body').addClass('layout-' + setLayoutTheme);
      console.log('Новый стиль оформления: ' + setLayoutTheme);
      // Т.к. запись с настройками может быть только одна, то смело обновляем найденную запись
	  server.settings.update({
	    'id': parseInt(results[0].id),
        'units': setUnits,
        'language': setLang,
        'colorTheme': setColorTheme,
        'layoutTheme': setLayoutTheme
	  }).then(function(item) {
        console.log('Записали новые настройки в базу: ' + JSON.stringify(item));
      });
    });
});
// Модальное окно для подтверждения загрузки демо-данных
$$('.confirm-fill-demo').on('click', function () {
  myApp.confirm('Are you sure? It will erase all of your data!', function () {
    // Очистим всё
    console.log(JSON.stringify(server));
    //server.clear('settings');
    server.clear('workExercise');
    server.clear('schedule');
    server.clear('workout');
    server.clear('optionsExercises');
    server.clear('exercise');
    server.clear('exerciseType');
    server.clear('customers');
    // Заполняем таблицы данными из json файлов
    console.log('Начинаем обрабатывать упражнения');
    var dataExercisesJSON = '';
    $$.getJSON('default/exercises.json', function(data) {
    //getJSON('default/exercises.json').then(function(data) {
      dataExercisesJSON = data;
      // Запускаем цикл по группам упражнений (exerciseType)
      for (var j in data.exerciseType) {
        //console.log('j = ' + j);
        //console.log('data.exerciseType[j].name = ' + data.exerciseType[j].name);
        //console.log('exercise = ' + JSON.stringify(data.exerciseType[j]));
        var newExTypeName = data.exerciseType[j].name;
        var newExTypeId = data.exerciseType[j].id;
        //console.log('newExTypeId = ' + newExTypeId + '; newExTypeName = ' + newExTypeName);
        // Добавляем группы упражнений
        server.exerciseType.add({
          'id': newExTypeId,
          'name': newExTypeName
        }).then(function(exType) {
          //console.log('Добавили в БД новую группу упражнений: ' + JSON.stringify(exType));
          //var exerciseTypeId = exType[0].id;
          //console.log('Начинаем обработку группы упражнений с id = ' + exerciseTypeId);
          // Внутри группы упражнений проходим циклом все упражнения из этой группы
          //console.log('arrExercises = ' + JSON.stringify(arrExercises));
          //var arrExercises = data.exerciseType[j].exercises; // Занесём все упражнения (как объекты) данной группы в отдельный массив
          for (var i in data.exerciseType[parseInt(exType[0].id)].exercises) {
            //console.log('i = ' + i);
            //console.log('Начинаем обрабатывать следующее упражнение: data.exerciseType[j].exercises[i].name = ' + data.exerciseType[j].exercises[i].name);
            // Занесём характеристики текущего упражнения в массив
            //var options = arrExercises[i].options[0];
            //var options = data.exerciseType[j].exercises[i].options[0];
            //console.log('options = ' + options);
            var newExerciseName = data.exerciseType[parseInt(exType[0].id)].exercises[i].name;
            var newExerciseId = parseInt(data.exerciseType[parseInt(exType[0].id)].exercises[i].id);
            //console.log('newExerciseName = ' + newExerciseName);
            server.exercise.add({
              'id': newExerciseId,
              'name': newExerciseName,
              'type': parseInt(exType[0].id)
            }).then(function(itemEx) {
              //console.log('Добавили в БД новое упражнение: ' + JSON.stringify(itemEx));
            });
          }
          // Параллельно в этом же цикле (по группам упражнений) запустим добавление в БД связок Упражнение-Параметр
          for(var rowExercise in data.exerciseType[parseInt(exType[0].id)].exercises) {
            //console.log('Мы в отдельном цикле. Текущий параметр rowExercise = ' + rowExercise);
            for (var option in data.exerciseType[parseInt(exType[0].id)].exercises[rowExercise].options[0]) {
              if(data.exerciseType[parseInt(exType[0].id)].exercises[rowExercise].options[0][option]) {
                //console.log('Текущий действующий параметр: option = ' + option);
                var newExerciseId = data.exerciseType[parseInt(exType[0].id)].exercises[rowExercise].id;
                server.optionsExercises.add({
                  'option': option,
                  'exerciseId': newExerciseId
                }).then(function(itemOpt) {
                  console.log('Добавили в БД новую связку упражнения с активным параметром: ' + JSON.stringify(itemOpt));
                });
              }        
            }     
          }
        });
      }
      // Обновляем список групп упражнений на соответствующей странице
      server.exerciseType.query('name')
        .all()
        .distinct()
        .execute()
        .then(function(results) {
          //console.log('exerciseType results = ' + JSON.stringify(results));
          updateListExerciseType(results);
        });
    });  
    
    $$.getJSON('default/customers.json', function(data) {
    //getJSON('default/customers.json').then(function(data) {
      for (var i in data.customers) {
        // Добавляем клиентов в базу
        server.customers.add(data.customers[i]);
      }
      server.customers.query('name')
        .all()            
        .distinct()
        .execute()
        .then(function(results) {
          // Запросом получили массив объектов customers
          updateListCustomers(results);
        });
    });
    
    myApp.alert('Enjoy your new demo data');
  });
});

// Модальное окно для подтверждения очистки базы данных
$$('.confirm-clean-db').on('click', function () {
  myApp.confirm(i18n.gettext('Are you sure? It will erase all of your data!'), function () {
    console.log('Start cleaning DB');
    // Очистим все таблицы
    server.clear('settings');
    server.clear('workExercise');
    server.clear('schedule');
    server.clear('workout');
    server.clear('optionsExercises');
    server.clear('exerciseType');
    server.clear('exercise');
    server.clear('customers');
    console.log('Reload pages data');
    updateListCustomers('');
    updateListExerciseType('');
    myApp.alert(i18n.gettext('Database is clean'));
  }, function () {
    // Действие отменено
  });
});

// Модальное окно для создания базы данных
$$('.confirm-create-db').on('click', function () {
  myApp.confirm(i18n.gettext('Are you sure?'), function () {
    db.open(bdSchema).then(function(serv) {
      server = serv;
    });
  });
});
// Модальное окно для удаления базы данных
$$('.confirm-remove-db').on('click', function () {
  myApp.confirm(i18n.gettext('Are you sure?'), function () {
	// Удаление самой базы данных
	indexedDB.deleteDatabase('my-app');
	document.getElementById("ulListCustomers").innerHTML = '';
	document.getElementById("forDeleteCustomers").innerHTML = '';
	document.getElementById("ulListExerciseType").innerHTML = '';
  });
});
/*
Функция очистки данных на странице данных клиента. Вызывается со страницы index-3 (список клиентв) по кнопке Add
*/
function emptyDataCustomer() {
  // Сформируем доступные кнопки для вкладки добавления нового клиента
  var menuEditCustomer = '';
  menuEditCustomer =  '<a href="#view-3" class="tab-link btn-left-top app-text">' + i18n.gettext('Cancel') + '</a></a>';
  menuEditCustomer += '<a href="" class="tab-link btn-right-top app-text" style="display: none;" id="linkEditCustomer" onclick="addCustomer()">' + i18n.gettext('Save') + '</a>';
  document.getElementById("divEditCustomer").innerHTML = menuEditCustomer;
  $$('#inputNewCustomer').val('');
  $$('#inputNewCustomer').attr('data-item', '');
  $$('#newCustomerComments').val('');
}
/*
Функция очистки данных на странице данных упражнения. Вызывается со страницы index-7 (списоко упражнений) по кнопке Add
*/
function emptyDataExercise() {
  // Сформируем доступные кнопки для вкладки добавления нового клиента
  var menuAddExercise = '';
  menuAddExercise =  '<a href="#view-7" class="tab-link btn-left-top app-text">' + i18n.gettext('Cancel') + '</a></a>';
  menuAddExercise += '<a href="" class="tab-link btn-right-top app-text" onclick="addExercise()">' + i18n.gettext('Save') + '</a>';
  document.getElementById("divAddExercise").innerHTML = menuAddExercise;
  $$('#inputNewExercise').val('');
  $$('#view-7a input').prop('checked', false);
}
/*
Функция построения списка клиентов. В функцию передаётся массив объектов customers
*/
function updateListCustomers(customers) {
  //console.log($$.serializeObject(customers[0]));
  var listCustomers = '';
  var listCustomersForDelete = '';
  //customers.forEach(function (value) {
  //customers.each(function (value) {
  for (var index in customers) {
    value = customers[index];
    // Список пользователей
    listCustomers += '<li>';
    listCustomers += '  <a href="#view-10" class="tab-link item-link item-content" onclick="fillCustomerData(' + value.id + ')">';
    listCustomers += '    <div class="item-inner">';
    listCustomers += '      <div class="item-title">' + value.name + '</div>';
    listCustomers += '    </div>';
    listCustomers += '  </a>';
    listCustomers += '</li>';
    // Список пользователей для удаления
    listCustomersForDelete += '<li>';
    listCustomersForDelete += '  <label class="label-checkbox item-content">';
    listCustomersForDelete += '    <div class="item-inner">';
    listCustomersForDelete += '      <div class="item-title">';
    listCustomersForDelete += '        <a href="#view-10" class="tab-link btn-right-top" onclick="fillCustomerData(' + value.id + ')">' + value.name + '</a>';
    listCustomersForDelete += '      </div>';
    listCustomersForDelete += '    </div>';
    listCustomersForDelete += '    <input type="checkbox" name="inputCustomerForDelete" value="' + value.id + '">';
    listCustomersForDelete += '    <div class="item-media item-media-right">';
    listCustomersForDelete += '      <i class="icon icon-form-checkbox"></i>';
    listCustomersForDelete += '    </div>';
    listCustomersForDelete += '  </label>';
    listCustomersForDelete += '</li>';
  //});
  }
  document.getElementById("ulListCustomers").innerHTML = listCustomers;
  document.getElementById("forDeleteCustomers").innerHTML = listCustomersForDelete;
  document.getElementById("badgeCountCustomers").innerHTML = customers.length;
}
/*
Функция добавления клиента. Вызывается из страницы #view-10 по кнопке Save
*/
function addCustomer() {
  var temp = $$('input#inputNewCustomer').val();
  // На всякий случай поставим заглушку от инъекций
  var newCustomer = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  temp = '';
  temp = $$('input#inputDateStartClasses').val();
  var dateStartClasses = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  var timeVal = new Date().toISOString();
  var photo = 'somepic' + timeVal + '.jpg'; // TODO фото надо куда-то сохранять, а тут указывать путь к файлу
  temp = '';
  temp = $$('textarea#newCustomerComments').val();
  var newCustomerComments = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  //console.log('Добавляем клиента ' + newCustomer + ' фотография ' + photo + ' комментарий: ' + newCustomerComments);
  if(newCustomer != '') {
  	//console.log('Добавляем клиента ' + newCustomer + ' фотография ' + photo + ' комментарий: ' + newCustomerComments);
    server.customers.add({'name': newCustomer, 'photo': photo, 'comments': newCustomerComments});
    // Обновляем список клиентов на соответсвующей странице
    server.customers.query('name')
      .all()            
      .distinct()
      .execute()
      .then(function(results) {
      	myApp.addNotification({
          title: i18n.gettext('Add new Customer'),
          hold: messageDelay,
          message: i18n.gettext('Data was saved')
        });
        // Запросом получили массив объектов customers
        updateListCustomers(results);
      });
    //$$('a[href="#view-3"]').click();
  } else {
    myApp.addNotification({
      title: i18n.gettext('Error while adding'),
      hold: messageDelay,
      message: i18n.gettext('Nothing to add!')
    });
  }
}
/*
Функция сохранения изменений в данных клиента. Вызывается по кнопке Save из формы редактирования данных клиента
*/
function editCustomer() {
  var customerId = parseInt($$('#inputNewCustomer').data('item'));
  var temp = $$('#inputNewCustomer').val();
  var newNameCustomer = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  temp = '';
  temp = $$('#newCustomerComments').val();
  var newCommentsCustomer = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  console.log('Сейчас будем обновлять данные по клиенту с id = ' + customerId);
  server.customers.get(customerId).then(function (customer) {
    if ((newNameCustomer === customer.name) && (newCommentsCustomer === customer.comments)) {
      myApp.addNotification({
        title: i18n.gettext('Nothing to save'),
        hold: messageDelay,
        message: i18n.gettext('New data already exist in database.')
      });
    } else {
      server.customers.update({
        'id': customerId,
        'name': newNameCustomer,
        'comments': newCommentsCustomer,
        'photo': customer.photo    
      }).then(function (newDataCustomer) {
        console.log('Обновили данные по клиенту: ' + JSON.stringify(newDataCustomer));
        myApp.addNotification({
          title: i18n.gettext('Successful updated'),
          hold: messageDelay,
          message: i18n.gettext('Data was updated.')
        });    
      });
    }
  });
}
/*
Функция удаления клиентов из БД. Вызывается из страницы #view-13 по кнопке Delete
Параметры сюда никакие не передаются, т.к. функция вызывается только из определённого места html страницы -
параметры добываются непосредственно из страницы
*/
function removeCustomers() {
  // Модальное окно для подтверждения удаления клиентов
  //$$('.confirm-delete-customers').on('click', function () {
  myApp.confirm(i18n.gettext('Are you sure?'), function () {
    // Найдём все value всех отмеченных чекбоксов в ul#forDeleteCustomers. Эти значения есть id клиентов для удаления из базы
    // Начинаем цикл по всем отмеченным для удаления клиентам
    $$('input[name="inputCustomerForDelete"]:checked').each(function() {
      console.log('Проверяем пользователя с id = ' + this.value);
	  server.customers.get(parseInt(this.value)).then(function(resCustomer) {
        console.log('Нашли удаляемого клиента в базе: ' + JSON.stringify(resCustomer));
        // Проверяем, можно ли удалять этого клиента из базы
        // Если по клиенту есть записи в истории занятий или расписании, то спрашиваем, точно ли всё по нему удалить
        // Искать нужно в трёх таблицах сразу: workout (хотя это можно, пожалуй, пропустить), schedule и workExercise
        console.log('resCustomer.id = ' + resCustomer.id);
        server.workExercise.query()
          .filter('customer', parseInt(resCustomer.id))
          .execute()
          .then(function(resWorkEx) {
            if(resWorkEx.length) { // Если что-то нашлось, то сообщаем, что удалить нельзя пока есть данные
              myApp.addNotification({
                title: i18n.gettext('Customer ') + resCustomer.name + i18n.gettext(' can not be deleted'),
                hold: messageDelay,
                message: i18n.gettext('There is data in history.')
              });
            } else { // Ничего не нашли тут, проверяем в следующей таблице
              server.schedule.query()
                .filter('customer', parseInt(resCustomer.id))
                .execute()
                .then(function(resSchedule) {
                  if(resSchedule.length) { // Если что-то нашлось, то сообщаем, что удалить нельзя пока есть данные
                    myApp.addNotification({
                      title: i18n.gettext('Customer ') + resCustomer.name + i18n.gettext(' can not be deleted'),
                      hold: messageDelay,
                      message: i18n.gettext('There is data in schedule by that customer.')
                    });
                  } else { // Ничего не нашли тут, проверяем в следующей таблице
                    server.workout.query()
                      .filter('customer', parseInt(resCustomer.id))
                      .execute()
                      .then(function(resWorkout) {
                        if(resWorkout.length) { // Если что-то нашлось, то сообщаем, что удалить нельзя пока есть данные
                          myApp.addNotification({
                            title: i18n.gettext('Customer ') + resCustomer.name + i18n.gettext(' can not be deleted'),
                            hold: messageDelay,
                            message: i18n.gettext('There is data in workout.')
                          });
                        } else { // Ничего не нашли тут - искать уже нигде больше не надо, - можно смело удалять пользователя
                          server.remove('customers', parseInt(resCustomer.id)).then(function(res3) {
                            console.log('Удалили пользователя с id = ' + resCustomer.id);
                            console.log(JSON.stringify(res3));
                            // После всех удалений, обновим списки клиентов на соответствующих страницах
                            server.customers.query('name')
                          	  .all()
                              .distinct()
                              .execute()
                              .then(function(res2) {
                                console.log('Клиенты после удаления res2 = ' + JSON.stringify(res2));
                                updateListCustomers(res2);
                        	  });
                          });
                        }
                      });
                  }
                });
            }
          });
      });
    });
  },
  function () {
    //myApp.alert('You clicked Cancel button');
  }
  );
}
/*
Включаем функционал показа фотографий клиентов
*/
var myPhotoBrowserDark = myApp.photoBrowser({
  photos: [{
    'url': '',
    'caption': ''
  }]
});
$$('#aCustomerPhoto').on('click', function () {
  myPhotoBrowserDark.open();
});
/*
Функция заполнения данными страницы клиента (#index-3). В функцию передаётся id клиента. Вызывается из списка клиентов при выборе клиента
*/
function fillCustomerData(customerId) {
  // Сформируем доступные кнопки для вкладки существующего клиента
  var menuEditCustomer = '';
  menuEditCustomer =  '<a href="#view-3" class="tab-link btn-left-top app-text">' + i18n.gettext('Cancel') + '</a></a>';
  menuEditCustomer += '<a href="" class="tab-link btn-right-top" style="display: none;" id="linkEditCustomer" onclick="editCustomer()">' + i18n.gettext('Save') + '</a>';
  document.getElementById("divEditCustomer").innerHTML = menuEditCustomer;
  console.log('Заполняем данные по клиенту с id = ' + customerId);
  server.customers.get(parseInt(customerId)).then(function(customer) {
    $$('input#inputNewCustomer').val(customer.name);
    $$('#inputNewCustomer').attr('data-item', customerId);
    $$('textarea#newCustomerComments').val(customer.comments);
    myPhotoBrowserDark = myApp.photoBrowser({
      photos: [{
        'url': './photo/' + customer.photo,
        'caption': customer.name
      }]
    });
  });
}
/*
Функция выполняется, когда начали изменять данные клиента. Функция делает видимой нужную кнопку для сохранения новых данных клиента 
*/
function showEditLinkCustomer() {
  console.log('Показываем кнопку Update');
  $$('#linkEditCustomer').show();
}
/*
Функция построения списка групп упражнений. В функцию передаётся массив объектов exerciseType
*/
function updateListExerciseType(exerciseType) {
  var listExerciseType = '';
  //exerciseType.forEach(function (value) {
  //exerciseType.each(function (value) {
  for (var index in exerciseType) {
    value = exerciseType[index];
    listExerciseType += '<li>';
    listExerciseType += '  <div class="item-content">';
    listExerciseType += '    <div class="item-inner">';
    listExerciseType += '      <div class="item-media">';
    listExerciseType += '        <a href="#view-7" class="tab-link" onclick="updateListExercises(' + value.id + ')"><i class="icon icon-form-settings"></i></a>';
    listExerciseType += '      </div>';
    listExerciseType += '      <div class="item-input">';
    listExerciseType += '        <input type="text" placeholder="Exercise type" id="ex-compl-name-' + value.id + '" value="' + value.name + '" oninput="showRenameLinkExType(' + value.id + ')">';
    listExerciseType += '      </div>';
    listExerciseType += '      <div class="item-input hidden" id="ex-compl-rename-' + value.id + '">';
    listExerciseType += '        <a href="" class="button button-round" onclick="renameExType(' + value.id + ')">Rename</a>';
    listExerciseType += '      </div>';
    listExerciseType += '      <div class="item-input hidden" id="ex-compl-' + value.id + '">';
    listExerciseType += '        <a href="" class="button button-round" onclick="deleteExType(' + value.id + ')">Delete</a>';
    listExerciseType += '      </div>';
    listExerciseType += '      <div class="item-media">';
    listExerciseType += '        <label class="label-checkbox item-content">';
    listExerciseType += '          <input type="checkbox" name="ex-compl-' + value.id + '" class="btn-delete-toggle">';
    listExerciseType += '          <div class="item-media">';
    listExerciseType += '            <i class="icon icon-form-checkbox"></i>';
    listExerciseType += '          </div>';
    listExerciseType += '        </label>';
    listExerciseType += '      </div>';
    listExerciseType += '    </div>';
    listExerciseType += '  </div>';
    listExerciseType += '</li>';
  //});
  }
  document.getElementById("ulListExerciseType").innerHTML = listExerciseType;
}

/*
Функция выполняется, когда начали изменять название группы упражнений. Функция делает видимой нужную кнопку для сохранения нового имени группы упражнений 
*/
function showRenameLinkExType(exType) {
  if($$("#ex-compl-rename-" + exType).hasClass('hidden')) {
    $$("#ex-compl-rename-" + exType).removeClass('hidden');
  }
}
/*
Функция переименования названия группы упражнений. В функцию передаётся id одной выбранной группы упражнений
*/
function renameExType(idExType) {
  var temp = document.getElementById("ex-compl-name-" + idExType).value;
  var newName = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  //console.log('newName = ' + newName);
  server.exerciseType.update({
    'id': parseInt(idExType),
    'name': newName
  }).then(function(res) {
    console.log('Переименованная группа упражнений в базе: ' + JSON.stringify(res));
    if(!$$("#ex-compl-rename-" + idExType).hasClass('hidden')) {
      $$("#ex-compl-rename-" + idExType).addClass('hidden');
    } 
    myApp.addNotification({
      title: i18n.gettext('Successful rename'),
      hold: messageDelay,
      message: i18n.gettext('Group of exercises was renamed.')
    });
  });
}
/*
Функция построения списка упражнений определённой группы.
В функцию передаётся id одной выбранной группы упражнений
*/
function updateListExercises(exerciseTypeId) {
  server.exerciseType.get(exerciseTypeId).then(function (rowExerciseType) {
    $$('div.ex-of-type').text(rowExerciseType.name); // Показываем, в какой группе мы сейчас находимся
    $$('div.ex-of-type').attr('data-item', exerciseTypeId); // Устанавливаем значение id текущей группы упражнений
  });
  var listExercise = '';
  // Запросом отбираем все упражнения данной группы (exerciseType)
  server.exercise.query('name')
  	.filter('type', parseInt(exerciseTypeId))
    //.distinct()
    .execute()
    .then(function(results) {
      console.log('Найденные упражнения по выбранному id ' + exerciseTypeId + ' группы упражнений: results = ' + JSON.stringify(results));
      for (var index in results) {
        rowExercise = results[index];
      	//console.log('rowExercise.name = ' + rowExercise.name);
      	listExercise += '<li>';
        listExercise += '  <div class="item-content">';
        listExercise += '    <div class="item-inner">';
        listExercise += '      <div class="item-input">';
        listExercise += '        <input type="text" placeholder="Exercise" id="ex-name-' + rowExercise.id + '" value="' + rowExercise.name + '" oninput="showRenameLinkExercise(' + rowExercise.id + ')">';
        listExercise += '      </div>';
        listExercise += '      <div class="item-input hidden" id="ex-rename-' + rowExercise.id + '">';
        listExercise += '        <a href="" class="button button-round" onclick="renameExercise(' + rowExercise.id + ')">Rename</a>';
        listExercise += '      </div>';
      	listExercise += '      <div class="item-media">';
  	    listExercise += '        <a href="#view-8" class="tab-link button button-round" onclick="updateViewExProp(' + rowExercise.id + ')">Properties</a>';
  	    listExercise += '      </div>';
  	    listExercise += '      <div class="item-input hidden" id="ex-' + rowExercise.id + '">';
  	    listExercise += '        <a href="" class="button button-round" onclick="deleteExercise(' + rowExercise.id + ')">Delete</a>';
  	    listExercise += '      </div>';
  	    listExercise += '      <div class="item-media">';
  	    listExercise += '        <label class="label-checkbox item-content">';
  	    listExercise += '          <input type="checkbox" name="ex-' + rowExercise.id + '" class="btn-delete-toggle">';
  	    listExercise += '          <div class="item-media">';
  	    listExercise += '            <i class="icon icon-form-checkbox"></i>';
  	    listExercise += '          </div>';
  	    listExercise += '        </label>';
  	    listExercise += '      </div>';
  	    listExercise += '    </div>';
  	    listExercise += '  </div>';
  	    listExercise += '</li>';
      }
      document.getElementById("ulListExercises").innerHTML = listExercise;
      //console.log('exerciseType results = ' + JSON.stringify(results));
      //updateListExerciseType(results);
    });
}
/*
Функция выполняется, когда начали изменять название упражнения. Функция делает видимой нужную кнопку для сохранения нового имени группы упражнений 
*/
function showRenameLinkExercise(exercise) {
  if($$("#ex-rename-" + exercise).hasClass('hidden')) {
    $$("#ex-rename-" + exercise).removeClass('hidden');
  }
}
/*
Функция переименования названия упражнения. В функцию передаётся id одного выбранного упражнения
*/
function renameExercise(idExercise) {
  var temp = document.getElementById("ex-name-" + idExercise).value;
  var newExName = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  console.log('newExName = ' + newExName);
  // Cначала найдём текущие данные по упражнению
  server.exercise.get(idExercise).then(function (exercise) {
    server.exercise.update({
  	  'id': parseInt(idExercise),
  	  'name': newExName,
  	  'type': exercise.type
  	}).then(function(res) { 	
      console.log('Переименованная группа упражнений в базе: ' + JSON.stringify(res));
      if(!$$("#ex-rename-" + idExercise).hasClass('hidden')) {
        $$("#ex-rename-" + idExercise).addClass('hidden');
        myApp.addNotification({
          title: i18n.gettext('Successful rename'),
          hold: messageDelay,
          message: i18n.gettext('Exercise was renamed.')
        });
      }
    });
  });
}
/*
Функция добавления упражнения и его характеристик. Вызывается из страницы #view-7a (список упражнений определённой группы) по кнопке Save
*/
function addExercise() {
  var temp = $$('input#inputNewExercise').val();
  var newExercise = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  var idTypeExercise = parseInt($$('div#view-7a div.ex-of-type').data('item'));
  console.log('Вычислили группу упражнений - это ' + idTypeExercise);
  if(newExercise != '') {
    // Сначала надо проверить, нет ли уже такого названия упражнения в базе
    server.exercise.query('name')
      .filter('name', newExercise)
      .execute()
      .then(function (resultExist) {
        if(resultExist.length) { // В базе есть запись с таким упражнением.
          myApp.addNotification({
            title: i18n.gettext('Can not be added'),
            hold: messageDelay,
            message: i18n.gettext('That name of exercise already exist in database.')
          });
        } else { // Такого упражнения ещё нет. Можно добавлять
          server.exercise.add({
            'name': newExercise,
            'type': idTypeExercise
          }).then(function(rowNewExercise) {
            console.log('Добавили новое упражнение: ' + JSON.stringify(rowNewExercise));
            // Повторяем запись в базу по каждому отмеченному свойству упражнения
            $$('input[name="checkbox-new-ex-prop"]:checked').each(function() {
              //console.log('Мы в цикле по действующим параметрам упражнения!');
              //console.log('rowNewExercise[0].id = ' + rowNewExercise[0].id);
        	    server.optionsExercises.add({
        	      'option': this.value,
        	      'exerciseId': parseInt(rowNewExercise[0].id)
        	    }).then(function(rowOptEx) {
                  console.log('Добавили новую связку параметр-упражнение: ' + JSON.stringify(rowOptEx));
        	    });
            });
            // Обновляем список упражнений на соответствующей странице
            console.log('Перед построением списка упражнений проверяем искому группу - это ' + idTypeExercise);
            updateListExercises(idTypeExercise);
            $$('div.content-block-title a[href="#view-7"]').click();
          });
        }
      });
  }
}
/*
Функция удаления упражнения. В функцию передаётся id упражнения
*/
function deleteExercise(exerciseId) {
  // Сначала проверим, есть ли по данному упражнению записи в базе
  server.workExercise.query('exercise')
  	.filter('exercise', parseInt(exerciseId))
    .execute()
    .then(function(resWorkEx){
      if(resWorkEx.length) {
    	// В базе есть записи с этим упражнением. Удалять нельзя
    	myApp.addNotification({
		  title: i18n.gettext('Exercise ') + resWorkEx[0].name + i18n.gettext(' can not be deleted'),
          hold: messageDelay,
		  message: i18n.gettext('This item can not be delete because of history by this exercise.')
		});
      } else {
        // Данных по выполнению данного упражнения не нашлось
        // Надо проверить, не запланировано ли оно у кого-нибудь
        server.schedule.query('exercise')
          .only(parseInt(exerciseId))
          .count()
          .execute()
          .then(function(countExSchedule){
            if(countExSchedule) {
              // В базе есть записи в расписании с этим упражнением. Удалять нельзя
              myApp.addNotification({
                title: i18n.gettext('Exercise ') + resWorkEx[0].name + i18n.gettext(' can not be deleted'),
                hold: messageDelay,
                message: i18n.gettext('This item can not be delete because there are schedule with this exercise.')
              });
            } else {
              // В базе нет записей по этому упражнению, поэтому смело удаляем его
              // Сначала найдём все id записей с опциями по этому упражнению
                console.log('exercise для удаления: ' + exerciseId);
                server.optionsExercises.query()
                  .filter('exerciseId', parseInt(exerciseId))
                  .execute()
                  .then(function (optEx) {
                    //optEx.forEach(function (rowOptEx) {
                    //optEx.each(function (rowOptEx) {
                    for (var index in optEx) {
                      rowOptEx = optEx[index];
                      server.remove('optionsExercises', parseInt(rowOptEx.id));
                    //});
                    }
                    // После того, как все опции данного упражнения удалили, можно удалять и само упражнение
                    server.remove('exercise', parseInt(exerciseId)).then(function () {
                      // Упражнение удалил, теперь обновим список упражнений в данной группе
                  	  var typeExercise = parseInt($$('div#view-7a div.ex-of-type').data('item'));
                  	  updateListExercises(typeExercise);
                    });
                  });
            }
          });
    	}
    });
}
/*
Функция обновления списка опций конкретного упражнения. В функцию передаётся id выбранного упражнения
*/
function updateViewExProp(exerciseId) {
  console.log('Формируем список характеристик данного упражнения');
  // Сначала снимаем все галочки параметров
  $$('#view-8 input').prop('checked', false);
  // Найдём и покажем название текущего упражнения
  server.exercise.get(exerciseId).then(function (exercise) {
    $$('#ex-prop').html(exercise.name).attr('data-item', exerciseId); // Обновим на странице название и id текущего упражнения
  });
  server.optionsExercises.query()
    .filter('exerciseId', exerciseId)
    .execute()
    .then(function (exerciseOptions) {
      // Теперь ставим только те галочки, которые нужны по данным БД
      console.log('Список найденных характеристик по упражнению: ' + JSON.stringify(exerciseOptions));
      for (var index in exerciseOptions) {
        rowExOpt = exerciseOptions[index];
      	console.log('rowExOpt.option = ' + rowExOpt.option);
      	//$$('input[name="checkbox-ex-prop"][value="' + rowExOpt.option + '"]').click();
      	$$('input[name="checkbox-ex-prop"][value="' + rowExOpt.option + '"]').prop('checked', true);
      }
    });
}
/*
Функция обновления состава действующих параметров выбранного упражнения. Вызывается со страницы view-8 по кнопке Save 
*/
function updateExerciseProperties() {
  // Определяем редактируемое упражнение
  var exerciseId = parseInt($$('div#ex-prop').data('item'));
  console.log('Идёт обновление параметров упражнения с id = ' + exerciseId);
  // Нужно понять, что изменили. Тут возможны варианты: добавили опции, убрали опции, одновременно что-то добавили и что-то убрали, вообще ничего не поменяли
  // Для начала соберём в массив всё, что сейчас отмечено
  var arrNewOpt = [];
  var arrOldOpt = [];
  var deletedOpt = []; // Массив удалённых параметров
  var addedOpt = []; // Масси добавленных параметров
  $$('input[name="checkbox-ex-prop"]:checked').each(function(indexOpt, valueOpt) {
    arrNewOpt[indexOpt] = valueOpt.value;
    console.log('Занесли в массив значение выбранной опции: ' + valueOpt.value);
  });
  // Сначала отберём все записи с активными параметрами по данному упражнению из базы
  server.optionsExercises.query()
  	.filter('exerciseId', exerciseId)
    .execute()
    .then(function(results) {
      console.log('Список характеристик: ' + JSON.stringify(results));
      //results.forEach(function (rowOldOpt, indexOldOpt) {
      results.each(function (rowOldOpt, indexOldOpt) {
        // Сформируем массив старых параметров (те, что уже есть в базе данных)
        arrOldOpt[indexOldOpt] = rowOldOpt.option;
        // Сразу поищем, является ли данный элемент удалённым
        if (!in_array(rowOldOpt.option, arrNewOpt)) {
          deletedOpt.push(rowOldOpt.option); // Этот параметр исключили из активных параметров упражнения
          // Проверим использовался ли этот параметр в данных
          server.workExercise.query()
            .filter('option', parseInt(rowOldOpt.option))
            .execute()
            .then(function (resWorkEx) {
              if (resWorkEx.length) { // Какие-то данные есть в базе
                // Выведем сообщение, что такой-то параметр нельзя удалить, т.к. он используется
                myApp.addNotification({
                  title: i18n.gettext('Error while deleting'),
                  hold: messageDelay,
                  message: i18n.gettext('Option ') + rowOldOpt.option + i18n.gettext(' already used in database. It can not be deleted!')
                });
                // Надо снять отметку с этой опции
                $$('input[name="checkbox-ex-prop"][value="' + rowOldOpt.option + '"]').prop('checked', false);
              } else { // Никаких данных нет - можно смело удалять
        	    server.remove('optionsExercises', parseInt(rowOldOpt.id));
        	    console.log('Удалили связку параметр-упражнение с id = ' + rowOldOpt.id);
              }
            });
        }
      }); // Закончили перебирать все существующие параметры, составили список удалённых параметров
      // Теперь пройдёмся по всем параметрам из нового набора, чтобы определить, какие параметры добавили
      for (var indexNewOpt in arrNewOpt) {
        if (!in_array(arrNewOpt[indexNewOpt], arrOldOpt)) {
          addedOpt.push(arrNewOpt[indexNewOpt]); // Этот параметр добавили в новом наборе параметров упражнения
          // Добавляем в базу этот параметр
          server.optionsExercises.add({
  	        'option': arrNewOpt[indexNewOpt],
  	        'exerciseId': exerciseId
  	      }).then(function (newRowExOpt) {
            console.log('Добавили связку опция-упражнение: ' + JSON.stringify(newRowExOpt));
  	      });
        }
      }
      if (!deletedOpt.length && !addedOpt.length) { // Ничего не изменили. Тупо нажали Сохранить
        // Покажем сообщение, что сохранять нечего
        myApp.addNotification({
          title: i18n.gettext('Nothing to save'),
          hold: messageDelay,
          message: i18n.gettext('New set of options are equal to existent.')
        });
      }
    });
}
/*
Функция добавления названия группы упражнений
*/
function addExType() {
  var temp = $$('input#inputNewExType').val();
  var newExType = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  server.exerciseType.add({'name': newExType}).then(function(result) {
    // Обновляем список групп упражнений на соответствующей странице
    server.exerciseType.query('name')
      .all()
      .distinct()
      .execute()
      .then(function(results) {
        //console.log('exerciseType results = ' + JSON.stringify(results));
        updateListExerciseType(results);
      });
      $$('a[href="#view-5"]').click();
  });
}
/*
Функция удаления названия группы упражнений. В функцию передаётся id одной выбранной группы упражнений
*/
function deleteExType(idExType) {
  // Сначала проверим, есть ли по данной группе упражнений упражнения в базе
  server.exercise.query('type')
  	.only(idExType)
  	.count()
    .execute()
    .then(function(countExercises) {
      if(countExercises) {
    	// В базе есть упражнения из этой группы. Удалять нельзя
    	myApp.addNotification({
		  title: i18n.gettext('Can not be deleted'),
          hold: messageDelay,
		  message: i18n.gettext('This item can not be delete while there are exercises in it.')
		});
      } else {
    	// В базе нет упражнений из этой группы, поэтому смело удаляем эту группу упражнений
    	server.remove('exerciseType', parseInt(idExType)).then(function(res1) {
    	  server.exerciseType.query('name')
			.all()
			.distinct()
			.execute()
			.then(function(results) {
			  //console.log('exerciseType results = ' + JSON.stringify(results));
			  updateListExerciseType(results);
			});
    	});
      }
    });
}
// Управляем видимостью кнопок Delete в настройках упражнений
$$(document).on('change', '.btn-delete-toggle', function() {
  var collapse_content_selector = '#' + $$(this).attr('name');
  $$(collapse_content_selector).toggleClass('hidden');
});
/*
Функция обновления данных на странице формирования комплекса упражнений клиента.
Вызывается со страницы #view-10 (страница обзора выбранного клиента) по кнопке "Workout of the day"
По-умолчанию тут должен сформироваться комплекс упражнений на сегодня, если он уже был ранее сформирован сегодня,
либо если сегодня тот день недели, на который есть расписание
(в случае когда есть и то, и то, - приоритет за сформированным сегодня комплексом). 
*/
function upgradeViewWorkout() {
  // Сформируем доступные кнопки для вкладки сформированного комплекса упражнений
  var menuWorkout = '';
  menuWorkout =  '<div class="col-25">';
  menuWorkout += '  <center><a href="#view-10" class="back tab-link" id="aCancelSetEx">' + i18n.gettext('Cancel') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab1" class="tab-link" onclick="makeCalendExCustomer()">' + i18n.gettext('Calendar') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab2" class="tab-link" onclick="makeScheduleExCustomer()">' + i18n.gettext('Schedule') + '</a></center>';
  //menuWorkout += '  <center><a href="#" class="tab-link">' + i18n.gettext('Schedule') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab3" class="tab-link" onclick="makeSetExCustomer()">' + i18n.gettext('Change') + '</a></center>';
  menuWorkout += '</div>';
  document.getElementById("divMenuWorkout").innerHTML = menuWorkout;
  var isWorkout = 0; // Установим флаг наличия расписания на сегодня
  var temp = $$('input#inputNewCustomer').val();
  var customerName = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  var customerId = parseInt($$('#inputNewCustomer').data('item'));
  $$('#spanCustName').html(customerName).attr('data-item', customerId);
  var today = new Date().toDateInputValue();
  $$('#spanDateEx').html(today);
  console.log('Клиент ' + customerName + ', дата ' + today);
  // Сформируем список упражнений, если он уже был сформирован на сегодня ранее по данному клиенту
  server.workout.query()
  	.filter(function(currentWorkout) {return (currentWorkout.date === today) && (currentWorkout.customer === customerId)})
    .execute()
    .then(function(resWorkout) {
      var listExCust = '';
      if(resWorkout.length) { // Если нашли сегодня сформированный комплекс упражнений, то покажем его
        console.log('Нашли в базе данные по занятиям на сегодня: ' + JSON.stringify(resWorkout));
        for (var index in resWorkout) {
          var item = resWorkout[index];
          console.log('Обрабатываем первое занятие на сегодня. item = ' + JSON.stringify(item));
      	  // По id упражнения получим все данные по нему
      	  server.exercise.get(item.exercise).then(function (rowExercise) {
      	    console.log('Вот, что нашли по текущему упражнению: ' + JSON.stringify(rowExercise));
      	    var exName = rowExercise.name; // Получили название упражнения, т.к. в workout хранится только код
        	listExCust += '<li>';
            listExCust += '  <a href="#view-24" class="tab-link item-link item-content" onclick="makeViewExWork(' + rowExercise.id + ')">';
            listExCust += '    <div class="item-inner">';
            listExCust += '      <span data-item="' + rowExercise.id + '">' + exName + '</span>';
            listExCust += '    </div>';
            listExCust += '  </a>';
            listExCust += '</li>';
            // После того, как в цикле сформировали список упражнений не текущий день недели, покажем его на странице
            console.log('Сейчас будем выводить подготовленный список упражнений');
            /*if(!$$('#noWorkout').hasClass('hidden')) {
              $$('#noWorkout').addClass('hidden');
            }*/
            $$('#noWorkout').hide();
            document.getElementById("ulListCurrentExercises").innerHTML = listExCust;
            //SORTER.sort('#ulListCurrentExercises');
          });
          isWorkout = 1;
        }
      } else { // Сегодня комплекс занятий не формировался
      	console.log('Сегодня комплекс занятий не формировался, значит проверям по дням недели');
      	server.schedule.query()
      	  .filter('customer', customerId)
      	  .execute()
      	  .then(function(resSchedule) {
      	  	if(resSchedule.length) {
              console.log('Нашли в базе данные по занятиям данного клиента по дням недели');
              // Определим текущий день недели
              var dayOfWeek = new Date().getDay();
              switch (dayOfWeek) {
  	            case 0:
  	              nameToday = 'sunday';
  	              break;
  	            case 1:
  	              nameToday = 'monday';
  	              break;
  	            case 2:
  	              nameToday = 'tuesday';
  	              break;
  	            case 3:
  	              nameToday = 'wednesday';
  	              break;
  	            case 4:
  	              nameToday = 'thursday';
  	              break;
  	            case 5:
  	              nameToday = 'friday';
  	              break;
  	            case 6:
  	              nameToday = 'saturday';
  	              break;
              }
              console.log('Сегодня: ' + nameToday);
              // Теперь пройдёмся по всем дням недели и проверим, нет ли там текущего
              // А если на текущий день недели ничего не запланировано, то покажем текст-заглушку. Для это используем флаг isWorkout
              //resSchedule.forEach(function(item) {
              //resSchedule.each(function(item) {
              for (var index in resSchedule) {
                item = resSchedule[index];
      	        if((item.day === nameToday) || (item.day === 'everyday')) {
      	          server.exercise.get(item.exercise).then(function (rowExercise) {
      	            var exName = rowExercise.name; // Получили название упражнения, т.к. в workout хранится только код
        	        listExCust += '<li>';
                    listExCust += '  <a href="#view-24" class="tab-link item-link item-content" onclick="makeViewExWork(' + rowExercise.id + ')">';
                    listExCust += '    <div class="item-inner">';
                    listExCust += '      <span data-item="' + rowExercise.id + '">' + exName + '</span>';
                    listExCust += '    </div>';
                    listExCust += '  </a>';
                    listExCust += '</li>';
                    // После того, как в цикле сформировали список упражнений не текущий день недели, покажем его на странице
                    console.log('Сейчас будем выводить подготовленный список упражнений');
                    /*if(!$$('#noWorkout').hasClass('hidden')) {
                      $$('#noWorkout').addClass('hidden');
                    }*/
                    $$('#noWorkout').hide();
                    document.getElementById("ulListCurrentExercises").innerHTML = listExCust;
                  });
                  isWorkout = 1;
      	        }
              //});
              }
           } // Конец проверки на наличие расписания по дням недели на данного клиента
      	  });
      }
      if (!isWorkout) { // Если упражнений на сегодня нет
        /*if($$('#noWorkout').hasClass('hidden')) {
          $$('#noWorkout').removeClass('hidden');
        }*/
        $$('#noWorkout').show();
      }
    });
  // По-умолчанию первым делом показываем вкладку с уже сформированным списком упражнений на сегодня
  myApp.showTab('#tab0');
}
/* Функция проверки на наличие значения в массиве */
function in_array(value, array) {
  for(var i = 0; i < array.length; i++) {
    if(array[i] == value) return true;
  }
  return false;
}
/*
Функция обновления данных на странице формирования набора упражнений клиента.
Вызывается со страницы #view-15 по кнопке "Change"
*/
function makeSetExCustomer() {
  // Сформируем доступные кнопки для вкладки сформированного комплекса упражнений
  var menuWorkout = '';
  menuWorkout =  '<div class="col-25">';
  menuWorkout += '  <center><a href="" class="tab-link" onclick="makeSetExCustomer()" id="aClearAll">' + i18n.gettext('Clear all') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab1" class="tab-link" onclick="makeCalendExCustomer()">' + i18n.gettext('Calendar') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab2" class="tab-link" onclick="makeScheduleExCustomer()">' + i18n.gettext('Schedule') + '</a></center>';
  //menuWorkout += '  <center><a href="#" class="tab-link">' + i18n.gettext('Schedule') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab0" class="tab-link" onclick="saveSetExCustomer(\'fromChange\')">' + i18n.gettext('Save') + '</a></center>';
  menuWorkout += '</div>';
  document.getElementById("divMenuWorkout").innerHTML = menuWorkout;
  // Очистим список готового набора (тот, что слева)
  $$('#ulListSelectedExercises').html('');
  // Скопируем в левый список те упражнения, которые на сегодня уже отобраны (со вкладки #tab0)
  var listEx = '';
  var excludeEx = [];
  $$('#ulListCurrentExercises li a div span').each(function(index, item) {
  	temp = item.innerHTML;
  	console.log('Разбор очередной позиции упражнения: ' + JSON.stringify($$(this)));
  	// На всякий случай поставим заглушку от инъекций
  	exercise = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  	var exerciseId = parseInt($$(this).data('item')); // Находим id упражнения
  	excludeEx[index] = exercise;
    console.log('exercise = ' + exercise);
    listEx += '<li class="swipeout swipeout-selected">';
    listEx += '  <div class="swipeout-content item-content">';
    listEx += '    <div class="item-inner">';
    listEx += '      <div class="item-title set-of-exercises" data-item="' + exerciseId + '">' + exercise + '</div>';
    listEx += '    </div>';
    listEx += '  </div>';
    listEx += '  <div class="swipeout-actions-left">';
    listEx += '    <a href="#" class="action1">Deleted</a>';
    listEx += '  </div>';
    listEx += '</li>';
  });
  $$('ul#ulListSelectedExercises').append(listEx);
  $$('#ulListAllExWithTypes').html('');
  // Формируем полный список групп упражнений (тот, что справа)
  server.exerciseType.query('name')
    .all()
    .execute()
    .then(function(typeEx) {
       console.log('Формируем список групп упражнений');
       // Пройдём циклом по всем названиям групп упражнений, которые уже упорядочены по наименованию
       for (var index in typeEx) {
         var exTypeId = typeEx[index].id; // Получили код текущей группы упражнений
         var exTypeName = typeEx[index].name; // Получили наименование текущей группы упражнений
         console.log('Текущая группа упражнений: ' + exTypeName + ' с id = ' + exTypeId);
         // Добавляем на страницу наименования групп упражнений
         $$('#ulListAllExWithTypes').append('<li class="item-divider" data-item="' + exTypeId + '">' + exTypeName + '</li>');
         console.log('Добавили название очередной группы упражнений: ' + exTypeName + ' с id = ' + exTypeId);
         // Формируем список упражнений из данной группы
         server.exercise.query('name')
  	       .filter('type', parseInt(exTypeId))
           .execute()
           .then(function(arrEx) {
             // По отсортированному массиву названий упражнений пройдём циклом
             for (var indexArrEx in arrEx) {
               var exerciseId = arrEx[indexArrEx].id; // Получили id текущего упражнения
               var exerciseName = arrEx[indexArrEx].name; // Получили наименование текущего упражнения
               var exerciseType = arrEx[indexArrEx].type; // Получили название группы упражнения
               // Если упражнение было уже отобрано ранее, то его не надо включать в полный список справа
               //console.log('Вот наш список исключений: ' + excludeEx[0] + '; ' + excludeEx[1]);
               if(!(in_array(exerciseName, excludeEx))) {
               	 console.log('Проверили, что этого упражнения нет в списке исключений: ' + exerciseName);
               	 var listExercises = '';
                 listExercises += '<li class="swipeout swipeout-all">';
                 listExercises += '  <div class="swipeout-content item-content">';
                 listExercises += '    <div class="item-inner">';
                 listExercises += '      <div class="item-title" data-item="' + exerciseId + '">' + exerciseName + '</div>';
                 listExercises += '      </div>';
                 listExercises += '    </div>';
                 listExercises += '  </div>';
                 listExercises += '  <div class="swipeout-actions-right">'; // Действие появится справа
                 listExercises += '    <a href="#" class="action1">Added</a>';
                 listExercises += '  </div>';
                 listExercises += '</li>';
                 // Элемент сформирован, надо вставлять на место
                 $$('#ulListAllExWithTypes').find('li.item-divider[data-item="' + exerciseType + '"]').append(listExercises);
               }
             }
             arrEx.length = 0; // Очищаем массив упражнений для заполнения по новой группе
           });
       }
  });
}

// Обработаем свайпы на упражнениях. Нужно такое упражнение убрать из списка справа и добавить в список слева
$$(document).on('opened', '.swipeout-all', function (e) {
  //console.log('Item opened on: ' + e.detail.progress + '%');
  console.log('Item opened');
  myApp.swipeoutDelete(this);
  //console.log(this);
  console.log($$(this).find('div.item-title').text());
  var exercise = $$(this).find('div.item-title').text();
  var listEx = '';
  var exerciseId = $$(this).find('div.item-title').data('item');
  console.log('Определили id свайпнутого упражнения: ' + exerciseId);
  listEx += '<li class="swipeout swipeout-selected">';
  listEx += '  <div class="swipeout-content item-content">';
  listEx += '    <div class="item-inner">';
  listEx += '      <div class="item-title set-of-exercises" data-item="' + exerciseId + '">' + exercise + '</div>';
  listEx += '    </div>';
  listEx += '  </div>';
  listEx += '  <div class="swipeout-actions-left">';
  //listEx += '    <div class="swipeout-actions-inner">';
  listEx += '    <a href="#" class="action1">Deleted</a>';
  //listEx += '    </div>';
  listEx += '  </div>';
  listEx += '</li>';
  $$('ul#ulListSelectedExercises').append(listEx);
});
// Обработаем свайпы на упражнениях, которые уже успели отобрать. Нужно такое упражнение убрать из списка слева и добавить в список справа
$$(document).on('opened', '.swipeout-selected', function (e) {
  myApp.swipeoutDelete(this);
  //console.log(this);
  console.log($$(this).find('div.item-title').text());
  var exerciseName = $$(this).find('div.item-title').text();
  var listExercises = '';
  var exerciseId = parseInt($$(this).find('div.item-title').data('item'));
  listExercises += '<li class="swipeout swipeout-all">';
  listExercises += '  <div class="swipeout-content item-content">';
  listExercises += '    <div class="item-inner">';
  listExercises += '      <div class="item-title" data-item="' + exerciseId + '">' + exerciseName + '</div>';
  listExercises += '      </div>';
  listExercises += '    </div>';
  listExercises += '    <div class="swipeout-actions-right">';
  //listExercises += '      <div class="swipeout-actions-inner">';
  listExercises += '      <a href="#" class="action1">Added</a>';
  listExercises += '    </div>';
  listExercises += '  </div>';
  listExercises += '</li>';
  // Элемент сформирован, надо вставлять на место
  // Но сначала найти нужную группу упражнений
  server.exercise.get(exerciseId).then(function (exercise) {
    console.log('Нашли группу этого упражнения: ' + exercise.type);
    // TODO Тут вставляем запись в конец списка, хотя правильнее было бы в нужном порядке (сортировка по алфавиту)
    $$('#ulListAllExWithTypes').find('li.item-divider[data-item="' + exercise.type + '"]').append(listExercises);
  });
});  
/*
Функция сохранения набора упражнений клиента.
Вызывается со страницы #view-15 #tab3 по кнопке "Save"
*/
function saveSetExCustomer(flagFrom) {
  // Сформируем доступные кнопки для вкладки сформированного комплекса упражнений
  var menuWorkout = '';
  menuWorkout =  '<div class="col-25">';
  menuWorkout += '  <center><a href="#view-10" class="back tab-link" id="aCancelSetEx">' + i18n.gettext('Cancel') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab1" class="tab-link" onclick="makeCalendExCustomer()">' + i18n.gettext('Calendar') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab2" class="tab-link" onclick="makeScheduleExCustomer()">' + i18n.gettext('Schedule') + '</a></center>';
  //menuWorkout += '  <center><a href="#" class="tab-link">' + i18n.gettext('Schedule') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab3" class="tab-link" onclick="makeSetExCustomer()">' + i18n.gettext('Change') + '</a></center>';
  menuWorkout += '</div>';
  document.getElementById("divMenuWorkout").innerHTML = menuWorkout;
  console.log('Сохраняем набор');
  var temp = '';
  var listExCust = '';
  var customerId = parseInt($$('span#spanCustName').data('item'));
  var dateEx = $$('span#spanDateEx').text(); // TODO Тут, вероятно, надо предусмотреть сохранение в базе даты в одном каком-то формате, чтобы не было путаницы при смене региональных настроек
  // Перед сохранением нового списка упражнений, надо удалить уже существующие в базе данные
  server.workout.query()
  	.filter(function(workoutCustomer) {return (workoutCustomer.date === dateEx) && (workoutCustomer.customer === customerId)})
    .execute()
    .then(function(result) {
      console.log('Нашли в базе данные по занятиям на сегодня: ' + JSON.stringify(result));
      var listExCust = '';
      for (var index in result) {
        var item = typeEx[index];
      	server.remove('workout', parseInt(item.id)).then(function(res3) {
          console.log('Удалили workout с id = ' + item.id);
          console.log(JSON.stringify(res3));
        });
      }
    });
  if(flagFrom === 'fromCalendar') { // Если мы в эту функцию попали из календаря
    $$('#ulListPastExercises li span').each(function(index, item) {
  	  temp = item.innerHTML;
  	  // На всякий случай поставим заглушку от инъекций
  	  var exerciseName = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
      console.log('exerciseName = ' + exerciseName + '; customerId = ' + customerId + '; dateEx = ' + dateEx);
      // Определим id упражнения
      console.log('Смотрим в html в поисках id упражнения: ' + $$(this).data('item'));
      var exerciseId = parseInt($$(this).data('item'));
  	  server.workout.add({'customer': customerId, 'date': dateEx, 'exercise': exerciseId});
  	  listExCust += '<li>';
      listExCust += '  <a href="#view-24" class="tab-link item-link item-content" onclick="makeViewExWork(' + exerciseId + ')">';
      listExCust += '    <div class="item-inner">';
      listExCust += '      <span data-item="' + exerciseId + '">' + exerciseName + '</span>';
      listExCust += '    </div>';
      listExCust += '  </a>';
      listExCust += '</li>';
      // После того, как в цикле сформировали список упражнений, покажем его на странице
      document.getElementById("ulListCurrentExercises").innerHTML = listExCust;
    });
  } else { // Если в эту функцию мы попали из сохранения нового набора упражнений
    $$('div.set-of-exercises').each(function(index, item) {
  	  temp = item.innerHTML;
  	  // На всякий случай поставим заглушку от инъекций
  	  exerciseName = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
      console.log('exerciseName = ' + exerciseName + '; customerId = ' + customerId + '; dateEx = ' + dateEx);
      // Определим id упражнения
      console.log('Смотрим в html в поисках id упражнения: ' + $$(this).data('item'));
      var exerciseId = parseInt($$(this).data('item'));
  	  server.workout.add({'customer': customerId, 'date': dateEx, 'exercise': exerciseId});
  	  listExCust += '<li>';
      listExCust += '  <a href="#view-24" class="tab-link item-link item-content" onclick="makeViewExWork(' + exerciseId + ')">';
      listExCust += '    <div class="item-inner">';
      listExCust += '      <span data-item="' + exerciseId + '">' + exerciseName + '</span>';
      listExCust += '    </div>';
      listExCust += '  </a>';
      listExCust += '</li>';
      // После того, как в цикле сформировали список упражнений, покажем его на странице
      document.getElementById("ulListCurrentExercises").innerHTML = listExCust;
    });
  }
  $$('#noWorkout').hide();
  //SORTER.sort('#ulListCurrentExercises');
}
/*
Функция подготовки отображения страницы работы с упражнением клиента.
Вызывается со страницы #view-15 #tab0 по нажатию на какое-то упражнение (его id передаётся в параметре)
*/
function makeViewExWork(exerciseId) {
  console.log('Подготавливаем к работе страницу упражнения с id = ' + exerciseId);
  var customerId = parseInt($$('#spanCustName').data('item'));
  var temp = $$('#spanCustName').html();
  var customerName = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  document.getElementById("spanWorkCustName").innerHTML = customerName;
  var today = new Date().toDateInputValue();
  document.getElementById("spanWorkDateEx").innerHTML = today;
  // На форму покажем название упражнения, с которым сейчас работаем
  server.exercise.get(exerciseId).then(function (rowExercise) {
    document.getElementById("spanExWork").innerHTML = rowExercise.name;
    $$('#spanExWork').attr('data-item', exerciseId);
  });
  // Формируем к показу характеристики выбранного упражнения
  var propEx = '';
  // Параметр "Подходы" нужно оформить в виде выпадающего списка. Сразу добавим его.
  propEx += '<li>';
  propEx += '  <div class="item-content">';
  propEx += '    <div class="item-media"><i class="icon icon-form-settings"></i></div>';
  propEx += '    <div class="item-inner">';
  propEx += '      <div class="item-title label">sets</div>';
  propEx += '      <div class="item-input">';
  propEx += '        <select data-item="sets">';
  for (i=1; i<11; i++) {
    propEx += '          <option>' + i + '</option>';
  }
  propEx += '        </select>';
  propEx += '      </div>';
  propEx += '    </div>';
  propEx += '  </div>';
  propEx += '</li>';
  
  //var exerciseName = $$('span#spanExWork').text();
  console.log('Идёт построение параметров упражнения с id = ' + exerciseId);
  // Сначала отберём все записи по данному упражнению из базы...
  server.optionsExercises.query()
  	.filter('exerciseId', exerciseId)
    .execute()
    .then(function(results) {
      console.log('Список характеристик: ' + JSON.stringify(results));
      for (var index in results) {
        var rowExOpt = results[index];
      	console.log('rowExOpt.option = ' + rowExOpt.option);
      	// Параметр "Время" нужно оформить в виде двух окон ввода для минут и секунд 
      	if (rowExOpt.option == 'time') {
      	  propEx += '<li>';
      	  propEx += '  <div class="item-content">';
      	  propEx += '    <div class="item-media"><i class="icon icon-form-settings"></i></div>';
      	  propEx += '    <div class="item-inner">';
      	  propEx += '      <div class="item-title label">' + rowExOpt.option + '</div>';
      	  propEx += '      <div class="item-input">';
      	  propEx += '        <div class="row">';
      	  propEx += '          <div class="col-50"><input type="number" min="0" data-item="' + rowExOpt.option + '-minutes" placeholder="Minutes"></div>';
      	  propEx += '          <div class="col-50"><input type="number" min="0" data-item="' + rowExOpt.option + '-seconds" placeholder="Seconds"></div>';
      	  propEx += '        </div>';
      	  propEx += '      </div>';
      	  propEx += '    </div>';
      	  propEx += '  </div>';
      	  propEx += '</li>';
      	}
      	else {
      	  propEx += '<li>';
      	  propEx += '  <div class="item-content">';
      	  propEx += '    <div class="item-media"><i class="icon icon-form-settings"></i></div>';
      	  propEx += '    <div class="item-inner">';
      	  propEx += '      <div class="item-title label">' + rowExOpt.option + '</div>';
      	  propEx += '      <div class="item-input">';
      	  propEx += '        <input type="number" min="0" data-item="' + rowExOpt.option + '" placeholder="Value of ' + rowExOpt.option + '">';
      	  propEx += '      </div>';
      	  propEx += '    </div>';
      	  propEx += '  </div>';
      	  propEx += '</li>';
      	}
      }
      document.getElementById("ulListCurrentWorkEx").innerHTML = propEx;
    });
}
/*
Функция сохранения введённых данных по выполнению упражнения клиентом.
Вызывается со страницы #view-24 #workTab1 по нажатию на кнопку Save
*/
function saveExerciseWork() {
  var customerId = parseInt($$('span#spanCustName').data('item'));
  var exerciseId = parseInt($$('#spanExWork').data('item'));
  var dateEx = $$('#spanDateEx').text(); // TODO Тут, вероятно, надо предусмотреть сохранение в базе даты в одном каком-то формате, чтобы не было путаницы при смене региональных настроек
  var workSet = parseInt($$('select[data-item="sets"]').val()); // Узнаём номер подхода
  var noDoubles = 1; // Флаг, показывающий, что дубли не встретились
  //console.log('workSet = ' + workSet);
  var flagAdd = 0; // По-умолчанию запись в базу запрещена
  // Перед тем, как записать что-либо в базу данных, нужно проверить нет ли уже там записи о текущем аналитическом разрезе
  server.workExercise.query()
    .filter(function(workEx) {return (workEx.date == dateEx) && (workEx.exercise == exerciseId) && (workEx.customer == customerId) && (workEx.set == workSet)})
    .execute()
    .then(function(result) {
      if(result.length) {
        console.log('По текущему аналитическому разрезу уже есть данные');
        // Текущая проверяемая запись из базы данных совпала с текущим клиентом, текущим упражнением и текущим подходом
        // Если текущий аналитический разрез присутствует в базе, предложим пользователю три варианта:
        // 1. Перезаписать данные
        // 2. Добавить к записанному
        // 3. Отменить запись
        myApp.modal({
          title: i18n.gettext('Current set already exist in DB'),
          text: i18n.gettext('What do you want to do with current values?'),
          buttons: [{
            text: i18n.gettext('Rewrite'),
            onClick: function() {
              var flagSavedData = 0;
              // Выбрали вариант перезаписи.
              // Значит найдём все записи по данному подходу данного клиента по данному упражнению на данную дату и обновим их
              console.log('Мы в обработчике перезаписи данных по выполнению упражнения');
              for (var index in result) {
                var item = result[index];
                // Мы нашли данные по аналитическому разрезу!
                console.log('В базе нашлось: item.option = ' + item.option + '; item.value = ' + item.value);
                // Найдём текущий параметр в нашей форме
                if(item.option == 'time') {
                  var tempMinValue = $$('#ulListCurrentWorkEx input[data-item = "time-minutes"]').val();
                  if (tempMinValue == '') { // Не заполнили минуты
                    var intMinValue = 0;
                  } else {
                    var intMinValue = parseInt(tempMinValue);
                  }
                  var tempSecValue = $$('#ulListCurrentWorkEx input[data-item = "time-seconds"]').val();
                  if (tempSecValue == '') {
                    var intSecValue = 0;
                  } else {
                    var intSecValue = parseInt(tempSecValue);
                  }
                  newValOpt = intSecValue + (intMinValue * 60); // Всё переводим в секунды
                } else { // Параметр - не время, т.е. можно сразу заносить в базу новое суммарное значение
                  var tempValue = $$('#ulListCurrentWorkEx input[data-item = "' + item.option + '"]').val();
                  if (tempValue == '') { // Если поле ввода оставили пустым
                    var newValOpt = 0;
                  } else {
                    var newValOpt = parseInt(tempValue);
                  }
                }
                server.workExercise.update({
                  'id': parseInt(item.id),
                  'customer': customerId,
                  'date': dateEx,
                  'exercise': exerciseId,
                  'option': item.option,
                  'value': newValOpt,
                  'set': workSet
                }).then(function (updatedWorkEx) {
                  console.log('Обновили очередную строку в БД: ' + JSON.stringify(updatedWorkEx));
                  flagSavedData++;
                  if (flagSavedData == 1) {
                    // TODO Надо бы выводить сообщение об успешном сохранении после успешного сохранения...
                    myApp.addNotification({
                      title: i18n.gettext('Saved'),
                      hold: messageDelay,
                      message: i18n.gettext('Data was updated')
                    });
                  }
                });
              }
            } // Конец функции перезаписи значений БД
          },
          {
            text: 'Add',
            onClick: function() {
              var flagSavedData = 0;
              // Выбрали вариант добавления текущих показателей к тем, что уже есть в базе по данному разрезу.
              // Значит найдём все записи по данному подходу данного клиента по данному упражнению и прибавим текущие значения
              for (var index in result) {
                var item = result[index];
                // Найдём текущий параметр в нашей форме
                if(item.option == 'time') {
                  var tempMinValue = $$('#ulListCurrentWorkEx input[data-item = "time-minutes"]').val();
                  if (tempMinValue == '') { // Не заполнили минуты
                    var intMinValue = 0;
                  } else {
                    var intMinValue = parseInt(tempMinValue);
                  }
                  var tempSecValue = $$('#ulListCurrentWorkEx input[data-item = "time-seconds"]').val();
                  if (tempSecValue == '') {
                    var intSecValue = 0;
                  } else {
                    var intSecValue = parseInt(tempSecValue);
                  }
                  newValOpt = intSecValue + (intMinValue * 60); // Всё переводим в секунды
                } else { // Параметр - не время, т.е. можно сразу заносить в базу новое суммарное значение
                  var tempValue = $$('#ulListCurrentWorkEx input[data-item = "' + item.option + '"]').val();
                  if (tempValue == '') { // Если поле ввода оставили пустым
                    var newValOpt = 0;
                  } else {
                    var newValOpt = parseInt(tempValue);
                  }
                }
                server.workExercise.update({
                  'id': parseInt(item.id),
                  'customer': customerId,
                  'date': dateEx,
                  'exercise': exerciseId,
                  'option': item.option,
                  'value': newValOpt + item.value,
                  'set': workSet
                }).then(function (updatedWorkEx) {
                  console.log('Обновили очередную строку в БД (сложили показатели): ' + JSON.stringify(updatedWorkEx));
                  flagSavedData++;
                  if (flagSavedData == 1) {
                    // TODO Надо бы выводить сообщение об успешном сохранении после успешного сохранения...
                    myApp.addNotification({
                      title: i18n.gettext('Data was saved'),
                      hold: messageDelay,
                      message: i18n.gettext('Data was updated')
                    });
                  }
                });
              }
            } // Конец функции добавления значений к сохранённым в БД
          },
          {
            text: i18n.gettext('Cancel'),
            bold: true,
            onClick: function() {
            } // Конец функции отмены сохранения
          }]
        }); // Конец обработки модального окна
      } else {
        console.log('По текущему аналитическому разрезу ничего не найдено');
        // Считываем все значения
        var option = '';
        var time = 0; // Время будем записывать в секундах
        var isTime = 0;
        var flagSavedData = 0; // Флаг, что данные (первоя строка) сохранены
        $$('#ulListCurrentWorkEx li input').each(function(index, item) {
          console.log('item.value ' + item.value + '; item.attributes[data-item].value ' + item.attributes["data-item"].value);
          option = item.attributes['data-item'].value;
          // Значение параметра заполнено
          if(option === 'time-minutes') {
            isTime = 1;
            // Запоминаем минуты, переведённые в секунды
            var tempMinValue = $$(this).val();
            if (tempMinValue == '') {
              var intMinValue = 0;
            } else {
              var intMinValue = parseInt(tempMinValue);
            }
            time = time + (intMinValue * 60);
          }
          else if(option === 'time-seconds') {
            isTime = 1;
            // Запоминем секунды
            var tempSecValue = $$(this).val();
            if (tempSecValue == '') {
              var intSecValue = 0;
            } else {
              var intSecValue = parseInt(tempSecValue);
            }
            time = time + intSecValue;
          } else {
            var tempValue = $$(this).val();
            console.log('tempValue = ' + tempValue);
            if(tempValue == '') {
              var intValue = 0;
            } else {
              var intValue = parseInt(tempValue);
            }
            console.log('Перед записью: customerId = ' + customerId + '; dateEx = ' + dateEx + '; exerciseId = ' + exerciseId + '; option = ' + option + '; intValue = ' + intValue + '; workSet = ' + workSet);
            // Любой параметр, кроме времени
            server.workExercise.add({
              'customer': customerId,
              'date': dateEx,
              'exercise': exerciseId,
              'option': option,
              'value': intValue,
              'set': workSet
            }).then(function (savedData) {
              console.log('Проверяем, что записали: ' + JSON.stringify(savedData));
              flagSavedData++;
              if (flagSavedData == 1) {
                // TODO Надо бы выводить сообщение об успешном сохранении после успешного сохранения...
                myApp.addNotification({
                  title: i18n.gettext('Saved'),
                  hold: messageDelay,
                  message: i18n.gettext('Data was added')
                });
              }
            });
          }
        }); // Конец цикла записи
          // Отдельно записываем в базу время, т.к. сразу нельзя было (происходило сложение минут и секунд)
          if(isTime) {
            console.log('Добавляем время выполнения упражнения в базу. time = ' + time);
            server.workExercise.add({
              'customer': customerId,
              'date': dateEx,
              'exercise': exerciseId,
              'option': 'time',
              'value': time,
              'set': workSet
            }).then(function (savedData) {
              flagSavedData++;
              if (flagSavedData == 1) {
                // TODO Надо бы выводить сообщение об успешном сохранении после успешного сохранения...
                myApp.addNotification({
                  title: i18n.gettext('Data was saved'),
                  hold: messageDelay,
                  message: i18n.gettext('Data was added')
                });
              }
            });
          }
      }
    });
} // Конец функции сохранения результатов выполнения упражнения

// Приводим даты в "русский вид" ("15.04.2013"))
function makeCalDate(date) {
  var d = date.getDate().toString();
  var m = 1 + date.getMonth();
  var y = date.getFullYear().toString();
  if(d.length < 2) {
    d = "0" + d;
  }
  m = m.toString();
  if(m.length < 2) {
    m = "0" + m;
  }

  //var Date2 = d +"."+ m +"."+ y;
  var Date2 = y +"-"+ m +"-"+ d;
                        
  return Date2;
}
/*
Функция подготовки отображения календаря клиента.
Вызывается со страницы #view-15 #tab1 (при клике на вкладку календаря)
*/
function makeCalendExCustomer() {
  // Сформируем доступные кнопки для вкладки Календарь
  var menuWorkout = '';
  menuWorkout =  '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab0" class="tab-link" onclick="viewExSetCustomer()">' + i18n.gettext('Cancel') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab1" class="tab-link active">' + i18n.gettext('Calendar') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab2" class="tab-link" onclick="makeScheduleExCustomer()">' + i18n.gettext('Schedule') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab0" class="tab-link" onclick="saveSetExCustomer(\'fromCalendar\')">' + i18n.gettext('Save') + '</a></center>';
  menuWorkout += '</div>';
  document.getElementById("divMenuWorkout").innerHTML = menuWorkout;
  // Очистим список упражнений в левой части
  $$('#ulListPastExercises').html('');
  console.log("Начинаем подгружать календарь");
  // Получим из базы данные, когда были занятия у данного клиента
  var customerId = parseInt($$('span#spanCustName').data('item'));
  server.workout.query()
  	.filter('customer', customerId)
    .execute()
    .then(function(result) {
      //console.log('Нашли данные по занятиям: ' + JSON.stringify(result));
      var datesWork = [];
      var dateWork = '';
      var i = 0;
      var arrWorkEx = [];
      var dateEx = $$('#spanDateEx').text(); // TODO Тут, вероятно, надо предусмотреть сохранение в базе даты в одном каком-то формате, чтобы не было путаницы при смене региональных настроек
      for (var index in result) {
        var item = result[index];
        // Сформируем массив дат, когда были составлены списки упражнений для занятия текущего клиента
        dateWork = item.date;
        if (index == 0) {
          datesWork[0] = dateWork;
          console.log('Первый раз. Новая дата: ' + dateWork);
          i = 1;
        } else { // Обрабатываем уже не первую запись
          // Если дата из новой записи ещё не встречалась, то запишем её в наш массив дат
          if(!(in_array(dateWork, datesWork))) {
            datesWork[i] = dateWork;
            i = 1; // Начинаем отсчёт упражнения по новой дате
            console.log('Новая дата: ' + dateWork);
          } else {
            i = i + 1; // Продолжаем отсчёт упражнений по той же дате
          }
        }
        //console.log('i = ' + i);
        if(i > 1) { // Заносим id уже не первого упражнения в массив по этой дате
          arrWorkEx[dateWork] = arrWorkEx[dateWork] + '@#' + item.exercise;
        } else { // Заносим id первого упражнения в массив по этой дате
          arrWorkEx[dateWork] = item.exercise;
        }
      } // Вышли из цикла после обработки всех строк
      // Если на текущую дату уже есть какой-то набор упражнений, его надо тут показать
      if (result.length && (in_array(dateEx, datesWork))) { // Если на сегодня что-то есть по данному клиенту 
        console.log('Обрабатываем текущую дату (она нашлась в базе даных)!');
        console.log('arrWorkEx[dateEx] = ' + arrWorkEx[dateEx]);
        var workExercises = arrWorkEx[dateEx].split('@#');
        var listExCust = '';
        //workExercises.forEach(function(exerciseToday) {
        //workExercises.each(function(exerciseToday) {
        for (var index in workExercises) {
          var exerciseToday = workExercises[index];
          // Т.к. мы нашли id упражнения, определим его название
          server.exercise.get(parseInt(exerciseToday)).then(function (rowExercise) {
    	    console.log('rowExercise.name = ' + rowExercise.name);
            listExCust += '<li>';
            listExCust += '  <div class="item-link item-content">';
            listExCust += '    <div class="item-inner">';
            listExCust += '      <span data-item="' + rowExercise.id + '">' + rowExercise.name + '</span>';
            listExCust += '    </div>';
            listExCust += '  </div>';
            listExCust += '</li>';
            document.getElementById("ulListPastExercises").innerHTML = listExCust;
            //SORTER.sort('#ulListPastExercises');
          });
        //});
        }
      };
      //console.log('Цикл закончился, форматируем даты');

      var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August' , 'September' , 'October', 'November', 'December'];
      document.getElementById("calendar-inline-container").innerHTML = '';
      console.log(datesWork[0]);
      var calendarInline = myApp.calendar({
        container: '#calendar-inline-container',
        value: [new Date()],
        //value: datesWork, // Выделяем те дни, когда были занятия.
        weekHeader: false,
        toolbarTemplate:
          '<div class="toolbar calendar-custom-toolbar">' +
            '<div class="toolbar-inner">' +
              '<div class="left">' +
                '<a href="#" class="link icon-only"><i class="icon icon-back"></i></a>' +
              '</div>' +
              '<div class="center"></div>' +
              '<div class="right">' +
                '<a href="#" class="link icon-only"><i class="icon icon-forward"></i></a>' +
              '</div>' +
            '</div>' +
          '</div>',
        onOpen: function (p) {
          $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
          $$('.calendar-custom-toolbar .left .link').on('click', function () {
            calendarInline.prevMonth();
          });
          $$('.calendar-custom-toolbar .right .link').on('click', function () {
            calendarInline.nextMonth();
          });
        },
        onMonthAdd: function (calendar, monthContainer) {
          $$(monthContainer).find('.picker-calendar-day').each(function() {
            var day = $$(this);
            var dayDate = day.attr('data-date').split('-'); //will give you array in format ['yyyy','m','d'];
            // Собираем дату в виде строки по формату ГГГГ-ММ-ДД
            var tempDate = new Date(dayDate[0], dayDate[1], dayDate[2]);
            var dateText = makeCalDate(tempDate);
            console.log('dateText = ' + dateText);
            if (in_array(dateText, datesWork)) {
              console.log('Совпадение даты найдено: ' + dayDate);
              day.addClass('selected-day');
            }
          });
        },
        onMonthYearChangeStart: function (p) {
          $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
        },
        onDayClick: function (p, dayContainer, year, month, day) {
          console.log('Нажали на дату ' + year + '-' + (parseInt(month)+1) + '-' + day);
          // Собираем дату в виде строки по формату ГГГГ-ММ-ДД
          var tempDate = new Date(year, month, day);
          var dateText = makeCalDate(tempDate);
          //console.log('dateText = ' + dateText);
          //console.log('datesWork[0] = ' + datesWork[0]);
          if(in_array(dateText, datesWork)) {
            console.log('На эту дату есть комплекс упражнений!');
            var workExercises = [];
            workExercises = arrWorkEx[dateText].split('@#');
            var listExCust = '';
            for (var index in workExercises) {
              var exerciseId = workExercises[index];
              console.log('Мы в цикле по кодам упражнений. Текущая строка: ' + exerciseId);
              // Т.к. мы нашли id упражнения, определим его название
              server.exercise.get(parseInt(exerciseId)).then(function (rowExercise) {
                //console.log('exercise = ' + exercise);
                listExCust += '<li>';
                listExCust += '  <div class="item-link item-content">';
                listExCust += '    <div class="item-inner">';
                listExCust += '      <span data-item="' + rowExercise.id + '">' + rowExercise.name + '</span>';
                listExCust += '    </div>';
                listExCust += '  </div>';
                listExCust += '</li>';
                // Надо слева показать список упражнений выделенного дня
                console.log('listExCust = ' + listExCust);
                document.getElementById("ulListPastExercises").innerHTML = listExCust;
                //SORTER.sort('#ulListPastExercises');
                console.log('Обновили комплекс упражнений!');
              });
            }
          }
        }
      });
    });
}
/*
Функция сортировки списков <li>
*/
/*var SORTER = {};
SORTER.sort = function(which, dir) {
  SORTER.dir = (dir == "desc") ? -1 : 1;
  $$(which).each(function() {
    // Find the list items and sort them
    //var sorted = $$(this).find("> li").sort(function(a, b) {
    var sorted = $$(this).children().sort(function(a, b) {
      return $$(a).text().toLowerCase() > $$(b).text().toLowerCase() ? SORTER.dir : -SORTER.dir;
    });
    $$(this).append(sorted);
  });
};*/

/*
Функция подготовки отображения расписания клиента по дням недели.
Вызывается со страницы #view-15 #tab2 (при клике на вкладку Schedule)
Текущий комплекс упражнений (если он есть) должен перекочевать сюда в левую часть, чтобы можно было выбрать дни недели
и закрепить этот комплекс упражнений за определёнными днями недели.
Если текущего комплекса упражнений ещё нет, то на данной вкладке должны "подсветиться" те дни недели,
по которым расписание сформировано. Если выбрать заполненный день, то должен показаться его комплекс упражнений.
*/
function makeScheduleExCustomer() {
  // Сформируем доступные кнопки для вкладки расписания по дням недели
  var menuWorkout = '';
  menuWorkout =  '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab0" class="back tab-link" onclick="viewExSetCustomer()">' + i18n.gettext('Cancel') + '</a>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab1" class="tab-link" onclick="makeCalendExCustomer()">' + i18n.gettext('Calendar') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab2" class="tab-link active">' + i18n.gettext('Schedule') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab0" class="tab-link" onclick="makeScheduleCustomer()">' + i18n.gettext('Save') + '</a></center>';
  menuWorkout += '</div>';
  document.getElementById("divMenuWorkout").innerHTML = menuWorkout;
  // Найдём сформированный на сегодня набор упражнений, чтобы тут же его показать
  var customerId = parseInt($$('span#spanCustName').data('item'));
  var dateEx = $$('span#spanDateEx').text(); // TODO Тут, вероятно, надо предусмотреть сохранение в базе даты в одном каком-то формате, чтобы не было путаницы при смене региональных настроек
  var currentListEx = $$('#ulListCurrentExercises li a div span');
  var arrWorkEx = [];
  if (currentListEx) { // Уже есть сформированный комплекс упражнений на сегодня
    // Отобразим текущий комплекс упражнений в левой части вкладки
    var listExCust = '';
    $$('#ulListCurrentExercises li a div span').each(function(index, item) {
      var temp = item.innerHTML;
      //console.log('Разбор очередной позиции упражнения: ' + JSON.stringify($$(this)));
      // На всякий случай поставим заглушку от инъекций
      var exerciseName = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
      var exerciseId = parseInt($$(this).data('item')); // Находим id упражнения
      arrWorkEx.push(exerciseId); // Формируем список выбранных упражнений
      listExCust += '<li>';
      listExCust += '  <div class="item-link item-content">';
      listExCust += '    <div class="item-inner">';
      listExCust += '      <span data-item="' + exerciseId + '">' + exerciseName + '</span>';
      listExCust += '    </div>';
      listExCust += '  </div>';
      listExCust += '</li>';
      // Надо слева показать список упражнений, сформированный на сегодня
      document.getElementById("ulListScheduleEx").innerHTML = listExCust;
    });
    // В правой части вкладки отметим те дни недели, которые содержат данный набор упражнений
    server.schedule.query('day')
      .filter('customer', customerId)
      .execute()
      .then(function(result) {
        var arrDays = [];
        var arrExForCheck = [];
        var num = 0;
        var count = result.length;
        console.log('Размер найденного массива = ' + count);
        for (var index in result) {
          var item = result[index];
          // Результат отбора отсортирован по дням
          arrDays[index] = item.day;
          console.log('Проверяем день ' + item.day);
          console.log('index = ' + index);
          num = parseInt(index) + 1;
          console.log('num = ' + num + '; count = ' + count);
          if (((index > 0) && (arrDays[index] != arrDays[index - 1])) || (num == count)) { // Если начались записи по новому дню
            // Проверяем список упражнений, назначенных на текущий день - совпадает ли он с сегодняшним комплексом упражнений
            if (num == count) {
              console.log('Новая запись того же дня (последняя): ' + item.exercise);
              arrExForCheck.push(item.exercise); // Вносим упражнение следующего дня
            }
            console.log('arrExForCheck.sort().toString() = ' + arrExForCheck.sort().toString());
            console.log('arrWorkEx.sort().toString() = ' + arrWorkEx.sort().toString());
            console.log('Сверяем наборы упражнений');
            if (arrExForCheck.sort().toString() === arrWorkEx.sort().toString()) {
              // Отмечаем совпавший день
              console.log('Отмечаем совпавший день ' + arrDays[index - 1]);
              $$('#ulListDays li[data-item="' + arrDays[index - 1] + '"] input').prop('checked', true);
            }
            arrExForCheck.length = 0; // Сбрасываем массив для проверки следующего дня
            arrExForCheck.push(item.exercise); // Вносим упражнение следующего дня
          } else { // Продолжаются записи по одному дню
            console.log('Новая запись того же дня: ' + item.exercise);
            arrExForCheck.push(item.exercise); // Формируем список упражнений, назначенных на текущий день
          }
        }
      });
  } else { // На сегодня нет сформированного комплекса упражнений
    // TODO Подсветим серым цветом те дни недели, на которые есть сохранённые комплексы упражнений

  }
}
/*
Функция сохранения расписания по сформированному набору упражнений клиента.
Вызывается со страницы #view-15 #tab2 (при Save в Schedule)
*/
function makeScheduleCustomer() {
  // Сформируем доступные кнопки для вкладки текущего комплекса упражнений
  var menuWorkout = '';
  menuWorkout =  '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab0" class="back tab-link" onclick="viewExSetCustomer()">' + i18n.gettext('Cancel') + '</a>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab1" class="tab-link" onclick="makeCalendExCustomer()">' + i18n.gettext('Calendar') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#" class="tab-link">' + i18n.gettext('Schedule') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab3" class="tab-link" onclick="makeSetExCustomer()">' + i18n.gettext('Change') + '</a></center>';
  menuWorkout += '</div>';
  document.getElementById("divMenuWorkout").innerHTML = menuWorkout;
  console.log('Сохраняем расписание');
  var customerId = parseInt($$('span#spanCustName').data('item'));
  var day;
  var isEveryday = 0; // По-умолчанию, считаем, что отметка "Каждый день" не стоит
  // Сформируем текущий рабочий список дней (всё, что отметили галочками)
  var arrNewDays = [];
  $$('#ulListDays input:checked').each(function(item, index) {
    arrNewDays.push($$(this).val());
    console.log('$$(this).val() = ' + $$(this).val());
    // Проверяем, появилась ли отметка everyday
    if($$(this).val() === 'everyday') {
      isEveryday = 1; // Выбрана опция "Каждый день", значит все другие записи из базы надо удалить
    }
  });
  // Найдём в базе все записи по расписаниям занятий на данного клиента
  server.schedule.query()
  	.filter('customer', customerId)
    .execute()
    .then(function(results) {
      // Удалим всё, что уже ранее было сохранено в качестве расписания клиента по выбранным сейчас дням
      // Остальные дни не трогаем. Таким образом можно сформировать разные группы упражнений для разных дней.
      for (var index in results) {
        var rowSchedule = results[index];
        if(in_array(rowSchedule.day, arrNewDays) || isEveryday) {
          server.remove('schedule', parseInt(rowSchedule.id));
      	}
      }
      // После того, как удалили старые записи, внесём в базу новые записи
      // Для этого в цикле по дням (из сформированного ранее массива) занесём все упражнения
      for (var indexDay in arrNewDays) {
        $$('#ulListScheduleEx span').each(function() {
          var exerciseId = parseInt($$(this).data('item'));
          console.log('Получили id текущего упражнения: ' + exerciseId);
          server.schedule.add({
            'customer': customerId,
            'day': arrNewDays[indexDay],
            'exercise': exerciseId
          });
          console.log('Были добавлены такие данные: customer = ' + customerId + '; day = ' + arrNewDays[indexDay] + '; exerciseId = ' + exerciseId);
        });
      }
    });
}
/*
Функция отображения сформированного набора упражнений клиента на сегодня.
Вызывается со страницы #view-15 #tab1 (при Cancel в Календаре) и ещё в некоторых местах при Cancel
*/
function viewExSetCustomer() {
  // Сформируем доступные кнопки для вкладки со сформированным набором упражнений клиента на сегодня
  var menuWorkout = '';
  menuWorkout =  '<div class="col-25">';
  menuWorkout += '  <center><a href="#view-10" class="back tab-link" id="aCancelSetEx">' + i18n.gettext('Cancel') + '</a>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab1" class="tab-link" onclick="makeCalendExCustomer()">' + i18n.gettext('Calendar') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab2" class="tab-link" onclick="makeScheduleExCustomer()">' + i18n.gettext('Schedule') + '</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab3" class="tab-link" onclick="makeSetExCustomer()">' + i18n.gettext('Change') + '</a></center>';
  menuWorkout += '</div>';
  document.getElementById("divMenuWorkout").innerHTML = menuWorkout;
}
/* Функция выполняется когда изменяется значение какого-либо флага дня из расписания (на странице #view-15 #tab2 - Schedule)
 Управляет автоматическим переключением флагов согласно логике.
*/
$$('#ulListDays li').click(function() {
  console.log('$$(this).find("input").val() = ' + $$(this).find('input').val());
  var checkBox = $$(this).find('input').val();
  var isChecked = $$('#ulListDays input[value="' + checkBox + '"]').prop('checked'); // Проверяем, установлен ли флаг
  if (isChecked) {
    if(checkBox === 'today') {
      // Установлен флаг "только на сегодня", значит, надо снять отметки со всех остальных флагов
      $$('li[data-item="everyday"] input').prop('checked', false);
      $$('li[data-item="week"] input').prop('checked', false);
    } else if (checkBox == 'everyday') {
      // Установлен флаг "ежедневно", значит, надо снять отметки со всех остальных флагов
      $$('li[data-item="today"] input').prop('checked', false);
      $$('li[data-item="week"] input').prop('checked', false);
    } else {
  	  // Установлен флаг на каком-то дне недели, значит, надо снять отметки с флагов "только на сегодня" и "ежедневно"
      $$('li[data-item="today"] input').prop('checked', false);
      $$('li[data-item="every"] input').prop('checked', false);
    }
  }
});
/*
Функция генерирует данные для страницы статистики по выбранному упражнению, клиенту и дате
*/
function generateStatistics() {
  // Надо добавить кнопку Save
  $$('#linkSaveWorkEx').show();
  var customerId = parseInt($$('span#spanCustName').data('item'));
  var dateEx = $$('span#spanDateEx').text(); // TODO Тут, вероятно, надо предусмотреть сохранение в базе даты в одном каком-то формате, чтобы не было путаницы при смене региональных настроек
  var exerciseId = parseInt($$('#spanExWork').data('item'));
  var countBlock = 0; 
  // Определим, какое количество блоков информации надо выводить (количество записей по даному клиенту)
  // Для этого сначала определим все действующие параметры текущего упражнения
  server.optionsExercises.query()
    .filter('exerciseId', exerciseId)
    .execute()
    .then(function(resOptions) {
      var countOptions = resOptions.length; // Это должно быть не нулевое значение
      console.log('Количество всех собранных из БД характеристик: ' + countOptions);
      // Найдём все характеристики упражнения и сформируем из них заголовки строк статистики
      // Первым параметром всегда идёт Подход
      var statName = '';
      statName += '<span class="statistics-name">sets</span><br>';
      var numberOption = 0;
      // После подхода идут все остальные характеристики
      for (var index in resOptions) {
        var rowExOpt = resOptions[index];
        statName += '<span class="statistics-name">' + rowExOpt.option + '</span><br>';
        numberOption++;
        document.getElementById("divStatName").innerHTML = statName;
      }
      // Найдём все записи по данному упражнению и клиенту (каждое упражнение повторяется в базе по столько раз, сколько характеристик есть в упражнении)
      server.workExercise.query()
        .filter(function(blockData) {return ((blockData.exercise == exerciseId) && (blockData.customer == customerId))})
        .execute()
        .then(function(workEx) {
          console.log('Найденные блоки информации: ' + JSON.stringify(workEx));
          console.log('Найдено количество записей по упражнению и клиенту: ' + workEx.length);
          var amountBlock = workEx.length / countOptions;
          console.log('amountBlock =  ' + amountBlock);
          if (amountBlock < 5) {
            countBlock = amountBlock;
          } else {
            countBlock = 5;
          }
          console.log('Определили количество показываемых блоков информации: ' + countBlock);
          var block = '';
          var i = 0; // Счётчик параметров. Будем отсчитывать параметры и формировать блоки информации
          for (var index in workEx) {
            var item = workEx[index];
           	console.log('Выводим построчно всё, что нашлось: ' + JSON.stringify(item));
            console.log('Считаем итерации: i = ' + i);
           	if(i === 0) {
           	  // Пошёл первый параметр в новом блоке
           	  console.log('Открываем новый блок');
           	  block += '<div class="swiper-slide">';
           	  // Первым параметром всегда идёт Подход
           	  block += '<span>' + item.set + '</span>';
           	}
           	block += '<br><span>' + item.value + '</span>';
           	i++;
           	if(i === numberOption) {
           	  console.log('Закрываем блок и обнуляем счётчик.');
           	  // Пора закрывать блок и обнулять счётчик параметров упражнения
           	  block += '</div>';
           	  i = 0;
           	}
            console.log('Выводим блок на страницу.');
            document.getElementById("divStatistics").innerHTML = block;
          }
          var mySlider3 = myApp.swiper('.swiper-stat', {
            //pagination: '.swiper-stat .swiper-pagination',
            freeMode: true,
            spaceBetween: 15,
            slidesPerView: countBlock,
            //slidesPerView: 'auto',
            grabCursor: true,
            paginationHide: false,
            paginationClickable: true,
            nextButton: '.swiper-button-next',
            prevButton: '.swiper-button-prev'
          });
        });
    });

}
// Функция срабатывает при нажатии кнопки Note на странице работы с упражнением index-24
$$('#aWorkNote').on('click', function() {
  // Надо добавить кнопку Save
  $$('#linkSaveWorkEx').show();
});
// Функция срабатывает при нажатии кнопки Statistics на странице работы с упражнением index-24
$$('#aWorkStatistics').on('click', function() {
  // Надо скрыть кнопку Save
  $$('#linkSaveWorkEx').hide();
});
/*
Функция срабатывает при нажатии кнопки Graph на странице работы с упражнением index-24
Функция рисует график по данным истории выполнения упражнения из БД
*/
$$('#aWorkGraph').on('click', function() {
  // Надо скрыть кнопку Save
  $$('#linkSaveWorkEx').hide();
  // Получим все параметры данного упражнения
  var exerciseId = parseInt($$('#spanExWork').data('item'));
  var customerId = parseInt($$('#spanCustName').data('item'));
  var arrOptEx = []; // Список всех параметров данного упражнения
  var i = 0; // Счётчик количества данных (фактически это количество подходов)
  // Сначала определим состав и количество активных параметров у данного упражнения
  server.optionsExercises.query()
  	.filter('exerciseId', exerciseId)
    .execute()
    .then(function(results) {
      for (var index in results) {
        var rowExercise = results[index];
    	arrOptEx[index] = rowExercise.option;
      }
      // Определим количество характеристик
      var countOptions = arrOptEx.length;
      console.log('Количество всех собранных из БД характеристик: ' + countOptions);
      console.log('Список всех собранных из БД характеристик: ' + JSON.stringify(arrOptEx));
      // Теперь надо сформировать данные для графика. Ищем в базе всё по данному упражнению и клиенту
      server.workExercise.query()
  	    .filter(function(blockData) {return ((blockData.exercise === exerciseId) && (blockData.customer === customerId))})
        .execute()
        .then(function(result) {
      	  var analitCount = 0;
		  var arrSetEx = [];
		  var arrDateEx = [];
		  var arrRepeats = [];
		  var arrWeight = [];
		  var arrTime = [];
		  var arrDistance = [];
		  var arrSpeed = [];
		  var arrSlope = [];
		  var arrLoad = [];
          for (var index in result) {
            var item = result[index];
            // Добрались до данных, теперь их надо собрать в массивы
            if (i === 0) {
              arrDateEx[analitCount] = item.date;
              arrSetEx[analitCount] = item.set;
            }
            console.log('item.option = ' + item.option);
            if (item.option === 'repeats') {
	          arrRepeats[analitCount] = item.value;
	        } else if (item.option === 'weight') {
	          arrWeight[analitCount] = item.value;
	        } else if (item.option === 'time') {
	          arrTime[analitCount] = item.value / 60; // Время отобразим в минутах
	        } else if (item.option === 'distance') {
	          arrDistance[analitCount] = item.value;
	        } else if (item.option === 'speed') {
	          arrSpeed[analitCount] = item.value;
	        } else if (item.option === 'slope') {
	          arrSlope[analitCount] = item.value;
	        } else if (item.option === 'load') {
	          arrLoad[analitCount] = item.value;
	        }
            i++; // Счётчик по параметрам одного аналитического разреза
            if(i === countOptions) {
              i = 0; // Начало нового аналитического разреза
	          analitCount++;
            }
            console.log('Номер характеристики в текущей итерации: ' + i);
          }
          // Данные собрали в массив. Теперь готовим к показу график по данным
          //var test = [1, 2, 3];
		  var data = {
		    //labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		    labels: arrDateEx,
		    /*series: [
		      arrRepeats,
		      arrWeight,
		      arrTime,
			  arrDistance,
			  arrSpeed,
			  arrSlope,
			  arrLoad
			]*/
			series: [
			  {
                name: i18n.gettext('Repeats'),
                data: arrRepeats
              },
              {
                name: i18n.gettext('Weight'),
                data: arrWeight
              },
              {
                name: i18n.gettext('Time'),
                data: arrTime
              },
              {
                name: i18n.gettext('Distance'),
                date: arrDistance
              },
              {
                name: i18n.gettext('Speed'),
                data: arrSpeed
              },
              {
                name: i18n.gettext('Slope'),
                data: arrSlope
              },
              {
                name: i18n.gettext('Load'),
                data: arrLoad
              }
            ]
		  };
		  console.log('Собираем данные в массивы для показа на графике.');
		  var options = {
		    //seriesBarDistance: 10,
		    lineSmooth: Chartist.Interpolation.simple({
              divisor: 2
            }),
            fullWidth: true,
            chartPadding: {
              right: 80
            }
		  };

		  var responsiveOptions = [
		    ['screen and (max-width: 640px)', {
		      seriesBarDistance: 5,
		      axisX: {
		        labelInterpolationFnc: function (value) {
		          return value[0];
		        }
		      }
		    }]
		  ];
		  console.log('Показываем график.');
		  //new Chartist.Bar('.ct-chart', data, options, responsiveOptions);
		  new Chartist.Line('.ct-chart', data, options, responsiveOptions);

          var chart = $$('.ct-chart');
          //$$('.ct-point').on('click', function () {
          chart.on('click', '.ct-point', function (event) {
            var clickedLink = this;
            var point = $$(this),
              value = point.attr('ct:value'),
              seriesName = point.parent().attr('ct:series-name');
            var popoverHTML = '<div class="popover">'+
                                 '<div class="popover-inner">'+
                                   '<div class="content-block">'+
                                     '<p>' + seriesName + '</p>'+
                                     '<p>' + value + '</p>'+
                                   '</div>'+
                                 '</div>'+
                               '</div>';
            /*popoverHTML.css({
              left: (event.offsetX || event.originalEvent.layerX) - popoverHTML.width() / 2 - 10,
              top: (event.offsetY || event.originalEvent.layerY) - popoverHTML.height() - 40
            })*/
            myApp.popover(popoverHTML, clickedLink);
          });
        });
    });  
});
