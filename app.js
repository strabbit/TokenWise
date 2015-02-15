var username, loading, refreshing, login_webview, fetch_webview, db, fetchTotal, toFetch=[], sortColumn = 5, sortDir = 'desc';

function drawTable() {
	db.activity.toCollection().toArray( function( tips ) {
		var start = $("#start-date").val();
		var end = $("#end-date").val();

		start = start.substr(-4) + '/' + start.substr(0,5) + ' 00:00:00';
		end = end.substr(-4) + '/' + end.substr(0,5) + ' 99:99:99';

		tips = tips.reduce( function( p, c ) {
			if(
				(
					( c.type==="Tip" && $("#otip:checked").length ) || 
					( c.type==="Private" && $("#oprivate:checked").length ) || 
					( c.type==="Group Show" && $("#ogroup:checked").length ) || 
					( c.type==="Voyeur" && $("#ovoyeur:checked").length )
				) && c.date >= start && c.date < end
			) {
				if ( !p[c.model] ) {
					p[c.model] = {
						count: 0,
						high: c.amount,
						low: c.amount,
						total: 0
					};
				}
				p[c.model].count++;
				p[c.model].high = c.amount > p[c.model].high ? c.amount: p[c.model].high;
				p[c.model].low = c.amount < p[c.model].low ? c.amount: p[c.model].low;
				p[c.model].total += c.amount;
			}
			return p;
		}, {} );
		
		var tbody = document.querySelector('table tbody');
		tbody.innerHTML='';
		var overall_count = 0,
			overall_high = null,
			overall_low = null,
			overall_total = 0;

		for( var model in tips ) {
			var tr = document.createElement('tr');
			var td_model = document.createElement('td');
			var td_count = document.createElement('td');
			var td_average = document.createElement('td');
			var td_high = document.createElement('td');
			var td_low = document.createElement('td');
			var td_total = document.createElement('td');
			td_model.innerText = model;
			td_count.innerText = tips[model].count;
			td_average.innerText = Math.floor( tips[model].total * 100 / tips[model].count ) / 100;
			td_high.innerText = tips[model].high;
			td_low.innerText = tips[model].low;
			td_total.innerText = tips[model].total;
			tr.appendChild( td_model );
			tr.appendChild( td_count );
			tr.appendChild( td_average );
			tr.appendChild( td_high );
			tr.appendChild( td_low );
			tr.appendChild( td_total );
			tbody.appendChild(tr);
			overall_count += tips[model].count;
			overall_high = ( overall_high === null ) || ( tips[model].high > overall_high ) ? tips[model].high : overall_high;
			overall_low = ( overall_low === null ) || ( tips[model].low < overall_low ) ? tips[model].low : overall_low;
			overall_total += tips[model].total;
		}

		var tfoot = document.querySelector('table tfoot');
		tfoot.innerHTML = '';
		var tr = document.createElement('tr');
		var th_model = document.createElement('th');
		var th_count = document.createElement('th');
		var th_average = document.createElement('th');
		var th_high = document.createElement('th');
		var th_low = document.createElement('th');
		var th_total = document.createElement('th');
		th_model.innerText = 'Overall';
		th_count.innerText = overall_count;
		th_average.innerText = overall_count ? Math.floor( overall_total * 100 / overall_count ) / 100 : 0;
		th_high.innerText = overall_high || 0;
		th_low.innerText = overall_low || 0;
		th_total.innerText = overall_total;
		tr.appendChild( th_model );
		tr.appendChild( th_count );
		tr.appendChild( th_average );
		tr.appendChild( th_high );
		tr.appendChild( th_low );
		tr.appendChild( th_total );
		tfoot.appendChild(tr);


		var table = $("table").stupidtable();
		var th_to_sort = table.find("thead th").eq(sortColumn);
		th_to_sort.stupidsort(sortDir);
		table.bind('aftertablesort',function(e,d){
			sortColumn = d.column;
			sortDir = d.direction;
		})
	} );
}

window.addEventListener( 'message', function( event ) {
	if ( event.data.command === 'getUsername' ) {
		loading.style.display = "none";
		$('html').removeClass('noscroll');
		if ( ! event.data.username ) {
			login_webview.style.left = "0";
			$('html').addClass('noscroll');
			$('body').scrollTop(0);
		} else {
			login_webview.style.left = "-10000px";
		}
		username = event.data.username;

		if ( username ) {
			db = new Dexie( username );

			db.version(1).stores({
				activity: '++,date,type,model,amount',
				update: 'index,date'
			});

			db.open();

			db.update.toCollection().first( function( row ) { 
				var els = document.querySelectorAll('.refresh');
				for ( var i = 0; i < els.length; i++ ) {
					els[i].innerText = row.date;
				}
			} );

			var els = document.querySelectorAll('.username');
			for ( var i = 0; i < els.length; i++ ) {
				els[i].innerText = username;
			}

			drawTable();
		}
	}

	if ( event.data.command === 'fetch' ) {

		for ( var i = 0; i < event.data.data.length; i++ ) {
			var row = {
				date: event.data.data[i][0].replace(
					/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ([0-9]{1,2})(th|st|nd|rd), ([0-9]{4}),/,
					function(m0,m1,m2,m3,m4){
						var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
							mm = ( "0" + ( months.indexOf(m1) + 1 ) ).slice( -2 ),
							dd = ( "0" + m2 ).slice( -2 ),
							yyyy = m4;
						return yyyy+'/'+mm+'/'+dd;
					}
				),
				type: event.data.data[i][1],
				model: event.data.data[i][2],
				amount: parseInt( event.data.data[i][3], 10 )
			};

			db.activity.add( row );
		}

		if ( toFetch.length ) {
			fetch_webview.src = toFetch.pop();
			$( '#progress' ).css('width',(( fetchTotal - toFetch.length ) / fetchTotal ) * 100 +'%');
		} else {
			db.update.put( { index: 1, date: new Date() } );
			refreshing.style.display = 'none';
			$('html').removeClass('noscroll');
			drawTable();
		}
	}
} );

