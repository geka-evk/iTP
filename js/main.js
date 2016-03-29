"use strict";

var itp = itp || {};
	
	itp._config = {
		rCount: 10,
		cCount: 20,
		cell: { width: 100, height: 30 }	// px;
	}

	itp.init = function () {
		var rCountInput = document.querySelector('#rCount'),
			cCountInput = document.querySelector('#cCount');
			
		rCountInput.value = itp._config.rCount;
		cCountInput.value = itp._config.cCount;

		document.querySelector('#btnCreate').addEventListener("click", function () {
			itp.rCount = rCountInput.value;
			itp.cCount = cCountInput.value;
			itp._createTables();
		});
	}
		
	itp._createTables = function () {
		var table = document.querySelector('#itpTable'),
			tableCol = document.querySelector('#itpTableCol'),
			tableRow = document.querySelector('#itpTableRow'),
		//	tbody = table.getElementsByTagName('tbody'),
			r, c, row;

		if (itp._isCreate) { alert("Таблица уже создана!"); }
		else {
			console.log( table.width  = itp.cCount * itp._config.cell.width + "px" );
			console.log( table.height = itp.rCount * itp._config.cell.height + "px" );
			tableCol.width = table.width;
			tableRow.height = table.height;

			table.addEventListener("click", function (e) {
				var input; 

				if (e.target.nodeName === "TD") {
					e.target.className = "input";
					input = document.createElement("input");
					input.className = "inGrid";
					input.value = e.target.innerHTML;

					input.onblur = function () {
						this.parentNode.class = ""; 	//	можно так:	this.parentNode.classList.remove("input");
						this.parentNode.innerHTML = this.value;
					};

					input.onkeyup  = function (e) { 
						if (e.keyCode === 13) this.blur();; 
					}

					e.target.innerHTML = "";
					e.target.appendChild(input);
					input.focus();
				}
			});

			for (r = 0; r < itp.rCount; r++) {
				table.insertRow(r);
				tableRow.insertRow(r).insertCell(0).outerHTML = "<th>" + (r + 1) + "</th>";

				for (c = 0; c < itp.cCount; c++) {
					if (r === 0) { 
						if (c === 0 ) { tableCol.insertRow(0) };
						tableCol.rows[0].insertCell(c).outerHTML = "<th>" + String.fromCharCode(65 + c) + "</th>";
						//tableCol.rows[0].insertCell(c).textContent = String.fromCharCode(65 + c);
					 }
					table.rows[r].insertCell(c);
				}
			}

			document.querySelector('.table').onscroll = function() {
				tableRow.style.top  = -this.scrollTop  + "px";
				tableCol.style.left = -this.scrollLeft + "px";
			}

			itp._isCreate = true;	// отслеживает, была ли создана таблица
			document.querySelector('main').style.display = "block";

		}
	}

document.addEventListener("DOMContentLoaded", itp.init);














	