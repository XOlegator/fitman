//console.log('Sart at my-app');
// Initialize your app
var myApp = new Framework7({
  modalTitle: 'Personal trainer',
  init: false
});

// Export selectors engine
var $$ = Framework7.$;
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

myApp.onPageInit('index-3', function (page) {
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
    server.customers.query('name')
    .all()
    .keys()
    .execute()
    .done(function(results) {
      updateListCustomers(results);
    });
  });
  // Перед инициализацией страницы со списком клиентов, нужно подготовить этот список
  //console.log('page 3 init');
  
  //console.log('End of init page 3');
});

myApp.onPageInit('index-5', function (page) {
  // Перед инициализацией страницы со списком групп упражнений, нужно подготовить этот список
  //console.log('page 5 init');
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
    server.exerciseType.query('name')
    .all()
    .keys()
    .execute()
    .done(function(results) {
      updateListExerciseType(results);
    });
  });
  
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

// Модальное окно для подтверждения загрузки демо-данных
$$('.confirm-fill-demo').on('click', function () {
    myApp.confirm('Are you sure? It will erase all of your data!', 
      function () {
        // Очистим всё
        server.clear('exerciseType');
        server.clear('exercise');
        server.clear('customers');
        // Заполняем таблицы данными из json файлов
        $.getJSON('default/exercises.json', function(data) {
          for (var j in data.exerciseType) {
            //console.log('exercise = ' + JSON.stringify(data.exerciseType[j]));
            // Добавляем группы упражнений
            server.exerciseType.add(data.exerciseType[j]);
            for (var i in data.exerciseType[j].exercises) {
              //console.log('Add exercise');
              //console.log('exerciseType = ' + JSON.stringify(data.exerciseType[j].exercises[i]));
              // Формируем базу упражнений по типам (типы заносим в отдельную таблицу)
              server.exercise.add({'name': data.exerciseType[j].exercises[i].name, 'type': j});
            }
          }
          server.exerciseType.query('name')
            .all()
            .distinct()
            //.keys()
            .execute()
            .done(function(results) {
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
            //.keys()
            .execute()
            .done(function(results) {
              // Запросом получили массив объектов customers
              updateListCustomers(results);
            });
        });
        //console.log('All data was add');
        //console.log('Reload is done');
        myApp.alert('Enjoy your new demo data');
      },
      function () {
        // Действие отменено
      }
    );
});

// Модальное окно для подтверждения очистки базы данных
$$('.confirm-clean-db').on('click', function () {
    myApp.confirm('Are you sure? It will erase all of your data!', 
      function () {
        //console.log('Start cleaning DB');
        // Очистим всё
        server.clear('exerciseType');
        server.clear('exercise');
        server.clear('customers');
        //console.log('Reload pages data');
        server.customers.query('name')
          .all()
          .keys()
          .distinct()
          .execute()
          .done(function(results) {
            updateListCustomers(results);
          });
        server.exerciseType.query('name')
          .all()
          .keys()
          .execute()
          .done(function(results) {
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
    myApp.confirm('Are you sure?', 
      function () {
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
      },
      function () {
        // Действие отменено
      }
    );
});
/*
В функцию передаётся массив объектов customers
*/
function updateListCustomers(customers) {
  var listCustomers = '';
  customers.forEach(function (value) {
    listCustomers += '<li class="item-content">';
    listCustomers += '  <div class="item-inner">';
    listCustomers += '    <div class="item-title">' + value.name + '</div>';
    listCustomers += '  </div>';
    listCustomers += '</li>';
  });
  document.getElementById("ulListCustomers").innerHTML = listCustomers;
}
/*
В функцию передаётся массив объектов exerciseType
*/
function updateListExerciseType(exerciseType) {
  var listExerciseType = '';
  exerciseType.forEach(function (value) {
    listExerciseType += '<li>';
    listExerciseType += '  <div class="item-content">';
    listExerciseType += '    <div class="item-inner">';
    listExerciseType += '      <div class="item-media">';
    listExerciseType += '        <a href="#view-7" class="tab-link"><i class="icon icon-form-settings"></i></a>';
    listExerciseType += '      </div>';
    listExerciseType += '      <div class="item-input">';
    listExerciseType += '        <input type="text" placeholder="Exercise" value="' + value.name + '">';
    listExerciseType += '      </div';
    listExerciseType += '      <div class="item-input hidden" id="ex-compl-' + value.id + '">';
    listExerciseType += '        <a href="#" class="button button-round">Delete</a>';
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
    listExerciseType += '    </div>';
    listExerciseType += '</li>';
    //console.log('value = ' + value);
    //console.log('key = ' + key);
  });
  document.getElementById("ulListExerciseType").innerHTML = listExerciseType;
}
