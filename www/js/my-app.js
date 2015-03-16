//console.log('Sart at my-app');
// Initialize your app
var myApp = new Framework7({
  modalTitle: 'Personal trainer',
  init: false
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
// Export selectors engine
var $$ = Framework7.$;
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

$.getJSON('default/bd-schema.json', function(data){
//getJSON('default/bd-schema.json').then(function(data) {
  bdSchema = data;
  console.log("Схема БД: " + JSON.stringify(data));
  db.open(data).then(function(serv) {
  	console.log('Получили схему БД, открыли базу');
    server = serv;
    console.log(JSON.stringify(server));
    console.log('Инициализируем страницу index-2');
    myApp.onPageInit('index-2', function (page) {
      // Перед инициализацией страницы с настройками, нужно получить некоторые настройки из БД
      server.settings.query()
        .all()
        .execute()
        .then(function(results) {
          console.log('Получили список настроек');
          if(results.length) {
          	$("#selectUnits :contains('" + results.units + "')").attr("selected", "selected");
          	$("#selectLang :contains('" + results.language + "')").attr("selected", "selected");
          } else {
          	// Настроек в базе никаких не было (значит в первый раз открыли программу). Допишем их туда.
          	// По-умолчанию язык будет - English, система единиц измерения - Metric
          	server.settings.add({
              'units': 'Metric',
              'language': 'English'
            }).then(function(item){
              console.log('Записали настройки по-умолчанию в базу: ' + JSON.stringify(item));
          	  $("#selectUnits :contains('Metric')").attr("selected", "selected");
          	  $("#selectLang :contains('English')").attr("selected", "selected");
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
      $('#inputDateStartClasses').val(new Date().toDateInputValue());
    });
    myApp.init();
  });
});
// Функция изменения системы единиц измерения в настройках
$('#selectUnits').on('change', function() {
	console.log('Зашли в изменение настроек единиц измерения');
  // Сначала найдём то, что уже есть в базе
  server.settings.query()
    .all()
    .execute()
    .then(function(results) {
      var setLang = results[0].language;
      var setUnits = $("#selectUnits :selected").html();
      // Т.к. запись с настройками может быть только одна, то смело обновляем найденную запись
	    server.settings.update({
	      'id': parseInt(results[0].id),
        'units': setUnits, // Ставим новое значение
        'language': setLang // Оставляем то, что было ранее
	    }).then(function(item) {
        console.log('Записали новые настройки в базу: ' + JSON.stringify(item));
      });
    });
});
// Функция изменения языка приложения в настройках
$('#selectLang').on('change', function() {
	console.log('Зашли в изменение настроек языка');
  // Сначала найдём то, что уже есть в базе
  server.settings.query()
    .all()
    .execute()
    .then(function(results) {
      var setLang = $("#selectLang :selected").html();
      var setUnits = results[0].units;
      // Т.к. запись с настройками может быть только одна, то смело обновляем найденную запись
      server.settings.update({
	      'id': parseInt(results[0].id),
        'units': setUnits, // Оставляем то, что было ранее
        'language': setLang // Ставим новое значение
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
    $.getJSON('default/exercises.json', function(data) {
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
    
    $.getJSON('default/customers.json', function(data) {
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
    myApp.confirm('Are you sure? It will erase all of your data!', 
      function () {
        console.log('Start cleaning DB');
        // Очистим все таблицы
        server.clear('workExercise');
        server.clear('schedule');
        server.clear('workout');
        server.clear('optionsExercises');
        server.clear('exerciseType');
        server.clear('exercise');
        server.clear('customers');
        console.log('Reload pages data');
        server.customers.query('name')
          .all()
          .keys()
          .distinct()
          .execute()
          .then(function(results) {
            updateListCustomers(results);
          });
        server.exerciseType.query('name')
          .all()
          .keys()
          .execute()
          .then(function(results) {
            updateListExerciseType(results);
          });
        myApp.alert('Database is clean');
      },
      function () {
        // Действие отменено
      }
    );
});

// Модальное окно для создания базы данных
$$('.confirm-create-db').on('click', function () {
  myApp.confirm('Are you sure?', function () {
    db.open(bdSchema).then(function(serv) {
      server = serv;
    });
  });
});
// Модальное окно для удаления базы данных
$$('.confirm-remove-db').on('click', function () {
	myApp.confirm('Are you sure?', function () {
		// Удаление самой базы данных
		indexedDB.deleteDatabase('my-app');
		document.getElementById("ulListCustomers").innerHTML = '';
		document.getElementById("forDeleteCustomers").innerHTML = '';
		document.getElementById("ulListExerciseType").innerHTML = '';
	});
});
/*
Функция очистки данных на странице данных клиента. Вызывается со страницы index-3 (списко клиентв) по кнопке Add
*/
function emptyDataCustomer() {
  $('#inputNewCustomer').val('');
  $('#inputNewCustomer').attr('data-item', '');
  $('#newCustomerComments').val('');
  // Кнопку сохранения добавления клиента покажем, а кнопку редактирования клиента скроем
  if ($('#linkAddCustomer').hasClass('hidden')) {
    $('#linkAddCustomer').removeClass('hidden');
  }
  if (!$('#linkEditCustomer').hasClass('hidden')) {
    $('#linkEditCustomer').addClass('hidden');
  }
}
/*
Функция построения списка клиентов. В функцию передаётся массив объектов customers
*/
function updateListCustomers(customers) {
  var listCustomers = '';
  var listCustomersForDelete = '';
  customers.forEach(function (value) {
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
    listCustomersForDelete += '  <div class="item-inner">';
    listCustomersForDelete += '    <div class="item-title">';
    listCustomersForDelete += '      <a href="#view-10" class="tab-link btn-right-top" onclick="fillCustomerData(' + value.id + ')">' + value.name + '</a>';
    listCustomersForDelete += '    </div>';
    listCustomersForDelete += '    <div class="item-media">';
    listCustomersForDelete += '      <label class="label-checkbox item-content">';
    listCustomersForDelete += '        <input type="checkbox" name="inputCustomerForDelete" value="' + value.id + '">';
    listCustomersForDelete += '        <div class="item-media">';
    listCustomersForDelete += '          <i class="icon icon-form-checkbox"></i>';
    listCustomersForDelete += '        </div>';
    listCustomersForDelete += '      </label>';
    listCustomersForDelete += '    </div>';
    listCustomersForDelete += '  </div>';
    listCustomersForDelete += '</li>';
  });
  document.getElementById("ulListCustomers").innerHTML = listCustomers;
  document.getElementById("forDeleteCustomers").innerHTML = listCustomersForDelete;
  document.getElementById("badgeCountCustomers").innerHTML = customers.length;
}
/*
Функция добавления клиента. Вызывается из страницы #view-10 по кнопке Save
*/
function addCustomer() {
  var newCustomer = $('input#inputNewCustomer').val();
  var dateStartClasses = $('input#inputDateStartClasses').val();
  var timeVal = new Date().toISOString();//.substring(0, 10);
  var photo = 'somepic' + timeVal + '.jpg'; // TODO фото надо куда-то сохранять, а тут указывать путь к файлу
  var newCustomerComments = $('textarea#newCustomerComments').val();
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
          title: 'Add new Customer',
          hold: messageDelay,
          message: 'Data was saved'
        });
        // Запросом получили массив объектов customers
        updateListCustomers(results);
      });
    //$$('a[href="#view-3"]').click();
  }
}
/*
Функция сохранения изменений в данных клиента. Вызывается по кнопке Save из формы редактирования данных клиента
*/
function editCustomer() {
  var customerId = parseInt($('#inputNewCustomer').attr('data-item'));
  var newNameCustomer = $('#inputNewCustomer').val();
  var newCommentsCustomer = $('#newCustomerComments').val();
  console.log('Сейчас будем обновлять данные по клиенту с id = ' + customerId);
  server.customers.get(customerId).then(function (customer) {
    if ((newNameCustomer == customer.name) && (newCommentsCustomer == customer.comments)) {
      myApp.addNotification({
        title: 'Nothing to save',
        hold: messageDelay,
        message: 'New data already exist in database.'
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
          title: 'Successful updated',
          hold: messageDelay,
          message: 'Data was updated.'
        });    
      });
    }
  });
}
/*
Функция удаления клиентов из БД. Вызывается из страницы #view-13 по кнопке Delete
*/
function removeCustomers() {
  // Модальное окно для подтверждения удаления клиентов
  //$$('.confirm-delete-customers').on('click', function () {
  myApp.confirm('Are you sure?', function () {
    // Найдём все value всех отмеченных чекбоксов в ul#forDeleteCustomers. Эти значения есть id клиентов для удаления из базы
    // Начинаем цикл по всем отмеченным для удаления клиентам
    $('input[name="inputCustomerForDelete"]:checked').each(function() {
      console.log('Проверяем пользователя с id = ' + this.value);
	    server.customers.query('name')
	      .filter('id', parseInt(this.value))
        .execute()
        .then(function(results) {
          console.log('Нашли удаляемого клиента в базе: ' + JSON.stringify(results));
          // Проверяем, можно ли удалять этого клиента из базы
          // TODO Если по клиенту есть записи в истории занятий, то спрашиваем, точно ли всё по нему удалить
          // Искать нужно в трёх таблицах сразу: workout (хотя это можно, пожалуй, пропустить), schedule и workExercise
          server.workExercise.query()
          	.filter('customer', results[0].name)
            .execute()
            .then(function(resWorkEx) {
              if(resWorkEx.length) { // Если что-то нашлось, то спрашиваем удалять ли всё
              
              } else { // Ничего не нашли тут, проверяем в следующей таблице
                server.schedule.query()
                	.filter('customer', results[0].name)
                  .execute()
                  .then(function(resSchedule) {
                    if(resSchedule.length) { // Если что-то нашлось, то спрашиваем удалять ли всё
                    
                    } else { // Ничего не нашли тут, проверяем в следующей таблице
                      server.workout.query()
                      	.filter('customer', results[0].name)
                        .execute()
                        .then(function(resWorkout) {
                          if(resWorkout.length) { // Если что-то нашлось, то спрашиваем удалять ли всё
                          
                          } else { // Ничего не нашли тут, то искать уже нигде больше не надо, - можно смело удалять пользователя 
                            server.remove('customers', parseInt(results[0].id)).then(function(res3){
                              console.log('Удалили пользователя с id = ' + results[0].id);
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
      myApp.alert('You clicked Cancel button');
    }
  );
  //});
  /*var newCustomer = $('input#inputNewCustomer').val();
  var dateStartClasses = $('input#inputDateStartClasses').val();
  var timeVal = new Date().toISOString();//.substring(0, 10);
  var photo = 'somepic' + timeVal + '.jpg';
  var newCustomerComments = $('textarea#newCustomerComments').val();
  //console.log('Добавляем клиента ' + newCustomer + ' фотография ' + photo + ' комментарий: ' + newCustomerComments);
  if(newCustomer != '') {
  	//console.log('Добавляем клиента ' + newCustomer + ' фотография ' + photo + ' комментарий: ' + newCustomerComments);
    server.customers.add({'name': newCustomer, 'photo': photo, 'comments': newCustomerComments});
    // Обновляем список клиентов на соответствующей странице
    server.customers.query('name')
      .all()            
      .distinct()
      .execute()
      .then(function(results) {
      	myApp.addNotification({
          title: 'Add new Customer',
          message: 'Data was saved'
        });
        // Запросом получили массив объектов customers
        updateListCustomers(results);
      });
    //$$('a[href="#view-3"]').click();
  }*/
}
/*
Функция заполнения данными страницы клиента (#index-3). В функцию передаётся id клиента. Вызывается из списка клиентов при выборе клиента
*/
function fillCustomerData(customerId) {
  console.log('Заполняем данные по клиенту с id = ' + customerId);
  server.customers.get(parseInt(customerId)).then(function(customer) {
    $('input#inputNewCustomer').val(customer.name);
    $$('#inputNewCustomer').attr('data-item', customerId);
    $('textarea#newCustomerComments').val(customer.comments);
  });
  // Кнопки добавления и редактирования клиента скроем
  if (!$('#linkAddCustomer').hasClass('hidden')) {
    $('#linkAddCustomer').addClass('hidden');
  }
  if (!$('#linkEditCustomer').hasClass('hidden')) {
    $('#linkEditCustomer').addClass('hidden');
  }
}/*
Функция выполняется, когда начали изменять данные клиента. Функция делает видимой нужную кнопку для сохранения новых данных клиента 
*/
function showEditLinkCustomer() {
  if($('#linkEditCustomer').hasClass('hidden')) {
    $('#linkEditCustomer').removeClass('hidden');
  }
}
/*
Функция построения списка групп упражнений. В функцию передаётся массив объектов exerciseType
*/
function updateListExerciseType(exerciseType) {
  var listExerciseType = '';
  exerciseType.forEach(function (value) {
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
  });
  document.getElementById("ulListExerciseType").innerHTML = listExerciseType;
}

/*
Функция выполняется, когда начали изменять название группы упражнений. Функция делает видимой нужную кнопку для сохранения нового имени группы упражнений 
*/
function showRenameLinkExType(exType) {
  if($("#ex-compl-rename-" + exType).hasClass('hidden')) {
    $("#ex-compl-rename-" + exType).removeClass('hidden');
  }
}
/*
Функция переименования названия группы упражнений. В функцию передаётся id одной выбранной группы упражнений
*/
function renameExType(idExType) {
	newName = document.getElementById("ex-compl-name-" + idExType).value;
	//console.log('newName = ' + newName);
	server.exerciseType.update({
	  'id': parseInt(idExType),
	  'name': newName
	}).then(function(res) { 	
    console.log('Переименованная группа упражнений в базе: ' + JSON.stringify(res));
    if(!$("#ex-compl-rename-" + idExType).hasClass('hidden')) {
      $("#ex-compl-rename-" + idExType).addClass('hidden');
    } 
    myApp.addNotification({
        title: 'Successful rename',
        hold: messageDelay,
        message: 'Gpoup of exercises was renamed.'
    });
  });
}
/*
Функция построения списка упражнений определённой группы.
В функцию передаётся id одной выбранной группы упражнений
*/
function updateListExercises(exerciseTypeId) {
  server.exerciseType.get(exerciseTypeId).then(function (rowExerciseType) {
    $('div.ex-of-type').text(rowExerciseType.name); // Показываем, в какой группе мы сейчас находимся
    $('div.ex-of-type').attr('data-item', exerciseTypeId); // Устанавливаем значение id текущей группы упражнений
  });
  var listExercise = '';
  // Запросом отбираем все упражнения данной группы (exerciseType)
  server.exercise.query('name')
  	.filter('type', parseInt(exerciseTypeId))
    //.distinct()
    .execute()
    .then(function(results) {
      console.log('Найденные упражнения по выбранному id ' + exerciseTypeId + ' группы упражнений: results = ' + JSON.stringify(results));
      //for (var rowExercise in results) {
      results.forEach(function (rowExercise) {
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
      });
      document.getElementById("ulListExercises").innerHTML = listExercise;
      //console.log('exerciseType results = ' + JSON.stringify(results));
      //updateListExerciseType(results);
    });
}
/*
Функция выполняется, когда начали изменять название упражнения. Функция делает видимой нужную кнопку для сохранения нового имени группы упражнений 
*/
function showRenameLinkExercise(exercise) {
  if($("#ex-rename-" + exercise).hasClass('hidden')) {
    $("#ex-rename-" + exercise).removeClass('hidden');
  }
}
/*
Функция переименования названия упражнения. В функцию передаётся id одного выбранного упражнения
*/
function renameExercise(idExercise) {
	newExName = document.getElementById("ex-name-" + idExercise).value;
	console.log('newExName = ' + newExName);
	// Cначала найдём текущие данные по упражнению
	server.exercise.get(idExercise).then(function (exercise) {
    server.exercise.update({
  	  'id': parseInt(idExercise),
  	  'name': newExName,
  	  'type': exercise.type
  	}).then(function(res) { 	
      console.log('Переименованная группа упражнений в базе: ' + JSON.stringify(res));
      if(!$("#ex-rename-" + idExercise).hasClass('hidden')) {
        $("#ex-rename-" + idExercise).addClass('hidden'); 
        myApp.addNotification({
          title: 'Successful rename',
          hold: messageDelay,
          message: 'Exercise was renamed.'
        });
      }
    });
	});
}
/*
Функция добавления упражнения и его характеристик. Вызывается из страницы #view-7a (список упражнений определённой группы) по кнопке Save
*/
function addExercise() {
  var newExercise = $('input#inputNewExercise').val();
  //var typeExercise = $('div#view-7a div.ex-of-type').text();
  var idTypeExercise = parseInt($('div#view-7a div.ex-of-type').attr('data-item'));
  console.log('Вычислили группу упражнений - это ' + idTypeExercise);
  if(newExercise != '') {
    // Сначала надо проверить, нет ли уже такого названия упражнения в базе
    server.exercise.query('name')
      .filter('name', newExercise)
      .execute()
      .then(function (resultExist) {
        if(resultExist.length) { // В базе есть запись с таким упражнением.
          myApp.addNotification({
            title: 'Can not be added',
            hold: messageDelay,
            message: 'That name of exercise already exist in database.'
          });
        } else { // Такого упражнения ещё нет. Можно добавлять
          server.exercise.add({
            'name': newExercise,
            'type': idTypeExercise
          }).then(function(rowNewExercise) {
            console.log('Добавили новое упражнение: ' + JSON.stringify(rowNewExercise));
            // Повторяем запись в базу по каждому отмеченному свойству упражнения
            $('input[name="checkbox-new-ex-prop"]:checked').each(function() {
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
	/*server.exercise.query('name')
  	.filter('type', exerciseType)
    .distinct()
    .execute()
    .then(function(res){
    	if(res.length) {
    		// В базе есть записи с этим упражнением. Удалять нельзя
    		myApp.addNotification({
		        title: 'Delete',
		        message: 'This item can not be delete while there are exercises in it.'
		    });
    	} else {*/
    		// В базе нет записей по этому упражнению, поэтому смело удаляем его
    		// Сначала найдём все id записей с опциями по этому упражнению
    		console.log('exercise для удаления: ' + exerciseId);
    		server.optionsExercises.query()
    		  .filter('exerciseId', exerciseId)
    		  .execute()
    		  .then(function (optEx) {
            optEx.forEach(function (rowOptEx) {
              server.remove('optionsExercises', parseInt(rowOptEx.id));
            });
            // После того, как все опции данного упражнения удалили, можно удалять и само упражнение
            server.remove('exercise', parseInt(exerciseId)).then(function () {
              // Упражнение удалил, теперь обновим список упражнений в данной группе
    		      var typeExercise = parseInt($('div#view-7a div.ex-of-type').attr('data-item'));
    		      updateListExercises(typeExercise);
            });
    		  });
    	//}
    //});
}
/*
Функция обновления списка опций конкретного упражнения. В функцию передаётся id выбранного упражнения
*/
function updateViewExProp(exerciseId) {
  console.log('Формируем список характеристик данного упражнения');
  // Сначала снимаем все галочки параметров
  $('div#view-8 input[name="checkbox-ex-prop"]').removeAttr('checked');
  // Найдём и покажем название текущего упражнения
  server.exercise.get(exerciseId).then(function (exercise) {
    $('div#ex-prop').text(exercise.name).attr('data-item', exerciseId); // Обновим на странице название и id текущего упражнения  
  });
  server.optionsExercises.query()
    .filter('exerciseId', exerciseId)
    .execute()
    .then(function (exerciseOptions) {
      // Теперь ставим только те галочки, которые нужны по данным БД
      console.log('Список найденных характеристик по упражнению: ' + JSON.stringify(exerciseOptions));
      exerciseOptions.forEach(function (rowExOpt) {
      	console.log('rowExOpt.option = ' + rowExOpt.option);
      	//$$('input[name="checkbox-ex-prop"][value="' + rowExOpt.option + '"]').click();
      	$$('input[name="checkbox-ex-prop"][value="' + rowExOpt.option + '"]').prop('checked', true);
      });
    });
}
/*
Функция обновления состава действующих параметров выбранного упражнения. Вызывается со страницы view-8 по кнопке Save 
*/
function updateExerciseProperties() {
  // Определяем редактируемое упражнение
  var exerciseId = parseInt($('div#ex-prop').attr('data-item'));
  console.log('Идёт обновление параметров упражнения с id = ' + exerciseId);
  // Нужно понять, что изменили. Тут возможны варианты: добавили опции, убрали опции, одновременно что-то добавили и что-то убрали, вообще ничего не поменяли
  // Для начала соберём в массив всё, что сейчас отмечено
  var arrNewOpt = [];
  var arrOldOpt = [];
  var deletedOpt = []; // Массив удалённых параметров
  var addedOpt = []; // Масси добавленных параметров
  $('input[name="checkbox-ex-prop"]:checked').each(function(indexOpt, valueOpt) {
    arrNewOpt[indexOpt] = valueOpt.value;
    console.log('Занесли в массив значение выбранной опции: ' + valueOpt.value);
  });
  // Сначала отберём все записи с активными параметрами по данному упражнению из базы
  server.optionsExercises.query()
  	.filter('exerciseId', exerciseId)
    .execute()
    .then(function(results) {
      console.log('Список характеристик: ' + JSON.stringify(results));
      results.forEach(function (rowOldOpt, indexOldOpt) {
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
                  title: 'Error while deleting',
                  hold: messageDelay,
                  message: 'Option ' + rowOldOpt.option + ' already used in database. It can not be deleted!'
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
          title: 'Nothing to save',
          hold: messageDelay,
          message: 'New set of options are equal to existent.'
        });
      }
    });
}
/*
Функция добавления названия группы упражнений
*/
function addExType() {
	var newExType = $('input#inputNewExType').val();
	server.exerciseType.add({'name': newExType});
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
}
/*
Функция удаления названия группы упражнений. В функцию передаётся id одной выбранной группы упражнений
*/
function deleteExType(idExType) {
	// Сначала проверим, есть ли по данной группе упражнений упражнения в базе
	server.exercise.query('name')
  	.filter('type', idExType)
    //.all()
    //.distinct()
    //.keys()
    .execute()
    .then(function(res){
    	if(res.length) {
    		// В базе есть упражнения из этой группы. Удалять нельзя
    		myApp.addNotification({
		      title: 'Delete',
          hold: messageDelay,
		      message: 'This item can not be delete while there are exercises in it.'
		    });
    	} else {
    		// В базе нет упражнений из этой группы, поэтому смело удаляем эту группу упражнений
    		server.remove('exerciseType', parseInt(idExType)).then(function(res1) {
    			server.exerciseType.query('name')
				    .all()
				    .distinct()
				    //.keys()
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
$(document).on('change', '.btn-delete-toggle', function() {
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
  // Кнопку Save надо заменить на Change
  $('a[href="#tab0"]').replaceWith('<a href="#tab3" class="tab-link" onclick="makeSetExCustomer()">Change</a>');
  // Кнопку Clear all надо заменить на Cancel 
  $('a#aClearAll').replaceWith('<a href="#view-10" class="back tab-link" id="aCancelSetEx">Cancel</a>');
  var isWorkout = 0; // Установим флаг наличия расписания на сегодня
  var customerName = $('input#inputNewCustomer').val();
  var customerId = parseInt($$('#inputNewCustomer').attr('data-item'));
  $('span#spanCustName').html(customerName).attr('data-item', customerId);
  var today = new Date().toDateInputValue();
  $('span#spanDateEx').html(today);
  console.log('Клиент ' + customerName + ', дата ' + today);
  // Формируем календарь занятий данного клиента
  //$("#calendar").datepicker({ autoSize: true });
  // Сформируем список упражнений, если он уже был сформирован на сегодня ранее
  server.workout.query('customer')
  	.filter('date', today)
    .execute()
    .then(function(result) {
      var listExCust = '';
      if(result.length) { // Если нашли сегодня сформированный комплекс упражнений, то проверим, есть ли тут нужный клиент и (если есть) сразу же покажем его
        console.log('Нашли в базе данные по занятиям на сегодня: ' + JSON.stringify(result));
        result.forEach(function(item) {
          console.log('Обрабатываем первое занятие на сегодня. item = ' + JSON.stringify(item));
      	  if(item.customer == customerId) {
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
              if(!$('#noWorkout').hasClass('hidden')) {
                $('#noWorkout').addClass('hidden');    
              }
              document.getElementById("ulListCurrentExercises").innerHTML = listExCust;
              SORTER.sort('#ulListCurrentExercises');
            });
            isWorkout = 1;
      	  }
        });
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
              resSchedule.forEach(function(item) {
      	        if((item.day == nameToday) || (item.day == 'everyday')) {
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
                    if(!$('#noWorkout').hasClass('hidden')) {
                      $('#noWorkout').addClass('hidden');    
                    }
                    document.getElementById("ulListCurrentExercises").innerHTML = listExCust;
                  });
                  isWorkout = 1;
      	        }
              });
           } // Конец проверки на наличие расписания по дням недели на данного клиента
      	  });
      }
      if (!isWorkout) { // Если упражнений на сегодня нет
        if($('#noWorkout').hasClass('hidden')) {
          $('#noWorkout').removeClass('hidden');    
        }
      }
    });
  // По-умолчанию первым делом показываем вкладку с уже сформированным списком упражнений на сегодня
  myApp.showTab('#tab0');
}
/* Функция проверки на наличие значения в массиве */
function in_array(value, array) 
{
    for(var i = 0; i < array.length; i++) 
    {
        if(array[i] == value) return true;
    }
    return false;
}
/*
Функция обновления данных на странице формирования набора упражнений клиента.
Вызывается со страницы #view-15 по кнопке "Change"
*/
function makeSetExCustomer() {
  // Кнопку Change надо заменить на Save
  $('a[href="#tab3"]').replaceWith('<a href="#tab0" class="tab-link" onclick="saveSetExCustomer(\'fromChange\')">Save</a>');
  // Кнопку Cancel надо заменить на Clear all
  $('a#aCancelSetEx').replaceWith('<a href="" class="tab-link" onclick="makeSetExCustomer()" id="aClearAll">Clear all</a>');
  // Очистим список готового набора
  $('ul#ulListSelectedExercises').empty();
  // Скопируем в левый список те упражнения, которые на сегодня уже отобраны (со вкладки #tab0)
  var listEx = '';
  var excludeEx = [];
  $('#ulListCurrentExercises li a div span').each(function(index, item) {
  	temp = item.innerHTML;
  	console.log('Разбор очередной позиции упражнения: ' + JSON.stringify($(this)));
  	// На всякий случай поставим заглушку от инъекций
  	exercise = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  	var exerciseId = parseInt($(this).attr('data-item')); // Находим id упражнения
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
  $('ul#ulListSelectedExercises').append(listEx);
  $('#ulListAllExWithTypes').empty();
  // Формируем полный список групп упражнений (тот, что справа)
  server.exerciseType.query('name')
    .all()
    .execute()
    .then(function(results) {
       console.log('Формируем список групп упражнений');
       console.log('Список групп упражнений: ' + JSON.stringify(results));
       // Упражнения без сортировки (библиотека db.js не поддерживает сортировку) - добавим её,
       // но сначала сформируем массив для сортировки по наименованию
       var arrExTypes = [];
       results.forEach(function (rowExerciseType, indexType) {
       	 //console.log('indexType: ' + indexType);
       	 arrExTypes[indexType] = rowExerciseType.name + '@#' + rowExerciseType.id;
       	 //console.log('arrExTypes[indexType] = ' + rowExerciseType.name);
       });
       arrExTypes.sort(); // Теперь имеем отсортированный по названиям список групп упражнений
       var arrEx = [];
       //console.log('arrExTypes = ' + arrExTypes);
       // Пройдём циклом по всем названиям групп упражнений, которые уже упорядочены по наименованию
       arrExTypes.forEach(function(exTypeNameId) {
         var arrTempNameId = exTypeNameId.split('@#');
         var exTypeId = arrTempNameId[1]; // Получили код группы упражнений
         var exTypeName = arrTempNameId[0]; // Получили наименование текущей группы упражнений
         console.log('Текущая группа упражнений: ' + exTypeName + ' с id = ' + exTypeId);
         // Добавляем на страницу наименования групп упражнений
         $('ul#ulListAllExWithTypes').append('<li class="item-divider" data-item="' + exTypeId + '">' + exTypeName + '</li>');
         var testExercise = [];
         // Формируем список упражнений из данной группы
         server.exercise.query('name')
  	       .filter('type', parseInt(exTypeId))
           .distinct()
           .execute()
           .then(function(res2) {
             res2.forEach(function (rowExercise, indexEx) {
               arrEx[indexEx] = rowExercise.name + '@#' + rowExercise.id; // Создаём массив наименований упражнений для того, чтобы отсортировать
               //console.log('arrEx[indexEx]: ' + rowExercise.name);
             });
             arrEx.sort(function (a, b) {
               return b - a;             
             }); // Теперь упражнения отсортированы по названиям в порядке убывания
             //console.log('Упорядоченный список упражнений: ' + arrEx);
             // По отсортированному массиву названий упражнений пройдём циклом
             arrEx.forEach(function(exerciseNameId, index) {
               var arrTempExNameId = exerciseNameId.split('@#');
               var exerciseId = arrTempExNameId[1]; // Получили id текущего упражнения
               var exerciseName = arrTempExNameId[0]; // Получили наименование текущего упражнения
               testExercise[index] = exerciseName;
               //console.log('testExercise[index] = ' + testExercise[index]);
               //console.log('testExercise[index - 1] = ' + testExercise[index - 1]);
               if((index == 0) || (testExercise[index] != testExercise[index - 1])) {
               	 // Если упражнение было уже отобрано ранее, то его не надо включать в полный список справа 
               	 //console.log('Вот наш список исключений: ' + excludeEx[0] + '; ' + excludeEx[1]);
               	 if(!(in_array(exerciseName, excludeEx))) {
               	   //console.log('Проверили, что этого упражнения нет в списке исключений: ' + exercise);
               	   var listExercises = '';
                   listExercises += '<li class="swipeout swipeout-all">';
                   listExercises += '  <div class="swipeout-content item-content">';
                   listExercises += '    <div class="item-inner">';
                   listExercises += '      <div class="item-title" data-item="' + exerciseId + '">' + exerciseName + '</div>';
                   listExercises += '      </div>';
                   listExercises += '    </div>';
                   listExercises += '  </div>';
                   listExercises += '  <div class="swipeout-actions-right">'; // Действие появится справа
                   //listExercises += '    <div class="swipeout-actions-inner">';
                   listExercises += '    <a href="#" class="action1">Added</a>';
                   listExercises += '  </div>';
                   listExercises += '</li>';
                   // Элемент сформирован, надо вставлять на место
                   $('ul#ulListAllExWithTypes li[data-item="' + exTypeId + '"]').after(listExercises);
                 }
               }
             });
             arrEx.length = 0; // Очищаем массив упражнений для заполнения по новой группе
           });
       });
  });
}

// Обработаем свайпы на упражнениях. Нужно такое упражнение убрать из списка справа и добавить в список слева
$(document).on('opened', '.swipeout-all', function (e) {
  //console.log('Item opened on: ' + e.detail.progress + '%');
  console.log('Item opened');
  myApp.swipeoutDelete(this);
  //console.log(this);
  console.log($(this).find('div.item-title').text());
  var exercise = $(this).find('div.item-title').text();
  var listEx = '';
  var exerciseId = $(this).find('div.item-title').attr('data-item');
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
  $('ul#ulListSelectedExercises').append(listEx);
});
// Обработаем свайпы на упражнениях, которые уже успели отобрать. Нужно такое упражнение убрать из списка слева и добавить в список справа
$(document).on('opened', '.swipeout-selected', function (e) {
  myApp.swipeoutDelete(this);
  //console.log(this);
  console.log($(this).find('div.item-title').text());
  var exercise = $(this).find('div.item-title').text();
  var listExercises = '';
  var exerciseId = parseInt($(this).find('div.item-title').attr('data-item'));
  listExercises += '<li class="swipeout swipeout-all">';
  listExercises += '  <div class="swipeout-content item-content">';
  listExercises += '    <div class="item-inner">';
  listExercises += '      <div class="item-title" data-item="' + exerciseId + '">' + exercise + '</div>';
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
    console.log('Нашли тип этого упражнения: ' + exercise.type);
    // TODO Тут вставляем запись в конец списка, хотя правильнее было бы в нужном порядке (сортировка по алфавиту)
    $('ul#ulListAllExWithTypes li[data-item="' + exercise.type + '"]').after(listExercises);
  });
  /*server.exercise.query('name')
  	.filter('name', exercise)
    .distinct()
    .execute()
    .then(function(result) {
      console.log('Нашли тип этого упражнения: ' + result[0].type);
      // TODO Тут вставляем запись в конец списка, хотя правильнее было бы в нужном порядке (сортировка по алфавиту)
      $('ul#ulListAllExWithTypes li[data-item="' + result[0].type + '"]').after(listExercises);
    });*/
});  
/*
Функция сохранения набора упражнений клиента.
Вызывается со страницы #view-15 #tab3 по кнопке "Save"
*/
function saveSetExCustomer(flagFrom) {
  // Сформируем доступные кнопки для вкладки сформированного комплекса упражнений
  var menuWorkout = '';
  menuWorkout =  '<div class="col-25">';
  menuWorkout += '  <center><a href="#view-10" class="back tab-link" id="aCancelSetEx">Cancel</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab1" class="tab-link" onclick="makeCalendExCustomer()">Calendar</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  //menuWorkout += '  <center><a href="#tab2" class="tab-link" onclick="makeScheduleExCustomer()">Schedule</a></center>';
  menuWorkout += '  <center><a href="#" class="tab-link">Schedule</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab3" class="tab-link" onclick="makeSetExCustomer()">Change</a></center>';
  menuWorkout += '</div>';
  document.getElementById("divMenuWorkout").innerHTML = menuWorkout;
  console.log('Сохраняем набор');
  var temp = '';
  var listExCust = '';
  var customerId = parseInt($('span#spanCustName').attr('data-item'));
  var dateEx = $('span#spanDateEx').text(); // TODO Тут, вероятно, надо предусмотреть сохранение в базе даты в одном каком-то формате, чтобы не было путаницы при смене региональных настроек
  // Перед сохранением нового списка упражнений, надо удалить уже существующие в базе данные
  server.workout.query('customer')
  	.filter('date', dateEx)
    .execute()
    .then(function(result) {
      console.log('Нашли в базе данные по занятиям на сегодня: ' + JSON.stringify(result));
      var listExCust = '';
      result.forEach(function(item) {
      	// Отбираем занятия только нужного клиента
      	if(item.customer == customerId) {
      	  server.remove('workout', parseInt(item.id)).then(function(res3){
            console.log('Удалили workout с id = ' + item.id);
            console.log(JSON.stringify(res3));
          });
      	}
      });
    });
  if(flagFrom == 'fromCalendar') { // Если мы в эту функцию попали из календаря
    $('#ulListPastExercises li span').each(function(index, item) {
  	  temp = item.innerHTML;
  	  // На всякий случай поставим заглушку от инъекций
  	  var exerciseName = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
      console.log('exerciseName = ' + exerciseName + '; customerId = ' + customerId + '; dateEx = ' + dateEx);
      // Определим id упражнения
      console.log('Смотрим в html в поисках id упражнения: ' + $(this).attr('data-item'));
      var exerciseId = parseInt($(this).attr('data-item'));
  	  server.workout.add({'customer': customerId, 'date': dateEx, 'exercise': exerciseId});
  	  listExCust += '<li>';
      listExCust += '  <a href="#view-24" class="tab-link item-link item-content" onclick="makeViewExWork(' + exerciseId + ')">';
      listExCust += '    <div class="item-inner">';
      listExCust += '      <span data-item="' + exerciseId + '">' + exerciseName + '</span>';
      listExCust += '    </div>';
      listExCust += '  </a>';
      listExCust += '</li>';
    });
  } else { // Если в эту функцию мы попали из сохранения нового набора упражнений
    $('div.set-of-exercises').each(function(index, item) {
  	  temp = item.innerHTML;
  	  // На всякий случай поставим заглушку от инъекций
  	  exerciseName = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
      console.log('exerciseName = ' + exerciseName + '; customerId = ' + customerId + '; dateEx = ' + dateEx);
      // Определим id упражнения
      console.log('Смотрим в html в поисках id упражнения: ' + $(this).attr('data-item'));
      var exerciseId = parseInt($(this).attr('data-item'));
  	  server.workout.add({'customer': customerId, 'date': dateEx, 'exercise': exerciseId});
  	  listExCust += '<li>';
      listExCust += '  <a href="#view-24" class="tab-link item-link item-content" onclick="makeViewExWork(' + exerciseId + ')">';
      listExCust += '    <div class="item-inner">';
      listExCust += '      <span data-item="' + exerciseId + '">' + exerciseName + '</span>';
      listExCust += '    </div>';
      listExCust += '  </a>';
      listExCust += '</li>';
    });
  }
  if(!$('#noWorkout').hasClass('hidden')) {
    $('#noWorkout').addClass('hidden');    
  }
  // После того, как в цикле сформировали список упражнений, покажем его на странице
  document.getElementById("ulListCurrentExercises").innerHTML = listExCust;
  SORTER.sort('#ulListCurrentExercises');
}
/*
Функция подготовки отображения страницы работы с упражнением клиента.
Вызывается со страницы #view-15 #tab0 по нажатию на какое-то упражнение (его id передаётся в параметре)
*/
function makeViewExWork(exerciseId) {
  console.log('Подготавливаем к работе страницу упражнения с id = ' + exerciseId);
  var customerId = parseInt($('#spanCustName').attr('data-item'));
  var customerName = $('#spanCustName').html();
  document.getElementById("spanWorkCustName").innerHTML = customerName;
  var today = new Date().toDateInputValue();
  document.getElementById("spanWorkDateEx").innerHTML = today;
  // На форму покажен название упражнения, с которым сейчас работаем
  server.exercise.get(exerciseId).then(function (rowExercise) {
    document.getElementById("spanExWork").innerHTML = rowExercise.name;
    $('#spanExWork').attr('data-item', exerciseId);
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
  
  //var exerciseName = $('span#spanExWork').text();
  console.log('Идёт построение параметров упражнения с id = ' + exerciseId);
  // Сначала отберём все записи по данному упражнению из базы...
  server.optionsExercises.query()
  	.filter('exerciseId', exerciseId)
    .execute()
    .then(function(results) {
      console.log('Список характеристик: ' + JSON.stringify(results));
      results.forEach(function (rowExOpt) {
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
      });
      document.getElementById("ulListCurrentWorkEx").innerHTML = propEx;
    });
}
/*
Функция сохранения введённых данных по выполнению упражнения клиентом.
Вызывается со страницы #view-24 #workTab1 по нажатию на кнопку Save
*/
function saveExerciseWork() {
  var customerId = parseInt($('span#spanCustName').attr('data-item'));
  var exerciseName = $('span#spanExWork').text();
  var exerciseId = parseInt($('#spanExWork').attr('data-item'));
  var dateEx = $('span#spanDateEx').text(); // TODO Тут, вероятно, надо предусмотреть сохранение в базе даты в одном каком-то формате, чтобы не было путаницы при смене региональных настроек
  var workSet = parseInt($('select[data-item="sets"]').val()); // Узнаём номер подхода
  var noDoubles = 1; // Флаг, показывающий, что дубли не встретились
  console.log('workSet = ' + workSet);
  var flagAdd = 0; // По-умолчанию запись в базу запрещена
  // Перед тем, как записать что-либо в базу данных, нужно проверить нет ли уже там записи о текущем аналитическом разрезе
  // Для этого отберём из базы все записи по выполнению упражнений на текущий день
  server.workExercise.query()
  	.filter('date', dateEx)
    .execute()
    .then(function(result) {
      if(result.length) { // Если что-то на сегодня нашлось, то делаем дальше проверки
        // Среди сегодняшних записей найдём записи на текущего клиента и текущее упражнения, а также на данный подход
        var findNext = 1;
        result.forEach(function (itemWorkEx, indexWorkEx) {
          console.log('Мы в цикле обработки новых значений. Текущая строка значений: ' + JSON.stringify(itemWorkEx));
          if((itemWorkEx.customer == customerId) && (itemWorkEx.exercise == exerciseId) && (itemWorkEx.set == workSet) && findNext) {
            findNext = 0; // Дальше искать в записях БД не нужно; выходим из if
            noDoubles = 0; // Показываем, что дубли попались
            console.log('Прошли в обработку повторяющейся записи!');
      	    // Текущая проверяемая запись из базы данных совпала с текущим клиентом, текущим упражнением и текущим подходом
            // Если текущий аналитический разрез присутствует в базе, предложим пользователю три варианта:
            // 1. Перезаписать данные
            // 2. Добавить к записанному
            // 3. Отменить запись
            myApp.modal({
              title:  'Current set already exist in DB',
              text: 'What do you want to do with current values?',
              buttons: [{
                text: 'Rewrite',
                onClick: function() {
              	  // Выбрали вариант перезаписи.
              	  // Значит найдём все записи по данному подходу данного клиента по данному упражнению на данную дату и обновим их
                  console.log('Мы в обработчике перезаписи данных по выполнению упражнения');
                  //var arrayOldVal = [];
                  server.workExercise.query()
                  	.filter('date', dateEx)
                    .execute()
                    .then(function(result) {
                      result.forEach(function (item, index) {
                      	if((item.customer == customerId) && (item.exercise == exerciseId) && (item.set == workSet)) {
                      	  // Мы нашли данные по аналитическому разрезу!
                      	  console.log('В базе нашлось: item.option = ' + item.option + '; item.value = ' + item.value);
                      	  // Найдём текущий параметр в нашей форме
                          if(item.option == 'time') {
                            var tempMinValue = $('#ulListCurrentWorkEx input[data-item = "time-minutes"]').val();
                            if (tempMinValue == '') { // Не заполнили минуты
                              var intMinValue = 0;
                            } else {
                              var intMinValue = parseInt(tempMinValue);
                            }
                            var tempSecValue = $('#ulListCurrentWorkEx input[data-item = "time-seconds"]').val();
                            if (tempSecValue == '') {
                              var intSecValue = 0;
                            } else {
                              var intSecValue = parseInt(tempSecValue);
                            }
                      	    newValOpt = intSecValue + (intMinValue * 60); // Всё переводим в секунды
                          } else { // Параметр - не время, т.е. можно сразу заносить в базу новое суммарное значение
                      	    var tempValue = $('#ulListCurrentWorkEx input[data-item = "' + item.option + '"]').val();
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
      	                  });
                      	}
                      });
                      
                    });          
                } // Конец функции перезаписи значений БД
              },
              {
                text: 'Add',
                onClick: function() {
              	  // Выбрали вариант добавления текущих показателей к тем, что уже есть в базе по данному разрезу.
              	  // Значит найдём все записи по данному подходу данного клиента по данному упражнению и прибавим текущие значения
                  server.workExercise.query()
                  	.filter('date', dateEx)
                    .execute()
                    .then(function(result) {
                      result.forEach(function (item, index) {
                      	if((item.customer == customerId) && (item.exercise == exerciseId) && (item.set == workSet)) {
                      	  // Мы нашли в БД данные по текущему аналитическому разрезу!
                      	  // Найдём текущий параметр в нашей форме
                          if(item.option == 'time') {
                            var tempMinValue = $('#ulListCurrentWorkEx input[data-item = "time-minutes"]').val();
                            if (tempMinValue == '') { // Не заполнили минуты
                              var intMinValue = 0;
                            } else {
                              var intMinValue = parseInt(tempMinValue);
                            }
                            var tempSecValue = $('#ulListCurrentWorkEx input[data-item = "time-seconds"]').val();
                            if (tempSecValue == '') {
                              var intSecValue = 0;
                            } else {
                              var intSecValue = parseInt(tempSecValue);
                            }
                      	    newValOpt = intSecValue + (intMinValue * 60); // Всё переводим в секунды
                          } else { // Параметр - не время, т.е. можно сразу заносить в базу новое суммарное значение
                      	    var tempValue = $('#ulListCurrentWorkEx input[data-item = "' + item.option + '"]').val();
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
      	                  });
                      	}
                      });
                    });
                } // Конец функции добавления значений к сохранённым в БД
              },
              {
                text: 'Cancel',
                bold: true,
                onClick: function() {
                } // Конец функции отмены сохранения
              }]
            }); // Конец обработки модального окна
          } else { // Конец проверки наличия аналитического разреза
            // Если текущего аналитического разреза не нашлось, делаем поднятие флага, что нужно добавить запись в БД.
            flagAdd = 1;
            console.log('Установили флаг, что искать дубли больше не нужно');
          }
        }); // Конец цикла по записям текущего дня
        // Если прошлись по всем записям в БД и не нашли совпадений, то надо просто добавить текущие значения в БД
        if(flagAdd && noDoubles) {
        	console.log('Сегодня записи были, но по текущему подходу ничего не нашлось');
      	  // Ни разу в цикле не нашлась запись из базы данных. Т.е. надо добавить запись в БД
      	  // Считываем все значения
      	  var option = '';
  	      var time = 0; // Время будем записывать в секундах
	        var isTime = 0;
          $('#ulListCurrentWorkEx li input').each(function(index, item) {
  	        console.log('item.value ' + item.value + 'item.attributes[data-item].value ' + item.attributes['data-item'].value);
  	        option = item.attributes['data-item'].value;
	          // Значение параметра заполнено
	          if(option == 'time-minutes') {
	            isTime = 1;
	  	        // Запоминаем минуты, переведённые в секунды
	  	        var tempMinValue = $(this).val();
	  	        if (tempMinValue == '') {
	  	          var intMinValue = 0;
	  	        } else {
	  	          var intMinValue = parseInt(tempMinValue);
	  	        }
	  	        time = time + (intMinValue * 60); 
	          }
	          else if(option == 'time-seconds') {
	            isTime = 1;
	  	        // Запоминем секунды
	  	        var tempSecValue = $(this).val();
	  	        if (tempSecValue == '') {
	  	          var intSecValue = 0;
	  	        } else {
	  	          var intSecValue = parseInt(tempSecValue);
	  	        }
	  	        time = time + intSecValue;
	          } else {
	            var tempValue = $(this).val();
	            if(tempValue == '') {
	              var intValue = 0;
	            } else {
	              var intValue = parseInt(tempValue);
	            }
	  	        // Любой параметр, кроме времени
	            server.workExercise.add({
	  	          'customer': customerId,
	  	          'date': dateEx,
	  	          'exercise': exerciseId,
	  	          'option': option,
	  	          'value': intValue,
	  	          'set': workSet
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
	          });
	        }
        } // Конец обработки необходимости записи в БД
      } else { // На текущий день в базе нет никаких записей, значит сразу добавляем в базу параметры
      	// Считываем все значения
      	console.log('На текущий день записей нет. Добавляем смело новые записи');
	      var time = 0; // Время будем записывать в секундах
	      var option = '';
	      var isTime = 0;
	      $('#ulListCurrentWorkEx li input').each(function(index, item) {
	        console.log('item.value ' + item.value + '; item.attributes[data-item].value ' + item.attributes['data-item'].value);
	        option = item.attributes['data-item'].value;
          // Значение параметра заполнено
          if(option == 'time-minutes') {
            isTime = 1; // Устанавливаем флаг, что есть параметр время
  	        // Запоминаем минуты, переведённые в секунды
  	        var tempMinValue = $(this).val();
  	        if (tempMinValue == '') {
  	          var intMinValue = 0;
  	        } else {
  	          var intMinValue = parseInt(tempMinValue);
  	        }
  	        time = time + (intMinValue * 60); 
          }
          else if(option == 'time-seconds') {
            isTime = 1; // Устанавливаем флаг, что есть параметр время
  	        // Запоминем секунды
  	        var tempSecValue = $(this).val();
  	        if (tempSecValue == '') {
  	          var intSecValue = 0;
  	        } else {
  	          var intSecValue = parseInt(tempSecValue);
  	        }
  	        time = time + intSecValue;
          } else {
  	        // Любой параметр, кроме времени
  	        var tempValue = $(this).val();
  	        if (tempValue == '') {
  	          var intValue = 0;
  	        } else {
  	          var intValue = parseInt($(this).val());
  	        }
            server.workExercise.add({
  	          'customer': customerId,
  	          'date': dateEx,
  	          'exercise': exerciseId,
  	          'option': option,
  	          'value': intValue,
  	          'set': workSet
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
          });
        }
      }
    });
}
// Приводим даты в "русский вид" ("15.04.2013"))
function makeCalDate(date) {
    var d = date.getDate().toString();
    var m = 1 + date.getMonth();
    var y = date.getFullYear().toString();
    if(d.length < 2)
    {
        d = "0" + d;    
    }
    m = m.toString();
    if(m.length < 2)
    {
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
  menuWorkout += '  <center><a href="#tab0" class="tab-link" onclick="viewExSetCustomer()">Cancel</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab1" class="tab-link active">Calendar</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab2" class="tab-link" onclick="makeScheduleExCustomer()">Schedule</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab0" class="tab-link" onclick="saveSetExCustomer(\'fromCalendar\')">Save</a></center>';
  menuWorkout += '</div>';
  document.getElementById("divMenuWorkout").innerHTML = menuWorkout;
  console.log("Начинаем подгружать календарь");
  // Получим из базы данные, когда были занятия у данного клиента
  var customerId = parseInt($('span#spanCustName').attr('data-item'));
  server.workout.query()
  	.filter('customer', customerId)
    .execute()
    .then(function(result) {
      //console.log('Нашли данные по занятиям: ' + JSON.stringify(result));
      var datesWork = [];
      var dateWork = '';
      var i = 0;
      var arrWorkEx = [];
      var dateEx = $('span#spanDateEx').text(); // TODO Тут, вероятно, надо предусмотреть сохранение в базе даты в одном каком-то формате, чтобы не было путаницы при смене региональных настроек
      result.forEach(function (item, index) {
        // Сформируем массив дат, когда были составлены списки упражнений для занятия текущего клиента
        dateWork = item.date;
        if (index == 0) {
          datesWork[0] = dateWork;
          //console.log('Первый раз. Новая дата: ' + dateWork);
          i = 1;
        } else { // Обрабатываем уже не первую запись
          // Если дата из новой записи ещё не встречалась, то запишем её в наш массив дат
          if(!(in_array(dateWork, datesWork))) {
            datesWork[i] = dateWork;
            i = 1; // Начинаем отсчёт упражнения по новой дате
            //console.log('Новая дата: ' + dateWork);
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
      }); // Вышли из цикла после обработки всех строк
      // Если на текущую дату уже есть какой-то набор упражнений, его надо тут показать
      if (result.length && (in_array(dateEx, datesWork))) { // Если на сегодня что-то есть по данному клиенту 
        console.log('Обрабатываем текущую дату (она нашлась в базе даных)!');
        console.log('arrWorkEx[dateEx] = ' + arrWorkEx[dateEx]);
        var workExercises = arrWorkEx[dateEx].split('@#');
        var listExCust = '';
        workExercises.forEach(function(exerciseToday) {
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
            SORTER.sort('#ulListPastExercises');
          });
        });
      };
      //console.log('Цикл закончился, форматируем даты');

      var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August' , 'September' , 'October', 'November', 'December'];
      document.getElementById("calendar-inline-container").innerHTML = '';
      console.log(datesWork[0]);
      var calendarInline = myApp.calendar({
          container: '#calendar-inline-container',
          //value: [new Date()],
          value: datesWork,
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
          onMonthYearChangeStart: function (p) {
              $$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
          },
          onDayClick: function (p, dayContainer, year, month, day) {
            //console.log('Нажали на дату ' + year + '-' + (parseInt(month)+1) + '-' + day);
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
                workExercises.forEach(function(exerciseId) {
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
                    SORTER.sort('#ulListPastExercises');
                    console.log('Обновили комплекс упражнений!');
                  });
                });
              }
          }
      });
    });
}
/*
Функция сортировки списков <li>
*/
var SORTER = {};
SORTER.sort = function(which, dir) {
  SORTER.dir = (dir == "desc") ? -1 : 1;
  $(which).each(function() {
    // Find the list items and sort them
    var sorted = $(this).find("> li").sort(function(a, b) {
      return $(a).text().toLowerCase() > $(b).text().toLowerCase() ? SORTER.dir : -SORTER.dir;
    });
    $(this).append(sorted);
  });
};

/*
Функция подготовки отображения расписания клиента по дням недели.
Вызывается со страницы #view-15 #tab2 (при клике на вкладку Schedule)
*/
function makeScheduleExCustomer() {
  // Сформируем доступные кнопки для вкладки расписания по дням недели
  var menuWorkout = '';
  menuWorkout =  '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab0" class="back tab-link" onclick="viewExSetCustomer()">Cancel</a>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab1" class="tab-link" onclick="makeCalendExCustomer()">Calendar</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab2" class="tab-link active">Schedule</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab0" class="tab-link" onclick="makeScheduleCustomer()">Save</a></center>';
  menuWorkout += '</div>';
  document.getElementById("divMenuWorkout").innerHTML = menuWorkout;
  // Найдём сформированный на сегодня набор упражнений, чтобы тут же его показать
  var customerId = parseInt($('span#spanCustName').attr('data-item'));
  var dateEx = $('span#spanDateEx').text(); // TODO Тут, вероятно, надо предусмотреть сохранение в базе даты в одном каком-то формате, чтобы не было путаницы при смене региональных настроек
  server.workout.query()
  	.filter('date', dateEx)
    .execute()
    .then(function(result) {
      //console.log('Нашли данные по занятиям на текущий день: ' + JSON.stringify(result));
      var listExCust = '';
      result.forEach(function (item, index) {
        // Найдём заняти только нужного клиента и сформируем из них спискок
        if (item.customer == customerId) {
          // Т.к. в базе хранятся id упражнения, то надо сначала найти их названия
          server.exercise.get(item.exercise).then(function (rowExercise) {
            listExCust += '<li>';
            listExCust += '  <div class="item-link item-content">';
            listExCust += '    <div class="item-inner">';
            listExCust += '      <span data-item="' + rowExercise.id + '">' + rowExercise.name + '</span>';
            listExCust += '    </div>';
            listExCust += '  </div>';
            listExCust += '</li>';
            // Надо слева показать список упражнений выделенного дня 
            document.getElementById("ulListScheduleEx").innerHTML = listExCust;
          });
        }
      }); // Конец цикла по упражнениям текущей даты
    }); // Конец обработки запроса
}
/*
Функция сохранения расписания по сформированному набору упражнений клиента.
Вызывается со страницы #view-15 #tab2 (при Save в Schedule)
*/
function makeScheduleCustomer() {
  // Сформируем доступные кнопки для вкладки текущего комплекса упражнений
  var menuWorkout = '';
  menuWorkout =  '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab0" class="back tab-link" onclick="viewExSetCustomer()">Cancel</a>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab1" class="tab-link" onclick="makeCalendExCustomer()">Calendar</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  //menuWorkout += '  <center><a href="#tab2" class="tab-link" onclick="makeScheduleExCustomer()">Schedule</a></center>';
  menuWorkout += '  <center><a href="#" class="tab-link">Schedule</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab3" class="tab-link" onclick="makeSetExCustomer()">Change</a></center>';
  menuWorkout += '</div>';
  document.getElementById("divMenuWorkout").innerHTML = menuWorkout;
  console.log('Сохраняем расписание');
  var customerId = parseInt($('span#spanCustName').attr('data-item'));
  var day;
  // Сформируем текущий рабочий список дней (всё, что отметили галочками)
  var tempDays = $('input:checkbox[name=day-checkbox]:checked').map(function(index, element) {
    return $(element).attr("value");
  });
  var arrNewDays = tempDays.get();
  //console.log('arrNewDays[1] = ' + arrNewDays[1]);
  // Найдём в базе все записи по расписаниям занятий на данного клиента
  server.schedule.query()
  	.filter('customer', customerId)
    .execute()
    .then(function(results) {
      // Удалим всё, что уже ранее было сохранено в качестве расписания клиента по выбранным сейчас дням
      // Остальные дни не трогаем. Таким образом можно сформировать разные группы упражнений для разных дней.
      results.forEach(function (rowSchedule) {
      	if(in_array(rowSchedule.day, arrNewDays)) {
      	  server.remove('schedule', parseInt(rowSchedule.id));
      	}
      });
    });
  // После того, как удалили старые записи, внесём в базу новые записи
  // Для этого в цикле по дням (из сформированного ранее массива) занесём все упражнения
  arrNewDays.forEach(function(element, indexDay) {
    $('#ulListScheduleEx span').each(function(index, item) {
      temp = item.innerHTML;
      // На всякий случай поставим заглушку от инъекций
  	  //scheduleExercise = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  	  var exerciseId = parseInt($(this).attr('data-item'));
  	  console.log('Получили id текущего упражнения: ' + exerciseId);
  	  server.schedule.add({
  	    'customer': customerId,
  	    'day': arrNewDays[indexDay],
  	    'exercise': exerciseId
  	  });
  	  console.log('Были добавлены такие данные: customer = ' + customerId + '; day = ' + arrNewDays[indexDay] + '; exerciseId = ' + exerciseId);
    });
  });
}
/*
Функция отображения сформированного набора упражнений клиента на сегодня.
Вызывается со страницы #view-15 #tab1 (при Cancel в Календаре)
*/
function viewExSetCustomer() {
  // Сформируем доступные кнопки для вкладки со сформированным набором упражнений клиента на сегодня
  var menuWorkout = '';
  menuWorkout =  '<div class="col-25">';
  menuWorkout += '  <center><a href="#view-10" class="back tab-link" id="aCancelSetEx">Cancel</a>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab1" class="tab-link" onclick="makeCalendExCustomer()">Calendar</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab2" class="tab-link" onclick="makeScheduleExCustomer()">Schedule</a></center>';
  menuWorkout += '</div>';
  menuWorkout += '<div class="col-25">';
  menuWorkout += '  <center><a href="#tab3" class="tab-link" onclick="makeSetExCustomer()">Change</a></center>';
  menuWorkout += '</div>';
  document.getElementById("divMenuWorkout").innerHTML = menuWorkout;
}
/* Функция выполняется когда изменяется значение какого-либо флага дня из расписания (на странице #view-15 #tab2 - Schedule)
 Управляет автоматическим переключением флагов согласно логике.
*/
$('#ulListDays li').click(function() {
  console.log('$(this).find("input").val() = ' + $(this).find('input').val());
  var checkBox = $(this).find('input').val();
  var isChecked = $('#ulListDays input[value="' + checkBox + '"]').is(':checked'); // Проверяем, установлен ли флаг
  if (isChecked) {
    if(checkBox == 'today') {
      // Установлен флаг "только на сегодня", значит, надо снять отметки со всех остальных флагов
      $('li[data-item="everyday"] input').removeAttr('checked');
      $('li[data-item="week"] input').removeAttr('checked');
    } else if (checkBox == 'everyday') {
      // Установлен флаг "ежедневно", значит, надо снять отметки со всех остальных флагов
      $('li[data-item="today"] input').removeAttr('checked');
      $('li[data-item="week"] input').removeAttr('checked');
    } else {
  	  // Установлен флаг на каком-то дне недели, значит, надо снять отметки с флагов "только на сегодня" и "ежедневно"
      $('li[data-item="today"] input').removeAttr('checked');
      $('li[data-item="every"] input').removeAttr('checked');
    }
  }
});
/*
Функция генерирует данные для страницы статистики по выбранному упражнению, клиенту и дате
*/
function generateStatistics() {
	// Надо добавить кнопку Save
	$('#linkSaveWorkEx').show();
  var customerId = parseInt($('span#spanCustName').attr('data-item'));
  var dateEx = $('span#spanDateEx').text(); // TODO Тут, вероятно, надо предусмотреть сохранение в базе даты в одном каком-то формате, чтобы не было путаницы при смене региональных настроек
  var exerciseName = $('span#spanExWork').text();
  var exerciseId = parseInt($('#spanExWork').attr('data-item'));
  var countBlock = 0; 
  // 5 Slides Per View, 5px Between
  server.optionsExercises.query()
  	.filter('exerciseId', exerciseId)
    .execute()
    .then(function(results) {
      if (results.length < 5) {
        countBlock = results.length;
      } else {
        countBlock = 5;
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
  console.log('Получили id текущего упражнения: ' + exerciseId);
  // Найдём все характеристики упражнения и сформируем из них заголовки строк статистики
  // Первым параметром всегда идёт Подход
  var statName = '';
  statName += '<span class="statistics-name">sets</span><br>';
  var countOptions = 0;
  server.optionsExercises.query()
  	.filter('exerciseId', exerciseId)
    .execute()
    .then(function(results) {
      results.forEach(function (rowExOpt) {
      	statName += '<span class="statistics-name">' + rowExOpt.option + '</span><br>';
      	countOptions++;
      });
      document.getElementById("divStatName").innerHTML = statName;      
      // Теперь найдём всю статистику по данному клиенту
      server.workExercise.query()
  	    .filter('customer', customerId)
        .execute()
        .then(function(result) {
          console.log('Статистика по клиенту: ' + JSON.stringify(result));
          var block = '';
          var i = 0; // Счётчик параметров. Будем отсчитывать параметры и формировать блоки информации
          result.forEach(function (item, index) {
          	console.log('Выводим построчно всё, что нашлось: ' + JSON.stringify(item));
            if(item.exercise == exerciseId) { // Нас интересует только определённое упражнение
            	console.log('Считаем итерации: i = ' + i);
          	  if(i == 0) {
          	    // Пошёл первый параметр в новом блоке
          	    console.log('Открываем новый блок');
          	    block += '<div class="swiper-slide">';
          	    // Первым параметром всегда идёт Подход
          	    block += '<span>' + item.set + '</span>';
          	  }
          	  block += '<br><span>' + item.value + '</span>';
          	  i++;
          	  if(i === countOptions) {
          	  	console.log('Закрываем блок и обнуляем счётчик.');
          	    // Пора закрывать блок и обнулять счётчик параметров упражнения
          	    block += '</div>';
          	    i = 0;
          	  }
          	}
          });
          console.log('Выводим блок на страницу.');
          document.getElementById("divStatistics").innerHTML = block;
          //mySlider3.updateContainerSize();
        });
    });
}
// Функция срабатывает при нажатии кнопки Note на странице работы с упражнением index-24
$('#aWorkNote').on('click', function() {
	// Надо добавить кнопку Save
	$('#linkSaveWorkEx').show(); 
});
// Функция срабатывает при нажатии кнопки Statistics на странице работы с упражнением index-24
$('#aWorkStatistics').on('click', function() {
	// Надо скрыть кнопку Save
	$('#linkSaveWorkEx').hide(); 
});
/*
Функция срабатывает при нажатии кнопки Graph на странице работы с упражнением index-24
Функция рисует график по данным истории выполнения упражнения из БД
*/
$('#aWorkGraph').on('click', function() {
	// Надо скрыть кнопку Save
	$('#linkSaveWorkEx').hide();
	// Получим все параметры данного упражнения
	var exerciseName = $('span#spanExWork').text();
	var exerciseId = parseInt($('#spanExWork').attr('data-item'));
	var customerId = parseInt($('span#spanCustName').attr('data-item'));
	var arrOptEx = []; // Список всех параметров данного упражнения
	var i = 0; // Счётчик количества данных (фактически это количество подходов)
	// Сначала определим количество активных параметров у данного упражнения
	server.optionsExercises.query()
  	.filter('exerciseId', exerciseId)
    .execute()
    .then(function(results) {
      results.forEach(function (rowExercise, index) {
    		arrOptEx[index] = rowExercise.option;
      });
      // Определим количество характеристик
      var countOptions = arrOptEx.length;
      console.log('Количество всех собранных из БД характеристик: ' + countOptions);
      //console.log('Список всех собранных из БД характеристик: ' + JSON.stringify(arrOptEx));
      // Теперь надо сформировать данные для графика. Ищем в базе всё по данному упражнению и клиенту
      server.workExercise.query()
  	    .filter('customer', customerId)
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
          result.forEach(function (item) {
            if(item.exercise == exerciseId) { // Нас интересует только определённое упражнение
            	// Добрались до данных, теперь их надо собрать в массивы
            	if (i == 0) {
            		arrDateEx[analitCount] = item.date;
            		arrSetEx[analitCount] = item.set;
            	}	else { 
            		if (item.option == 'repeats') {
	            		arrRepeats[analitCount] = item.value;
	            	} else if (item.option == 'weight') {
	            		arrWeight[analitCount] = item.value;
	            	} else if (item.option == 'time') {
	            		arrTime[analitCount] = item.value;
	            	} else if (item.option == 'distance') {
	            		arrDistance[analitCount] = item.value;
	            	} else if (item.option == 'speed') {
	            		arrSpeed[analitCount] = item.value;
	            	} else if (item.option == 'slope') {
	            		arrSlope[analitCount] = item.value;
	            	} else if (item.option == 'load') {
	            		arrLoad[analitCount] = item.value;
	            	}
            	}
            	i++; // Счётчик по параметрам одного аналитического разреза
            	if(i == countOptions) {
            		i = 0; // Начало нового аналитического разреза
	            	analitCount++;
            	}
            	console.log('Номер характеристики в текущей итерации: ' + i);
            }
          });
          // Данные собрали в массив. Теперь готовим к показу график по данным
          var test = [1, 2, 3];
					var data = {
					  //labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
					  labels: arrDateEx,
					  series: [
					    arrRepeats,
					    arrWeight,
					    arrTime,
					    arrDistance,
					    arrSpeed,
					    arrSlope,
					    arrLoad
					  ]
					};
					console.log('Собираем данные в массивы для показа на графике.');
					var options = {
					  seriesBarDistance: 10
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
					new Chartist.Bar('.ct-chart', data, options, responsiveOptions);
        });
    });  
});