window.addEventListener( 'load', function() {
	refreshing = document.querySelector('#refreshing');
	fetch_webview = document.querySelector( '#fetch_webview' );
	fetch_webview.addEventListener( 'loadstop', function() {
		var code  = "window.addEventListener('message',function(event){";
			code += "	var data = [];";
			code += "	var rows = document.querySelectorAll( '.content tr' );";
			code += "	for ( var i = 0; i < rows.length; i++ ) {";
			code += "		var cols = rows[i].querySelectorAll( 'td.value_td' );";
			code += "		if( cols.length !== 5 ) {";
			code += "			continue;";
			code += "		}";
			code += "		cols = Array.prototype.slice.call( cols, 0 );";
			code += "		cols = cols.map( function( col ) {";
			code += "			return col.innerText;";
			code += "		} );";
			code += "		data.push( cols );";
			code += "	}";
			code += "	event.source.postMessage({command:'fetch',data:data}, event.origin);";
			code += "});"
		fetch_webview.executeScript( { code: code } );

		fetch_webview.contentWindow.postMessage( {
			command: 'fetch'
		}, '*' );
	} );

	var logout = document.querySelector( '#logout' ),
		refresh = document.querySelector( '#refresh' );


	logout.onclick = function() {
		login_webview.clearData( {}, { cookies: true }, function() {
			login_webview.reload();
			db = null;
			username = null;
		} );
	};

	refresh.onclick = function() {
		if ( toFetch.length ) {
			return;
		}

		$( '#progress' ).css('width','0%');
		refreshing.style.display='block';
		$('html').addClass('noscroll');
		$('body').scrollTop(0);

		db = new Dexie( username );

		db.delete();

		db.version(1).stores({
			activity: '++,date,type,model,amount',
			update: 'index,date'
		});

		db.open();

		var date = new Date(),
			thisYear = date.getFullYear(),
			thisMonth = date.getMonth() + 1;

		for ( var year = 2007; year <= thisYear; year++ ) {
			for ( var month = 1; month <= 12; month++ ) {
				if ( year === thisYear && month > thisMonth ) {
					break;
				}
				var url = 'http://www.myfreecams.com/mfc2/php/account.php?all_token_sessions=1&year='+year+'&month='+month;
				toFetch.push( url );
			}
		}

		fetchTotal = toFetch.length;

		fetch_webview.src = toFetch.pop();
	};

	loading = document.querySelector( '#loading' );
	login_webview = document.querySelector( '#login_webview' );
	login_webview.addEventListener( 'loadcommit', function() {
		login_webview.insertCSS({'code': "a { display: none } center{ font-size: 0 }",runAt: 'document_start'});
	} );
	login_webview.addEventListener( 'loadstart', function() {
		if ( login_webview.src !== 'http://www.myfreecams.com/mfc2/php/login.php?request=login' ) {
			login_webview.src = 'http://www.myfreecams.com/mfc2/php/login.php?request=login';
		}
	} );
	login_webview.addEventListener( 'loadstop', function() {
		if ( login_webview.src === 'http://www.myfreecams.com/mfc2/php/login.php?request=login' ) {
			var code  = "window.addEventListener('message',function(event){";
				code += "	username = document.getElementById('username').value;"
				code += "	event.source.postMessage({command:'getUsername',username:username}, event.origin);";
				code += "});"
			login_webview.executeScript( { code: code } );

			login_webview.contentWindow.postMessage( {
				command: 'getUsername'
			}, '*' );
		}
	} );
} );


$(function(){
	var theDate = new Date();
	theDate = ("0"+(theDate.getMonth()+1)).slice(-2) + '/' + ("0" + theDate.getDate()).slice(-2) + '/' + theDate.getFullYear();
	$("#end-date").val( theDate );
	$('input[type=checkbox]').click(drawTable).change(drawTable);
	$('#start-date,#end-date').change(drawTable);
	$("#datepicker").datepicker({
		startDate: "01/01/2007",
		endDate: theDate,
		orientation: "top left",
		autoclose: true,
		forceParse: true
	});
})