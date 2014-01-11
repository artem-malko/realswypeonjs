// Code here

// Плагин определения направления свайпа

var swypeDirection = function() {
	this.init();
}

swypeDirection.prototype = {
	_config: {

	},

	init: function() {
		var that = this;

		that.body = document.getElementById('body');

		// Координата начала касания (Х и У)
		that.onTouchStartPositionX = 0;
		that.onTouchStartPositionY = 0;

		// Массив координат касаний
		that.touchArrayX = [0,0];
		that.touchArrayY = [0,0];

		// Переменная-признак вертикального или горизонтального свайпа
		that.isVertical = false;

		// Boolean var, true — swipe right, false — swipe left
		that.isOnRight = false;

		// Переменная признак начала свайпа
		that.isFirstTouch = false;

		that.body.addEventListener('touchstart', 
			function(event) { 
				that._onTouchStart(event);
			},
			false
		);

		that.body.addEventListener('touchmove', 
			function(event) { 
				that._onTouchMove(event);
			},
			false
		);
	},

	_onTouchStart: function(event) {
		var that = this;

		that.onTouchStartPositionX = event.touches[0].pageX;	
		that.onTouchStartPositionY = event.touches[0].pageY;	

		that.isFirstTouch = true;

		that.isVertical = false;

		return that;
	},


	_onTouchMove: function(event) {
		var that = this;

		that.touchArrayX[0] = event.touches[0].pageX;
		that.touchArrayY[0] = event.touches[0].pageY;
		
		var swypeWidth = Math.abs(that.touchArrayX[0]-that.onTouchStartPositionX);
		var swypeHeight = Math.abs(that.touchArrayY[0]-that.onTouchStartPositionY);
		
		if (that.isFirstTouch == true ) { 
			that.touchArrayX = [0,that.onTouchStartPositionX];
			that.touchArrayY = [0,that.onTouchStartPositionY];
			that.isFirstTouch = false;
		}

		if (that.touchArrayX[0] > that.touchArrayX[1]) { 
			that.isOnRight = true;

		} else { 
			that.isOnRight = false; 
		}

		that.touchArrayX[1] = that.touchArrayX[0];
		that.touchArrayY[1] = that.touchArrayY[0];
		
		if (swypeHeight >= swypeWidth) { 
			that.isVertical = true; 
		} else { 
			that.isVertical = false; 
		}
	},


	verticalDirection: function() {
		var that = this;

		return that.isVertical;
	},

	horizontalDirection: function() {
		var that = this;

		return that.isOnRight;
	}
	
}



// Плагин свайпа панели
var realSwype = function($swypePanel) {
	this.init($swypePanel);
}

realSwype.prototype = {

	_config: {
		'swypePanelOffset': 20
	},

	init: function($swypePanel) {
		var that = this;

		// Создаем объект, который будет отслеживать направления свайпа
		that.swypeDirection = new swypeDirection();

		// Определяем основные блоки

		// Выезжающая панель
		that.$swypePanel = $swypePanel;

		// Body
		that.$body = $('body');
		that.body = document.getElementById('body');

		// Параметры
		var realSwypePanelWidth = parseInt(that.$swypePanel.css('width'));

		that.swypePanelWidthOffset = that._config.swypePanelOffset;

		// Ширина панели с учетом offset
		that.swypePanelWidth =  realSwypePanelWidth - that.swypePanelWidthOffset;
		
		// Половина ширины панели, служит отметкой для определения
		// направления окончания движения панели.
		that.swypePanelHalfWidth = realSwypePanelWidth / 2;

		// Time of swipe begining
		that.startTime = 0;

		// Time of swipe ending
		that.endTime = 0;

		// Time of swiping
		that.swypeTime = 0;

		// New position of menu block
		that.newPosition = 0; 

		// Переменная-признак вертикального или горизонтального свайпа
		that.isVertical = false;

		// Boolean var, true — swipe right, false — swipe left
		that.isOnRight = false;

		// Объявляем обработчики событий

		// Начало свайпа
		that.body.addEventListener('touchstart', 
			function(event) { 
				that.onTouchStart(event);
			},
			false
		);

		// брабатываем сам свайп
		that.body.addEventListener('touchmove', 
			function(event) { 
				that.onTouchMove(event);
			},
			false
		);

		// брабатываем окончание свайпа
		that.body.addEventListener('touchend', 
			function(event) { 
				that.onTouchEnd(event);
			},
			false
		);

	},

	onTouchStart: function(event) {
		var that = this;

		that.startTime = Number(new Date());
	},

	onTouchMove: function(event) {
		var that = this;

		var k = 3; 
		
		that.isVertical = that.swypeDirection.verticalDirection();
		that.isOnRight = that.swypeDirection.horizontalDirection();

		$('span').text(that.isVertical);

		if (that.isVertical == true) {  
			return; 
		} else if (that.isVertical == false) {

				event.preventDefault();

				that.newPosition = parseInt(that.$swypePanel.css('left'));

				that.newPosition += k;

				if (that.newPosition > 0) { 
					that.newPosition = 0; 
				}

				if (that.newPosition < -that.swypePanelWidth) { 
					that.newPosition = -that.swypePanelWidth; 
				}

				that.$swypePanel.animate({ 'left': that.newPosition}, 0);
		}
	},

	onTouchEnd: function(event) {
		var that = this;

		that.endTime = Number(new Date());
		that.swypeTime = that.endTime - that.startTime;
		that.newPosition = parseInt(that.$swypePanel.css('left'));
		
		event.preventDefault();

		//Обрабатываем свайп, если он произошел быстро (меньше 0,5 секунды)
		if ( that.swypeTime > 50 && that.swypeTime < 500 && that.isVertical == false) {
		
			if (that.swypeTime < 100) { that.swypeTime = 100; }
			if (that.isOnRight == true) { that._finalMove(true, that.swypeTime); that.newPosition = -that.swypePanelWidthOffset; return; }
			if (that.isOnRight == false) { that._finalMove(false, that.swypeTime); return; }  
		}	
		
		if (that.swypeTime >= 500 && that.swypeTime <= 1000 && that.isVertical == false) {
			
			if (that.isOnRight == true) { that._finalMove(true, 400); that.newPosition = -that.swypePanelWidthOffset; return; }
			if (that.isOnRight == false) { that._finalMove(false, 400); return; }
		}	
		
		//Обрабатываем свайп, если он произошел медлеено
		
		if (that.swypeTime > 1000 && that.isVertical == false) {

			if (that.newPosition <= -that.swypePanelHalfWidth) { 
				that.$swypePanel.animate({ 'left': -that.swypePanelHalfWidth}, 400);
			} 
			
			if (that.newPosition > -that.swypePanelHalfWidth && that.newPosition < -that.swypePanelWidthOffset) { 
				that.$swypePanel.animate({ 'left': -that.swypePanelWidthOffset}, 400); 
			}
			
			if (that.newPosition >= -that.swypePanelWidthOffset) { 
				that.$swypePanel.animate({ 'left': -that.swypePanelWidthOffset}, 400);
			}
		}
	},

	_finalMove: function(isOnRight, duration) {
		var that = this;

		if (isOnRight) { 
			that.$swypePanel.animate({ 'left': (-that.swypePanelWidthOffset)}, duration);  
		} else { 
			that.$swypePanel.animate({ 'left': (-that.swypePanelWidth)}, duration);	
		}

		return that;
	},
}