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
$.getJSON('default/bd-schema.json', function(data){
  bdSchema = data;
  db.open(data).then(function(serv) {
  	console.log('Получили схему БД, открыли базу');
    server = serv;
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

// Модальное окно для подтверждения загрузки демо-данных
$$('.confirm-fill-demo').on('click', function () {
  myApp.confirm('Are you sure? It will erase all of your data!', function () {
    // Очистим всё
    console.log(JSON.stringify(server));
    server.clear('workExercise');
    server.clear('workout');
    server.clear('exercise');
    server.clear('exerciseType');
    server.clear('customers');
    // Заполняем таблицы данными из json файлов
    console.log('Начинаем обрабатывать упражнения');
    $.getJSON('default/exercises.json', function(data) {
      // Запускаем цикл по группам упражнений (exerciseType)
      for (var j in data.exerciseType) {
        //console.log('j = ' + j);
        //console.log('data.exerciseType[j].name = ' + data.exerciseType[j].name);
        //console.log('exercise = ' + JSON.stringify(data.exerciseType[j]));
        // Добавляем группы упражнений
        server.exerciseType.add({'name': data.exerciseType[j].name});
        // Внутри группы упражнений проходим циклом все упражнения из этой группы
        for (var i in data.exerciseType[j].exercises) {
          // Внутри упражнения проходим циклом по всем характеристикам упражнения
          // Формируем базу упражнений по типам (типы заносим в отдельную таблицу)
          for (var optName in data.exerciseType[j].exercises[i].options[0]) {
            //console.log('data.exerciseType[j].exercises[i].options[0][optName] = ' + JSON.stringify(data.exerciseType[j].exercises[i].options[0][optName]));
            //console.log('optName = ' + optName);
            // Если опция действует, то добавляем упражнение с этой опцией в базу данных
            if(data.exerciseType[j].exercises[i].options[0][optName]) {
              //console.log('Запись в базу строки по упражнению');
              //console.log('name = ' + data.exerciseType[j].exercises[i].name + '; type = ' + data.exerciseType[j].name + '; options = ' + optName);
              //console.log('type = ' + data.exerciseType[j].name);
              //console.log('options = ' + optName);
              server.exercise.add({
                'name': data.exerciseType[j].exercises[i].name,
                'type': data.exerciseType[j].name,
                'options': optName
              }).then(function(item){
                console.log(JSON.stringify(item));
              });
            }
          }
        }
      }
      // Обновляем список групп упражнений на соответсвующей странице
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
      	
        //console.log('Start cleaning DB');
        // Удалим все таблицы
        server.clear('workExercise');
        server.clear('workout');
        server.remove('exerciseType');
        server.remove('exercise');
        server.remove('customers');
        // Очистим всё
        //server.clear('exerciseType');
        //server.clear('exercise');
        //server.clear('customers');
        //console.log('Reload pages data');
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
	myApp.confirm('Are you sure?', 
      function () {
		// Удаление самой базы данных
		indexedDB.deleteDatabase('my-app');
		document.getElementById("ulListCustomers").innerHTML = '';
  		document.getElementById("forDeleteCustomers").innerHTML = '';
  		document.getElementById("ulListExerciseType").innerHTML = '';
	  }
	);
});
/*
Функция построения списка клиентов. В функцию передаётся массив объектов customers
*/
function updateListCustomers(customers) {
  var listCustomers = '';
  var listCustomersForDelete = '';
  customers.forEach(function (value) {
    // Список пользователей
    listCustomers += '<li>';
    listCustomers += '  <a href="#view-10" class="tab-link item-link item-content" onclick="fillCustomerData(\'' + value.name + '\')">';
    listCustomers += '    <div class="item-inner">';
    listCustomers += '      <div class="item-title">' + value.name + '</div>';
    listCustomers += '    </div>';
    listCustomers += '  </a>';
    listCustomers += '</li>';
    // Список пользователей для удаления
    listCustomersForDelete += '<li>';
    listCustomersForDelete += '  <div class="item-inner">';
    listCustomersForDelete += '    <div class="item-title">';
    listCustomersForDelete += '      <a href="#view-10" class="tab-link btn-right-top" onclick="fillCustomerData(\'' + value.name + '\')">' + value.name + '</a>';
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
}
/*
Функция добавления клиента. Вызывается из страницы #view-10 по кнопке Save
*/
function addCustomer() {
  var newCustomer = $('input#inputNewCustomer').val();
  var dateStartClasses = $('input#inputDateStartClasses').val();
  var timeVal = new Date().toISOString();//.substring(0, 10);
  var photo = 'somepic' + timeVal + '.jpg';
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
          message: 'Data was saved'
        });
        // Запросом получили массив объектов customers
        updateListCustomers(results);
      });
    //$$('a[href="#view-3"]').click();
  }
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
            // Проверяем, можно ли удалять этого клиента из базы
            // TODO Если по клиенту есть записи в истории занятий, то спрашиваем, точно ли всё по нему удалить
            console.log(JSON.stringify(results));
            server.remove('customers', parseInt(results[0].id)).then(function(res3){
              console.log('Удалили пользователя с id = ' + results[0].id);
              console.log(JSON.stringify(res3));
            });
          });
      });
      // После всех удалений, обновим списки клиентов на соответсвующих страницах
      server.customers.query('name')
		.all()
		.distinct()
		.execute()
		.then(function(res2) {
		  console.log('Клиенты после удаления res2 = ' + JSON.stringify(res2));
		  updateListCustomers(res2);
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
    // Обновляем список клиентов на соответсвующей странице
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
Функция заполнения данными страницы клиента (#index-3). Вызывается из списка клиентов при выборе клиента
*/
function fillCustomerData(customerName) {
  console.log('Заполняем данные по клиенту ' + customerName);
  server.customers.query()
  	.filter('name', customerName)
    .execute()
    .then(function(results) {
      $('input#inputNewCustomer').val(results[0].name);
      $('textarea#newCustomerComments').val(results[0].comments);
    });
    //document.location.href = '#view-10';
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
    listExerciseType += '        <a href="#view-7" class="tab-link" onclick="updateListExercises(\'' + value.name + '\')"><i class="icon icon-form-settings"></i></a>';
    listExerciseType += '      </div>';
    listExerciseType += '      <div class="item-input">';
    listExerciseType += '        <input type="text" placeholder="Exercise" value="' + value.name + '">';
    listExerciseType += '      </div>';
    listExerciseType += '      <div class="item-input hidden" id="ex-compl-' + value.id + '">';
    listExerciseType += '        <a href="" class="button button-round" onclick="deleteExType(\'' + value.name + '\', \'' + value.id + '\')">Delete</a>';
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
Функция построения списка упражнений определённой группы.
В функцию передаётся название одной выбранной группы упражнений
*/
function updateListExercises(exerciseType) {
  $('div.ex-of-type').text(exerciseType);
  var listExercise = '';
  // Запросом отбираем все упражнения даной группы (exerciseType)
  server.exercise.query('name')
  	.filter('type', exerciseType)
    //.all()
    .distinct()
    //.keys()
    .execute()
    .then(function(results) {
      //console.log('results = ' + JSON.stringify(results));
      //for (var rowExercise in results) {
      results.forEach(function (rowExercise) {
      	//console.log('rowExercise.name = ' + rowExercise.name);
      	listExercise += '<li>';
        listExercise += '  <div class="item-content">';
        listExercise += '    <div class="item-inner">';
        listExercise += '      <div class="item-input">';
        listExercise += '        <input type="text" placeholder="Exercise" value="' + rowExercise.name + '">';
        listExercise += '      </div>';
    	listExercise += '      <div class="item-media">';
	    listExercise += '        <a href="#view-8" class="tab-link button button-round" onclick="updateViewExProp(\'' + rowExercise.name + '\')">Properties</a>';
	    listExercise += '      </div>';
	    listExercise += '      <div class="item-input hidden" id="ex-' + rowExercise.id + '">';
	    listExercise += '        <a href="" class="button button-round" onclick="deleteExercise(\'' + rowExercise.name + '\')">Delete</a>';
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
Функция добавления упражнения и его характеристик. Вызывается из страницы #view-7a
*/
function addExercise() {
  var newExercise = $('input#inputNewExercise').val();
  var typeExercise = $('div#view-7a div.ex-of-type').text();
  if(newExercise != '') {
    // Повторяем запись в базу по каждому отмеченному свойству упражнения
    $('input[name="checkbox-new-ex-prop"]:checked').each(function(){
      //console.log('Мы в цикле по действующим параметрам упражнения!');
      //console.log('name = ' + newExercise + '; type = ' + typeExercise + '; options = ' + this.value);
	  server.exercise.add({'name': newExercise, 'type': typeExercise, 'options': this.value});
    });
    // Обновляем список упражнений на соответсвующей странице
    updateListExercises(typeExercise);
    $$('a[href="#view-7"]').click();
  }
}
/*
Функция удаления упражнения. В функцию передаётся название упражнения
*/
function deleteExercise(exercise) {
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
    		// Сначала найдём все id записей по этому упражнению из таблицы exercise
    		//console.log('exercise для удаления: ' + exercise);
    		server.exercise.query()
		  	.filter('name', exercise)
		    .execute()
		    .then(function(results) {
		      //console.log('results = ' + JSON.stringify(results));
		      results.forEach(function (rowExercise) {
		      	server.remove('exercise', parseInt(rowExercise.id));
		      	//console.log('Удалили запись с id ' + rowExercise.id);
		      });
		      var typeExercise = $('div#view-7a div.ex-of-type').text();
		      updateListExercises(typeExercise);
		    });
    		
    	//}
    //});
}
/*
Функция обновления списка опций конкретного упражнения. В функцию передаётся название выбранного упражнения
*/
function updateViewExProp(exercise) {
  console.log('Формируем список характеристик данного упражнения');
  // Сначала снимаем все галочки параметров
  $('div#view-8 input[name="checkbox-ex-prop"]').removeAttr('checked');
  $('div#ex-prop').text(exercise); // Обновим на странице название текущего упражнения
  // Теперь ставим только те галочки, которые нужны по данным БД
  server.exercise.query()
  	.filter('name', exercise)
    .execute()
    .then(function(results) {
      console.log('Список характеристик: ' + JSON.stringify(results));
      results.forEach(function (rowExercise) {
      	console.log('rowExercise.options = ' + rowExercise.options);
      	$$('input[name="checkbox-ex-prop"][value="' + rowExercise.options + '"]').click();
      });
    });
}
/*
Функция обновления действующих параметров выбранного упражнения. Вызывается со страницы view-8 по кнопке Save 
*/
function updateExerciseProperties() {
  // Определяем редактируемое упражнение
  var exerciseName = $('div#ex-prop').text();
  var exerciseType;
  console.log('Идёт обновление параметров упражнения ' + exerciseName);
  // Сначала отберём все записи по данному упражнению из базы...
  server.exercise.query()
  	.filter('name', exerciseName)
    .execute()
    .then(function(results) {
      // Запомним название группы упражнений
      exerciseType = results[0].type;
      console.log('results[0].type = ' + results[0].type);
      // ... и удалим их
      console.log('Список характеристик: ' + JSON.stringify(results));
      results.forEach(function (rowExercise) {
      	console.log('rowExercise.id = ' + rowExercise.id);
      	server.remove('exercise', parseInt(rowExercise.id));
      });
      // После того, как удалил старые записи, внесём в базу новые записи
      $('input[name="checkbox-ex-prop"]:checked').each(function(){
        console.log('Мы в цикле по новым действующим параметрам упражнения!');
        console.log('name = ' + exerciseName + '; type = ' + exerciseType + '; options = ' + this.value);
	    server.exercise.add({'name': exerciseName, 'type': exerciseType, 'options': this.value});
      });
    });
}
/*
Функция добавления названия группы упражнений
*/
function addExType() {
	var newExType = $('input#inputNewExType').val();
	server.exerciseType.add({'name': newExType});
	// Обновляем список групп упражнений на соответсвующей странице
  server.exerciseType.query('name')
    .all()
    .distinct()
    //.keys()
    .execute()
    .then(function(results) {
      //console.log('exerciseType results = ' + JSON.stringify(results));
      updateListExerciseType(results);
    });
    $$('a[href="#view-5"]').click();
}
/*
Функция удаления названия группы упражнений. В функцию передаётся название одной выбранной группы упражнений
*/
function deleteExType(exerciseType, idExType) {
	// Сначала проверим, есть ли поданной группе упражнений упражнения в базе
	server.exercise.query('name')
  	.filter('type', exerciseType)
    //.all()
    .distinct()
    //.keys()
    .execute()
    .then(function(res){
    	if(res.length) {
    		// В базе есть упражнения из этой группы. Удалять нельзя
    		myApp.addNotification({
		        title: 'Delete',
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
				    // Управляем видимостью кнопок Delete в настройках упражнений
				    //$$('body').off('change', '.btn-delete-toggle');
			      /*$$('.btn-delete-toggle').on('change', function() {
			      	var collapse_content_selector = '#' + $$(this).attr('name');
			      	$$(collapse_content_selector).toggleClass('hidden');
			      });*/
	    		/*myApp.addNotification({
			        title: 'Delete is done',
			        message: 'This item was deleted.'
			    });*/
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
*/
function upgradeViewWorkout() {
  var customerName = $('input#inputNewCustomer').val();
  $('span#spanCustName').html(customerName).attr('data-item', customerName);
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
      console.log('Нашли в базе данные по занятиям на сегодня: ' + JSON.stringify(result));
      var listExCust = '';
      result.forEach(function(item) {
      	if(item.customer == customerName) {
      	  listExCust += '<li>';
          listExCust += '  <a href="#view-24" class="tab-link item-link item-content" onclick="makeViewExWork(\'' + item.exercise + '\')">';
          listExCust += '    <div class="item-inner">';
          listExCust += '      <span>' + item.exercise + '</span>';
          listExCust += '    </div>';
          listExCust += '  </a>';
          listExCust += '</li>';
      	}
      });
      // После того, как в цикле сформировали сегодняшний список упражнений, покажем его на странице
      document.getElementById("ulListCurrentExercises").innerHTML = listExCust;
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
  $('a[href="#tab3"]').replaceWith('<a href="#tab0" class="tab-link" onclick="saveSetExCustomer()">Save</a>');
  // Кнопку Cancel надо заменить на Clear all
  $('a#aCancelSetEx').replaceWith('<a href="" class="tab-link" onclick="makeSetExCustomer()" id="aClearAll">Clear all</a>');
  // Очистим список готового набора
  $('ul#ulListSelectedExercises').empty();
  // Скопируем в левый список те упражнения, которые на сегодня уже отобраны (со вкладки #tab0)
  var listEx = '';
  var excludeEx = [];
  $('#ulListCurrentExercises li a div span').each(function(index, item) {
  	temp = item.innerHTML;
  	// На всякий случай поставим заглушку от инъекций
  	exercise = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  	excludeEx[index] = exercise;
    console.log('exercise = ' + exercise);
    listEx += '<li class="swipeout swipeout-selected">';
    listEx += '  <div class="swipeout-content item-content">';
    listEx += '    <div class="item-inner">';
    listEx += '      <div class="item-title set-of-exercises">' + exercise + '</div>';
    listEx += '    </div>';
    listEx += '  </div>';
    listEx += '  <div class="swipeout-actions-left">';
    listEx += '    <a href="#" class="action1">Deleted</a>';
    listEx += '  </div>';
    listEx += '</li>';
  });
  $('ul#ulListSelectedExercises').append(listEx);
  // Формируем полный список групп упражнений (тот, что справа)
  server.exerciseType.query('name')
    .all()
    .execute()
    .then(function(results) {
       //console.log('Формируем список групп упражнений');
       //console.log('Список групп упражнений: ' + JSON.stringify(results));
       // Терепь найдём все упражнения из данной группы.
       // Упражнения без сортировки (библиотека db.js не поддерживает сортировку) - добавим её,
       // но сначала сформируем массив для сотрировки
       var arrExTypes = [];
       results.forEach(function (rowExerciseType, indexType) {
       	 //console.log('indexType: ' + indexType);
       	 arrExTypes[indexType] = rowExerciseType.name;
       	 //console.log('arrExTypes[indexType] = ' + rowExerciseType.name);
       });
       arrExTypes.sort(); // Теперь имеем отсортированный по названиям список групп упражнений
       var arrEx = [];
       //console.log('arrExTypes = ' + arrExTypes);
       // Пройдём циклом по всем названиям групп упражнений
       arrExTypes.forEach(function(exTypeName) {
       	 // Добавляем на страницу наименования групп упранений
         $('ul#ulListAllExWithTypes').append('<li class="item-divider" data-item="' + exTypeName + '">' + exTypeName + '</li>');
         var testExercise = [];
         // Формируем список упражнений из данной группы
         server.exercise.query('name')
  	       .filter('type', exTypeName)
           .distinct()
           .execute()
           .then(function(res2) {
             res2.forEach(function (rowExercise, indexEx) {
               arrEx[indexEx] = rowExercise.name;
               //console.log('arrEx[indexEx]: ' + rowExercise.name);
             });
             arrEx.sort(); // Теперь упражнения отсортированы по названиям
             console.log('Упорядоченный список упражнений: ' + arrEx);
             arrEx.forEach(function(exercise, index) {
               testExercise[index] = exercise;
               //console.log('testExercise[index] = ' + testExercise[index]);
               //console.log('testExercise[index - 1] = ' + testExercise[index - 1]);
               if((index == 0) || (testExercise[index] != testExercise[index - 1])) {
               	 // Если упражнение было уже отобрано ранее, то его не надо включать в полный список справа 
               	 //console.log('Вот наш список исключений: ' + excludeEx[0] + '; ' + excludeEx[1]);
               	 if(!(in_array(exercise, excludeEx))) {
               	   //console.log('Проверили, что этого упражнения нет в списке исключений: ' + exercise);
                   // В браузере и эмуляторе Android отрабатывает по-разному
                   // В эмуляторе проявляются лишние строки. Видимо, distinct не отрабатывает и выводятся записи упражнений по каждой опции
           	       var listExercises = '';
                   listExercises += '<li class="swipeout swipeout-all">';
                   listExercises += '  <div class="swipeout-content item-content">';
                   listExercises += '    <div class="item-inner">';
                   listExercises += '      <div class="item-title">' + exercise + '</div>';
                   listExercises += '      </div>';
                   listExercises += '    </div>';
                   listExercises += '  </div>';
                   listExercises += '  <div class="swipeout-actions-right">'; // Действие появится справа
                   //listExercises += '    <div class="swipeout-actions-inner">';
                   listExercises += '    <a href="#" class="action1">Added</a>';
                   listExercises += '  </div>';
                   listExercises += '</li>';
                   // Элемент сформирован, надо вставлять на место
                   $('ul#ulListAllExWithTypes li[data-item="' + exTypeName + '"]').after(listExercises);
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
  listEx += '<li class="swipeout swipeout-selected">';
  listEx += '  <div class="swipeout-content item-content">';
  listEx += '    <div class="item-inner">';
  listEx += '      <div class="item-title set-of-exercises">' + exercise + '</div>';
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
  listExercises += '<li class="swipeout swipeout-all">';
  listExercises += '  <div class="swipeout-content item-content">';
  listExercises += '    <div class="item-inner">';
  listExercises += '      <div class="item-title">' + exercise + '</div>';
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
  server.exercise.query('name')
  	.filter('name', exercise)
    .distinct()
    .execute()
    .then(function(result) {
      console.log('Нашли тип этого упражнения: ' + result[0].type);
      // TODO Тут вставляем запись в конец списка, хотя правильнее было бы в нужном порядке (сортировка по алфавиту)
      $('ul#ulListAllExWithTypes li[data-item="' + result[0].type + '"]').after(listExercises);
    });
});  
/*
Функция сохранения набора упражнений клиента.
Вызывается со страницы #view-15 #tab3 по кнопке "Save"
*/
function saveSetExCustomer() {
  console.log('Сохраняем набор');
  var setExercises;
  var temp = '';
  var listExCust = '';
  var customerName = $('span#spanCustName').attr('data-item');
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
      	if(item.customer == customerName) {
      	  server.remove('workout', parseInt(item.id)).then(function(res3){
            console.log('Удалили workout с id = ' + item.id);
            console.log(JSON.stringify(res3));
          });
      	}
      });
    });
  $('div.set-of-exercises').each(function(index, item){
  	temp = item.innerHTML;
  	// На всякий случай поставим заглушку от инъекций
  	setExercises = temp.replace(/<script[^>]*>[\S\s]*?<\/script[^>]*>/ig, "");
  	
    console.log('setExercises = ' + setExercises + '; customerName = ' + customerName + '; dateEx = ' + dateEx);
  	server.workout.add({'customer': customerName, 'date': dateEx, 'exercise': setExercises});
  	listExCust += '<li>';
    listExCust += '  <a href="#view-24" class="tab-link item-link item-content" onclick="makeViewExWork(\'' + setExercises + '\')">';
    listExCust += '    <div class="item-inner">';
    listExCust += '      <span>' + setExercises + '</span>';
    listExCust += '    </div>';
    listExCust += '  </a>';
    listExCust += '</li>';
  });
  // После того, как в цикле сформировали список упражнений, покажем его на странице
  document.getElementById("ulListCurrentExercises").innerHTML = listExCust;
  //$('ul#ulListCurrentExercises').html(listExCust);
  // Кнопку Save надо заменить на Change
  $('a[href="#tab0"]').replaceWith('<a href="#tab3" class="tab-link" onclick="makeSetExCustomer()">Change</a>');
  // Кнопку Clear all надо заменить на Cancel 
  $('a#aClearAll').replaceWith('<a href="#view-10" class="back tab-link" id="aCancelSetEx">Cancel</a>');
}
/*
Функция подготовки отображения страницы работы с упражнением клиента.
Вызывается со страницы #view-15 #tab0 по нажатию на какое-то упражнение (оно передаётся в параметре)
*/
function makeViewExWork(exercise) {
  console.log('Подготавливаем к работе страницу с упражнением ' + exercise);
  var customerName = $('#spanCustName').attr('data-item');
  document.getElementById("spanWorkCustName").innerHTML = customerName;
  var today = new Date().toDateInputValue();
  document.getElementById("spanWorkDateEx").innerHTML = today;
  document.getElementById("spanExWork").innerHTML = exercise;
  // Формируем к показу характеристики выбранного упражнения
  var propEx = '';
  var exerciseName = $('span#spanExWork').text();
  console.log('Идёт построение параметров упражнения ' + exerciseName);
  // Сначала отберём все записи по данному упражнению из базы...
  server.exercise.query()
  	.filter('name', exerciseName)
    .execute()
    .then(function(results) {
      console.log('Список характеристик: ' + JSON.stringify(results));
      results.forEach(function (rowExercise) {
      	console.log('rowExercise.options = ' + rowExercise.options);
      	// Параметр "Подходы" нужно оформить в виде выпадающего списка
      	if (rowExercise.options == 'sets') {
      	  propEx += '<li>';
      	  propEx += '  <div class="item-content">';
      	  propEx += '    <div class="item-media"><i class="icon icon-form-settings"></i></div>';
      	  propEx += '    <div class="item-inner">';
      	  propEx += '      <div class="item-title label">' + rowExercise.options + '</div>';
      	  propEx += '      <div class="item-input">';
      	  propEx += '        <select data-item="' + rowExercise.options + '">';
      	  for (i=1; i<11; i++) {
            propEx += '          <option>' + i + '</option>';
          }
          propEx += '        </select>';
      	  propEx += '      </div>';
      	  propEx += '    </div>';
      	  propEx += '  </div>';
      	  propEx += '</li>';
      	}
      	// Параметр "Время" нужно оформить в виде двух окон ввода для минут и секунд 
      	else if (rowExercise.options == 'time') {
      	  propEx += '<li>';
      	  propEx += '  <div class="item-content">';
      	  propEx += '    <div class="item-media"><i class="icon icon-form-settings"></i></div>';
      	  propEx += '    <div class="item-inner">';
      	  propEx += '      <div class="item-title label">' + rowExercise.options + '</div>';
      	  propEx += '      <div class="item-input">';
      	  propEx += '        <div class="row">';
      	  propEx += '          <div class="col-50"><input type="number" min="0" data-item="' + rowExercise.options + '-minutes" placeholder="Minutes"></div>';
      	  propEx += '          <div class="col-50"><input type="number" min="0" data-item="' + rowExercise.options + '-seconds" placeholder="Seconds"></div>';
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
      	  propEx += '      <div class="item-title label">' + rowExercise.options + '</div>';
      	  propEx += '      <div class="item-input">';
      	  propEx += '        <input type="number" min="0" data-item="' + rowExercise.options + '" placeholder="Value of ' + rowExercise.options + '">';
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
  var customerName = $('span#spanCustName').attr('data-item');
  var exercise = $('span#spanExWork').text();
  var dateEx = $('span#spanDateEx').text(); // TODO Тут, вероятно, надо предусмотреть сохранение в базе даты в одном каком-то формате, чтобы не было путаницы при смене региональных настроек
  // Считываем все значения
  $('#ulListCurrentWorkEx input').each(function(index, item) {
  	console.log('item.value ' + item.value + 'item.attributes[data-item].value ' + item.attributes['data-item'].value);
  	var option = item.attributes['data-item'].value;
  	var time = 0; // Время будем записывать в секундах
  	if(option) {
  	  // Значение параметра заполнено
  	  if(option == 'time-minutes') {
  	  	// Запоминаем минуты, переведённые в секунды
  	  	time = time + parseInt(item.value) * 60; 
  	  }
  	  else if(option == 'time-seconds') {
  	  	// Запоминем секунды
  	  	time = time + parseInt(item.value);
  	  } else {
  	  	// Любой параметр, кроме времени
  	    server.workExercise.add({
  	  	  'customer': customerName,
  	  	  'date': dateEx,
  	  	  'exercise': exercise,
  	  	  'option': option,
  	  	  'value': item.value
  	    });
  	  }
  	} else {
  	  // Значение параметра не заполнено
  	}
  	// Отдельно записываем в базу время, т.к. сразу нельзя было (происходило сложение минут и секунд)
  	if(time) {
  	  server.workExercise.add({
  	  	'customer': customerName,
  	  	'date': dateEx,
  	  	'exercise': exercise,
  	  	'option': 'time',
  	  	'value': time
  	  });
  	}
  });
}
// Приводим даты в "русский вид" ("15.04.2013"))
function makeCalDate(date)
{
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
  menuWorkout += '  <center><a href="#tab1" class="tab-link" onclick="makeCalendExCustomer()">Calendar</a></center>';
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
  var customerName = $('span#spanCustName').attr('data-item');
  server.workout.query()
  	.filter('customer', customerName)
    .execute()
    .then(function(result) {
      console.log('Нашли данные по занятиям: ' + JSON.stringify(result));
      var datesWork = [];
      var dateWork = '';
      var i = 0;
      result.forEach(function (item, index) {
        // Сформируем массив дат, когда были занятия
        dateWork = item.date;
        if (index == 0) {
          datesWork[0] = dateWork;
          console.log('Новая дата: ' + dateWork);
          i = 1;
        } else { // Обрабатываем уже не первую запись
          // Если дата из новой записи ещё не встречалась, то запишем её в наш массив дат
          if(!(in_array(dateWork, datesWork))) {
            i = i + 1;
            datesWork[i] = dateWork;
            console.log('Новая дата: ' + dateWork);
          }
        }
      });
      // Вышли из цикла после обработки всех строк
      //console.log('Цикл закончился, форматируем даты');
      $("#calendar").datepicker({  
        beforeShowDay: function(date) {
          //console.log('Мы в обработке даты');
          //console.log('makeCalDate(date) = ' + makeCalDate(date));
          if(in_array(makeCalDate(date), datesWork)) {
            //console.log('Прошли проверку даты');
            return[true, "calendar_actdate"];
          } else {
            //console.log('не Прошли проверку даты');
            return[true, ""];                                
          }
        },
        onSelect: function(dateText, inst) {
          console.log('Нажали на дату dateText ' + dateText);
                 // Если есть событие, то открываем окно
                /*if(in_array(datesWork, dateText))
                {
                    $( "#calendar_dialog" ).dialog( "open" );
                }*/
        }
      });
    });
}
/*
Функция подготовки отображения расписания клиента по дням недели.
Вызывается со страницы #view-15 #tab2 (при клике на вкладку Schedule)
*/
function makeScheduleExCustomer() {
  // Сформируем доступные кнопки для вкладки Календарь
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
