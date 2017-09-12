//[mainModule] MEMO
(function(window) {
	//TODO: check if name 'root' is valid.
	var root = this;
	var version = '0.9';
	var description = `
		<MEMO.js>
		Ver 0.9 Beta
		MEMO is the main application providing various micro services.
	`;

	var _VIEW = function(){
		// this.MainHandler;
		this.WallHandler;
		this.TodoHandler;
	};

	var _APPS = function(){
		this.Todo;
		this.People;
	};

	var _DATA = function() {
		this.DBTodo = [];
		this.DTodo = {
			Did: undefined,
			userId: undefined,
			date: undefined,
		};
		this.DPeople = {};
	};

	_VIEW.prototype = {
		alertMessage: function(msg) {
			if(msg !== undefined) {
				$('.alert h1').text(msg);
			}
			$('nav, #container').toggleClass('blurred');
			$('.alert').toggleClass('selected');

			$('.closeButton').click(function() {
				VIEW.alertMessage();
			});
			setTimeout(function(){
				$('html').on('keypress', function(e) {
					if(e.keyCode == 13)
						VIEW.alertMessage();
						// e.preventDefault();
				});
			}, 500);
		},
		handleNav: function() {
			$('nav input').click(function() {
				var id = $(this).attr('id');
				$('#container .currentContent').removeClass('currentContent');
				$('#container #'+id).toggleClass('currentContent');
				$('.currentContent').scrollTop(0);
				$('body').attr('app-id', id);

				if($('#subBackground2').css('opacity') == '0'){
					$('#subBackground2').css('background-image', 'var(--'+id+')');
					// $('#subBackground2').css(themes.body[id]);
					$('nav').css('background', 'var(--'+id+'-nav)');
					// $('nav').css(themes.nav[id]);

					$('#subBackground2').css({
						'opacity': '1'
					});
				} else {
					$('#subBackground1').css('background-image', 'var(--'+id+')');
					// $('#subBackground1').css(themes.body[id]);
					$('nav').css('background', 'var(--'+id+'-nav)');
					// $('nav').css(themes.nav[id]);

					$('#subBackground2').css({
						'opacity': '0'
					});
				}

			});
		},
		handleOptionBar: function() {
			$('#optionButton').click(function() {
				if($('#optionButton').prop('checked'))
					$('#optionBar').css({'right': '0'});
				else
					$('#optionBar').css({'right': '-30vw'});
				$('.contents').toggleClass('blurred');
			});
		},
		setInitialState: function() {
			$('body').scrollTop(0);
			// $('body').animate({ scrollTop: 0 }, 'fast');
			$('.intro').css({
				'opacity': '0',
				'height': '40px',
				'padding': '0',
				'visibility': 'hidden'
			});

			$('input[name=cardFirstName]').blur(function(e) {
				if(e.target.value)
					$(this).css('min-width', 1.3+e.target.value.length*1.3+'rem')
			});

			this.handleNav();
			this.WallHandler.handleSection('#Wall section');
			this.handleOptionBar();
			this.WallHandler.handlePlusButton();
			this.TodoHandler.handleSection();
			this.TodoHandler.handlePlusButton();
			// this.TodoHandler.handleCatTag();
			//TODO: customize editor plugin
			CKEDITOR.replace('test11');
			CKEDITOR.replace('TodoTest', {
				customConfig: './custom/4todo.js'
			});
			// CKEDITOR.inline('TodoTest');
		},
	};

	_VIEW.prototype.WallHandler = {
		handleSection: function(targetElement) {
			$.event.addProp('dataTransfer');

			var setTarget = function(e) {
				if($(e.target).is('section')){
					return $(e.target);				
				}
				else{
					// e.preventDefault();
					e.stopPropagation();
					return $(e.target).parents('section');
				}
			};

			$(targetElement).prop('draggable', 'true');

			$(targetElement).on('dragstart', function(e) {
				var target = setTarget(e);

				e.dataTransfer.setData("text/plain", target.attr('data-item'));

				target.addClass('onDrag');
				$(targetElement).not(target).not(target.next()).addClass('dragPoint');
			});

			$(targetElement).on('dragenter', function(e) {
			});

			$(targetElement).on('dragover', function(e) {
				if(e.preventDefault)
					e.preventDefault();

				var target = setTarget(e);

				target.not('.onDrag').not($('.onDrag').next()).addClass('onDragOver');
			});

			$(targetElement).on('drop', function(e) {
				var id = e.dataTransfer.getData("text/plain");

				var target = setTarget(e);

				target.before($('[data-item='+id+']'));
			});

			$(targetElement).on('dragleave', function(e) {
				var target = setTarget(e);

				target.removeClass('onDragOver');
			});

			$(targetElement).on('dragend', function(e) {
				var target = setTarget(e);

				target.removeClass('onDrag');
				$(targetElement).removeClass('onDragOver');
				$(targetElement).removeClass('dragPoint');
			});
		},
		handlePlusButton: function() {

			$('.circle').focus(function() {
				if($('body').attr('app-id') !== 'Wall')
					return;
				$('nav, .contents').toggleClass('blurred');
			});

			$('.circle').blur(function() {
				if($('body').attr('app-id') !== 'Wall')
					return;
				$('nav, .contents').toggleClass('blurred');
			});

			$('button.subCircle').focus(function() {
				if($('body').attr('app-id') !== 'Wall')
					return;
				var _id = $(this).attr('id');

				switch(_id) {
					case "P":
						addMemoPeople();
						break;
					default:
						$('.contents').prepend('<section><h1>test</h1></section>');
						break;
				}
			});

			var addCodes = {
				'Todo': `
					<section>
						<h1>+Todo</h1>
						<form>
						</form>
					</section>
				`,
			};

			function addMemoPeople() {
				var str = `
					<section>
						<h1>MemoTodo</h1>
						<form>
							<div>
								<textarea name="addMemo"></textarea>
							</div>
							<div>
								<input type="submit" value="SUBMIT" />
								<input type="reset" value="RESET" />
							</div>
						</form>
					</section>
				`;
				$('.section').prepend(str);
				CKEDITOR.replace('addMemo');
			}
		}
	};

	_VIEW.prototype.TodoHandler = {
		handleSection: function(target) {
			if(target === undefined)
				var target = $('section');
			else
				var target = $(target);

			STICKER.handleSticker(target);

			target.children('form').on('submit', function(e) {
				console.log(JSON.stringify($(this).serializeArray()));
				VIEW.TodoHandler.handleOnSubmit();
				e.preventDefault();
			});
		},
		handlePlusButton: function() {
			var addCodes = {
				'Todo': `
					<section class="addNew">
						<S-category>New</S-category>
						<div>
							<form>
								<div>
									<input type="text" name="title" id="title" placeholder="제목" autocomplete="off">
								</div>
								<div>
									<textarea id="TodoTest" name="contents">응</textarea>
								</div>
								<div>
									<input type="tag">
								</div>
								<div class="submit">
									<input type="submit" value="SUBMIT" />
									<input type="reset" value="RESET" />
								</div>
							</form>
						</div>						
					</section>
				`,
			};

			$('.circle').focus(function() {
				if($('body').attr('app-id') !== 'Todo')
					return;

				$('#Todo .sections').prepend(addCodes.Todo);
				TAG.initialize();
				CKEDITOR.replace('TodoTest', {
					customConfig: './custom/4todo.js'
				});
				VIEW.TodoHandler.handleSection();
			});

			// $('.circle').blur(function() {
			// });
		},
		handleCatTag: function() {

		},
		handleOnSubmit: function(target) {
			var target = $(target).parents('section');
			$(target).css({
				'transform': 'scale(0)',
				'height': '0',
				'overflow-y': 'hidden'
			});
			setTimeout(function() {
				$(target).replaceWith('')
			},500);
			$('#Todo .sections').prepend(`
				<section><S-category>Testing</S-category><div></div></section>
			`);	
		},
		addSection: function(Did) {
			//TODO: try this function on ejs
			var _DTodo = APPS.loadDTodo(Did);
			$('#Todo .sections').prepend(`
				<section>
					<S-category>`++`</S-category>
					<div></div>
				</section>
			`);
		},
	};


	_APPS.prototype = {
		setInitialState: function() {

		},
		loadDTodo: function(Did) {
			return DATA.getDBTodo(Did);
		},
	};

	_DATA.prototype = {
		setDTodo: function(dataArray) {
			var _keys = ['Did', 'userId', 'date', 'tags'],
				_DTodo = {};
			for(let i in _keys){
				_DTodo[_keys[i]] = dataArray[_keys[i]];
			}
			console.log(_DTodo);
			this.DBTodo[dataArray['Did']] = _DTodo;
		},
		getDBTodo: function(Did){
			if(Did === undefined){
				console.log(this.DBTodo);
				return this.DBTodo;
			}
			console.log(this.DBTodo[Did]);
			return this.DBTodo[Did];
		},
	}

	//Public Methods
	var getVersion = function(){
		return version;
	};

	//Objects
	var VIEW = new _VIEW();
	var DATA = new _DATA();

	window.MEMO = {
		VIEW: VIEW,
		DATA: DATA,
		initialize: function(){VIEW.setInitialState();},
		test: function(target){VIEW.TodoHandler.handleOnSubmit(target);},
	};
}(window));

