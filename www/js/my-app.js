//console.log('Sart at my-app');
// Initialize your app
var myApp = new Framework7({
  modalTitle: 'Personal trainer',
  init: false
});

// Export selectors engine
var $$ = Framework7.$;
//indexedDB.deleteDatabase('my-app');
//var RSVP = require('rsvp');
//var Promise = require('es6-promise').Promise;
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
    		unique: false
          },
          type: {
            unique: false
          },
          options: {
            unique: false
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
  }).then(function(serv) {
    server = serv;
    server.customers.query('name')
    .all()
    //.keys()
    .execute()
    .then(function(results) {
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
    		unique: false
          },
          type: {
            unique: false
          },
          options: {
            unique: false
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
  }).then(function(serv) {
    server = serv;
    server.exerciseType.query('name')
    .all()
    //.keys()
    .execute()
    .then(function(results) {
      updateListExerciseType(results);
      // Управляем видимостью кнопок Delete в настройках упражнений
      /*$$('.btn-delete-toggle').on('change', function() {
      	var collapse_content_selector = '#' + $$(this).attr('name');
      	$$(collapse_content_selector).toggleClass('hidden');
      });*/
    });
  });
  
});

// TODO переделать с инициализации страницы на загрузку. Инициализация подразумевает один раз, а загружаться будут каждый раз разные данные!
/*myApp.onPageInit('index-7', function (page) {
  // Перед инициализацией страницы со списком упражнений определённой группы, нужно подготовить этот список
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
  }).then(function(serv) {
    server = serv;
    server.exercise.query('name')
    .all()
    //.keys()
    .execute()
    .then(function(results) {
      updateListExercise(results);
      // Управляем видимостью кнопок Delete в настройках упражнений
      $$('.btn-delete-toggle').on('change', function() {
      	var collapse_content_selector = '#' + $$(this).attr('name');
      	$$(collapse_content_selector).toggleClass('hidden');
      });
    });
  });
  
});*/

myApp.init();

// Модальное окно для подтверждения удаления клиентов
$$('.confirm-delete-customers').on('click', function () {
    myApp.confirm('Are you sure?', 
      function () {
        // Найдём все value всех отмеченных чекбоксов в ul#forDeleteCustomers. Эти значения есть id клиентов для удаления из базы
         
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
        console.log('Начинаем обрабатывать упражнения');
        $.getJSON('default/exercises.json', function(data) {
          // Запускаем цикл по группам упражнений (exerciseType)
          for (var j in data.exerciseType) {
            //console.log('j = ' + j);
            console.log('data.exerciseType[j].name = ' + data.exerciseType[j].name);
            //console.log('exercise = ' + JSON.stringify(data.exerciseType[j]));
            // Добавляем группы упражнений
            server.exerciseType.add({'name': data.exerciseType[j].name});
            // Внутри группы упражнений проходим циклом все упражнения из этой группы
            for (var i in data.exerciseType[j].exercises) {
              // Внутри упражнения проходим циклом по всем характеристикам упражнения
              //for (var opt in data.exerciseType[j].exercises[i].options) {
              //  console.log('opt = ' + opt);
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
                    	'options': optName})
                    	.then(function(item){
                    		console.log(JSON.stringify(item));
                    	});
                  }
                }
              //}
            }
          }
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
            .then(function(results) {
              // Запросом получили массив объектов customers
              updateListCustomers(results);
            });
        });
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
        // Удалим все таблицы
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
		    		unique: false
		          },
		          type: {
		            unique: false
		          },
		          options: {
		            unique: false
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
        }).then(function(serv) {
          server = serv;
          
        });
      },
      function () {
        // Действие отменено
      }
    );
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
В функцию передаётся массив объектов customers
*/
function updateListCustomers(customers) {
  var listCustomers = '';
  var listCustomersForDelete = '';
  customers.forEach(function (value) {
    // Список пользователей
    listCustomers += '<li class="item-content">';
    listCustomers += '  <div class="item-inner">';
    listCustomers += '    <div class="item-title">' + value.name + '</div>';
    listCustomers += '  </div>';
    listCustomers += '</li>';
    // Список пользователей для удаления
    /*
    <li>
      <label class="label-checkbox item-content">
        <div class="item-inner">
          <div class="item-title">Customers 1</div>
        </div>
        <input type="checkbox" name="my-checkbox" value="Customers 1">
        <div class="item-media">
          <i class="icon icon-form-checkbox"></i>
        </div>
      </label>
    </li>
    */
    listCustomersForDelete += '<li>';
    listCustomersForDelete += '  <div class="item-inner">';
    listCustomersForDelete += '    <div class="item-title">' + value.name + '</div>';
    listCustomersForDelete += '    <div class="item-media">';
    listCustomersForDelete += '      <label class="label-checkbox item-content">';
    listCustomersForDelete += '        <input type="checkbox" name="' + value.name + '" value="' + value.id + '">';
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
В функцию передаётся массив объектов exerciseType
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
    listExerciseType += '        <a href="" class="button button-round" onclick="deleteExType(\'' + value.name + '\', \'' + value.id + '\')" id="aDeleteExType">Delete</a>';
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
В функцию передаётся название одной выбранной группы упражнений
*/
function updateListExercises(exerciseType) {
  $('div#ex-of-type').text(exerciseType);
  var listExercise = '';
  // Запросом отбираем все упражнения даной группы (exerciseType)
  server.exercise.query('name')
  	.filter('type', exerciseType)
    //.all()
    .distinct()
    //.keys()
    .execute()
    .then(function(results) {
      console.log('results = ' + JSON.stringify(results));
      //for (var rowExercise in results) {
      results.forEach(function (rowExercise) {
      	console.log('rowExercise.name = ' + rowExercise.name);
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
	    listExercise += '        <a href="#" class="button button-round">Delete</a>';
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
В функцию передаётся название выбранного упражнения
*/
function updateViewExProp(exercise) {
  // Сначала снимаем все галочки параметров
  $('div#view-8 input[name="checkbox-ex-prop"]').removeAttr('checked');
  // Теперь ставим только те галочки, которые нужны по данным БД
  server.exercise.query()
  	.filter('name', exercise)
    .execute()
    .then(function(results) {
      //console.log('results = ' + JSON.stringify(results));
      results.forEach(function (rowExercise) {
      	//console.log('rowExercise.options = ' + rowExercise.options);
      	$('div#ex-prop').text(rowExercise.name);
      	$$('input[name="checkbox-ex-prop"][value="' + rowExercise.options + '"]').click();
      });
    });
}
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
В функцию передаётся название одной выбранной группы упражнений
*/
/*$$('#aDeleteExType').on('click', function () {
    myApp.addNotification({
        title: 'Delete',
        message: 'This item can not be delete while there are exercises in it.'
    });
});*/
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
