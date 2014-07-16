casper.test.begin('Side menu can be opened', function(test) {
  casper.start('http://127.0.0.1:5000/', function() {
    test.assertExists('#header .btn');
    test.assertExists('.sidebar');
    this.click('#header .btn');
    this.waitUntilVisible('.sidebar.is-visible', function() {
      test.pass('Open .sidemenu');
    });
    this.waitUntilVisible('.overlay.is-visible', function() {
      test.pass('.overlay is visible');
    });
  })

  casper.run(function() {
      test.done();
  });
});



casper.test.begin('Side menu can be dismissed with overlay', function(test) {
  casper.start('http://127.0.0.1:5000/', function() {
    this.click('#header .btn');
    this.waitUntilVisible('.overlay.is-visible', function() {
      this.click('.overlay');
      test.assertDoesntExist('.sidebar.is-visible');
      test.pass('.sidebar dismissed with overlay');
    });
  })

  casper.run(function() {
    test.done();
  });
});


casper.test.begin('Clicking category updates title', function(test) {
  casper.start('http://127.0.0.1:5000/', function() {
    this.click('#header .btn');
    this.waitUntilVisible('.sidebar.is-visible', function() {
      console.log(this);
      test.assertElementCount('.category', 4)
      test.assertSelectorHasText('.category-list li:nth-of-type(3) a', 'New Releases')
      this.click('.category-list li:nth-of-type(3) a');
      test.assertSelectorHasText('title', 'New Releases | Flix')
      test.assertSelectorHasText('#header .title', 'New Releases')
    });
  })

  casper.run(function() {
    test.done();
  });
});