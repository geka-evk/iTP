"use strict";

var itp = itp || {};
	
	itp._config = {
		rCount: 	20,
		cCount: 	20,
		scrollSize: 16,		// px
		cell: 		{ width: 100, height: 30 },	// px;
		sheets: 	[ "Лист 1", "Лист 2", "Лист 3" ],
		hideSheets: true
	}


	itp.init = function () {
		var rCountInput = document.querySelector('#rCount'),
			cCountInput = document.querySelector('#cCount'),
			select = document.querySelector('select');
			
		document.querySelector('select').selectedIndex = itp._config.hideSheets ? 1 : 0;
			
		rCountInput.value = itp._config.rCount;
		cCountInput.value = itp._config.cCount;
	
	//	itp.data =  localStorage.dataLS? JSON.parse(localStorage.dataLS) : [];	// листы

		document.querySelector('#btnCreate').addEventListener("click", function () {
			itp.rCount = +rCountInput.value;
			itp.cCount = +cCountInput.value;

			itp.data = [];
			itp._config.sheets.forEach( function (el, i) {
				itp.data[i] = { name: el };	
			});
			itp.aShIndex = 0;	
			itp.aSh = itp.data[ itp.aShIndex ];		
			itp.aSh["active"] = true;
			itp._config.hideSheets = document.querySelector('select').selectedIndex ? true : false ;

			itp._createTabs();
		});

		document.querySelector('#btnRestore').addEventListener("click", function () {
			itp.data 	 = JSON.parse( localStorage.dataLS );
			itp.aShIndex = itp.activeSheet();
			itp.aSh 	 = itp.data[ itp.aShIndex ];	
			itp._config.hideSheets = document.querySelector('select').selectedIndex ? true : false ;

			itp._createTabs();
		});

		document.querySelector('#btnGetJSON').addEventListener("click", function () {
			itp._getJSONData('http://keramet.kh.ua/itpGetJSON.php',  function () {
    			console.log( JSON.stringify(itp.JSONdata) );
    		//	itp.showCurent();
			});
		});
	}		//	end of  itp.init

	itp._createTabs = function () {
		var tab, sheet, 
			sheetsTab = document.querySelector("div.sheetsTab"),
			main = document.querySelector("main"),
			sheetInnerHTML = document.querySelector("div.sheet").innerHTML;		// может, как-то подключить шаблон

		if (itp._isCreate) {
			alert ("Таблица уже создана. Для пересоздания обновите страницу!");
			return "_isCreate";
		}

		tab = document.createElement("a");
		tab.href = "#";
		tab.title = "Добавить новый лист";
		tab.innerHTML = "<span class='addSheet'><b> + </b></span>";
		tab.onclick = function () {
			alert("Пока не работает :( ");
			return	false;
		}
		sheetsTab.appendChild(tab); 

		itp.data.forEach( function (el, i) {
			tab = document.createElement("a");
			tab.href = "#";
			tab.innerHTML = "<span" + ( el.active ? " class='active'" : "" ) + ">" + el.name + "</span>";
			tab.onclick = itp._onclickTab;
			sheetsTab.appendChild(tab);

			if (itp._config.hideSheets) {	
				if (i) {						// создаём дивы для листов (при скрытии)
					sheet = document.createElement("div");
					sheet.className = 'sheet';
					sheet.id = "sh-" + i;
					sheet.innerHTML = sheetInnerHTML;
					main.appendChild(sheet);
				}
				itp._createSheets(i);
				if (el.active) { document.getElementById('sh-' + i).classList.add("active"); }
			}
		});	

		if ( !itp._config.hideSheets ) {
			document.getElementById('sh-0').classList.add("active");
			itp._createSheets();
		}

		itp._isCreate = true;
	}


	itp._onclickTab = function (e) {
		var t = Date.now(),
			tabs = document.querySelectorAll(".sheetsTab a span:not(.addSheet)");

		if ( e.target.classList.contains("active") ) return;

		[].slice.call(tabs).forEach( function (item, i) {
		 	item.classList.remove("active"); 
		 	if (itp.data[i].active) { itp.data[i].active = false; } 	// нужна ли проверка? (сразу itp.data[i].active = false; )
		 	
		 	if (item === e.target) {
		 		if ( itp._config.hideSheets ) {
		 			document.getElementById('sh-' + itp.aShIndex).classList.remove("active");
		 			document.getElementById('sh-' + i).classList.add("active");
		 		} 
		 		itp.data[i].active = true;
		 		itp.aSh = itp.data[i];
		 		itp.aShIndex = i;
		 	}
		});
		
		e.target.classList.add("active");

		if ( !itp._config.hideSheets ) {
			itp._clearSheet();
			itp._createSheets();
		}
		
		console.log( "Время на смену листа, мс: " + (Date.now() - t) );

		itp._saveToLS();
		return false;
	}

	
	itp._createSheets = function (sheetIndex) {
		var sheetIndex = sheetIndex || 0,
			sheet = document.getElementById("sh-" + sheetIndex),
			tableCol = sheet.querySelector('.itpTableCol'),
			tableRow = sheet.querySelector('.itpTableRow'),
			tableGrid = sheet.querySelector('.itpTable'),
			tbodyGrid = tableGrid.getElementsByTagName('tbody')[0];
		

		if ( !tableCol.rows.length ) {		// были ли для этого дива созданы таблицы 
			itp._config.hideSheets ? __fillSheet(sheetIndex) : __fillSheet(itp.aShIndex);

		//	tableGrid.addEventListener("click", __clickGrid);
		//	tableGrid.addEventListener("dblclick", __dblclickGrid);

			tableGrid.onclick 	 = __clickGrid;
			tableGrid.ondblclick = __dblclickGrid;
			sheet.querySelector('.table').onscroll = __onScroll;
		}


		function __fillSheet(n) {
			var r, c, cell;

			if ( !itp.data[n] ) { alert("Нет такого листа!");	}	// может, Throw  Error ?

			if ( !itp.data[n].cells ) {
				itp.data[n].cells = {};
				itp.data[n].rCount = itp.rCount || itp._config.rCount;
				itp.data[n].cCount = itp.cCount || itp._config.cCount;
			}	

			tableGrid.width  = itp.data[n].cCount * itp._config.cell.width + itp._config.scrollSize + "px";
			tableGrid.height = itp.data[n].rCount * itp._config.cell.height + itp._config.scrollSize + "px";
			tableCol.width 	 = tableGrid.width;
			tableRow.height  = tableGrid.height;

			for (r = 0; r < itp.data[n].rCount; r++) {
				tbodyGrid.insertRow(r);
				tableRow.insertRow(r).insertCell(0).outerHTML = "<th>" + (r + 1) + "</th>";

				for (c = 0; c < itp.data[n].cCount; c++) {
					if (r === 0) { 
						if (c === 0 ) { tableCol.insertRow(0) };
						tableCol.rows[0].insertCell(c).outerHTML = "<th>" + itp._colName(c) + "</th>";
					}

					cell = itp._colName(c) + (r + 1);
					tbodyGrid.rows[r].insertCell(c).innerHTML = itp.data[n].cells[cell] ? 
						itp.checkFormula( cell, n ) : "";
				}
			}
		}		// end of  __fillSheet


		function __clickGrid(e) { 
			if (e.target.nodeName === "TD")  { e.target.classList.toggle("selected"); }
		}

		function __dblclickGrid(e) {		// при нажатии на ячейку
			var input, cell; 

			if (e.target.nodeName === "TD") {
				cell =	itp._colName(e.target.cellIndex) +
							(e.target.parentNode.rowIndex + 1);
				e.target.className = "input";
				input = document.createElement("input");
				input.className = "inGrid";
				input.value = itp.aSh.cells[cell]? itp.aSh.cells[cell] : "";
			//	input.value = e.target.innerHTML;

				input.onblur = function () {
					var cell =	itp._colName(e.target.cellIndex) +
								(e.target.parentNode.rowIndex + 1);

					this.parentNode.classList.remove("input");	//	можно так:	this.parentNode.class = "";
				//	this.parentNode.innerHTML = this.value;
					itp.aSh.cells[cell] = this.value;
					this.parentNode.innerHTML = itp.checkFormula(cell, itp.aShIndex);
					
					itp._saveToLS();
				};

				input.onkeyup = function (e) {
					if (e.keyCode === 13) this.blur();
				}

				e.target.innerHTML = "";
				e.target.appendChild(input);
				input.focus();
			}
		}		// end  of  __dblclickGrid


		function __onScroll() {
			var needAddC = this.scrollWidth - (this.clientWidth + this.scrollLeft),
				needAddR = this.scrollHeight - (this.clientHeight + this.scrollTop);

			tableRow.style.top  = -this.scrollTop  + "px";
			tableCol.style.left = -this.scrollLeft + "px";

			if (needAddC < itp._config.cell.width)  __addCol();
			if (needAddR < itp._config.cell.height) __addRow();
		}

		function __addRow() {	
			var sheet = document.querySelector("div.sheet.active"),
				tableRow = sheet.querySelector('.itpTableRow'),
				tableGrid = sheet.querySelector('.itpTable'),
				tbodyGrid = tableGrid.getElementsByTagName('tbody')[0],
				c;

			tbodyGrid.insertRow(itp.aSh.rCount);
			tableRow.insertRow(itp.aSh.rCount).insertCell(0).outerHTML = "<th>" + (itp.aSh.rCount + 1) + "</th>";

			for (c = 0; c < itp.aSh.cCount; c++) {
				tbodyGrid.rows[itp.aSh.rCount].insertCell(c);
			}
	
			itp.aSh.rCount++;
			tableGrid.height = (tableGrid.scrollHeight + itp._config.cell.height) + "px";
			tableRow.height = tableGrid.height;
		}

		function __addCol() {
			var sheet = document.querySelector("div.sheet.active"),
				tableCol = sheet.querySelector('.itpTableCol'),
				tableGrid = sheet.querySelector('.itpTable'),
				tbodyGrid = tableGrid.getElementsByTagName('tbody')[0],
				r;

			tableCol.rows[0].insertCell(itp.aSh.cCount).outerHTML = "<th>" + itp._colName(itp.aSh.cCount) + "</th>";

			for (r = 0; r < itp.aSh.rCount; r++) {
				tbodyGrid.rows[r].insertCell(itp.aSh.cCount);
			}

			itp.aSh.cCount++;
			tableGrid.width = (tableGrid.scrollWidth + itp._config.cell.width) + "px";
			tableCol.width = tableGrid.width;	
		}

	}		// end of  itp._createSheets


	itp._clearSheet = function () {
		var sheet = document.querySelector("div.sheet.active"),
			tableGrid = sheet.querySelector('.itpTable');

		sheet.querySelector('.itpTableCol').innerHTML = "";
		sheet.querySelector('.itpTableRow').innerHTML = "",
		tableGrid.getElementsByTagName('tbody')[0].innerHTML = "";
	}


	itp.checkFormula = function (cell, sheetIndex) {
		var txt = itp.data[sheetIndex].cells[cell],
			output = document.querySelector("#outputCurrentState"),
			result;

		if (typeof txt === "undefined") return "-" ;	// возвращаю "-" для наглядности		
		if (txt[0] === "=") { 
			try 		  { result = new Function("return " + txt.substring(1))(); }
			catch (error) {	
				result = "<span class='error'>!</span>";
				output.innerHTML = 	"<b>Ошибка в формуле: </b>" +
						itp.data[sheetIndex].name + ", ячейка " + cell  + "<br>";
				setTimeout(function () { output.innerHTML = ""; }, 2000);
			}
		} else 	{ result = txt; }

		return result;
	}


	itp._saveToLS = function () {
		localStorage.setItem ( "dataLS" , JSON.stringify(itp.data) );
	//	console.log( localStorage.dataLS ); 

		itp._saveToServer('http://keramet.kh.ua/itpSaveData.php');
	}

	
	
	itp.showCurent = function () {
		var outputCurrent = "#outputCurrentState";

		document.querySelector(outputCurrent).innerHTML = "<b>itp.data.length:  \t </b>" +  +itp.data.length  + "<br>" +
														  "<b>itp.aShIndex:  \t </b>" +  itp.aShIndex  +  "<br>" +
														  "<b>itp.aSh.name:  \t </b>" + (itp.aSh? itp.aSh.name : itp.aSh) + "<br>" +
													 	  "<b>itp.JSONdata:  \t </b>" + JSON.stringify( itp.JSONdata ) + "<br>";
													 //	  "<b>localStorage.dataLS: </b>" + JSON.stringify( localStorage.dataLS ); 
		console.dir( itp.aSh );
		console.log( "itp.aSh (активный лист - АЛ): " + JSON.stringify(itp.aSh) );
	}

		// может, лучше хранить ссылку на активный лист вместо функции определения АЛ ??
	itp.activeSheet = function () {		
		var n;

		itp.data.forEach( function (el, i) {
			if (el.active) { n = i; }
		});
		return n;
	}

	itp._keyup = function (e) {
		var td = document.querySelector('td.selected:hover');
	//	console.log(e.target.nodeName);
	//	console.log(e.target);
	//	console.log(e.currentTarget);
		if (td) { console.log(td); }
	}


	itp._colName = function (n) {		
		var startChar = "A",  endChar = "Z",
			chCount = endChar.charCodeAt(0) - startChar.charCodeAt(0) + 1,
			arr = [];

		function getChar(i) { return String.fromCharCode(startChar.charCodeAt(0) + i) }

		(function decomposition(N, base) {		// подумать, может base убрать?? (использовать сразу chCount)
			var temp = Math.floor(N / base);

			if (!temp) { arr.unshift( getChar(N) ); }
			else {
				arr.unshift( getChar(N % base) );
				decomposition( temp - 1, base );
			}
		})(n, chCount);

		return arr.join("");
	}

	itp._getJSONData = function (path, callback) {
   		var httpRequest = new XMLHttpRequest();

  		httpRequest.onreadystatechange = function () {
        	if (httpRequest.readyState === 4) {
            	if (httpRequest.status === 200) {
                	itp.JSONdata = JSON.parse(httpRequest.responseText);
                	if (callback) { callback(); }
           		}
       		}
		};
		httpRequest.open('GET', path);
		httpRequest.send(); 
	}

	itp._saveToServer = function (url) {
   		var xhr = new XMLHttpRequest();

  		xhr.onreadystatechange = function () {
        	if (xhr.readyState === 4) {
            	if (xhr.status === 200) { console.log(xhr.response); }
       		}
		};
		xhr.open( 'POST', url );
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send( "itpData=" + encodeURIComponent(JSON.stringify(itp.data)) ); 
	}


document.addEventListener("DOMContentLoaded", itp.init);













	