//TODO: modulize this perfectly:
//[microModule] tagAsInput Module
(function(window) {
	var root = this;
	var version = '1.0';
	var description = `
		<tagAsInput.js>
		Ver 1.0
		tagAsInput gives a new way to input any data.
		just put <input type="tag">!
	`;

	var uniqueTag = ['시간', '사람', '알람', '분류', '장소'];

	var setInitialState = function() {
		//TODO: make name attribute 'settable'
		$('input[type="tag"]').replaceWith(`
			<div class="tagContainer">
				<input type="hidden" name="tags" class="tagData">
				<input type="text" class="tagAdder" placeholder="+태그추가">
			</div>
		`);
	};

	var handleTag = function() {
		var parseTag = function(_str, target) {
			var str = _str.split(':'),
				dataNode = $(target).parent().find('.tagData');

			if(str.length == 1){
				$(target).before('<div tabindex=0>'+str[0]+'</div>');
				dataNode.attr('value', dataNode.attr('value')+'#'+str[0]);
			} else if(str.length == 2 && uniqueTag.indexOf(str[0]) != -1){
				//TODO: make str[1] data format (e.g. date: 2017/01/01) 
				str[1] = str[1].trim();
				$(target).before('<div tabindex=0 class="uniqueTag '+str[0]+'">'+str[1]+'</div>');
				dataNode.attr('value', dataNode.attr('value')+'#'+str[0]+':'+str[1]);
			} else {
				VIEW.alertMessage('잘못된 태그입니다.');
			}
		};

		$('.tagAdder').focus(function() {
			$(this).parent().addClass('focus');
		});
		$('.tagAdder').blur(function() {
			$(this).parent().removeClass('focus');
		});
		$('.tagAdder').on('keypress', function(e) {
			if(e.keyCode == 13 && $(this).val()) {
				var tagVal = $(this).val();
				parseTag(tagVal, this);

				$(this).val('');

				$(this).prev().click(function(e) {
					$(this).remove();
				});
				$(this).prev().on('keyup', function(e) {
					//press enter, spacebar, or backspace
					if(e.keyCode == 13 || e.keyCode == 32 || e.keyCode == 8) {
						$(this).next().focus();
						$(this).remove();
						e.preventDefault();
					}
				});

				e.preventDefault();
			}
		});
		$('.tagAdder').on('keyup', function(e) {
			if(e.keyCode == 8 && !($(e.target).val())) {
				$(e.target).prev().focus();
				e.preventDefault();
			}
		});
	}

	window.TAG = {
		initialize: function(){
			setInitialState();
			handleTag();
		}
	};
}(window));

