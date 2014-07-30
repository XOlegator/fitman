// Initialize your app
var myApp = new Framework7({
  modalTitle: 'Personal trainer',
  init: false
});

// Export selectors engine
var $$ = Framework7.$;

var view1 = myApp.addView('#view-1'); // Заглавная страница
var view2 = myApp.addView('#view-2'); // Настройки
var view3 = myApp.addView('#view-3'); // Клиенты
var view4 = myApp.addView('#view-4'); // Ссылка на регистрацию
var view5 = myApp.addView('#view-5'); // Группы упражнений
var view7 = myApp.addView('#view-7'); // Управление списком упражнений
var view8 = myApp.addView('#view-8'); // Страница настроек упражнения
var view10 = myApp.addView('#view-10'); // Добавление клиента
var view13 = myApp.addView('#view-13'); // Удаление клиентов из базы

var server;
db.open({
  server: 'my-app',
  version: 1,
  schema: {
    exerciseType: {
      key: {
        keyPath: 'id',
        autoIncrement: true
      },
      indexes: {
  			name: {
  			  unique: true
  			}
      }
    },
    exercise: {
      key: {
        keyPath: 'id',
        autoIncrement: true
      },
      indexes: {
  			name: {
  			  unique: true
  			}
      }
    },
    customers: {
      key: {
        keyPath: 'id',
        autoIncrement: true
      },
      indexes: {
  			name: {
  			  unique: true
  			}
      }
    }
  }
}).done(function(s) {
  server = s;
});

myApp.onPageBeforeInit('index-3', function (page) {
  // Перед инициализацией страницы со списком клиентов, нужно подготовить этот список
  alert('Pane 3 init');
  alert(JSON.stringify(server))
  server.customers.query('name')
    .all()
    .keys()
    .distinct()
    .execute()
    .done(function(results) {
      //alert(JSON.stringify(results));
      var listCustomers = '';
      results.forEach(function (val) {
        //alert(val);
        listCustomers += '<li class="item-content">';
        listCustomers += '  <div class="item-inner">';
        listCustomers += '    <div class="item-title">' + val + '</div>';
        listCustomers += '  </div>';
        listCustomers += '</li>';
      });
      document.getElementById("ulListCustomers").innerHTML = listCustomers;
      /*var output="<ul>";
      for (var i in data.exercise) {
          output+="<li>" + data.exercise[i].name + "</li>";
          alert(i);
      }

      output+="</ul>";
      document.getElementById("placeholder").innerHTML=output;*/
    });
  // Закрываем соединение с базой данных
  //server.close();
});

myApp.onPageInit('index-2', function (page) {
  alert('222');
  console.log('2 page initialized');
  console.log(page);
});

myApp.init();

// Управляем видимостью кнопок Delete в настройках упражнений
$$('.btn-delete-toggle').on('change', function(e) {
	var collapse_content_selector = '#' + $$(this).attr('name');
	$$(collapse_content_selector).toggleClass('hidden');
});
// Модальное окно для подтверждения удаления клиентов
$$('.confirm-ok-cancel').on('click', function () {
    myApp.confirm('Are you sure?', 
      function () {
        myApp.alert('You clicked Ok button');
      },
      function () {
        myApp.alert('You clicked Cancel button');
      }
    );
});

//$(document).ready(function() {
  
  /*
  // Пример чтения данных из файла json
  $.getJSON('default/exercise.json', function(data) {
      var output="<ul>";
      for (var i in data.exercise) {
          output+="<li>" + data.exercise[i].name + "</li>";
          alert(i);
      }

      output+="</ul>";
      document.getElementById("placeholder").innerHTML=output;
  });*/
  /*$.getJSON('default/exercise.json', function(data) {
    // Получаем строку из файла json
    var defaultExercisesString = JSON.stringify(data.exercise);
    alert(defaultExercisesString);
    // Вариант создания объекта из строки формата json:
    //var defaultExercisesObject = JSON.parse(defaultExercisesString);
    // Тогда можно обращаться с свойствам:
    //alert(defaultExercisesObject[0].name);   
    
  });*/
  // В целях тестирования и разработки каждый раз создаём базу с нуля. Очистим всё
  /*var dbRequest = window.indexedDB.deleteDatabase("my-app");
  dbRequest.onsuccess = function(evt) {
    alert("DB is dropped");
  };
  dbRequest.onerror = function(evt){}*/
    
  
// Эта функция должна отрабатывать при полной загрузке страницы
$$(document).on('pageInit', function (e) {
  alert("Start");
  // Открываем базу данных
  //var server;
  db.open({
    server: 'my-app',
    version: 1,
    schema: {
      exerciseType: {
        key: {
          keyPath: 'id',
          autoIncrement: true
        },
        indexes: {
    			name: {
    			  unique: true
    			}
        }
      },
      exercise: {
        key: {
          keyPath: 'id',
          autoIncrement: true
        },
        indexes: {
    			name: {
    			  unique: true
    			}
        }
      },
      customers: {
        key: {
          keyPath: 'id',
          autoIncrement: true
        },
        indexes: {
    			name: {
    			  unique: true
    			}
        }
      }
    }
  }).done(function(s) {
    server = s;
    //alert(JSON.stringify(s));
    //var defaultExercisesObject;
    //var defaultExercisesString;
    /*$.getJSON('default/exercises.json', function(data) {
      //alert(JSON.stringify(data.exerciseType[0].exercises[0]));
      for (var j in data.exerciseType) {
        // Добавляем группы упражнений
        server.exerciseType.add(data.exerciseType[j]).done(function(res){
          //alert("Ok");
        });
        for (var i in data.exerciseType[j].exercises) {
          //alert(data.exerciseType[0].exercises[i].name);
          // Формируем базу упражнений по типам (типы заносим в отдельную таблицу)
          
          server.exercise.add({'name': data.exerciseType[j].exercises[i].name, 'type': j}).done(function(res){
            //alert("Ok");
          });
        }
      }
    });*/
    /*$.getJSON('default/customers.json', function(data) {
      for (var i in data.customers) {
        // Добавляем группы упражнений
        server.customers.add(data.customers[i]).done(function(res){
          //alert("Ok");
        });
      }
    });*/
    
  });
  server.exercise.query('name', 'Chin up')
    .execute()
    .done(function(results) {
      alert(results);
    });
  // Закрываем соединение с базой данных
  server.close();  
  
  var page = e.detail.page;
  // Отдельный код для заглавной страницы
  if (page.name === 'index-1') {
      // We need to get count GET parameter from URL (about.html?count=10)
      var count = page.query.count;
      // Now we can generate some dummy list
      var listHTML = '<ul>';
      for (var i = 0; i < count; i++) {
          listHTML += '<li>' + i + '</li>';
      }
      listHTML += '</ul>';
      // And insert generated list to page content
      $$(page.container).find('.page-content').append(listHTML);
  }
  
  
});
