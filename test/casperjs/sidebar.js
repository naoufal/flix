casper.test.begin('Side menu can be opened', function(test) {
  casper.start('http://localhost:5000', function() {
    this.viewport(640, 1136);
    test.assertExists('#header .btn');
    test.assertExists('.sidebar');
    this.click('#header .btn');
    this.waitUntilVisible('.sidebar.is-visible', function() {
      test.pass('Sidebar is visible');
      test.assertExists('.overlay.is-visible');
      test.pass('Overlay is visible');
    });
    this.wait(1000, function(){
      this.capture('test/screenshots/sidebar-' + Date.now() + '.png');
    });
  });

  casper.run(function() {
      test.done();
  });
});



casper.test.begin('Side menu can be dismissed with overlay', function(test) {
  casper.start('http://localhost:5000', function() {
    this.viewport(640, 1136);
    this.click('#header .btn');
    this.wait(1000, function() {
      this.click('.overlay');
      test.assertDoesntExist('.sidebar.is-visible');
      test.pass('Sidebar can be dismissed by clicking overlay');
    });
    this.wait(1000, function() {
      this.capture('test/screenshots/sidebar-' + Date.now() + '.png')
    });
  });

  casper.run(function() {
    test.done();
  });
});



casper.test.begin('Clicking category updates title', function(test) {
  casper.start('http://localhost:5000', function() {
    this.viewport(640, 1136);
    this.click('#header .btn');
    this.waitUntilVisible('.sidebar.is-visible', function() {
      test.assertElementCount('.category', 4)
      test.assertSelectorHasText('.category-list li:nth-of-type(3) a', 'New Releases')
      this.click('.category-list li:nth-of-type(3) a');
      test.assertSelectorHasText('title', 'New Releases | Flix')
      test.assertSelectorHasText('#header .title', 'New Releases')
      test.pass('Selecting category from sidebar updates Page Title and H1')
      this.capture('test/screenshots/sidebar-' + Date.now() + '.png')
    });
  });

  casper.run(function() {
    test.done();
  });
});