//[microModule] stickers Module
(function(window) {
	var root = this;
	var version = '0.9';
	var description = `
		<stickers.js>
		Ver 0.9
		just to make stickers which are visualized draggable object.
		Data of people, categories, memos, or sth else can be a 'sticker'.
	`;

	var _Scategory = function() {
		this._dataArray = {
			'type': 'default', //default, palette, ddList
			'font': '#333',
			'background': 'transparent',
			'size': 'default',
			'node': undefined,
		};
		this.dataStack = [];
		this.categoryStack = {};
		this.colors = {
			'font': ['#4e9a5e','#6290ad','#d29c66','#ffbf04'],
			'background': ['#c4f5cf','#ddf2ff','#ffeedd','#fff0c5'],
		};
	};

	_Scategory.prototype = {
		initialize: function() {
			function newElement(tagName, prop) {
				var proto = Object.create(HTMLElement.prototype);
				for(let j in prop){
					proto[j] = prop[j];
				}
				// console.log(proto, prop);

				if(tagName.constructor === Array){
					for(let i in tagName) {
						var _tag = document.registerElement(tagName[i], {
							prototype: proto,
						});
					}
				} else {
					var _tag = document.registerElement(tagName, {
						prototype: proto,
					});
				}
			};

			newElement('S-category', {
				createdCallback: function() {
					var dataArray = {
						'type': 'default',
						'node': this,
						'category': $(this).text(),
					}

					var isIn = Scategory.categoryStack[dataArray.category];
					if(isIn === undefined){
						Scategory.categoryStack[dataArray.category] = {
							'font': Scategory.colors.font.pop(),
							'background': Scategory.colors.background.pop(),
						};
					}

					var color = Scategory.categoryStack[dataArray.category];
					dataArray.font = color.font;
					dataArray.background = color.background;

					// console.log(dataArray);

					var symbol = document.createElement('S-symbol');				
					var name = document.createElement('S-name');
					symbol.innerText = dataArray.category.slice(0,1);
					name.innerText = dataArray.category;
					this.innerText = "";
					this.appendChild(symbol);
					this.appendChild(name);

					$(this).css({
						'color': dataArray.font,
						'background': dataArray.background,
					});
					$(this).children('S-symbol').css({
						'color': dataArray.font,
						'border-color': dataArray.font,
					});

					$(this).mouseover(function(e) {
						$(this).css({
							'background': dataArray.font,
							'color': 'white',
						});
						$(this).children('S-symbol').css({
							'background': 'white',
						});
					}).mouseout(function(e) {
						$(this).css({
							'background': dataArray.background,						
							'color': dataArray.font,
						});
						$(this).children('S-symbol').css({
							'background': 'transparent',
						});
					});
				},
				attributeChangedCallback: function (attrName, oldVal, newVal) {
					// console.log('S-category changed');
				},
			});
			newElement('S-symbol');
			newElement('S-name');
			newElement('S-palette');
		},
		handleSticker: function(target) {
			if(!target.children('S-palette').length){
				$(target).children('S-category').append(`
					<S-palette class="hidden">
						<form>
							<input type="radio" id="1" name="CatTag" />
							<label for="1"><div>Work</div></label>
							<input type="radio" id="2" name="CatTag" />
							<label for="2"><div>School</div></label>
							<input type="radio" id="3" name="CatTag" />
							<label for="3"><div>Office</div></label>
						</form>
					</S-palette>
				`);
			}

			target.children('S-category').click(function(e) {
				$(e.target).parents('section').find('S-category').toggleClass('afterhidden');
				$(e.target).parents('section').find('S-palette').toggleClass('hidden');
			});

			target.find('S-palette label').mouseover(function(e) {
				var _label = $(e.target).closest('label');
				document.documentElement.style.setProperty("--preview", _label.css('border-color'));
				$(e.target).closest('S-category').addClass('preview');
				$(e.target).closest('S-category').find('S-symbol').text(_label.text().substr(0,1));
				$(e.target).closest('S-category').find('S-name').text(_label.text());
			}).mouseout(function(e) {
				$(e.target).closest('S-category').removeClass('preview');
			});
		}
	}

	var Scategory = new _Scategory();
	Scategory.initialize();
	window.STICKER = {
		handleSticker: function(target){Scategory.handleSticker(target);},
	};
}(window));