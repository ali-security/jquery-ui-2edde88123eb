define( [
	"qunit",
	"jquery"
], function( QUnit, $ ) {

QUnit.module( "qunit-reporter: core" );

// The URL the HTML reporter builds for the current page and the given query string
function reporterUrl( query ) {
	return window.location.protocol + "//" + window.location.host +
		window.location.pathname + query;
}

// The QUnit.log callback registered by the HTML reporter
function reporterLog() {
	var i,
		callbacks = QUnit.config.callbacks.log;

	for ( i = 0; i < callbacks.length; i++ ) {
		if ( /qunit-test-output-/.test( callbacks[ i ].toString() ) ) {
			return callbacks[ i ];
		}
	}
}

QUnit.test( "Crafted URL is parsed", function( assert ) {
	assert.expect( 4 );

	assert.ok( /'onmouseover='/.test( decodeURIComponent( window.location.pathname ) ),
		"Path carries the attribute payload" );
	assert.strictEqual( QUnit.urlParams[ "xss'data-xss" ], true,
		"Query string carries the attribute payload" );
	assert.strictEqual( QUnit.urlParams.maxDepth, "<b>xss</b>",
		"Query string carries the markup payload" );
	assert.strictEqual( QUnit.urlParams.eq, "a=b", "Values containing = are kept whole" );
} );

QUnit.test( "Header link escapes the URL", function( assert ) {
	var link = $( "#qunit-header a" )[ 0 ];

	assert.expect( 3 );

	assert.equal( link.attributes.length, 1, "Only the href attribute is set" );
	assert.strictEqual( link.getAttribute( "onmouseover" ), null,
		"No event handler is injected" );
	assert.equal( link.getAttribute( "href" ),
		reporterUrl( "?xss'data-xss&eq=a%3Db&maxDepth=%3Cb%3Exss%3C%2Fb%3E" ),
		"href holds the whole URL" );
} );

QUnit.test( "Max depth hint escapes the URL and the max depth", function( assert ) {
	var link,
		output = $( "<li id='qunit-test-output-xss-hint'><ol></ol></li>" )
			.appendTo( "#qunit-fixture" );

	assert.expect( 6 );

	// Render a failed assertion whose diff is suppressed, as the reporter would
	reporterLog()( {
		module: "qunit-reporter: core",
		name: "Max depth hint",
		testId: "xss-hint",
		result: false,
		message: "",
		runtime: 0,
		expected: "[object Object]",
		actual: "[object Object]"
	} );

	link = output.find( "a" );
	assert.equal( link.length, 1, "Rerun link is rendered" );
	assert.equal( link[ 0 ].attributes.length, 1, "Only the href attribute is set" );
	assert.strictEqual( link[ 0 ].getAttribute( "onmouseover" ), null,
		"No event handler is injected" );
	assert.equal( link[ 0 ].getAttribute( "href" ),
		reporterUrl( "?xss'data-xss&eq=a%3Db&maxDepth=-1" ),
		"href holds the whole URL" );
	assert.equal( output.find( "b" ).length, 0, "Max depth is not parsed as markup" );
	assert.ok( output.text().indexOf( "(<b>xss</b>)" ) !== -1, "Max depth is shown as text" );
} );

} );
